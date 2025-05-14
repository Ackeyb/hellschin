import { app, analytics } from '../lib/firebase';
import { ESLINT_DEFAULT_DIRS } from 'next/dist/lib/constants';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NodeNextRequest } from 'next/dist/server/base-http/node';

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

  useEffect(() => {
    const data = localStorage.getItem("gameConfig");
    if (data) {
      const parsed = JSON.parse(data);
      setCups(parsed.config.startCups);
      setAddCups(parsed.config.addPerRound);
      setCutoff(parsed.config.cutOff);
      setPlayers(
        parsed.players.map((name: string) => ({
          name,
          canPlay: true,
          status: 'BATTLE中', // 初期ステータスは「BATTLE中」
        }))
      );
    }
  }, []);

  const activePlayers = players.filter(p => p.canPlay);
  const currentPlayer = activePlayers[turn] || null;

  // 選択された目に基づいて、結果を処理する関数
  const handleResult = () => {
    if (selectedResult === null) return;

    const activePlayers = players.filter(p => p.canPlay);
    const activePlayer = activePlayers[turn]; // 現在のプレイヤー（canPlay=true）

    const newPlayers = [...players];
    const playerIndex = players.findIndex(p => p.name === activePlayer.name);

    newPlayers[playerIndex].result = selectedResult - cutoff;

    if (selectedResult <= -100) {
      newPlayers[playerIndex].status = 'BATTLE中（一二三）';
      setShowEffect(true);
      setTimeout(() => {
        setShowEffect(false);
      } , 3000);      
    } else if (selectedResult < 0) {
      newPlayers[playerIndex].status = `BATTLE中（目なし）`;
    } else if (selectedResult < 100) {
      newPlayers[playerIndex].status = `BATTLE中（${selectedResult}）`;
      setCups(prev => prev * 1);
    } else if (selectedResult < 200) {
      newPlayers[playerIndex].status = 'BATTLE中（四五六）';
      setCups(prev => prev * 2);
    } else if (selectedResult < 300) {
      newPlayers[playerIndex].status = 'BATTLE中（ゾロ目）';
      setCups(prev => prev * 3);
    } else {
      newPlayers[playerIndex].status = 'BATTLE中（ピンゾロ）';
      setCups(prev => prev * 5);
    }

    // 最後のプレイヤーだったら判定処理
    if (turn === activePlayers.length - 1) {
      const alivePlayers = newPlayers.filter(p => p.canPlay);
      const zeroOrLess = alivePlayers.filter(p => (p.result ?? 0) <= 0);
      const aboveZero = alivePlayers.filter(p => (p.result ?? 0) > 0);
      const minResult = Math.min(...aboveZero.map(p => p.result ?? Infinity));
      const lowestScorers = aboveZero.filter(p => p.result === minResult);

      if (zeroOrLess.length === 1) {
        alivePlayers.forEach(p => {
          if ((p.result ?? 0) <= 0) {
            p.status = '負け犬';
            p.canPlay = false;
          } else {
            p.status = '勝ち抜け';
            p.canPlay = false;
          }
        });
        setGameOver(true);
      } else if (zeroOrLess.length >= 2) {
        alivePlayers.forEach(p => {
          if ((p.result ?? 0) <= 0) {
            p.status = 'BATTLE中';
            p.canPlay = true;
          } else {
            p.status = '勝ち抜け';
            p.canPlay = false;
          }
        });
        setCups(cups => cups + addcups)
      } else if (lowestScorers.length === 1) {
        alivePlayers.forEach(p => {
          if (p.result === minResult) {
            p.status = '負け犬';
            p.canPlay = false;
          } else {
            p.status = '勝ち抜け';
            p.canPlay = false;
          }
        });
        setGameOver(true);
      } else {
        alivePlayers.forEach(p => {
          if (lowestScorers.includes(p)) {
            p.status = 'BATTLE中';
            p.canPlay = true;
          } else {
            p.status = '勝ち抜け';
            p.canPlay = false;
          }
        });
        setCups(cups => cups + addcups)
      }

      setRound(prev => prev + 1);
      setTurn(0);
    } else {
      setTurn(prev => prev + 1);
    }

    setPlayers(newPlayers);
    setSelectedResult(null);
  };
    
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
        <strong>Round {round}</strong>
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
        <span>負け犬は</span>
        <span 
          style={{ 
            fontSize: "1.75em", 
            fontWeight: "bold", 
            margin: "2px", 
            color:"red", 
            lineHeight: "1"
          }}
        >
          {cups}
        </span>
        <span>杯　（キャップ</span> 
        <span 
          style={{ 
            fontSize: "1.5em", 
            fontWeight: "bold", 
            margin: "2px", 
            color:"red",
            lineHeight: "1"
          }}
        >
          {cups / 5}
        </span>
        <span>杯）</span> 
      </div>
      <div>
        <ul
          style={{
            border: "3px double black",
            width: "350px",
            padding: "8px",
            listStyleType: "none",
            margin: 0,
            marginBottom: "16px",
          }}
        >
          {players.map((p, i) => (
            <li
              key={i}
              style={{
                borderBottom: "1px solid gray",
                padding: "4px 0",
                ...(currentPlayer && p.name === currentPlayer.name
                  ? {
                      backgroundColor: "yellow",
                      color: "red",
                      fontWeight: "bold",
                    }
                  : {}),
                marginLeft:"1em",
                marginRight:"1em"
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
          marginBottom: "16px",
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
          {"飲めよ！".split("").map((char, i) => (
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
            backgroundColor: gameOver ? "#ccc" : "#4caf50",
            color: gameOver ? "#666" : "white",
            marginBottom:"10px"
          }}
        >
          NEXT
        </button>
    </div>

    <div>
      <button 
        onClick={() => router.push("/")}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          width: "350px",
          height:"40px"
        }}
      >
        設定ページに戻る
      </button>
    </div>

  </div>
  );
}
