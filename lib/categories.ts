export interface CategoryOption {
  slug: string;
  label: string;
  emoji: string;
  description: string;
  tokens: string[];
}

export const VIBE_OPTIONS: CategoryOption[] = [
  {
    slug: "viral",
    label: "Viral",
    emoji: "🔥",
    description: "Highest momentum sounds trending now.",
    tokens: ["viral", "trending", "hot", "breakout"],
  },
  {
    slug: "funny",
    label: "Funny",
    emoji: "😂",
    description: "Comedy hooks and meme-ready sounds.",
    tokens: ["funny", "comedy", "laugh"],
  },
  {
    slug: "dance",
    label: "Dance",
    emoji: "💃",
    description: "Choreography-friendly beats.",
    tokens: ["dance", "choreo"],
  },
  {
    slug: "gym",
    label: "Gym",
    emoji: "💪",
    description: "Workout and performance energy.",
    tokens: ["gym", "workout", "fitness", "training"],
  },
  {
    slug: "chill",
    label: "Chill",
    emoji: "🌿",
    description: "Slow, ambient, or mellow moods.",
    tokens: ["chill", "calm", "relax"],
  },
  {
    slug: "sad",
    label: "Sad",
    emoji: "🥀",
    description: "Moody and emotional edits.",
    tokens: ["sad", "moody", "cry"],
  },
  {
    slug: "romantic",
    label: "Romantic",
    emoji: "💌",
    description: "Love stories and soft edits.",
    tokens: ["romantic", "love"],
  },
];

export const GENRE_OPTIONS: CategoryOption[] = [
  {
    slug: "pop",
    label: "Pop",
    emoji: "✨",
    description: "Mainstream, upbeat vocal tracks.",
    tokens: ["pop"],
  },
  {
    slug: "hip-hop",
    label: "Hip-Hop",
    emoji: "🎤",
    description: "Rap, trap, and hip-hop sounds.",
    tokens: ["hip-hop", "hiphop", "rap", "trap"],
  },
  {
    slug: "electronic",
    label: "Electronic",
    emoji: "⚡",
    description: "EDM, house, and synth-heavy music.",
    tokens: ["electronic", "edm", "house", "techno"],
  },
  {
    slug: "r&b",
    label: "R&B",
    emoji: "🎧",
    description: "Smooth, soulful, melodic tracks.",
    tokens: ["r&b", "rnb", "soul"],
  },
  {
    slug: "indie",
    label: "Indie",
    emoji: "🌙",
    description: "Indie, alternative, and niche sounds.",
    tokens: ["indie", "alt", "alternative"],
  },
];

export const COLLECTIONS: Array<{
  slug: string;
  title: string;
  description: string;
  genre?: string;
  vibe?: string;
}> = [
  {
    slug: "best-funny-tiktok-songs-2024",
    title: "Best Funny TikTok Songs (2024)",
    description:
      "Comedy-first audio with the strongest meme velocity this year.",
    vibe: "funny",
  },
  {
    slug: "top-gym-workout-music-january",
    title: "Top Gym Workout Music (January)",
    description: "High-energy tracks built for workout edits.",
    vibe: "gym",
  },
  {
    slug: "trending-dance-audio",
    title: "Trending Dance Audio",
    description: "The most choreography-friendly sounds on TikTok.",
    vibe: "dance",
  },
  {
    slug: "chill-study-tiktok-sounds",
    title: "Chill Study TikTok Sounds",
    description: "Calm background sounds for slow edits and study vibes.",
    vibe: "chill",
  },
  {
    slug: "pop-tiktok-hits",
    title: "Pop TikTok Hits",
    description: "Mainstream pop tracks trending right now.",
    genre: "pop",
  },
];

export function getCollectionBySlug(slug: string) {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

export function resolveCategoryFromSlug(slug: string) {
  const tokens = slug.split("-");
  const vibe = VIBE_OPTIONS.find((option) =>
    option.tokens.some((token) => tokens.includes(token)),
  );
  const genre = GENRE_OPTIONS.find((option) =>
    option.tokens.some((token) => tokens.includes(token)),
  );

  return {
    vibe: vibe?.slug,
    genre: genre?.slug,
  };
}
