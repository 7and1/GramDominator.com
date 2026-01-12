/**
 * Health Check Endpoint
 * Monitors database, KV, and external API health
 */

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getDB } from "@/lib/d1";
import { getCacheHealth } from "@/lib/fallback-data";

export const runtime = "edge";

type PagesEnv = Record<string, unknown> & {
  KV?: KVNamespace;
  AI?: unknown;
};

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: number;
  services: {
    database: ServiceHealth;
    kv: ServiceHealth;
    ai: ServiceHealth;
    cache: ServiceHealth;
  };
  version: string;
}

interface ServiceHealth {
  status: "healthy" | "degraded" | "unhealthy";
  latency?: number;
  error?: string;
}

/**
 * Health check endpoint handler
 */
export async function GET() {
  const startTime = Date.now();
  const context = getRequestContext();
  const env = context?.env as PagesEnv | undefined;

  const health: HealthStatus = {
    status: "healthy",
    timestamp: Date.now(),
    services: {
      database: await checkDatabase(),
      kv: await checkKV(env?.KV),
      ai: await checkAI(env?.AI),
      cache: await checkCache(),
    },
    version: "1.0.0",
  };

  // Determine overall health status
  const unhealthyServices = Object.values(health.services).filter(
    (s) => s.status === "unhealthy",
  );
  const degradedServices = Object.values(health.services).filter(
    (s) => s.status === "degraded",
  );

  if (unhealthyServices.length > 0) {
    health.status = "unhealthy";
  } else if (degradedServices.length > 0) {
    health.status = "degraded";
  }

  // Set appropriate status code
  const statusCode =
    health.status === "healthy"
      ? 200
      : health.status === "degraded"
        ? 200
        : 503;

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Health-Check-Duration": `${Date.now() - startTime}ms`,
    },
  });
}

/**
 * Check database health
 */
async function checkDatabase(): Promise<ServiceHealth> {
  const startTime = Date.now();

  try {
    const db = getDB();
    // Simple health query
    await db.prepare("SELECT 1 as health").first<{ health: number }>();

    return {
      status: "healthy",
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

/**
 * Check KV health
 */
async function checkKV(kv?: KVNamespace): Promise<ServiceHealth> {
  const startTime = Date.now();

  if (!kv) {
    return {
      status: "degraded",
      error: "KV binding not configured",
    };
  }

  try {
    const testKey = "health:check";
    await kv.put(testKey, "ok", { expirationTtl: 60 });
    await kv.get(testKey);
    await kv.delete(testKey);

    return {
      status: "healthy",
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "KV error",
    };
  }
}

/**
 * Check AI service availability
 */
async function checkAI(ai?: unknown): Promise<ServiceHealth> {
  const startTime = Date.now();

  if (!ai) {
    return {
      status: "degraded",
      error: "AI binding not configured",
    };
  }

  // AI is optional, just check binding exists
  return {
    status: "healthy",
    latency: Date.now() - startTime,
  };
}

/**
 * Check cache health
 */
async function checkCache(): Promise<ServiceHealth> {
  const startTime = Date.now();

  try {
    const cacheHealth = await getCacheHealth();

    if (cacheHealth.isStale && !cacheHealth.hasInMemory) {
      return {
        status: "degraded",
        latency: Date.now() - startTime,
        error: "Cache data is stale",
      };
    }

    return {
      status: "healthy",
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: "degraded",
      latency: Date.now() - startTime,
      error:
        error instanceof Error ? error.message : "Cache health check failed",
    };
  }
}
