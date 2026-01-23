import { app, analytics } from '../lib/firebase';
import { ESLINT_DEFAULT_DIRS } from 'next/dist/lib/constants';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NodeNextRequest } from 'next/dist/server/base-http/node';
import PreloadDiceImages from "../components/PreloadDiceImages";
import type { CSSProperties } from "react";

type Player = {
  name: string;
  result?: number;
  canPlay: boolean;
  status: string;
};

export default function PlayPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [round, setRound] = useState(1);
  const [cups, setCups] = useState(3);
  const [addcups, setAddCups] = useState(1)
  const [turn, setTurn] = useState(0);
  const [cutoff, setCutoff] = useState(2)
  const [selectedResult, setSelectedResult] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [showEffect, setShowEffect] = useState(false);
  const [showRainbow, setShowRainbow] = useState(false);
  const [showShadow, setShowShadow] = useState(false);
  const [showNextRound, setShowNextRound] = useState(false);
  const [reviveOn123, setReviveOn123] = useState(false);
  const [revivedThisRound, setRevivedThisRound] = useState(false);
  const sound123 = useRef(null);
  const sound456 = useRef(null);
  const soundnnn = useRef(null);
  const sound111 = useRef(null);
  const isLastPlayer = (index: number, players: Player[]) => index === players.length - 1;
  const [rule123, setRule123] = useState<{
    type: "end" | "revive";
    endCupLimit: number | null;
  } | null>(null);
  const isRule123Enabled = Boolean(rule123);
  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "linear-gradient(#fff5f5, #fffaf0)",
    minHeight: "100vh",
  };
  const panelStyle = {
    width: "350px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    padding: "8px",
    marginBottom: "10px",
  };

  const titleStyle = {
    fontSize: "1.4em",
    fontWeight: "bold",
  };

  const buttonStyle = {
    width: "350px",
    height: "40px",
    borderRadius: "20px",
    fontWeight: "bold",
    cursor: "pointer",
  };

    
  useEffect(() => {
    const data = localStorage.getItem("gameConfig");
    if (data) {
      const parsed = JSON.parse(data);
      setCups(parsed.config.startCups);
      setAddCups(parsed.config.addPerRound);
      setCutoff(parsed.config.cutOff);
      setRule123(parsed.rule123);
      setPlayers(
        parsed.players.map((name: string) => ({
          name,
          canPlay: true,
          status: 'BATTLE！',
        }))
      );
    }

    // 123復活フラグの読み込み
    const reviveFlag = localStorage.getItem("reviveOn123");
    setReviveOn123(reviveFlag === "true");

    if (typeof window !== "undefined") {
      sound123.current = new Audio("/audios/123.wav");
      sound456.current = new Audio("/audios/456.mp4");
      soundnnn.current = new Audio("/audios/nnn.mp3");
      sound111.current = new Audio("/audios/111.mp3");
    }
  }, []);

  const activePlayers = players.filter(p => p.canPlay);
  const currentPlayer = activePlayers[turn] || null;
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 選択された目に基づいて、結果を処理する関数
  const handleResult = async () => {
  if (selectedResult === null) return;

    const newPlayers = [...players];
    const activePlayers = newPlayers.filter(p => p.canPlay);
    const activePlayer = activePlayers[turn];
    const playerIndex = newPlayers.findIndex(p => p.name === activePlayer.name);

    // 現在の結果をセット
    newPlayers[playerIndex].result = selectedResult - cutoff;

  // 123（クソザコ）
  if (selectedResult <= -100) {

    // ① ステータス & 演出
    newPlayers[playerIndex].status = 'クソザコ（一二三）';

    sound123.current?.play();
    setShowShadow(true);
    setTimeout(() => setShowShadow(false), 3800);
    await sleep(3500);

    // ② まず表示反映（超重要）
    setPlayers([...newPlayers]);

    // ③ end ルール（最優先）
    if (
      rule123 &&
      rule123.type === "end" &&
      cups >= rule123.endCupLimit
    ) { 
      setShowNextRound(false); 
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 3000);
      setGameOver(true);
      return;
    }

    // ④ revive ルール
    if (
      rule123 &&
      rule123.type === "revive"
    ) {
      newPlayers.forEach(p => {
        p.canPlay = true;
        p.status = "復活！";
        p.result = 0;
      });
      setPlayers([...newPlayers]);
      setTurn(0);
      return;
    }  
  } else if (selectedResult <= 0) {
    newPlayers[playerIndex].status = `ほぼ負け犬（目なし）`;
  } else if (selectedResult < 100) {
    newPlayers[playerIndex].status = `まぁまぁ（${selectedResult}）`;
  } else if (selectedResult < 200) {
    newPlayers[playerIndex].status = '激強（四五六）';
    sound456.current?.play();
    setShowRainbow(true);
    setTimeout(() => setShowRainbow(false), 5500);
    await sleep(5800);
    setCups(prev => prev * 2);
  } else if (selectedResult < 300) {
    newPlayers[playerIndex].status = '超激強（ゾロ目）';
    soundnnn.current?.play();
    setShowRainbow(true);
    setTimeout(() => setShowRainbow(false), 3500);
    await sleep(3800);
    setCups(prev => prev * 3);
  } else {
    newPlayers[playerIndex].status = 'ほぼ神（ピンゾロ）';
    sound111.current?.play();
    setShowRainbow(true);
    setTimeout(() => setShowRainbow(false), 5700);
    await sleep(6000);
    setCups(prev => prev * 5);
  }

  // ラウンドの最後のプレイヤーだった場合
  const currentActivePlayers = newPlayers.filter(p => p.canPlay);
  if (turn === currentActivePlayers.length - 1) {
    const zeroOrLess = currentActivePlayers.filter(p => (p.result ?? 0) <= 0);
    const aboveZero = currentActivePlayers.filter(p => (p.result ?? 0) > 0);
    const minResult = Math.min(...aboveZero.map(p => p.result ?? Infinity));
    const lowestScorers = aboveZero.filter(p => p.result === minResult);

    if (zeroOrLess.length === 1) {
      currentActivePlayers.forEach(p => {
        if ((p.result ?? 0) <= 0) {
          p.status = '負け犬';
          p.canPlay = false;
        } else {
          p.status = '勝ち抜け';
          p.canPlay = false;
        }
      });
      setShowNextRound(false); 
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 3000);
      setGameOver(true);

    } else if (zeroOrLess.length >= 2) {
      currentActivePlayers.forEach(p => {
        if ((p.result ?? 0) <= 0) {
          p.status = '負け犬候補';
          p.canPlay = true;
        } else {
          p.status = '勝ち抜け';
          p.canPlay = false;
        }
      });
      setCups(prev => prev + addcups);

    } else if (lowestScorers.length === 1) {
      currentActivePlayers.forEach(p => {
        if (p.result === minResult) {
          p.status = '負け犬';
          p.canPlay = false;
        } else {
          p.status = '勝ち抜け';
          p.canPlay = false;
        }
      });
      setShowNextRound(false); 
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 3000);
      setGameOver(true);

    } else {
      currentActivePlayers.forEach(p => {
        if (lowestScorers.includes(p)) {
          p.status = '負け犬候補';
          p.canPlay = true;
        } else {
          p.status = '勝ち抜け';
          p.canPlay = false;
        }
      });
      setCups(prev => prev + addcups);
    }

const isGameFinished = newPlayers.filter(p => p.canPlay).length <= 1;

if (isGameFinished) {
  // 完全決着
  setShowNextRound(false);      // NEXT は出さない
  setShowEffect(true);
  setTimeout(() => setShowEffect(false), 3000);
  setGameOver(true);
} else if (!newPlayers.some(p => p.status === '負け犬')) {
  // NEXT を表示していいケースだけ
  setShowNextRound(true);
  setTimeout(() => setShowNextRound(false), 1500);
  setRound(prev => prev + 1);
  setTurn(0);
}

  } else {
    // ラウンド途中なら次のターン
    const nextActivePlayers = newPlayers.filter(p => p.canPlay);
    setTurn(prev => (prev + 1) % nextActivePlayers.length);
  }

  setPlayers(newPlayers);
  setSelectedResult(null);
};
    
  return (
    <div style={containerStyle}>
      <div
        style={{
          border: "None",
          borderBottom: "1px solid gray",
          width: "350px",
          marginTop:"5px",
          marginBottom: "10px",
          display: "flex",
          justifyContent: "center",
          fontSize: "1.75em"
        }}
      >
        <span style={titleStyle}>Round {round}</span>
      </div>
      <div
        style={{
          border: "None",
          borderBottom: "1px double black",
          width: "350px",
          marginBottom: "10px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          whiteSpace: "nowrap",
        }}
      >
        <span>負け犬は </span>
        <span style={{ fontSize: "2em", fontWeight: "bold", color: "#e11d48" }}>
          {cups}
        </span>
        <span> 杯</span>
        <div style={{ fontSize: "0.9em", color: "#666" }}>
          （キャップ {cups / 5} 杯）
        </div>
      </div>
      <div>
        <ul
          style={{
            border: "3px double black",
            width: "350px",
            padding: "8px",
            listStyleType: "none",
            margin: 0,
            marginBottom: "10px",
          }}
        >
          {players.map((p, i) => (
            <li
              key={i}
              style={{
                padding: "2px 0",
                marginBottom: "4px",
                borderRadius: "8px",
                backgroundColor:
                  currentPlayer && p.name === currentPlayer.name
                    ? "#fff1f2"
                    : "transparent",
                color:
                  currentPlayer && p.name === currentPlayer.name
                    ? "#e11d48"
                    : "#333",
                fontWeight:
                  currentPlayer && p.name === currentPlayer.name
                    ? "bold"
                    : "normal",
              }}
            >
              <span>　</span>
              {p.name}：
              {p.status === "勝ち抜け" ? (
                <span>🏆 勝ち抜け</span>
              ) : p.status === "負け犬" ? (
                <span>❌ 負け犬</span>
              ) : (
                <span>🟢 {p.status}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* 設定情報表示 */}
      <div
        style={{
          border: "1px solid #333",
          padding: "5px",
          borderRadius: "8px",
          width: "350px",
          marginBottom: "10px",
          backgroundColor: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ display:"flex"}}>
          <span style={{ marginRight: "1em" }}>
            <strong>{addcups}杯増し</strong>
          </span>
          <span style={{ marginRight: "1em" }}>
            <strong>：</strong>
          </span>
          <span>
            <strong>{cutoff}以下目無し</strong>
          </span>
        </div>
      </div>

      <div>
        <button
          onClick={() => setSelectedResult(0)}
          style={{
            backgroundColor: selectedResult === 0 ? "#ffffff" : "rgba(0, 0, 0, 0.3)",
            color: selectedResult === 0 ? "#000000" : "#ffffff",
            padding: "8px 16px",
            border: selectedResult === 0 ? "thin solid" : "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            width: "350px",
            height:"40px",
            marginBottom:"8px"
          }}
        >
          出目なし
        </button>
      </div>

      <div>
        {[1, 2, 3, 4, 5, 6].map(n => (
          <button
            key={n}
            onClick={() => setSelectedResult(n)}
            style={{ background: "none", border: "none", padding: 0 }}
          >
            <img
              src={
                selectedResult === n
                  ? `/images/Dice_Selected_${n}.png`
                  : `/images/Dice_${n}.png`
              }
              alt={`Dice ${n}`}
              style={{ height: "50px", marginRight:"5px"}}
            />
          </button>
        ))}
      </div>

      <div>
        <button 
          onClick={() => setSelectedResult(-100)}
          style={{ background: "none", border: "none", padding: 0 }}
        >
        <img 
              src={
                selectedResult === -100
                  ? `/images/Hand_Selected_123.png`
                  : `/images/Hand_123.png`
              }
              style={{ height:"50px", marginRight:"10px"}}
          />
        </button>
        <button 
          onClick={() => setSelectedResult(106)}
          style={{ background: "none", border: "none", padding: 0 }}
        >
        <img 
              src={
                selectedResult === 106
                  ? `/images/Hand_Selected_456.png`
                  : `/images/Hand_456.png`
              }
              style={{ height:"50px"}}
          />
        </button>
      </div>

      <div>
        <button 
          onClick={() => setSelectedResult(206)}
          style={{ background: "none", border: "none", padding: 0 }}
        >
        <img 
              src={
                selectedResult === 206
                  ? `/images/Hand_Selected_nnn.png`
                  : `/images/Hand_nnn.png`
              }
              style={{ height:"50px", marginRight:"10px"}}
          />
        </button>
        <button 
          onClick={() => setSelectedResult(306)}
          style={{ background: "none", border: "none", padding: 0 }}
        >
        <img 
              src={
                selectedResult === 306
                  ? `/images/Hand_Selected_111.png`
                  : `/images/Hand_111.png`
              }
              style={{ height:"50px"}}
          />
        </button>
      </div>

      {showRainbow && <div className="rainbow-overlay" />}    
      {showShadow && <div className="Shadow-overlay" />}    

      {showEffect && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // ← 半透明の黒背景
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {"完全決着".split("").map((char, i) => (
            <span
              key={i}
              className="drop-text"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              {char}
            </span>
          ))}
        </div>
      )}
      
      {/* NEXTボタンを押すとhandleResultが呼ばれる */}
      <div>
        <button 
          onClick={handleResult}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: gameOver ? "not-allowed" : "pointer",
            width: "350px",
            height:"40px",
            backgroundColor: gameOver ? "#ccc" : "#22c55e",
            color: "white",
            boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
            marginBottom:"5px"
          }}
        >
          NEXT
        </button>
    </div>

    <div>
      <button
        onClick={() => {
          const ok = window.confirm("本当に設定ページに戻っちゃうの？");
          if (ok) {
            router.push("/");
          }
        }}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          width: "350px",
          height: "40px",
          marginBottom: "5px"
        }}
      >
        設定ページに戻る
      </button>
    </div>

    <div>
      <button 
        onClick={() => {
          if (gameOver) {
            router.reload();
          }
        }}
        disabled={!gameOver}
        style={{
          padding: "8px 16px",
          borderRadius: "20px",
          fontWeight: "bold",
          cursor: gameOver ? "pointer" : "not-allowed",
          width: "350px",
          height: "40px",
          backgroundColor: gameOver ? "#3b82f6" : "#ccc",
          color: "white",
          border: "none",
        }}
      >
        もう一回遊べるドン
      </button>
    </div>

    {showNextRound && (
      <>
        <div className="next-round-overlay" />
        <div className="next-round-text">NEXT!!</div>
      </>
    )}

  </div>
  );
}
