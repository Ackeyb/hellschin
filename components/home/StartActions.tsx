import { labels } from "@/lib/game/labels";
import type { GameMode } from "@/lib/game/types";

type StartActionsProps = {
  onStart: (mode: GameMode) => void;
};

export default function StartActions({ onStart }: StartActionsProps) {
  return (
    <div className="start-actions">
      <button className="start-button lose" onClick={() => onStart("lose")} type="button">
        {labels.actions.startLoseMode}
      </button>
      <button className="start-button win" onClick={() => onStart("win")} type="button">
        {labels.actions.startWinMode}
      </button>
    </div>
  );
}
