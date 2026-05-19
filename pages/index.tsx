import ErrorDialog from "@/components/ErrorDialog";
import { labels } from "@/lib/game/labels";
import { loadResumePlayerNames, saveGameSetup } from "@/lib/game/storage";
import type { GameMode, Rule123 } from "@/lib/game/types";
import { type ConfigInput, validateConfig, validatePlayers } from "@/lib/game/validation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const defaultConfig: ConfigInput = {
  startCups: "",
  addPerRound: "",
  cutOff: "",
};

export default function Home() {
  const router = useRouter();
  const [config, setConfig] = useState<ConfigInput>(defaultConfig);
  const [players, setPlayers] = useState<string[]>([]);
  const [playerCount, setPlayerCount] = useState(2);
  const [backupPlayers, setBackupPlayers] = useState<string[]>([]);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [useRule123, setUseRule123] = useState(false);
  const [rule123Type, setRule123Type] = useState<Rule123["type"]>("revive");
  const [endCupLimit, setEndCupLimit] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const names = loadResumePlayerNames();
    if (names.length === 0) return;
    setPlayers(names);
    setPlayerCount(names.length);
  }, []);

  const updateNumericConfig = (key: keyof ConfigInput, value: string) => {
    if (/^\d*$/.test(value)) {
      setConfig((prev) => ({ ...prev, [key]: value }));
    }
  };

  const openPlayerDialog = () => {
    const count = players.length > 0 ? players.length : 2;
    setBackupPlayers(players);
    setPlayerCount(count);
    setPlayers((prev) => resizePlayers(prev, count));
    setIsPlayerDialogOpen(true);
  };

  const changePlayerCount = (count: number) => {
    setPlayerCount(count);
    setPlayers((prev) => resizePlayers(prev, count));
  };

  const startGame = (mode: GameMode) => {
    try {
      const validPlayers = validatePlayers(players);
      const parsedConfig = validateConfig(config);
      const rule123 = buildRule123();

      saveGameSetup({
        players: validPlayers,
        config: parsedConfig,
        rule123,
        mode,
      });

      router.push(mode === "lose" ? "/play" : "/play2");
    } catch (error) {
      if (error instanceof Error) setErrorMessage(error.message);
    }
  };

  const buildRule123 = (): Rule123 | null => {
    if (!useRule123) return null;
    if (rule123Type === "revive") return { type: "revive", endCupLimit: null };

    const limit = Number(endCupLimit);
    if (!limit || Number.isNaN(limit) || limit <= 0) {
      throw new Error(labels.messages.invalidEndCupLimit);
    }

    return { type: "end", endCupLimit: limit };
  };

  return (
    <main className="home-shell">
      <header className="home-header">
        <h1>{labels.appTitle}</h1>
        <p>{labels.appSubtitle}</p>
      </header>

      <section className="panel" aria-labelledby="players-heading">
        <div className="section-heading" id="players-heading">
          {labels.sections.players}
        </div>
        <button className="primary-button wide-button" onClick={openPlayerDialog} type="button">
          {labels.actions.addPlayers}
        </button>
        <div className="player-chip-list">
          {players.length === 0 ? (
            <span className="empty-message">{labels.messages.noPlayers}</span>
          ) : (
            players.map((player, index) => (
              <span className="player-chip" key={`${player}-${index}`}>
                {player}
                <button
                  aria-label={`${player} remove`}
                  onClick={() => setPlayers((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                  type="button"
                >
                  x
                </button>
              </span>
            ))
          )}
        </div>
      </section>

      <section className="panel" aria-labelledby="settings-heading">
        <div className="section-heading" id="settings-heading">
          {labels.sections.gameSettings}
        </div>

        <div className="field-stack">
          <NumericField
            label={labels.fields.startCups}
            unit={labels.fields.cupsUnit}
            value={config.startCups}
            onChange={(value) => updateNumericConfig("startCups", value)}
          />
          <NumericField
            label={labels.fields.addPerRound}
            unit={labels.fields.cupsUnit}
            value={config.addPerRound}
            onChange={(value) => updateNumericConfig("addPerRound", value)}
          />
          <NumericField
            label={labels.fields.cutOff}
            unit="以上"
            value={config.cutOff}
            onChange={(value) => updateNumericConfig("cutOff", value)}
          />
        </div>

        <div className="rule-box">
          <div className="section-heading small">{labels.sections.rule123}</div>
          <label className="check-row">
            <input
              checked={useRule123}
              onChange={(event) => {
                setUseRule123(event.target.checked);
                if (!event.target.checked) {
                  setRule123Type("revive");
                  setEndCupLimit("");
                }
              }}
              type="checkbox"
            />
            <span>123 特別ルールを有効にする</span>
          </label>

          <label className={useRule123 ? "radio-row" : "radio-row disabled"}>
            <input
              checked={rule123Type === "revive"}
              disabled={!useRule123}
              name="rule123"
              onChange={() => {
                setRule123Type("revive");
                setEndCupLimit("");
              }}
              type="radio"
            />
            <span>123 が出たら全員復活</span>
          </label>

          <label className={useRule123 ? "radio-row" : "radio-row disabled"}>
            <input
              checked={rule123Type === "end"}
              disabled={!useRule123}
              name="rule123"
              onChange={() => setRule123Type("end")}
              type="radio"
            />
            <span>123 が出たら終了</span>
          </label>

          <div className={useRule123 && rule123Type === "end" ? "nested-field" : "nested-field disabled"}>
            <input
              className="config-input"
              disabled={!useRule123 || rule123Type !== "end"}
              inputMode="numeric"
              onChange={(event) => {
                if (/^\d*$/.test(event.target.value)) setEndCupLimit(event.target.value);
              }}
              placeholder="0"
              type="text"
              value={endCupLimit}
            />
            <span>{labels.fields.endCupLimit}</span>
          </div>
        </div>
      </section>

      <div className="start-actions">
        <button className="start-button lose" onClick={() => startGame("lose")} type="button">
          {labels.actions.startLoseMode}
        </button>
        <button className="start-button win" onClick={() => startGame("win")} type="button">
          {labels.actions.startWinMode}
        </button>
      </div>

      {isPlayerDialogOpen && (
        <div className="dialog-backdrop" role="presentation">
          <div className="dialog player-dialog" role="dialog" aria-modal="true">
            <div className="dialog-title">{labels.sections.playerDialogTitle}</div>
            <label className="dialog-field">
              <span>{labels.fields.playerCount}</span>
              <select value={playerCount} onChange={(event) => changePlayerCount(Number(event.target.value))}>
                {Array.from({ length: 9 }, (_, index) => index + 2).map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>

            <div className="dialog-field-list">
              {players.map((name, index) => (
                <input
                  key={index}
                  onChange={(event) => {
                    const next = [...players];
                    next[index] = event.target.value;
                    setPlayers(next);
                  }}
                  placeholder={`${labels.fields.playerName}${index + 1}`}
                  type="text"
                  value={name}
                />
              ))}
            </div>

            <div className="dialog-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setPlayers(backupPlayers);
                  setIsPlayerDialogOpen(false);
                }}
                type="button"
              >
                {labels.actions.cancel}
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  try {
                    validatePlayers(players);
                    setIsPlayerDialogOpen(false);
                  } catch (error) {
                    if (error instanceof Error) setErrorMessage(error.message);
                  }
                }}
                type="button"
              >
                {labels.actions.done}
              </button>
            </div>
          </div>
        </div>
      )}

      <ErrorDialog
        open={errorMessage !== null}
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />
    </main>
  );
}

function NumericField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="numeric-field">
      <span>{label}</span>
      <input
        className="config-input"
        inputMode="numeric"
        onChange={(event) => onChange(event.target.value)}
        placeholder="0"
        type="text"
        value={value}
      />
      <span>{unit}</span>
    </label>
  );
}

function resizePlayers(players: string[], count: number) {
  const next = [...players];
  while (next.length < count) next.push("");
  return next.slice(0, count);
}
