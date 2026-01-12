import type { MetadataRoute } from "next";
import { COLLECTIONS, GENRE_OPTIONS, VIBE_OPTIONS } from "@/lib/categories";
import {
  getAudioSitemapEntries,
  getDistinctGenres,
  getDistinctVibes,
} from "@/lib/db";
import { buildAudioSlug } from "@/lib/slug";

export const runtime = "edge";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://gramdominator.com";
  const entries = await getAudioSitemapEntries(500);
  const dynamicGenres = await getDistinctGenres(20);
  const dynamicVibes = await getDistinctVibes(20);
  const genreSlugs = Array.from(
    new Set([...GENRE_OPTIONS.map((option) => option.slug), ...dynamicGenres]),
  );
  const vibeSlugs = Array.from(
    new Set([...VIBE_OPTIONS.map((option) => option.slug), ...dynamicVibes]),
  );

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/trends`,
      lastModified: new Date().toISOString(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tools/watermark-remover`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/tools/bio-generator`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...genreSlugs.map((slug) => ({
      url: `${baseUrl}/genre/${slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...vibeSlugs.map((slug) => ({
      url: `${baseUrl}/vibe/${slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...COLLECTIONS.map((collection) => ({
      url: `${baseUrl}/trends/${collection.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...entries.map((entry) => ({
      url: `${baseUrl}/audio/${buildAudioSlug(entry.title, entry.id)}`,
      lastModified: entry.updated_at
        ? new Date(entry.updated_at).toISOString()
        : undefined,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
