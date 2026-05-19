import { labels } from "@/lib/game/labels";
import type { Rule123 } from "@/lib/game/types";
import type { ConfigInput } from "@/lib/game/validation";
import NumericField from "./NumericField";
import Rule123Settings from "./Rule123Settings";

type GameSettingsSectionProps = {
  config: ConfigInput;
  useRule123: boolean;
  rule123Type: Rule123["type"];
  endCupLimit: string;
  onConfigChange: (key: keyof ConfigInput, value: string) => void;
  onUseRule123Change: (enabled: boolean) => void;
  onRule123TypeChange: (type: Rule123["type"]) => void;
  onEndCupLimitChange: (value: string) => void;
};

export default function GameSettingsSection({
  config,
  useRule123,
  rule123Type,
  endCupLimit,
  onConfigChange,
  onUseRule123Change,
  onRule123TypeChange,
  onEndCupLimitChange,
}: GameSettingsSectionProps) {
  return (
    <section className="panel" aria-labelledby="settings-heading">
      <div className="section-heading" id="settings-heading">
        {labels.sections.gameSettings}
      </div>

      <div className="field-stack">
        <NumericField
          label={labels.fields.startCups}
          unit={labels.fields.cupsUnit}
          value={config.startCups}
          onChange={(value) => onConfigChange("startCups", value)}
        />
        <NumericField
          label={labels.fields.addPerRound}
          unit={labels.fields.cupsUnit}
          value={config.addPerRound}
          onChange={(value) => onConfigChange("addPerRound", value)}
        />
        <NumericField
          label={labels.fields.cutOff}
          unit="以上"
          value={config.cutOff}
          onChange={(value) => onConfigChange("cutOff", value)}
        />
      </div>

      <Rule123Settings
        endCupLimit={endCupLimit}
        rule123Type={rule123Type}
        useRule123={useRule123}
        onEndCupLimitChange={onEndCupLimitChange}
        onRule123TypeChange={onRule123TypeChange}
        onUseRule123Change={onUseRule123Change}
      />
    </section>
  );
}
