import { NextRequest, NextResponse } from "next/server";
import { CACHE_CONFIG, getCacheTagForPath } from "./lib/cache";

const STATIC_ASSET_PATTERNS = [
  /\.(css|js|woff|woff2|ttf|otf|eot)$/,
  /\/_next\/static\//,
  /\/static\//,
  /\.(png|jpg|jpeg|gif|webp|svg|ico)$/,
  /\.(mp4|webm|ogg)$/,
];

const API_PATTERNS = [/\/api\//, /\/api\/v1\//];

const CACHEABLE_PATHS = [
  "/api/v1/trends",
  "/api/v1/audio/",
  "/api/v1/genres",
  "/api/v1/vibes",
  "/api/v1/genre/",
  "/api/v1/vibe/",
];

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (isStaticAsset(pathname)) {
    return addStaticAssetHeaders(request);
  }

  if (isApiRoute(pathname)) {
    return addApiCacheHeaders(request);
  }

  return NextResponse.next();
}

function isStaticAsset(pathname: string): boolean {
  return STATIC_ASSET_PATTERNS.some((pattern) => pattern.test(pathname));
}

function isApiRoute(pathname: string): boolean {
  return API_PATTERNS.some((pattern) => pattern.test(pathname));
}

function isCacheableApiPath(pathname: string): boolean {
  return CACHEABLE_PATHS.some((pattern) => pathname.startsWith(pattern));
}

function addStaticAssetHeaders(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  response.headers.set("Cache-Control", CACHE_CONFIG.edge.static);

  if (request.nextUrl.pathname.match(/\.(css|js)$/)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
  }

  if (request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=604800",
    );
  }

  return response;
}

function addApiCacheHeaders(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  if (!isCacheableApiPath(pathname)) {
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const cacheTags = getCacheTagForPath(pathname);
  if (cacheTags.length > 0) {
    response.headers.set("Edge-Cache-Tag", cacheTags.join(","));
  }

  if (pathname.startsWith("/api/v1/trends")) {
    response.headers.set("Cache-Control", CACHE_CONFIG.edge.trends);
  } else if (pathname.startsWith("/api/v1/audio/")) {
    response.headers.set("Cache-Control", CACHE_CONFIG.edge.audio);
  } else if (pathname.includes("hashtag")) {
    response.headers.set("Cache-Control", CACHE_CONFIG.edge.hashtags);
  } else {
    response.headers.set("Cache-Control", CACHE_CONFIG.edge.api);
  }

  response.headers.set("Vary", "Authorization,Accept-Encoding");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
