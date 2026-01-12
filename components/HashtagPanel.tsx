import { CopyButton } from "./CopyButton";

interface HashtagPanelProps {
  hashtags: string[];
}

export function HashtagPanel({ hashtags }: HashtagPanelProps) {
  const tagString = hashtags.map((tag) => `#${tag}`).join(" ");

  return (
    <div className="glass-card rounded-2xl p-6 shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/40">
            Hashtag generator
          </p>
          <h3 className="mt-2 font-display text-lg font-semibold">
            Suggested tags
          </h3>
        </div>
        <CopyButton text={tagString} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {hashtags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-black/70"
          >
            #{tag}
          </span>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-black/10 bg-white/70 p-4 text-xs text-black/60">
        Unlock advanced viral tag packs and competitor insights in GramDominator
        Pro.
      </div>
    </div>
  );
}
