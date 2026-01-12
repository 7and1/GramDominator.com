/**
 * Runtime Environment Variable Validation
 * Validates all required environment variables at startup
 */

import { z } from "zod";

/**
 * Environment variable schema
 * All variables that MUST be set for the application to function
 */
const EnvSchema = z.object({
  // Public facing URLs
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .default("https://gramdominator.com"),

  // Cloudflare bindings (available in production)
  DB: z.any().optional(), // D1 database binding
  AI: z.any().optional(), // AI binding
  KV: z.any().optional(), // KV namespace binding

  // External API credentials
  WATERMARK_API_URL: z.string().url().optional(),
  RAPIDAPI_KEY: z.string().min(1).optional(),
  RAPIDAPI_HOST: z.string().min(1).optional(),

  // Feature flags
  ENABLE_AI_FEATURES: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
  ENABLE_WATERMARK_TOOL: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
  ENABLE_ANALYTICS: z
    .string()
    .default("false")
    .transform((v) => v === "true"),

  // Rate limiting
  RATE_LIMIT_MAX_REQUESTS: z.string().default("60").transform(Number),
  RATE_LIMIT_WINDOW_MS: z.string().default("60000").transform(Number),

  // Cache settings
  CACHE_TTL_SECONDS: z.string().default("300").transform(Number),
  ENABLE_CACHE: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
});

/**
 * Runtime environment type
 */
export type Env = z.infer<typeof EnvSchema>;

/**
 * Validate environment variables and return typed config
 * Throws clear error messages for missing required variables
 */
export function validateEnv(): Env {
  try {
    // Build env object from process.env and request context
    const envInput = {
      ...process.env,

      // Public vars
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,

      // Feature flags
      ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES ?? "true",
      ENABLE_WATERMARK_TOOL: process.env.ENABLE_WATERMARK_TOOL ?? "true",
      ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS ?? "false",

      // Rate limiting
      RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS ?? "60",
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS ?? "60000",

      // Cache settings
      CACHE_TTL_SECONDS: process.env.CACHE_TTL_SECONDS ?? "300",
      ENABLE_CACHE: process.env.ENABLE_CACHE ?? "true",
    };

    return EnvSchema.parse(envInput);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues
        .map((e) => {
          const path = e.path.join(".");
          return `  - ${path}: ${e.message}`;
        })
        .join("\n");

      throw new Error(
        `Environment validation failed:\n${errors}\n\n` +
          `Please check your .env file or Cloudflare Pages environment variables.`,
      );
    }
    throw error;
  }
}

/**
 * Get validated environment (cached)
 */
let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  try {
    cachedEnv = validateEnv();
    return cachedEnv;
  } catch (error) {
    // In development, log the error but don't crash
    if (process.env.NODE_ENV === "development") {
      console.error("Environment validation warning:", error);
      // Return a minimal safe config
      return {
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
        ENABLE_AI_FEATURES: true,
        ENABLE_WATERMARK_TOOL: true,
        ENABLE_ANALYTICS: false,
        RATE_LIMIT_MAX_REQUESTS: 60,
        RATE_LIMIT_WINDOW_MS: 60000,
        CACHE_TTL_SECONDS: 300,
        ENABLE_CACHE: true,
      };
    }
    throw error;
  }
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  feature: "ai" | "watermark" | "analytics",
): boolean {
  const env = getEnv();

  switch (feature) {
    case "ai":
      return env.ENABLE_AI_FEATURES;
    case "watermark":
      return env.ENABLE_WATERMARK_TOOL;
    case "analytics":
      return env.ENABLE_ANALYTICS;
    default:
      return false;
  }
}

/**
 * Get cache TTL in seconds
 */
export function getCacheTTL(): number {
  return getEnv().CACHE_TTL_SECONDS;
}

/**
 * Check if caching is enabled
 */
export function isCacheEnabled(): boolean {
  return getEnv().ENABLE_CACHE;
}

/**
 * Get rate limit settings
 */
export function getRateLimitSettings(): {
  maxRequests: number;
  windowMs: number;
} {
  const env = getEnv();
  return {
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    windowMs: env.RATE_LIMIT_WINDOW_MS,
  };
}

/**
 * Get public site URL
 */
export function getSiteURL(): string {
  return getEnv().NEXT_PUBLIC_SITE_URL;
}
