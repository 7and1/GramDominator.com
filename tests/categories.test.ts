import { describe, expect, it } from "vitest";
import {
  getCollectionBySlug,
  resolveCategoryFromSlug,
} from "../lib/categories";

describe("categories helpers", () => {
  it("finds curated collection by slug", () => {
    const collection = getCollectionBySlug("best-funny-tiktok-songs-2024");
    expect(collection?.vibe).toBe("funny");
  });

  it("resolves vibe and genre tokens from slug", () => {
    const resolved = resolveCategoryFromSlug("top-gym-workout-music-january");
    expect(resolved.vibe).toBe("gym");
  });
});
