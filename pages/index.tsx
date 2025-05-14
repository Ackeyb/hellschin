import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [players, setPlayers] = useState<string[]>(["", ""]);
  const [config, setConfig] = useState({ startCups: 3, addPerRound: 1, cutOff: 2 });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);

    // プレイヤー名が重複していないかチェック
    const nonEmptyPlayers = newPlayers.filter(player => player.trim() !== ""); // 空白を除いたプレイヤー
    const uniquePlayers = new Set(nonEmptyPlayers);
    
    if (uniquePlayers.size !== nonEmptyPlayers.length) {
      setError("プレイヤー名は重複できません");
    } else {
      setError(null);
    }
  };

  const addPlayerField = () => {
    if (players.length < 10) setPlayers([...players, ""]);
  };

  const startGame = () => {
    const validPlayers = players.filter((p) => p.trim() !== "");
    if (validPlayers.length < 2) return alert("2人以上必要です");

    // プレイヤー名が重複している場合はゲーム開始できない
    const uniquePlayers = new Set(validPlayers);
    if (uniquePlayers.size !== validPlayers.length) {
      return alert("プレイヤー名が重複しています");
    }

    localStorage.setItem("gameConfig", JSON.stringify({ players: validPlayers, config }));
    router.push("/play");
  };

  return (
    <div style={{ padding: "24px", maxWidth: "480px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "16px" }}>
        ちんちろりん 設定
      </h1>

      {/* ▼▼▼ プレイヤー入力部 ▼▼▼ */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {players.map((p, i) => (
          <input
            key={i}
            value={p}
            onChange={(e) => handlePlayerChange(i, e.target.value)}
            placeholder={`プレイヤー${i + 1}`}
            className="player-input"
          />
        ))}
        {players.length < 10 && (
          <button onClick={addPlayerField} className="player-button">
            プレイヤー追加
          </button>
        )}
      </div>

      {/* ▼▼▼ 設定入力部 ▼▼▼ */}
      <div style={{ paddingTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="number"
            value={config.startCups}
            onChange={(e) => setConfig({ ...config, startCups: +e.target.value })}
            className="config-input"
          />
          <span style={{ marginLeft: "8px", fontWeight: "bold" }}>杯スタート</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="number"
            value={config.addPerRound}
            onChange={(e) => setConfig({ ...config, addPerRound: +e.target.value })}
            className="config-input"
          />
          <span style={{ marginLeft: "8px", fontWeight: "bold" }}>杯増し</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="number"
            min={0}
            max={6}
            value={config.cutOff}
            onChange={(e) => setConfig({ ...config, cutOff: +e.target.value })}
            className="config-input"
          />
          <span style={{ marginLeft: "8px", fontWeight: "bold" }}>以下目無し</span>
        </div>
      </div>

      {/* ▼▼▼ ゲーム開始ボタン ▼▼▼ */}
      <div style={{ marginTop: "24px" }}>
        <button onClick={startGame} className="start-button">
          ゲーム開始
        </button>
      </div>
    </div>
  );
}
