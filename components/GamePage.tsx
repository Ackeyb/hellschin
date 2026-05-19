import MessageDialog from "@/components/MessageDialog";
import PreloadDiceImages from "@/components/PreloadDiceImages";
import { applyResult, createInitialGameState, getCurrentPlayer } from "@/lib/game/engine";
import { labels } from "@/lib/game/labels";
import { resultChoices } from "@/lib/game/results";
import { loadGameSetup, saveResumePlayers } from "@/lib/game/storage";
import type { GameMode, GameState } from "@/lib/game/types";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

type GamePageProps = {
  mode: GameMode;
};

type EffectState = {
  rainbow: boolean;
  shadow: boolean;
  finish: boolean;
  nextRound: boolean;
};

const initialEffects: EffectState = {
  rainbow: false,
  shadow: false,
  finish: false,
  nextRound: false,
};

export default function GamePage({ mode }: GamePageProps) {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedResult, setSelectedResult] = useState<number | null>(null);
  const [effects, setEffects] = useState(initialEffects);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const sounds = useGameSounds();

  useEffect(() => {
    const setup = loadGameSetup();
    if (!setup) {
      setGameState(null);
      return;
    }

    setGameState(createInitialGameState({ ...setup, mode: setup.mode ?? mode }));
  }, [mode]);

  const currentPlayer = useMemo(
    () => (gameState ? getCurrentPlayer(gameState) : null),
    [gameState],
  );

  const showTemporaryEffect = (effect: keyof EffectState, duration: number) => {
    setEffects((prev) => ({ ...prev, [effect]: true }));
    window.setTimeout(() => {
      setEffects((prev) => ({ ...prev, [effect]: false }));
    }, duration);
  };

  const handleResult = () => {
    if (!gameState || selectedResult === null) return;

    const outcome = applyResult(gameState, selectedResult);
    setGameState(outcome.state);
    setSelectedResult(null);

    if (outcome.sound) sounds.play(outcome.sound);
    if (outcome.effects.includes("rainbow")) showTemporaryEffect("rainbow", 2400);
    if (outcome.effects.includes("shadow")) showTemporaryEffect("shadow", 2400);
    if (outcome.effects.includes("finish")) showTemporaryEffect("finish", 3000);
    if (outcome.effects.includes("nextRound")) showTemporaryEffect("nextRound", 1500);
  };

  const backToSettings = () => {
    if (!gameState) return;
    saveResumePlayers(gameState.players);
    router.push("/");
  };

  if (!gameState) {
    return (
      <main className="game-shell">
        <p className="empty-message">{labels.messages.missingGameConfig}</p>
        <button className="primary-button wide-button" onClick={() => router.push("/")} type="button">
          {labels.actions.backToSettings}
        </button>
      </main>
    );
  }

  return (
    <main className="game-shell">
      <PreloadDiceImages />
      <header className="game-header">
        <h1>Round {gameState.round}</h1>
        <div className="cups-line">
          <span>{gameState.mode === "lose" ? labels.statuses.loser : labels.statuses.winner}</span>
          <strong>{gameState.cups}</strong>
          <span>{labels.fields.cupsUnit}</span>
          <small>{gameState.cups / 5} キャッシュ</small>
        </div>
      </header>

      <section className="player-list" aria-label={labels.sections.players}>
        {gameState.players.map((player) => (
          <div
            className={player.id === currentPlayer?.id ? "player-row active" : "player-row"}
            key={player.id}
          >
            <span className="player-name">{player.name}</span>
            <span className={`status-pill ${player.status}`}>{labels.statuses[player.status]}</span>
            {player.result !== null && <span className="player-result">{player.result}</span>}
          </div>
        ))}
      </section>

      <section className="settings-strip" aria-label={labels.sections.gameSettings}>
        <span>
          {labels.fields.addPerRound}: <strong>{gameState.addPerRound}</strong>
        </span>
        <span>
          {labels.fields.cutOff}: <strong>{gameState.cutOff}</strong>
        </span>
      </section>

      <section className="result-panel" aria-label="Result choices">
        <button
          className={selectedResult === 0 ? "text-choice selected" : "text-choice"}
          onClick={() => setSelectedResult(0)}
          type="button"
        >
          {labels.resultChoices.none}
        </button>

        <div className="image-choice-grid">
          {resultChoices
            .filter((choice) => choice.image)
            .map((choice) => (
              <button
                className="image-choice"
                key={choice.id}
                onClick={() => setSelectedResult(choice.value)}
                type="button"
                aria-label={labels.resultChoices[choice.labelKey]}
              >
                <img
                  src={selectedResult === choice.value ? choice.image?.selected : choice.image?.normal}
                  alt={choice.image?.alt}
                />
              </button>
            ))}
        </div>
      </section>

      <nav className="game-actions" aria-label="Game actions">
        <button
          className="primary-button wide-button"
          disabled={gameState.gameOver || selectedResult === null}
          onClick={handleResult}
          type="button"
        >
          {labels.actions.next}
        </button>
        <button className="secondary-button wide-button" onClick={() => setShowBackDialog(true)} type="button">
          {labels.actions.backToSettings}
        </button>
        <button
          className="secondary-button wide-button"
          disabled={!gameState.gameOver}
          onClick={() => router.reload()}
          type="button"
        >
          {labels.actions.playAgain}
        </button>
      </nav>

      {effects.rainbow && <div className="rainbow-overlay" />}
      {effects.shadow && <div className="shadow-overlay" />}
      {effects.finish && (
        <div className="finish-overlay">
          {labels.overlays.finish.split("").map((char, index) => (
            <span className="drop-text" key={`${char}-${index}`} style={{ animationDelay: `${index * 0.18}s` }}>
              {char}
            </span>
          ))}
        </div>
      )}
      {effects.nextRound && (
        <>
          <div className="next-round-overlay" />
          <div className="next-round-text">{labels.overlays.nextRound}</div>
        </>
      )}

      <MessageDialog
        open={showBackDialog}
        message={labels.messages.confirmBackToSettings}
        onConfirm={backToSettings}
        onCancel={() => setShowBackDialog(false)}
      />
    </main>
  );
}

function useGameSounds() {
  const refs = {
    "123": useRef<HTMLAudioElement | null>(null),
    "456": useRef<HTMLAudioElement | null>(null),
    triple: useRef<HTMLAudioElement | null>(null),
    "111": useRef<HTMLAudioElement | null>(null),
  };

  useEffect(() => {
    refs["123"].current = new Audio("/audios/123.wav");
    refs["456"].current = new Audio("/audios/456.mp4");
    refs.triple.current = new Audio("/audios/nnn.mp3");
    refs["111"].current = new Audio("/audios/111.mp3");
  }, []);

  return {
    play(sound: keyof typeof refs) {
      const audio = refs[sound].current;
      if (!audio) return;
      audio.currentTime = 0;
      void audio.play();
    },
  };
}
