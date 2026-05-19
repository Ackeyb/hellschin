import { labels } from "@/lib/game/labels";

export type EffectState = {
  curse: boolean;
  happy: boolean;
  happier: boolean;
  happiest: boolean;
  finish: boolean;
  nextRound: boolean;
};

type GameEffectsProps = {
  effects: EffectState;
};

type SpecialEffectType = "curse" | "happy" | "happier" | "happiest";

export const initialEffects: EffectState = {
  curse: false,
  happy: false,
  happier: false,
  happiest: false,
  finish: false,
  nextRound: false,
};

export default function GameEffects({ effects }: GameEffectsProps) {
  return (
    <>
      {effects.curse && <SpecialEffectOverlay type="curse" title="123" subtitle="CURSED" />}
      {effects.happy && <SpecialEffectOverlay type="happy" title="456" subtitle="HAPPY" />}
      {effects.happier && <SpecialEffectOverlay type="happier" title="ぞろ目" subtitle="SUPER HAPPY" />}
      {effects.happiest && <SpecialEffectOverlay type="happiest" title="ピンゾロ" subtitle="MAX HAPPY" />}
      {effects.finish && (
        <div className="finish-overlay">
          {labels.overlays.finish.split("").map((char, index) => (
            <span className="drop-text" key={`${char}-${index}`} style={{ animationDelay: `${index * 0.18}s` }}>
              {char}
            </span>
          ))}
        </div>
      )}
      {effects.nextRound && (
        <>
          <div className="next-round-overlay" />
          <div className="next-round-text">{labels.overlays.nextRound}</div>
        </>
      )}
    </>
  );
}

function SpecialEffectOverlay({
  type,
  title,
  subtitle,
}: {
  type: SpecialEffectType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className={`special-effect-overlay ${type}-effect`}>
      <div className="effect-burst" />
      <div className="effect-rings" />
      <div className="effect-card">
        <span className="effect-title">{title}</span>
        <span className="effect-subtitle">{subtitle}</span>
      </div>
      <div className="effect-particles" />
    </div>
  );
}
