-- Migration: Performance optimization indexes
-- Composite index for genre+rank queries
CREATE INDEX IF NOT EXISTS idx_audio_genre_rank
  ON audio_trends(platform, lower(genre), rank)
  WHERE genre IS NOT NULL AND genre != '';

-- Composite index for vibe+rank queries
CREATE INDEX IF NOT EXISTS idx_audio_vibe_rank
  ON audio_trends(platform, lower(vibe), rank)
  WHERE vibe IS NOT NULL AND vibe != '';

-- Composite index for updated_at+rank (fresh content queries)
CREATE INDEX IF NOT EXISTS idx_audio_updated_rank
  ON audio_trends(platform, updated_at DESC, rank);

-- Covering index for trend list queries (includes all columns needed)
CREATE INDEX IF NOT EXISTS idx_audio_trends_covering
  ON audio_trends(platform, rank)
  INCLUDE (title, author, play_count, growth_rate, genre, vibe, cover_url, updated_at);

-- Partial index for high-growth audio (>10% growth rate)
CREATE INDEX IF NOT EXISTS idx_audio_high_growth
  ON audio_trends(platform, growth_rate DESC, rank)
  WHERE growth_rate > 10;

-- Index for hashtag volume + competition (trending hashtags)
CREATE INDEX IF NOT EXISTS idx_hashtag_volume_competition
  ON hashtags(platform, volume DESC, competition_score)
  WHERE volume > 0;
