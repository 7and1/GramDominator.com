import { getDB } from "./d1";
import type { AudioTrendRow, HashtagRow } from "./types";

const PLATFORM = "tiktok";

export async function getAudioTrends(limit = 50): Promise<AudioTrendRow[]> {
  const db = getDB();
  const { results } = await db
    .prepare(
      `SELECT platform, id, title, author, play_count, rank, growth_rate, genre, vibe, cover_url, updated_at
       FROM audio_trends
       WHERE platform = ?
       ORDER BY rank ASC
       LIMIT ?`,
    )
    .bind(PLATFORM, limit)
    .all<AudioTrendRow>();

  return results ?? [];
}

export async function getAudioById(id: string): Promise<AudioTrendRow | null> {
  const db = getDB();
  const result = await db
    .prepare(
      `SELECT platform, id, title, author, play_count, rank, growth_rate, genre, vibe, cover_url, updated_at
       FROM audio_trends
       WHERE platform = ? AND id = ?
       LIMIT 1`,
    )
    .bind(PLATFORM, id)
    .first<AudioTrendRow>();

  return result ?? null;
}

export async function getTopHashtags(limit = 12): Promise<HashtagRow[]> {
  const db = getDB();
  const { results } = await db
    .prepare(
      `SELECT platform, slug, volume, competition_score, related_tags, updated_at
       FROM hashtags
       WHERE platform = ?
       ORDER BY volume DESC
       LIMIT ?`,
    )
    .bind(PLATFORM, limit)
    .all<HashtagRow>();

  return results ?? [];
}

export async function getAudioSitemapEntries(
  limit = 500,
): Promise<AudioTrendRow[]> {
  const db = getDB();
  const { results } = await db
    .prepare(
      `SELECT platform, id, title, genre, vibe, updated_at
       FROM audio_trends
       WHERE platform = ?
       ORDER BY updated_at DESC
       LIMIT ?`,
    )
    .bind(PLATFORM, limit)
    .all<AudioTrendRow>();

  return results ?? [];
}

export async function getAudioByGenre(
  genre: string,
  limit = 50,
): Promise<AudioTrendRow[]> {
  const db = getDB();
  const { results } = await db
    .prepare(
      `SELECT platform, id, title, author, play_count, rank, growth_rate, genre, vibe, cover_url, updated_at
       FROM audio_trends
       WHERE platform = ? AND lower(genre) = ?
       ORDER BY rank ASC
       LIMIT ?`,
    )
    .bind(PLATFORM, genre.toLowerCase(), limit)
    .all<AudioTrendRow>();

  return results ?? [];
}

export async function getAudioByVibe(
  vibe: string,
  limit = 50,
): Promise<AudioTrendRow[]> {
  const db = getDB();
  const { results } = await db
    .prepare(
      `SELECT platform, id, title, author, play_count, rank, growth_rate, genre, vibe, cover_url, updated_at
       FROM audio_trends
       WHERE platform = ? AND lower(vibe) = ?
       ORDER BY rank ASC
       LIMIT ?`,
    )
    .bind(PLATFORM, vibe.toLowerCase(), limit)
    .all<AudioTrendRow>();

  return results ?? [];
}

export async function getAudioHistory(id: string, limit = 20) {
  const db = getDB();
  const { results } = await db
    .prepare(
      `SELECT snapshot_at, rank, play_count
       FROM audio_trend_history
       WHERE platform = ? AND id = ?
       ORDER BY snapshot_at DESC
       LIMIT ?`,
    )
    .bind(PLATFORM, id, limit)
    .all<{
      snapshot_at: number;
      rank: number | null;
      play_count: number | null;
    }>();

  return results ?? [];
}

export async function getDistinctGenres(limit = 20) {
  const db = getDB();
  const { results } = await db
    .prepare(
      `SELECT DISTINCT lower(genre) as genre
       FROM audio_trends
       WHERE platform = ? AND genre IS NOT NULL AND genre != ''
       LIMIT ?`,
    )
    .bind(PLATFORM, limit)
    .all<{ genre: string }>();

  return results?.map((row) => row.genre) ?? [];
}

export async function getDistinctVibes(limit = 20) {
  const db = getDB();
  const { results } = await db
    .prepare(
      `SELECT DISTINCT lower(vibe) as vibe
       FROM audio_trends
       WHERE platform = ? AND vibe IS NOT NULL AND vibe != ''
       LIMIT ?`,
    )
    .bind(PLATFORM, limit)
    .all<{ vibe: string }>();

  return results?.map((row) => row.vibe) ?? [];
}
