import { errorResponse } from "./api-response";

export interface RateLimitConfig {
  window: number;
  max: number;
  keyPrefix: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  default: {
    window: 60,
    max: 60,
    keyPrefix: "rl",
  },
  api: {
    window: 60,
    max: 100,
    keyPrefix: "rl:api",
  },
  trends: {
    window: 60,
    max: 30,
    keyPrefix: "rl:trends",
  },
  audio: {
    window: 60,
    max: 60,
    keyPrefix: "rl:audio",
  },
  strict: {
    window: 60,
    max: 10,
    keyPrefix: "rl:strict",
  },
  burst: {
    window: 1,
    max: 5,
    keyPrefix: "rl:burst",
  },
};

const MOCK_KV_STORE = new Map<string, { count: number; expiresAt: number }>();

export interface KVStore {
  get(key: string): Promise<{ count: number; expiresAt: number } | null>;
  put(
    key: string,
    value: { count: number; expiresAt: number },
    ttl?: number,
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

class MockKVStore implements KVStore {
  async get(key: string): Promise<{ count: number; expiresAt: number } | null> {
    const entry = MOCK_KV_STORE.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      MOCK_KV_STORE.delete(key);
      return null;
    }

    return entry;
  }

  async put(
    key: string,
    value: { count: number; expiresAt: number },
  ): Promise<void> {
    MOCK_KV_STORE.set(key, value);
  }

  async delete(key: string): Promise<void> {
    MOCK_KV_STORE.delete(key);
  }
}

let globalKVStore: KVStore | null = null;

export function getKVStore(): KVStore {
  return globalKVStore ?? new MockKVStore();
}

export function setKVStore(store: KVStore): void {
  globalKVStore = store;
}

export function createRateLimiter(
  config: RateLimitConfig,
  kvStore?: KVStore,
): {
  check: (identifier: string) => Promise<RateLimitResult>;
  reset: (identifier: string) => Promise<void>;
} {
  const store = kvStore ?? getKVStore();

  async function check(identifier: string): Promise<RateLimitResult> {
    const key = `${config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.window * 1000;

    let entry = await store.get(key);

    if (!entry || entry.expiresAt < now) {
      entry = { count: 0, expiresAt: now + config.window * 1000 };
    }

    const newCount = entry.count + 1;
    const allowed = newCount <= config.max;

    if (allowed) {
      await store.put(key, { count: newCount, expiresAt: entry.expiresAt });
    }

    const ttl = Math.max(0, Math.ceil((entry.expiresAt - now) / 1000));
    const remaining = Math.max(0, config.max - newCount);
    const retryAfter = allowed ? undefined : ttl;

    return {
      allowed,
      limit: config.max,
      remaining,
      reset: entry.expiresAt,
      retryAfter,
    };
  }

  async function reset(identifier: string): Promise<void> {
    const key = `${config.keyPrefix}:${identifier}`;
    await store.delete(key);
  }

  return { check, reset };
}

export function extractIdentifier(request: Request): string {
  const forwardedFor =
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? "anonymous";

  const authHeader = request.headers.get("Authorization");
  const apiKey = authHeader?.replace(/^Bearer\s+/i, "") ?? "";

  if (apiKey) {
    return `apikey:${apiKey}`;
  }

  return `ip:${ip}`;
}

export async function applyRateLimit(
  request: Request,
  config: RateLimitConfig,
  options?: {
    identifier?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    kvStore?: KVStore;
  },
): Promise<{ allowed: boolean; response?: Response }> {
  const identifier = options?.identifier ?? extractIdentifier(request);
  const rateLimiter = createRateLimiter(config, options?.kvStore);

  const result = await rateLimiter.check(identifier);

  if (!result.allowed) {
    const response = errorResponse("Rate limit exceeded", {
      code: "RATE_LIMITED",
      statusCode: 429,
    });

    response.headers.set("X-RateLimit-Limit", String(result.limit));
    response.headers.set("X-RateLimit-Remaining", "0");
    response.headers.set("X-RateLimit-Reset", String(result.reset));
    if (result.retryAfter) {
      response.headers.set("Retry-After", String(result.retryAfter));
    }

    return { allowed: false, response };
  }

  return { allowed: true };
}

export function setRateLimitHeaders(
  response: Response,
  result: RateLimitResult,
): Response {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(result.reset));

  if (result.retryAfter) {
    response.headers.set("Retry-After", String(result.retryAfter));
  }

  return response;
}

export function withRateLimit<
  T extends (...args: unknown[]) => Promise<Response> | Response,
>(
  handler: T,
  configOrKey: RateLimitConfig | keyof typeof RATE_LIMIT_CONFIGS,
  options?: {
    identifierFn?: (request: Request) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    kvStore?: KVStore;
  },
): T {
  return (async (...args: unknown[]) => {
    const [request] = args as [Request];

    const config =
      typeof configOrKey === "string"
        ? RATE_LIMIT_CONFIGS[configOrKey]
        : configOrKey;

    const identifier = options?.identifierFn
      ? options.identifierFn(request)
      : extractIdentifier(request);

    const result = await applyRateLimit(request, config, {
      identifier,
      ...options,
    });

    if (!result.allowed && result.response) {
      return result.response;
    }

    const response = await handler(...args);

    if (response instanceof Response) {
      const rateLimiter = createRateLimiter(config, options?.kvStore);
      const rateLimitResult = await rateLimiter.check(identifier);

      return setRateLimitHeaders(response, rateLimitResult);
    }

    return response;
  }) as T;
}

export function slidingWindowRateLimit(
  config: RateLimitConfig,
  kvStore?: KVStore,
): {
  check: (identifier: string, timestamp?: number) => Promise<RateLimitResult>;
} {
  const store = kvStore ?? getKVStore();
  const windowMs = config.window * 1000;

  async function check(
    identifier: string,
    timestamp = Date.now(),
  ): Promise<RateLimitResult> {
    const key = `${config.keyPrefix}:sw:${identifier}`;
    const windowStart = timestamp - windowMs;

    let entry = await store.get(key);

    if (!entry) {
      entry = { count: 0, expiresAt: timestamp + windowMs };
    }

    const requestsInWindow: number[] = [];
    const count = entry.count;

    const allowed = count < config.max;

    if (allowed) {
      entry.count += 1;
      await store.put(key, entry);
    }

    const ttl = Math.max(0, Math.ceil((entry.expiresAt - timestamp) / 1000));
    const remaining = Math.max(0, config.max - (allowed ? entry.count : count));
    const retryAfter = allowed ? undefined : ttl;

    return {
      allowed,
      limit: config.max,
      remaining,
      reset: entry.expiresAt,
      retryAfter,
    };
  }

  return { check };
}

export function tokenBucketRateLimit(
  config: RateLimitConfig & { refillRate?: number },
  kvStore?: KVStore,
): {
  check: (identifier: string) => Promise<RateLimitResult>;
} {
  const store = kvStore ?? getKVStore();
  const refillRate = config.refillRate ?? config.max / config.window;
  const maxTokens = config.max;

  async function check(identifier: string): Promise<RateLimitResult> {
    const key = `${config.keyPrefix}:tb:${identifier}`;
    const now = Date.now();

    let entry = await store.get(key);

    if (!entry) {
      entry = { count: maxTokens, expiresAt: now + config.window * 1000 };
    }

    const timePassed = (now - (entry.expiresAt - config.window * 1000)) / 1000;
    const refill = Math.floor(timePassed * refillRate);
    const currentTokens = Math.min(maxTokens, entry.count + refill);

    const allowed = currentTokens >= 1;

    if (allowed) {
      entry.count = currentTokens - 1;
      entry.expiresAt = now + config.window * 1000;
      await store.put(key, entry);
    }

    const ttl = Math.max(0, Math.ceil((entry.expiresAt - now) / 1000));
    const remaining = Math.floor(allowed ? currentTokens - 1 : currentTokens);
    const retryAfter = allowed ? undefined : Math.ceil(1 / refillRate);

    return {
      allowed,
      limit: maxTokens,
      remaining,
      reset: entry.expiresAt,
      retryAfter,
    };
  }

  return { check };
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}
