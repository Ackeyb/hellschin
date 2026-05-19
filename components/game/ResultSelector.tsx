import { labels } from "@/lib/game/labels";
import { resultChoices } from "@/lib/game/results";
import styles from "@/styles/Game.module.css";

type ResultSelectorProps = {
  selectedResult: number | null;
  onSelect: (result: number) => void;
};

export default function ResultSelector({ selectedResult, onSelect }: ResultSelectorProps) {
  return (
    <section className={styles.resultPanel} aria-label="Result choices">
      <button
        className={selectedResult === 0 ? `${styles.textChoice} ${styles.selected}` : styles.textChoice}
        onClick={() => onSelect(0)}
        type="button"
      >
        {labels.resultChoices.none}
      </button>

      <div className={styles.imageChoiceGrid}>
        {resultChoices
          .filter((choice) => choice.image)
          .map((choice) => (
            <button
              aria-label={labels.resultChoices[choice.labelKey]}
              className={styles.imageChoice}
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
