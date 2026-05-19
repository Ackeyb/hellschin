import { labels } from "@/lib/game/labels";
import type { Player } from "@/lib/game/types";

type PlayerListProps = {
  players: Player[];
  currentPlayerId?: string;
};

export default function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <section className="player-list" aria-label={labels.sections.players}>
      {players.map((player) => (
        <div
          className={player.id === currentPlayerId ? "player-row active" : "player-row"}
          key={player.id}
        >
          <span className="player-name">{player.name}</span>
          <span className={`status-pill ${player.status}`}>{labels.statuses[player.status]}</span>
          {player.result !== null && <span className="player-result">{player.result}</span>}
        </div>
      ))}
    </section>
  );
}
