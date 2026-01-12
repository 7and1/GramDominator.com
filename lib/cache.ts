export const CACHE_CONFIG = {
  PUBLIC: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
  PUBLIC_LONG:
    "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
  PUBLIC_SHORT:
    "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
  PRIVATE: "private, max-age=0, must-revalidate",
  NO_CACHE: "no-cache, no-store, must-revalidate",
  NO_STORE: "no-store",

  edge: {
    trends: "public, max-age=600, s-maxage=1800, stale-while-revalidate=3600",
    audio: "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400",
    hashtags:
      "public, max-age=1800, s-maxage=3600, stale-while-revalidate=7200",
    static: "public, max-age=31536000, immutable",
    api: "public, max-age=300, s-maxage=600, stale-while-revalidate=1800",
  },

  cdn: {
    purgeTag: {
      trends: "trends",
      audio: "audio",
      hashtags: "hashtags",
      all: "all",
    },
  },
} as const;

export type CacheConfigType = typeof CACHE_CONFIG;

export interface CacheHeaders {
  "Cache-Control": string;
  "CDN-Cache-Control"?: string;
  "Edge-Cache-Tag"?: string;
  Vary?: string;
}

export function getCacheHeaders(
  type: keyof typeof CACHE_CONFIG.edge | keyof typeof CACHE_CONFIG,
  options: {
    purgeTag?: string[];
    vary?: string[];
  } = {},
): CacheHeaders {
  const headers: CacheHeaders = {
    "Cache-Control":
      (type as keyof typeof CACHE_CONFIG.edge) in CACHE_CONFIG.edge
        ? CACHE_CONFIG.edge[type as keyof typeof CACHE_CONFIG.edge]
        : (CACHE_CONFIG[type as keyof typeof CACHE_CONFIG] as string),
  };

  if (options.purgeTag?.length) {
    headers["Edge-Cache-Tag"] = options.purgeTag.join(",");
  }

  if (options.vary?.length) {
    headers.Vary = options.vary.join(",");
  }

  return headers;
}

export function setCacheHeaders(
  response: Response,
  type: keyof typeof CACHE_CONFIG.edge | keyof typeof CACHE_CONFIG,
  options: {
    purgeTag?: string[];
    vary?: string[];
  } = {},
): Response {
  const headers = getCacheHeaders(type, options);

  response.headers.set("Cache-Control", headers["Cache-Control"]);

  if (headers["CDN-Cache-Control"]) {
    response.headers.set("CDN-Cache-Control", headers["CDN-Cache-Control"]);
  }

  if (headers["Edge-Cache-Tag"]) {
    response.headers.set("Edge-Cache-Tag", headers["Edge-Cache-Tag"]);
  }

  if (headers.Vary) {
    response.headers.set("Vary", headers.Vary);
  }

  return response;
}

export function getStaleWhileRevalidate(
  maxAge: number,
  staleAge: number,
): string {
  return `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${staleAge}`;
}

export function getCacheTagForPath(pathname: string): string[] {
  const tags: string[] = [];

  if (pathname.startsWith("/api/v1/trends")) {
    tags.push(CACHE_CONFIG.cdn.purgeTag.trends);
  }

  if (pathname.match(/^\/api\/v1\/audio\/[^/]+$/)) {
    tags.push(CACHE_CONFIG.cdn.purgeTag.audio);
  }

  if (pathname.includes("hashtag")) {
    tags.push(CACHE_CONFIG.cdn.purgeTag.hashtags);
  }

  if (tags.length === 0) {
    tags.push(CACHE_CONFIG.cdn.purgeTag.all);
  }

  return tags;
}

export function createCachedResponse(
  data: unknown,
  type: keyof typeof CACHE_CONFIG.edge | keyof typeof CACHE_CONFIG,
  status = 200,
  options: {
    purgeTag?: string[];
    vary?: string[];
  } = {},
): Response {
  const headers = getCacheHeaders(type, options);

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

export function createRedirectResponse(
  url: string,
  permanent = false,
): Response {
  return new Response(null, {
    status: permanent ? 301 : 302,
    headers: {
      Location: url,
      "Cache-Control": permanent ? "public, max-age=86400" : "no-cache",
    },
  });
}

export const EDGE_CACHE_TAGS = {
  trends: "trends",
  audio: "audio",
  audioById: (id: string) => `audio:${id}`,
  hashtags: "hashtags",
  api: "api",
  all: "all",
} as const;

export function getPurgeTagsForResource(
  resourceType: "trends" | "audio" | "hashtags" | "all",
): string[] {
  const tags: string[] = [];

  switch (resourceType) {
    case "trends":
      tags.push(EDGE_CACHE_TAGS.trends);
      break;
    case "audio":
      tags.push(EDGE_CACHE_TAGS.audio);
      break;
    case "hashtags":
      tags.push(EDGE_CACHE_TAGS.hashtags);
      break;
    case "all":
      tags.push(EDGE_CACHE_TAGS.all);
      break;
  }

  return tags;
}

export function parseCacheControl(header: string | null): {
  maxAge: number;
  sMaxAge: number | null;
  staleWhileRevalidate: number | null;
  isPublic: boolean;
  isPrivate: boolean;
  noCache: boolean;
  noStore: boolean;
  mustRevalidate: boolean;
} {
  const result = {
    maxAge: 0,
    sMaxAge: null as number | null,
    staleWhileRevalidate: null as number | null,
    isPublic: false,
    isPrivate: false,
    noCache: false,
    noStore: false,
    mustRevalidate: false,
  };

  if (!header) return result;

  const directives = header.split(",").map((d) => d.trim().toLowerCase());

  for (const directive of directives) {
    if (directive === "public") result.isPublic = true;
    if (directive === "private") result.isPrivate = true;
    if (directive === "no-cache") result.noCache = true;
    if (directive === "no-store") result.noStore = true;
    if (directive === "must-revalidate") result.mustRevalidate = true;

    const maxAgeMatch = directive.match(/max-age=(\d+)/);
    if (maxAgeMatch) result.maxAge = Number(maxAgeMatch[1]);

    const sMaxAgeMatch = directive.match(/s-maxage=(\d+)/);
    if (sMaxAgeMatch) result.sMaxAge = Number(sMaxAgeMatch[1]);

    const swrMatch = directive.match(/stale-while-revalidate=(\d+)/);
    if (swrMatch) result.staleWhileRevalidate = Number(swrMatch[1]);
  }

  return result;
}
