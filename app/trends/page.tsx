import Link from "next/link";
import type { Metadata } from "next";

import { AffiliateBanner } from "@/components/AffiliateBanner";
import { TrendTable } from "@/components/TrendTable";
import { JsonLd } from "@/components/JsonLd";
import { COLLECTIONS } from "@/lib/categories";
import { getTrendsWithFallback } from "@/lib/fallback-data";
import { buildAudioSlug } from "@/lib/slug";
import { formatDate, formatPercent } from "@/lib/format";
import {
  buildCanonical,
  buildFaqSchema,
  buildCollectionSchema,
  getSiteUrl,
} from "@/lib/seo";

export const runtime = "edge";
export const revalidate = 900;

export const metadata: Metadata = {
  title: "TikTok Trends Today | GramDominator",
  description:
    "See the fastest-growing TikTok sounds updated every hour. Filter by vibe or genre and jump into creator-ready insights.",
  keywords: [
    "TikTok trends",
    "viral TikTok sounds",
    "trending audio",
    "TikTok music",
    "viral songs",
    "TikTok analytics",
    "audio trends",
  ],
  alternates: {
    canonical: buildCanonical("/trends"),
  },
  openGraph: {
    title: "TikTok Trends Today | GramDominator",
    description:
      "Real-time TikTok audio leaderboard with growth rates, vibes, and genres.",
    url: buildCanonical("/trends"),
    type: "website",
    images: [
      {
        url: "/og-trends.jpg",
        width: 1200,
        height: 630,
        alt: "TikTok Trends Today",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Trends Today | GramDominator",
    description:
      "Real-time TikTok audio leaderboard with growth rates, vibes, and genres.",
    images: ["/og-trends.jpg"],
  },
};

export default async function TrendsPage() {
  // Use fallback data pattern for graceful degradation
  const trends = await getTrendsWithFallback(50);
  const updatedAt = trends[0]?.updated_at ?? null;
  const topGrowth = [...trends]
    .filter((trend) => trend.growth_rate !== null)
    .sort((a, b) => (b.growth_rate ?? 0) - (a.growth_rate ?? 0))
    .slice(0, 1)[0];

  const siteUrl = getSiteUrl();

  // Build CollectionPage schema
  const collectionSchema = buildCollectionSchema({
    name: "TikTok Trends Today - Viral Audio Leaderboard",
    description:
      "Real-time TikTok audio leaderboard showing the fastest-growing sounds with growth rates, vibes, and genres.",
    url: buildCanonical("/trends"),
    itemCount: trends.length,
    items: trends.slice(0, 20).map((trend) => ({
      name: trend.title,
      url: `${siteUrl}/audio/${buildAudioSlug(trend.title, trend.id)}`,
      thumbnailUrl: trend.cover_url ?? undefined,
    })),
  });

  // Build FAQ schema
  const faqSchema = buildFaqSchema([
    {
      question: "How often are TikTok audio trends updated?",
      answer:
        "GramDominator refreshes the leaderboard every six hours and shows the latest snapshot time on the page.",
    },
    {
      question: "What is the momentum score?",
      answer:
        "Momentum is based on play count growth first, and rank movement second, to surface breakout sounds early.",
    },
    {
      question: "Can I filter trends by vibe or genre?",
      answer:
        "Yes. Use the vibe and genre chips above the table to instantly filter the leaderboard.",
    },
    {
      question: "How do I use these sounds in my TikTok videos?",
      answer:
        "Click on any sound to view detailed analytics and access the TikTok music page directly. From there, tap 'Use this sound' to create your video.",
    },
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-black/50">
          Live audio trends
        </p>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">
          Today&apos;s breakout sounds
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-black/60">
          <span>Updated: {formatDate(updatedAt)}</span>
          {topGrowth ? (
            <span>
              Top growth: {topGrowth.title} (
              {formatPercent(topGrowth.growth_rate ?? 0)})
            </span>
          ) : null}
        </div>
      </section>

      <section className="mt-10">
        {trends.length ? (
          <TrendTable data={trends} />
        ) : (
          <div className="rounded-2xl border border-black/10 bg-white/80 p-6 text-sm text-black/60">
            No trends are available yet. Run the scraper to populate D1, then
            refresh.
          </div>
        )}
        <AffiliateBanner />
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">
          Curated collections
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {COLLECTIONS.map((collection) => (
            <Link
              key={collection.slug}
              href={`/trends/${collection.slug}`}
              className="glass-card rounded-2xl p-4"
            >
              <p className="text-sm font-semibold">{collection.title}</p>
              <p className="mt-2 text-xs text-black/60">
                {collection.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <JsonLd data={collectionSchema} />
      <JsonLd data={faqSchema} />
    </div>
  );
}
