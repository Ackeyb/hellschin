import { app, analytics } from '../lib/firebase';
import { useState } from "react";
import { useRouter } from "next/router";
import MessageDialog from "@/components/ErrorDialog";
import { useEffect } from "react";

export default function Home() {
  const [config, setConfig] = useState<ConfigInput>({
    startCups: "",
    addPerRound: "",
    cutOff: "",
  });
  const router = useRouter();
  const [useRule123, setUseRule123] = useState(false);
  const [rule123, setRule123] = useState<"revive" | "end">("revive");
  const [endCupLimit, setEndCupLimit] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [playerCount, setPlayerCount] = useState(2);
  const [backupPlayers, setBackupPlayers] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("resumePlayers");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as { name: string }[];

      // 名前だけ取り出す
      const names = parsed.map(p => p.name);

      setPlayers(names);
      setPlayerCount(names.length);

      // 使い切りにしたいなら消す（任意）
      localStorage.removeItem("resumePlayers");
    } catch {
      // 壊れてたら無視
      localStorage.removeItem("resumePlayers");
    }
  }, []);

  type GameConfig = {
    startCups: number;
    addPerRound: number;
    cutOff: number;
  };

  type ConfigInput = {
    startCups: string;
    addPerRound: string;
    cutOff: string;
  };

  type ParsedConfig = {
    startCups: number;
    addPerRound: number;
    cutOff: number;
  };

  const openPlayerDialog = () => {
    setBackupPlayers(players);

    const count = players.length > 0 ? players.length : 2;
    setPlayerCount(count);

    setPlayers((prev) => {
      const next = [...prev];
      while (next.length < count) next.push("");
      return next.slice(0, count);
    });

    setIsDialogOpen(true);
  };

  const changePlayerCount = (count: number) => {
    setPlayerCount(count);

    setPlayers((prev) => {
      const next = [...prev];
      while (next.length < count) next.push("");
      return next.slice(0, count);
    });
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const ruleCardStyle = (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    borderRadius: "10px",
    backgroundColor: active ? "#fff" : "#f8dfe5",
    border: active
      ? "1px solid #f3a1b3"
      : "1px dashed #f3a1b3",
    boxShadow: active
      ? "0 2px 6px rgba(233,107,138,0.2)"
      : "none",
    opacity: useRule123 ? 1 : 0.4,
  });

  type GameMode = "lose" | "win";

  const startGameBase = (mode: GameMode) => {
    try {
      const validPlayers = validatePlayers(players);
      const parsedConfig = validateConfig(config);

      if (useRule123 && rule123 === "end") {
        const limit = Number(endCupLimit);
        if (!limit || isNaN(limit) || limit <= 0) {
          throw new Error("終了条件の杯数がゼロとかナメてんの？");
        }
      }

      saveGameConfig({
        players: validPlayers,
        config: parsedConfig,
        rule123: useRule123
          ? {
              type: rule123,
              endCupLimit: rule123 === "end" ? Number(endCupLimit) : null,
            }
          : null,
        mode,
      });

      router.push(mode === "lose" ? "/play" : "/play2");
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(e.message);
      }
    }
  };

  const validatePlayers = (players: string[]) => {
    const trimmed = players.map((p) => p.trim());

    if (trimmed.length < 2) {
      throw new Error("その人数でどうやって遊ぶん？");
    }

    if (trimmed.some((p) => p === "")) {
      throw new Error("名前ないやついる！");
    }

    if (new Set(trimmed).size !== trimmed.length) {
      throw new Error("同じ名前のやついる！");
    }

    return trimmed;
  };

  const validateConfig = (config: {
    startCups: string;
    addPerRound: string;
    cutOff: string;
  }): ParsedConfig => {

    const parsed = {
      startCups: Number(config.startCups),
      addPerRound: Number(config.addPerRound),
      cutOff: Number(config.cutOff),
    };

    if (Object.values(parsed).some((v) => isNaN(v))) {
      throw new Error("設定値はすべて数字じゃないとおかしくなるでしょ！");
    }

    if (parsed.startCups <= 0) {
      throw new Error("スタート杯数がゼロとか飲む気ないの？");
    }

    if (parsed.cutOff < 0 || parsed.cutOff >= 7) {
      throw new Error("サイコロの出目って0～6だって知らんの？");
    }

    return parsed;
  };


  const saveGameConfig = (data: {
    players: string[];
    config: {
      startCups: number;
      addPerRound: number;
      cutOff: number;
    };
    rule123: null | {
      type: "revive" | "end";
      endCupLimit: number | null;
    };
    mode: "lose" | "win";
  }) => {
    localStorage.setItem("gameConfig", JSON.stringify(data));
  };


  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "480px",
        margin: "0 auto",
        backgroundColor: "#fde7ec",
        borderRadius: "16px",
      }}
    >
      <h1
        style={{
          fontSize: "1.4rem",
          fontWeight: "bold",
          marginBottom: "20px",
          textAlign: "center",
          color: "#fa0238",
          borderBottom: "2px solid #f3a1b3",
          borderTop: "2px solid #f3a1b3",
          paddingBottom: "8px",
        }}
      >
        ♡みんなで楽しく幸せ♡<br/>♥天使のちんちろりん♥
      </h1>

      {/* ▼▼▼ プレイヤー管理 ▼▼▼ */}
      <div
        style={{
          margin: "24px auto",
          padding: "16px 20px",
          maxWidth: "420px",
          borderRadius: "12px",
          border: "1px solid #ddd",
          backgroundColor: "#fff",
        }}
      >
        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            marginBottom: "12px",
            paddingBottom: "6px",
            borderBottom: "1px dashed #f3a1b3",
            color: "#6b3a44",
            textAlign: "center",
          }}
        >
          プレイヤー管理
        </div>

        <button
          onClick={openPlayerDialog}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "#e96b8a",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: "12px",
          }}
        >
          ＋ プレイヤーを追加
        </button>

        {/* プレイヤー一覧 */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "12px",
            justifyContent: "center",
          }}
        >
          {players.length === 0 ? (
            <span style={{ color: "#aaa" }}>まだプレイヤーがいません</span>
          ) : (

            players.map((player, index) => (
              <div
                key={index}
                style={{
                  position: "relative", // ← これ重要
                  padding: "6px 28px 6px 12px",
                  borderRadius: "999px",
                  backgroundColor: "#fde7ec",
                  border: "1px solid #f3a1b3",
                  color: "#6b3a44",
                  fontWeight: "bold",
                  boxShadow: "0 2px 4px rgba(233,107,138,0.2)",
                }}
              >
                {player}

                {/* 削除ボタン */}
                <button
                  onClick={() => removePlayer(index)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "8px",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#b44562",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "14px",
                    lineHeight: 1,
                  }}
                  aria-label={`${player}を削除`}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ▼▼▼ ゲーム設定 ▼▼▼ */}
      <div
        style={{
          marginTop: "16px",
          padding: "12px 16px",
          borderRadius: "12px",
          border: "1px dashed #f3a1b3",
          backgroundColor: "#fde7ec",
        }}
      >
        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            paddingBottom: "6px",
            borderBottom: "1px dashed #f3a1b3",
            color: "#6b3a44",
            textAlign: "center",
          }}
        >
          ゲーム設定
        </div>

        <div style={{ paddingTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              borderRadius: "10px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 6px rgba(233,107,138,0.15)",
            }}
          >
            <span style={{ width: "96px", fontWeight: "bold", color: "#6b3a44" }}>🌸 スタート</span>
            <div style={{ display: "flex", alignItems: "center", gap: "36px" }}>
              <input
                type="text"
                inputMode='numeric'
                value={config.startCups}
                placeholder="0"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setConfig({ ...config, startCups: value });
                    }
                  }}            
                className="config-input"
              />
              <span style={{ color: "#6b3a44", fontWeight: "bold" }}>杯</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              borderRadius: "10px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 6px rgba(233,107,138,0.15)",
            }}
          >
            <span style={{ width: "96px", fontWeight: "bold", color: "#6b3a44" }}>🌸 増 加</span>
            <div style={{ display: "flex", alignItems: "center", gap: "36px" }}>
              <input
                type="text"
                inputMode='numeric'
                value={config.addPerRound}
                placeholder="0"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setConfig({ ...config, addPerRound: value });
                    }
                  }}            
                className="config-input"
              />
              <span style={{ color: "#6b3a44", fontWeight: "bold" }}>杯</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              borderRadius: "10px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 6px rgba(233,107,138,0.15)",
            }}
          >
            <span style={{ width: "96px", fontWeight: "bold", color: "#6b3a44" }}>🌸 目無し</span>
            <div style={{ display: "flex", alignItems: "center", gap: "36px" }}>
              <input
                type="text"
                inputMode='numeric'
                value={config.cutOff}
                placeholder="0"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setConfig({ ...config, cutOff: value });
                    }
                  }}            
                className="config-input"
              />
              <span style={{ color: "#6b3a44", fontWeight: "bold" }}>以下</span>
            </div>
          </div>
        </div>

        {/* ▼▼▼ 123特別ルール ▼▼▼ */}
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            borderRadius: "14px",
            background: "linear-gradient(180deg, #fff0f5, #fde7ec)",
            border: "1px solid #f3a1b3",
            boxShadow: "0 4px 12px rgba(233,107,138,0.2)",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: "1.05rem",
              color: "#b44562",
              marginBottom: "10px",
            }}
          >
            💫 天使の特別ルール
          </div>

          {/* ON/OFF チェックボックス */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 12px",
              borderRadius: "10px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 6px rgba(233,107,138,0.15)",
              marginBottom: "12px",
            }}
          >
            <input
              type="checkbox"
              id="useRule123"
              checked={useRule123}
              onChange={(e) => {
                const checked = e.target.checked;
                setUseRule123(checked);
                if (!checked) {
                  setRule123("revive");
                  setEndCupLimit("");
                }
              }}
            />
            <label
              htmlFor="useRule123"
              style={{
                fontWeight: "bold",
                color: "#6b3a44",
              }}
            >
              123特別ルールを有効にする
            </label>
          </div>

          {/* ラジオボタン群 */}
          <div style={ruleCardStyle(rule123 === "revive")}>
            <input
              type="radio"
              name="rule123"
              id="rule123-revive"
              value="revive"
              checked={rule123 === "revive"}
              disabled={!useRule123}
              onChange={(e) => {
                const value = e.target.value as "revive" | "end";
                setRule123(value);

                // ★ revive に切り替えた瞬間に消す
                if (value !== "end") {
                  setEndCupLimit("");
                }
              }}
            />
            <label htmlFor="rule123-revive" style={{ fontWeight: "bold" }}>
              🌈 123が出たら全員復活
            </label>
          </div>

          {/* 終了＋条件 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={ruleCardStyle(rule123 === "end")}>
              <input
                type="radio"
                name="rule123"
                id="rule123-end"
                value="end"
                checked={rule123 === "end"}
                disabled={!useRule123}
                onChange={(e) =>
                  setRule123(e.target.value as "revive" | "end")
                }
              />
              <label htmlFor="rule123-end" style={{ fontWeight: "bold" }}>
                ⛔ 123が出たら終了
              </label>
            </div>

            {/* 条件 */}
            <div
              style={{
                marginLeft: "24px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 10px",
                borderRadius: "10px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 6px rgba(233,107,138,0.15)",
                opacity: useRule123 && rule123 === "end" ? 1 : 0.4,
              }}
            >
              <input
                type="text"
                inputMode="numeric"
                value={endCupLimit}
                placeholder="0"
                disabled={!useRule123 || rule123 !== "end"}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) setEndCupLimit(value);
                }}
                className="config-input"
                style={{ width: "60px" }}
              />
              <span style={{ fontWeight: "bold", color: "#6b3a44" }}>
                杯以上で終了
              </span>
            </div>
          </div>

        </div>
      </div>

      <div
        style={{
          marginTop: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => startGameBase("lose")}
          className="start-button lose"
        >
          😈 負け残りでスタート
        </button>

        <button
          onClick={() => startGameBase("win")}
          className="start-button win"
        >
          😇 勝ち抜けでスタート
        </button>
      </div>

      {isDialogOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "360px",
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            {/* タイトル */}
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "16px",
                color: "#6b3a44",
              }}
            >
              👼 プレイヤーを追加
            </div>

          {/* 人数選択 */}
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                fontWeight: "bold",
                color: "#6b3a44",
                marginBottom: "8px",
              }}
            >
              👥 人数を選択
            </div>

            <select
              value={playerCount}
              onChange={(e) => changePlayerCount(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            >
              {[...Array(9)].map((_, i) => {
                const n = i + 2;
                return (
                  <option key={n} value={n}>
                    {n} 人
                  </option>
                );
              })}
            </select>
          </div>

          {/* 名前入力 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {players.map((name, index) => (
              <input
                key={index}
                type="text"
                placeholder={`プレイヤー${index + 1}`}
                value={name}
                onChange={(e) => {
                  const next = [...players];
                  next[index] = e.target.value;
                  setPlayers(next);
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                  backgroundColor: "#fff",
                }}
              />
            ))}
          </div>

            {/* ボタン */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "16px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setPlayers(backupPlayers);
                  setIsDialogOpen(false);
                }}
                style={{
                  padding: "10px",
                  borderRadius: "999px",
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                キャンセル
              </button>

              <button
                onClick={() => {
                  try {
                    validatePlayers(players);
                    setIsDialogOpen(false);
                  } catch (e) {
                    if (e instanceof Error) {
                      setErrorMessage(e.message);
                    }
                  }
                }}
                style={{
                  padding: "10px 22px",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor: "#e96b8a",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                完了
              </button>
            </div>
          </div>
        </div>
      )}

      <MessageDialog
        open={errorMessage !== null}
        title="えらーーー！"
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />

    </div>
  );
}
