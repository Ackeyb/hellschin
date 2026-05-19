import { labels } from "@/lib/game/labels";

export type EffectState = {
  rainbow: boolean;
  shadow: boolean;
  finish: boolean;
  nextRound: boolean;
};

type GameEffectsProps = {
  effects: EffectState;
};

export const initialEffects: EffectState = {
  rainbow: false,
  shadow: false,
  finish: false,
  nextRound: false,
};

export default function GameEffects({ effects }: GameEffectsProps) {
  return (
    <>
      {effects.rainbow && <div className="rainbow-overlay" />}
      {effects.shadow && <div className="shadow-overlay" />}
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
