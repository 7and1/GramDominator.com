import type { Metadata } from "next";

import { BioGenerator } from "@/components/BioGenerator";
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
  title: "AI Bio Generator | GramDominator Tools",
  description:
    "Generate a creator bio tuned to your niche and tone using Cloudflare Workers AI.",
  keywords: [
    "AI bio generator",
    "creator bio generator",
    "social media bio",
    "TikTok bio generator",
    "Instagram bio generator",
    "bio writing tool",
    "AI content generator",
    "creator tools",
  ],
  alternates: {
    canonical: buildCanonical("/tools/bio-generator"),
  },
  openGraph: {
    title: "AI Bio Generator | GramDominator Tools",
    description:
      "Generate a creator bio tuned to your niche and tone using Cloudflare Workers AI.",
    url: buildCanonical("/tools/bio-generator"),
    type: "website",
    images: [
      {
        url: "/og-bio-generator.jpg",
        width: 1200,
        height: 630,
        alt: "AI Bio Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Bio Generator | GramDominator Tools",
    description:
      "Generate a creator bio tuned to your niche and tone using Cloudflare Workers AI.",
    images: ["/og-bio-generator.jpg"],
  },
};

export default function BioGeneratorPage() {
  const siteUrl = getSiteUrl();

  // Build FAQ schema
  const faqs = [
    {
      question: "How does the AI bio generator work?",
      answer:
        "Provide your niche, tone preference, and any key details about yourself. Our AI will generate a compelling bio tailored to your needs.",
    },
    {
      question: "Is the bio generator free to use?",
      answer:
        "Yes, the bio generator is completely free. Powered by Cloudflare Workers AI with no usage limits.",
    },
    {
      question: "What platforms can I use these bios for?",
      answer:
        "The generated bios work great for TikTok, Instagram, YouTube, Twitter, and any other social media platform that uses creator bios.",
    },
    {
      question: "Can I customize the tone of my bio?",
      answer:
        "Yes. You can select from professional, casual, funny, creative, or minimal tones to match your personal brand.",
    },
    {
      question: "How many bios can I generate?",
      answer:
        "Generate as many as you like. Keep tweaking your inputs until you find the perfect bio for your profile.",
    },
  ];

  const toolSchema = buildToolPageSchema({
    name: "AI Bio Generator",
    description:
      "Free AI-powered tool to generate creator bios for social media. Customize tone and niche for perfect results.",
    url: buildCanonical("/tools/bio-generator"),
    toolType: "UtilitiesApplication",
    faqs,
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-6 pb-16 pt-12">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-black/50">
          Lead magnet
        </p>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">
          AI bio generator
        </h1>
        <p className="text-sm text-black/60">
          Generate a creator bio tuned to your niche and tone using Cloudflare
          Workers AI.
        </p>
      </section>

      <section className="mt-10">
        <BioGenerator />
      </section>

      <JsonLd data={toolSchema} />
    </div>
  );
}
