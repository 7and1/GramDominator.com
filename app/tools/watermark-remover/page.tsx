import type { Metadata } from "next";

import { WatermarkTool } from "@/components/WatermarkTool";
import { JsonLd } from "@/components/JsonLd";
import {
  buildCanonical,
  buildFaqSchema,
  buildToolPageSchema,
  getSiteUrl,
} from "@/lib/seo";

export const runtime = "edge";
export const revalidate = 900;

export const metadata: Metadata = {
  title: "TikTok Watermark Remover | GramDominator Tools",
  description:
    "Paste a TikTok URL to get a clean download link for editing and reposting.",
  keywords: [
    "TikTok watermark remover",
    "remove TikTok watermark",
    "TikTok video downloader",
    "clean TikTok video",
    "TikTok editor",
    "watermark remover free",
    "TikTok tool",
  ],
  alternates: {
    canonical: buildCanonical("/tools/watermark-remover"),
  },
  openGraph: {
    title: "TikTok Watermark Remover | GramDominator Tools",
    description:
      "Paste a TikTok URL to get a clean download link for editing and reposting.",
    url: buildCanonical("/tools/watermark-remover"),
    type: "website",
    images: [
      {
        url: "/og-watermark-remover.jpg",
        width: 1200,
        height: 630,
        alt: "TikTok Watermark Remover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Watermark Remover | GramDominator Tools",
    description:
      "Paste a TikTok URL to get a clean download link for editing and reposting.",
    images: ["/og-watermark-remover.jpg"],
  },
};

export default function WatermarkPage() {
  const siteUrl = getSiteUrl();

  // Build FAQ schema
  const faqs = [
    {
      question: "How does the TikTok watermark remover work?",
      answer:
        "Simply paste any TikTok video URL and our tool will generate a clean download link without the watermark overlay.",
    },
    {
      question: "Is this watermark remover free?",
      answer:
        "Yes, the tool is completely free to use. Configure your RapidAPI endpoint in Cloudflare env vars to get started.",
    },
    {
      question: "Do you store my TikTok video URLs?",
      answer:
        "No. All requests are processed directly and we don't store any video URLs or download links.",
    },
    {
      question: "Can I use the downloaded videos commercially?",
      answer:
        "Please respect TikTok's terms of service and the original creator's rights. Only use downloaded videos for personal or fair use purposes.",
    },
    {
      question: "What video quality can I download?",
      answer:
        "The tool preserves the original video quality from TikTok, typically up to 1080p resolution depending on the source video.",
    },
  ];

  const toolSchema = buildToolPageSchema({
    name: "TikTok Watermark Remover",
    description:
      "Free tool to remove watermarks from TikTok videos. Paste a URL and get a clean download link.",
    url: buildCanonical("/tools/watermark-remover"),
    toolType: "MultimediaApplication",
    faqs,
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-6 pb-16 pt-12">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-black/50">
          Lead magnet
        </p>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">
          TikTok watermark remover
        </h1>
        <p className="text-sm text-black/60">
          Paste a TikTok URL to get a clean download link for editing. Configure
          your RapidAPI endpoint in Cloudflare env vars.
        </p>
      </section>

      <section className="mt-10">
        <WatermarkTool />
      </section>

      <JsonLd data={toolSchema} />
    </div>
  );
}
