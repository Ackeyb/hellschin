import { labels } from "@/lib/game/labels";
import type { GameMode } from "@/lib/game/types";

type GameHeaderProps = {
  mode: GameMode;
  round: number;
  cups: number;
};

export default function GameHeader({ mode, round, cups }: GameHeaderProps) {
  return (
    <header className="game-header">
      <h1>Round {round}</h1>
      <div className="cups-line">
        <span>{mode === "lose" ? labels.statuses.loser : labels.statuses.winner}</span>
        <strong>{cups}</strong>
        <span>{labels.fields.cupsUnit}</span>
        <small>{cups / 5} キャッシュ</small>
      </div>
    </header>
  );
}
