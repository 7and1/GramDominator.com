import { describe, expect, it } from "vitest";
import { parseAiResponse } from "../src/worker/ai-tagger";

describe("parseAiResponse", () => {
  it("parses JSON string response", () => {
    const result = parseAiResponse('{"genre":"Pop","vibe":"Energetic"}');
    expect(result.genre).toBe("Pop");
    expect(result.vibe).toBe("Energetic");
  });

  it("falls back to defaults when invalid", () => {
    const result = parseAiResponse("nope");
    expect(result.genre).toBeDefined();
  });
});
