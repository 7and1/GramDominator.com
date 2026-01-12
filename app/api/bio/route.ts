import { Ai } from "@cloudflare/ai";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { safeParse, BioRequestSchema, ValidationError } from "@/lib/validation";

export const runtime = "edge";

type PagesEnv = Record<string, unknown> & {
  AI?: unknown;
};

export async function POST(request: Request) {
  const context = getRequestContext();
  const env = context?.env as PagesEnv | undefined;

  if (!env?.AI) {
    return Response.json(
      { error: "AI binding not configured" },
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
  const validationResult = safeParse(BioRequestSchema, payload);
  if (!validationResult.success) {
    return Response.json(
      {
        error: "Invalid request data",
        details: validationResult.error.format(),
      },
      { status: 400 },
    );
  }

  const {
    name = "Creator",
    niche = "content",
    tone = "confident",
  } = validationResult.data;

  // Sanitize inputs to prevent prompt injection
  const sanitizedName = sanitizeInput(name);
  const sanitizedNiche = sanitizeInput(niche);
  const sanitizedTone = sanitizeInput(tone);

  const ai = new Ai(env.AI);
  const prompt = `Write a short 1-2 line social bio for ${sanitizedName}. Niche: ${sanitizedNiche}. Tone: ${sanitizedTone}.
Return a single sentence, no quotes.`;

  try {
    const response = await ai.run("@cf/meta/llama-3-8b-instruct", {
      messages: [{ role: "user", content: prompt }],
    });

    const text = extractText(response);
    return Response.json({ text: text.trim() });
  } catch (error) {
    console.error("AI generation error:", error);
    return Response.json({ error: "Failed to generate bio" }, { status: 500 });
  }
}

/**
 * Sanitize input to prevent injection attacks
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .replace(/[<>{}]/g, "") // Remove potentially dangerous characters
    .trim()
    .slice(0, 100); // Limit length
}

function extractText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    if (typeof record.response === "string") return record.response;
    if (typeof record.text === "string") return record.text;
  }
  return JSON.stringify(value ?? "");
}
