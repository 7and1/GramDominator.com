import type { TrendItem } from "../src/worker/types";

const PROXY_GRID_BASE =
  process.env.PROXY_GRID_BASE ?? "http://google.savedimage.com";
const PROXY_GRID_SECRET = process.env.PROXY_GRID_SECRET ?? "";
const PROXY_GRID_TIKTOK_ENDPOINT = "/api/search";

const MAX_ITEMS = 50;
const DEFAULT_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 10000;
const MAX_RETRIES = 3;

interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

const CIRCUIT_BREAKER_CONFIG = {
  threshold: 5,
  timeout: 60000,
  halfOpenAttempts: 2,
};

const puppeteerBreaker: CircuitBreakerState = {
  isOpen: false,
  failureCount: 0,
  lastFailureTime: 0,
  nextAttemptTime: 0,
};

const proxyGridBreaker: CircuitBreakerState = {
  isOpen: false,
  failureCount: 0,
  lastFailureTime: 0,
  nextAttemptTime: 0,
};

const responseCache = new Map<
  string,
  { data: TrendItem[]; expiresAt: number }
>();
const CACHE_TTL = 4 * 60 * 60 * 1000;

function calculateRetryDelay(attempt: number): number {
  const delay = DEFAULT_RETRY_DELAY * Math.pow(2, attempt);
  return Math.min(delay, MAX_RETRY_DELAY);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function canExecute(breaker: CircuitBreakerState): boolean {
  if (!breaker.isOpen) return true;

  const now = Date.now();
  if (now >= breaker.nextAttemptTime) {
    breaker.isOpen = false;
    breaker.failureCount = 0;
    return true;
  }

  return false;
}

export function recordSuccess(breaker: CircuitBreakerState): void {
  breaker.failureCount = 0;
  breaker.isOpen = false;
}

export function recordFailure(breaker: CircuitBreakerState): void {
  breaker.failureCount += 1;
  breaker.lastFailureTime = Date.now();

  if (breaker.failureCount >= CIRCUIT_BREAKER_CONFIG.threshold) {
    breaker.isOpen = true;
    breaker.nextAttemptTime = Date.now() + CIRCUIT_BREAKER_CONFIG.timeout;
  }
}

export function getBreakerState(breaker: CircuitBreakerState) {
  return {
    isOpen: breaker.isOpen,
    failureCount: breaker.failureCount,
    nextAttemptTime: breaker.nextAttemptTime,
    timeUntilReset: Math.max(0, breaker.nextAttemptTime - Date.now()),
  };
}

export function getPuppeteerBreakerState() {
  return getBreakerState(puppeteerBreaker);
}

export function getProxyGridBreakerState() {
  return getBreakerState(proxyGridBreaker);
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  context: string,
  retries = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      const delay = calculateRetryDelay(attempt);

      console.warn(
        `[ProxyGrid] ${context} attempt ${attempt + 1}/${retries + 1} failed:`,
        error instanceof Error ? error.message : String(error),
      );

      if (attempt < retries) {
        console.log(`[ProxyGrid] Retrying ${context} in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw new Error(
    `[ProxyGrid] ${context} failed after ${retries + 1} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

export async function fetchTikTokTrendsFromProxyGrid(
  options: {
    baseUrl?: string;
    secret?: string;
    force?: boolean;
    cacheKey?: string;
  } = {},
): Promise<TrendItem[]> {
  const {
    baseUrl = PROXY_GRID_BASE,
    secret = PROXY_GRID_SECRET,
    force = false,
    cacheKey = "tiktok-trends-default",
  } = options;

  if (!force) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`[ProxyGrid] Returning cached response for ${cacheKey}`);
      return cached.data;
    }
  }

  if (!canExecute(proxyGridBreaker)) {
    const state = getBreakerState(proxyGridBreaker);
    throw new Error(
      `[ProxyGrid] Circuit breaker is open. Next attempt in ${state.timeUntilReset}ms`,
    );
  }

  const result = await fetchWithRetry(async () => {
    const url = `${baseUrl.replace(/\/+$/, "")}${PROXY_GRID_TIKTOK_ENDPOINT}`;
    const requestBody = {
      type: "tiktok",
      query: "trending",
    };

    if (force) {
      (requestBody as unknown as Record<string, unknown>).force = true;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-grid-secret": secret,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `Proxy Grid request failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = (await response.json()) as Record<string, unknown>;
      return parseTikTokResponse(json);
    }

    const text = await response.text();
    return parseFallbackHtml(text);
  }, "TikTok trends fetch");

  if (result.length > 0) {
    recordSuccess(proxyGridBreaker);
  } else {
    recordFailure(proxyGridBreaker);
  }

  responseCache.set(cacheKey, {
    data: result,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return result;
}

function parseTikTokResponse(json: Record<string, unknown>): TrendItem[] {
  const items: TrendItem[] = [];
  const seen = new Set<string>();

  const data = (json.data as Array<Record<string, unknown>>) ?? json;
  const dataArray = Array.isArray(data) ? data : [];

  for (const [index, item] of dataArray.entries()) {
    const record = item as Record<string, unknown>;
    const id = String(record.id ?? record.music_id ?? `tiktok-${index}`);

    if (seen.has(id)) continue;
    seen.add(id);

    items.push({
      id,
      rank: Number(record.rank ?? index + 1),
      title: String(record.title ?? record.name ?? "Unknown"),
      author: String(record.author ?? record.artist ?? "Unknown"),
      play_count: Number(record.play_count ?? record.video_count ?? 0),
      cover_url: String(record.cover_url ?? record.cover ?? ""),
    });

    if (items.length >= MAX_ITEMS) break;
  }

  return items;
}

function parseFallbackHtml(html: string): TrendItem[] {
  if (!html) return [];
  const items: TrendItem[] = [];
  const seen = new Set<string>();

  const decode = (value: string) =>
    value
      .replace(/\\"/g, '"')
      .replace(/\\u([\dA-Fa-f]{4})/g, (_, g) =>
        String.fromCharCode(parseInt(g, 16)),
      )
      .trim();

  const jsonMatches = html.matchAll(
    /"music_id":"?(\d+)"?[^}]*?"title":"([^"]+)"[^}]*?"author":"([^"]*)"/g,
  );
  for (const match of jsonMatches) {
    const id = match[1];
    if (seen.has(id)) continue;
    seen.add(id);

    const title = decode(match[2]);
    const author = decode(match[3] || "Unknown");
    const playCount = extractPlayCount(match[0]);

    items.push({
      id,
      rank: items.length + 1,
      title: title || "Unknown",
      author: author || "Unknown",
      play_count: playCount,
      cover_url: "",
    });

    if (items.length >= MAX_ITEMS) break;
  }

  if (items.length === 0) {
    const linkMatches = html.matchAll(
      /href="[^"]*\/music\/(\d+)[^"]*".*?>([^<]+)</g,
    );
    for (const match of linkMatches) {
      const id = match[1];
      if (seen.has(id)) continue;
      seen.add(id);

      const title = decode(match[2]);
      items.push({
        id,
        rank: items.length + 1,
        title: title || "Unknown",
        author: "Unknown",
        play_count: 0,
        cover_url: "",
      });

      if (items.length >= MAX_ITEMS) break;
    }
  }

  return items;
}

function extractPlayCount(snippet: string): number {
  const playMatch =
    snippet.match(/"video_count":(\d+)/) ?? snippet.match(/"videoCnt":(\d+)/);
  if (playMatch) return Number(playMatch[1]) || 0;
  return 0;
}

export function clearCache(pattern?: string): void {
  if (pattern) {
    for (const key of responseCache.keys()) {
      if (key.includes(pattern)) {
        responseCache.delete(key);
      }
    }
  } else {
    responseCache.clear();
  }
}

export function getCacheStats(): {
  size: number;
  keys: string[];
  entries: Array<{ key: string; expiresAt: number; isExpired: boolean }>;
} {
  const now = Date.now();
  return {
    size: responseCache.size,
    keys: Array.from(responseCache.keys()),
    entries: Array.from(responseCache.entries()).map(([key, value]) => ({
      key,
      expiresAt: value.expiresAt,
      isExpired: value.expiresAt < now,
    })),
  };
}
