/**
 * Input Validation Schemas using Zod
 * OWASP Top 10 Compliance - Input Validation
 */

import { z } from "zod";

/**
 * Validate trend IDs (numeric strings with reasonable length)
 */
export const TrendIdSchema = z
  .string()
  .min(1, "Trend ID is required")
  .max(100, "Trend ID too long")
  .regex(/^\d+$/, "Trend ID must be numeric")
  .transform((val) => val.trim());

/**
 * Validate limit parameters for pagination
 */
export const LimitSchema = z
  .number()
  .int("Limit must be an integer")
  .min(1, "Limit must be at least 1")
  .max(500, "Limit cannot exceed 500");

export const LimitStringSchema = z
  .string()
  .regex(/^\d+$/, "Limit must be a number")
  .transform(Number)
  .pipe(LimitSchema.catch(50));

/**
 * Validate URL slugs (lowercase alphanumeric with hyphens)
 */
export const SlugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(200, "Slug too long")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug must contain only lowercase letters, numbers, and hyphens",
  )
  .transform((val) => val.trim());

/**
 * Validate genre parameter
 */
export const GenreSchema = z
  .string()
  .min(1, "Genre is required")
  .max(50, "Genre too long")
  .regex(/^[a-zA-Z0-9&\s-]+$/, "Genre contains invalid characters")
  .transform((val) => val.trim().toLowerCase());

/**
 * Validate vibe parameter
 */
export const VibeSchema = z
  .string()
  .min(1, "Vibe is required")
  .max(50, "Vibe too long")
  .regex(/^[a-zA-Z0-9&\s-]+$/, "Vibe contains invalid characters")
  .transform((val) => val.trim().toLowerCase());

/**
 * Validate audio slug with embedded ID (e.g., "song-name-123456789")
 */
export const AudioSlugSchema = z
  .string()
  .min(1, "Audio slug is required")
  .max(300, "Audio slug too long")
  .regex(
    /^[a-z0-9-]+$/,
    "Audio slug must contain only lowercase letters, numbers, and hyphens",
  );

/**
 * Validate URL parameters
 */
export const URLSchema = z
  .string()
  .url("Invalid URL format")
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, "URL must use HTTP or HTTPS protocol");

/**
 * API request validation schemas
 */
export const BioRequestSchema = z.object({
  name: z
    .string()
    .max(100, "Name too long")
    .transform((v) => v.trim())
    .optional(),
  niche: z
    .string()
    .max(100, "Niche too long")
    .transform((v) => v.trim())
    .optional(),
  tone: z
    .string()
    .max(50, "Tone too long")
    .transform((v) => v.trim())
    .optional(),
});

export const WatermarkRequestSchema = z.object({
  url: URLSchema,
});

/**
 * Query parameter validation schemas
 */
export const TrendsQuerySchema = z.object({
  limit: LimitStringSchema.optional(),
  page: z
    .string()
    .regex(/^\d+$/, "Page must be numeric")
    .default("1")
    .transform(Number)
    .optional(),
});

export const GenreQuerySchema = z.object({
  limit: LimitStringSchema.optional(),
});

export const VibeQuerySchema = z.object({
  limit: LimitStringSchema.optional(),
});

/**
 * Helper function to safely parse and validate input
 */
export function safeParse<T extends z.ZodTypeAny>(schema: T, input: unknown) {
  return schema.safeParse(input);
}

/**
 * Helper to get validated data or throw error
 */
export function parseOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const error = result.error.format();
    throw new ValidationError(JSON.stringify(error));
  }
  return result.data;
}

/**
 * Custom validation error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validate and sanitize a trend ID from user input
 */
export function validateTrendId(input: unknown): string {
  return parseOrThrow(TrendIdSchema, input);
}

/**
 * Validate and sanitize a limit parameter
 */
export function validateLimit(input: unknown): number {
  if (typeof input === "number") {
    return parseOrThrow(LimitSchema, input);
  }
  if (typeof input === "string") {
    return parseOrThrow(LimitStringSchema, input);
  }
  return 50; // default
}

/**
 * Validate and sanitize a slug parameter
 */
export function validateSlug(input: unknown): string {
  return parseOrThrow(SlugSchema, input);
}

/**
 * Validate and sanitize a genre parameter
 */
export function validateGenre(input: unknown): string {
  return parseOrThrow(GenreSchema, input);
}

/**
 * Validate and sanitize a vibe parameter
 */
export function validateVibe(input: unknown): string {
  return parseOrThrow(VibeSchema, input);
}

/**
 * Validate and sanitize an audio slug
 */
export function validateAudioSlug(input: unknown): string {
  return parseOrThrow(AudioSlugSchema, input);
}
