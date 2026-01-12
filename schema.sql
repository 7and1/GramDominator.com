-- D1 schema for GramDominator.com
-- Current snapshot of audio trends (fast reads)
CREATE TABLE IF NOT EXISTS audio_trends (
    platform TEXT NOT NULL DEFAULT 'tiktok',
    id TEXT NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    play_count INTEGER,
    rank INTEGER,
    growth_rate REAL,
    genre TEXT,
    vibe TEXT,
    cover_url TEXT,
    updated_at INTEGER,
    PRIMARY KEY (platform, id)
);

-- Historical snapshots for growth calculations
CREATE TABLE IF NOT EXISTS audio_trend_history (
    platform TEXT NOT NULL DEFAULT 'tiktok',
    id TEXT NOT NULL,
    snapshot_at INTEGER NOT NULL,
    play_count INTEGER,
    rank INTEGER,
    PRIMARY KEY (platform, id, snapshot_at)
);

-- Hashtag intelligence
CREATE TABLE IF NOT EXISTS hashtags (
    platform TEXT NOT NULL DEFAULT 'tiktok',
    slug TEXT NOT NULL,
    volume INTEGER,
    competition_score INTEGER,
    related_tags TEXT,
    updated_at INTEGER,
    PRIMARY KEY (platform, slug)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_audio_rank ON audio_trends(platform, rank);
CREATE INDEX IF NOT EXISTS idx_audio_genre ON audio_trends(platform, genre);
CREATE INDEX IF NOT EXISTS idx_audio_vibe ON audio_trends(platform, vibe);
CREATE INDEX IF NOT EXISTS idx_audio_updated_at ON audio_trends(updated_at);
CREATE INDEX IF NOT EXISTS idx_audio_history_snapshot ON audio_trend_history(snapshot_at);
CREATE INDEX IF NOT EXISTS idx_hashtag_volume ON hashtags(platform, volume);
CREATE INDEX IF NOT EXISTS idx_hashtag_updated_at ON hashtags(updated_at);
