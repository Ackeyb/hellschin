import { labels } from "@/lib/game/labels";

type PlayerSectionProps = {
  players: string[];
  onOpenDialog: () => void;
  onRemovePlayer: (index: number) => void;
};

export default function PlayerSection({ players, onOpenDialog, onRemovePlayer }: PlayerSectionProps) {
  return (
    <section className="panel" aria-labelledby="players-heading">
      <div className="section-heading" id="players-heading">
        {labels.sections.players}
      </div>
      <button className="primary-button wide-button" onClick={onOpenDialog} type="button">
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
                onClick={() => onRemovePlayer(index)}
                type="button"
              >
                x
              </button>
            </span>
          ))
        )}
      </div>
    </section>
  );
}
