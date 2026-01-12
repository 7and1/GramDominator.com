-- Migration: add genre/vibe columns and indexes
ALTER TABLE audio_trends ADD COLUMN genre TEXT;
ALTER TABLE audio_trends ADD COLUMN vibe TEXT;

CREATE INDEX IF NOT EXISTS idx_audio_genre ON audio_trends(platform, genre);
CREATE INDEX IF NOT EXISTS idx_audio_vibe ON audio_trends(platform, vibe);
