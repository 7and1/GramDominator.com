export interface Env {
  MYBROWSER: Fetcher;
  DB: D1Database;
  CRON_SECRET: string;
  AI?: any;
  HASHTAG_API_URL?: string;
  AI_TAG_LIMIT?: string;
  API_TOKEN?: string;
  ENVIRONMENT?: string;
  PROXY_GRID_SECRET?: string;
  PROXY_GRID_BASE?: string;
  SLACK_WEBHOOK_URL?: string;
}

export interface TrendItem {
  id: string;
  rank: number;
  title: string;
  author: string;
  play_count: number;
  cover_url: string;
}

export interface HistoryRow {
  id: string;
  play_count: number | null;
  rank: number | null;
  snapshot_at: number;
}

export interface HashtagItem {
  slug: string;
  volume: number;
  competition_score: number;
  related_tags: string[];
}
