/**
 * Security Headers and Content Security Policy Configuration
 * OWASP Top 10 Compliance
 */

type NonceSource = `'nonce-${string}'`;
type CSPSource =
  | "'self'"
  | "'none'"
  | "'unsafe-inline'"
  | "'unsafe-eval'"
  | "'unsafe-hashes'"
  | NonceSource
  | string;

interface CSPConfig {
  "default-src": CSPSource[];
  "base-uri": CSPSource[];
  "child-src": CSPSource[];
  "connect-src": CSPSource[];
  "font-src": CSPSource[];
  "form-action": CSPSource[];
  "frame-ancestors": CSPSource[];
  "frame-src": CSPSource[];
  "img-src": CSPSource[];
  "manifest-src": CSPSource[];
  "media-src": CSPSource[];
  "object-src": CSPSource[];
  "script-src": CSPSource[];
  "script-src-elem": CSPSource[];
  "style-src": CSPSource[];
  "style-src-elem": CSPSource[];
  "worker-src": CSPSource[];
}

/**
 * Production-ready CSP configuration
 * Restrictive by default, only allowing necessary sources
 */
export const cspConfig: CSPConfig = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "child-src": ["'self'"],
  "connect-src": [
    "'self'",
    // TikTok CDN for audio covers
    "*.tiktokcdn.com",
    "p16-va.tiktokcdn.com",
    "p16-sign.tiktokcdn.com",
  ],
  "font-src": ["'self'", "data:"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "frame-src": ["'self'"],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "*.tiktokcdn.com",
    "p16-va.tiktokcdn.com",
    "p16-sign.tiktokcdn.com",
  ],
  "manifest-src": ["'self'"],
  "media-src": ["'self'", "*.tiktokcdn.com", "p16-va.tiktokcdn.com"],
  "object-src": ["'none'"],
  "script-src": ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
  "script-src-elem": ["'self'", "'unsafe-inline'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "style-src-elem": ["'self'", "'unsafe-inline'"],
  "worker-src": ["'self'", "blob:"],
};

/**
 * Convert CSP config to header value string
 */
function buildCSPHeader(config: CSPConfig): string {
  return Object.entries(config)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");
}

/**
 * Get CSP header value
 */
export function getCSPHeaderValue(): string {
  return buildCSPHeader(cspConfig);
}

/**
 * Security headers for Next.js middleware or API routes
 */
export interface SecurityHeaders {
  "Content-Security-Policy": string;
  "X-DNS-Prefetch-Control": string;
  "Strict-Transport-Security": string;
  "X-Frame-Options": string;
  "X-Content-Type-Options": string;
  "Referrer-Policy": string;
  "Permissions-Policy": string;
  "X-XSS-Protection": string;
  "Cross-Origin-Opener-Policy": string;
  "Cross-Origin-Resource-Policy": string;
}

/**
 * Get all security headers for the application
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": getCSPHeaderValue(),
    "X-DNS-Prefetch-Control": "off",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
    "X-XSS-Protection": "1; mode=block",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate and sanitize URL to prevent open redirect attacks
 */
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url, window.location.origin);
    // Only allow http/https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    // Reject javascript: and data: URLs
    if (url.startsWith("javascript:") || url.startsWith("data:")) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Rate limit key generator for API routes
 */
export function getRateLimitKey(identifier: string, endpoint: string): string {
  return `ratelimit:${identifier}:${endpoint}`;
}

/**
 * Generate a nonce for CSP inline scripts (if needed in future)
 */
export function generateNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16)))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
