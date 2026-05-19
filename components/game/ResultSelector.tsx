import { labels } from "@/lib/game/labels";
import { resultChoices } from "@/lib/game/results";

type ResultSelectorProps = {
  selectedResult: number | null;
  onSelect: (result: number) => void;
};

export default function ResultSelector({ selectedResult, onSelect }: ResultSelectorProps) {
  return (
    <section className="result-panel" aria-label="Result choices">
      <button
        className={selectedResult === 0 ? "text-choice selected" : "text-choice"}
        onClick={() => onSelect(0)}
        type="button"
      >
        {labels.resultChoices.none}
      </button>

      <div className="image-choice-grid">
        {resultChoices
          .filter((choice) => choice.image)
          .map((choice) => (
            <button
              aria-label={labels.resultChoices[choice.labelKey]}
              className="image-choice"
              key={choice.id}
              onClick={() => onSelect(choice.value)}
              type="button"
            >
              <img
                src={selectedResult === choice.value ? choice.image?.selected : choice.image?.normal}
                alt={choice.image?.alt}
              />
            </button>
          ))}
      </div>
    </section>
  );
}
