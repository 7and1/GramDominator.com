import { describe, expect, it } from "vitest";
import { buildAudioSlug, parseAudioSlug, slugify } from "../lib/slug";

describe("slug helpers", () => {
  it("slugify normalizes titles", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });

  it("buildAudioSlug appends id", () => {
    expect(buildAudioSlug("Song Name", "12345")).toBe("song-name-12345");
  });

  it("parseAudioSlug returns trailing id", () => {
    expect(parseAudioSlug("song-name-12345")).toBe("12345");
  });
});
