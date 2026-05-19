import { labels } from "@/lib/game/labels";

type GameActionButtonsProps = {
  canAdvance: boolean;
  gameOver: boolean;
  onAdvance: () => void;
  onBackToSettings: () => void;
  onPlayAgain: () => void;
};

export default function GameActionButtons({
  canAdvance,
  gameOver,
  onAdvance,
  onBackToSettings,
  onPlayAgain,
}: GameActionButtonsProps) {
  return (
    <nav className="game-actions" aria-label="Game actions">
      <button
        className="primary-button wide-button"
        disabled={!canAdvance}
        onClick={onAdvance}
        type="button"
      >
        {labels.actions.next}
      </button>
      <button className="secondary-button wide-button" onClick={onBackToSettings} type="button">
        {labels.actions.backToSettings}
      </button>
      <button
        className="secondary-button wide-button"
        disabled={!gameOver}
        onClick={onPlayAgain}
        type="button"
      >
        {labels.actions.playAgain}
      </button>
    </nav>
  );
}
