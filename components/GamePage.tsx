import MessageDialog from "@/components/MessageDialog";
import PreloadDiceImages from "@/components/PreloadDiceImages";
import GameActionButtons from "@/components/game/GameActionButtons";
import GameEffects, { initialEffects, type EffectState } from "@/components/game/GameEffects";
import GameHeader from "@/components/game/GameHeader";
import GameSettingsStrip from "@/components/game/GameSettingsStrip";
import PlayerList from "@/components/game/PlayerList";
import ResultSelector from "@/components/game/ResultSelector";
import useGameSounds from "@/hooks/useGameSounds";
import { applyResult, createInitialGameState, getCurrentPlayer } from "@/lib/game/engine";
import { labels } from "@/lib/game/labels";
import { loadGameSetup, saveResumePlayers } from "@/lib/game/storage";
import type { GameMode, GameState } from "@/lib/game/types";
import styles from "@/styles/Game.module.css";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type GamePageProps = {
  mode: GameMode;
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
      <main className={styles.gameShell}>
        <p className="empty-message">{labels.messages.missingGameConfig}</p>
        <button className="primary-button wide-button" onClick={() => router.push("/")} type="button">
          {labels.actions.backToSettings}
        </button>
      </main>
    );
  }

  return (
    <main className={styles.gameShell}>
      <PreloadDiceImages />
      <GameHeader mode={gameState.mode} round={gameState.round} cups={gameState.cups} />
      <PlayerList players={gameState.players} currentPlayerId={currentPlayer?.id} />
      <GameSettingsStrip addPerRound={gameState.addPerRound} cutOff={gameState.cutOff} />
      <ResultSelector selectedResult={selectedResult} onSelect={setSelectedResult} />
      <GameActionButtons
        canAdvance={!gameState.gameOver && selectedResult !== null}
        gameOver={gameState.gameOver}
        onAdvance={handleResult}
        onBackToSettings={() => setShowBackDialog(true)}
        onPlayAgain={() => router.reload()}
      />
      <GameEffects effects={effects} />

      <MessageDialog
        open={showBackDialog}
        message={labels.messages.confirmBackToSettings}
        onConfirm={backToSettings}
        onCancel={() => setShowBackDialog(false)}
      />
    </main>
  );
}
