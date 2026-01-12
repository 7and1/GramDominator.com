import { getRequestContext } from "@cloudflare/next-on-pages";
import { safeParse, WatermarkRequestSchema } from "@/lib/validation";

export const runtime = "edge";

type PagesEnv = Record<string, unknown> & {
  WATERMARK_API_URL?: string;
  RAPIDAPI_KEY?: string;
  RAPIDAPI_HOST?: string;
};

export async function POST(request: Request) {
  const context = getRequestContext();
  const env = context?.env as PagesEnv | undefined;

  if (!env?.WATERMARK_API_URL) {
    return Response.json(
      { error: "WATERMARK_API_URL not configured" },
      { status: 501 },
    );
  }

  // Parse and validate request body
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate input using Zod schema
  const validationResult = safeParse(WatermarkRequestSchema, payload);
  if (!validationResult.success) {
    return Response.json(
      {
        error: "Invalid request data",
        details: validationResult.error.format(),
      },
      { status: 400 },
    );
  }

  const { url } = validationResult.data;

  // Additional security: validate URL is HTTPS
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:") {
      return Response.json(
        { error: "Only HTTPS URLs are allowed" },
        { status: 400 },
      );
    }
  } catch {
    return Response.json({ error: "Invalid URL format" }, { status: 400 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (env.RAPIDAPI_KEY) headers["x-rapidapi-key"] = env.RAPIDAPI_KEY;
  if (env.RAPIDAPI_HOST) headers["x-rapidapi-host"] = env.RAPIDAPI_HOST;

  try {
    const response = await fetch(env.WATERMARK_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ url }),
    });

    const result = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    if (!response.ok) {
      const message =
        typeof result.message === "string" ? result.message : "Upstream error";
      return Response.json({ error: message }, { status: response.status });
    }

    const data =
      typeof result.data === "object" && result.data
        ? (result.data as Record<string, unknown>)
        : {};
    const downloadUrl =
      (result.downloadUrl as string | undefined) ||
      (result.url as string | undefined) ||
      (data.download as string | undefined) ||
      (data.url as string | undefined) ||
      "";

    if (!downloadUrl) {
      return Response.json(
        { error: "No download URL in response" },
        { status: 502 },
      );
    }

    return Response.json({ downloadUrl });
  } catch (error) {
    console.error("Watermark API error:", error);
    return Response.json(
      { error: "Failed to process watermark removal" },
      { status: 500 },
    );
  }
}
