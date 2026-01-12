interface AffiliateBannerProps {
  headline?: string;
  cta?: string;
  url?: string;
}

export function AffiliateBanner({
  headline = "Want to grow faster? Automate your edits with AI.",
  cta = "Try the creator toolkit",
  url = process.env.NEXT_PUBLIC_AFFILIATE_URL ?? "https://example.com",
}: AffiliateBannerProps) {
  return (
    <div className="mt-8 rounded-2xl border border-black/10 bg-ink px-6 py-5 text-white shadow-glow">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">
            Growth partner
          </p>
          <h3 className="mt-2 font-display text-lg font-semibold">
            {headline}
          </h3>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-ink"
        >
          {cta}
        </a>
      </div>
    </div>
  );
}
