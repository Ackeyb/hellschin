import { labels } from "@/lib/game/labels";

type GameSettingsStripProps = {
  addPerRound: number;
  cutOff: number;
};

export default function GameSettingsStrip({ addPerRound, cutOff }: GameSettingsStripProps) {
  return (
    <section className="settings-strip" aria-label={labels.sections.gameSettings}>
      <span>
        {labels.fields.addPerRound}: <strong>{addPerRound}</strong>
      </span>
      <span>
        {labels.fields.cutOff}: <strong>{cutOff}</strong>
      </span>
    </section>
  );
}
