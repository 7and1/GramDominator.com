import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrendTable } from "@/components/TrendTable";
import { JsonLd } from "@/components/JsonLd";
import { VIBE_OPTIONS } from "@/lib/categories";
import { getAudioByVibe } from "@/lib/db";
import {
  buildCanonical,
  buildFaqSchema,
  buildCollectionSchema,
  getSiteUrl,
} from "@/lib/seo";
import { buildAudioSlug } from "@/lib/slug";

export const runtime = "edge";
export const revalidate = 900;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vibe = VIBE_OPTIONS.find((option) => option.slug === slug);
  if (!vibe) return {};

  return {
    title: `${vibe.label} TikTok Sounds & Trends`,
    description: vibe.description,
    keywords: [
      `${vibe.label} TikTok sounds`,
      `${vibe.label} audio trends`,
      `TikTok ${vibe.label} music`,
      `viral ${vibe.label} sounds`,
      "TikTok trends",
      "viral audio",
    ],
    alternates: {
      canonical: buildCanonical(`/vibe/${slug}`),
    },
    openGraph: {
      title: `${vibe.label} TikTok Sounds & Trends`,
      description: vibe.description,
      url: buildCanonical(`/vibe/${slug}`),
      type: "website",
      images: [
        {
          url: `/og-vibe-${slug}.jpg`,
          width: 1200,
          height: 630,
          alt: `${vibe.label} TikTok Sounds & Trends`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${vibe.label} TikTok Sounds & Trends`,
      description: vibe.description,
      images: [`/og-vibe-${slug}.jpg`],
    },
  };
}

export default async function VibePage({ params }: PageProps) {
  const { slug } = await params;
  const vibe = VIBE_OPTIONS.find((option) => option.slug === slug);
  if (!vibe) notFound();

  const trends = await getAudioByVibe(vibe.slug, 50);
  const siteUrl = getSiteUrl();

  // Build collection schema
  const collectionSchema = buildCollectionSchema({
    name: `${vibe.label} TikTok Sounds & Trends`,
    description: vibe.description,
    url: buildCanonical(`/vibe/${slug}`),
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
      question: `What qualifies a sound as ${vibe.label}?`,
      answer:
        "We map vibe tokens from AI tags and heuristic keywords, then filter the leaderboard to those matches.",
    },
    {
      question: "How often is the vibe page refreshed?",
      answer:
        "Every six hours at the data layer with page cache revalidation every 15 minutes.",
    },
    {
      question: "Can I use these sounds commercially?",
      answer:
        "Always check TikTok licensing terms for each track; GramDominator reports trend data only and does not grant rights.",
    },
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-black/50">
          Vibe collection
        </p>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">
          {vibe.emoji} {vibe.label} audio trends
        </h1>
        <p className="max-w-2xl text-sm text-black/60">{vibe.description}</p>
      </section>

      <section className="mt-10">
        <TrendTable data={trends} />
      </section>

      <JsonLd data={collectionSchema} />
      <JsonLd data={faqSchema} />
    </div>
  );
}
