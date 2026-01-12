import { describe, expect, it } from "vitest";
import { calculateGrowthRate } from "../src/worker/growth";
import type { HistoryRow, TrendItem } from "../src/worker/types";

describe("calculateGrowthRate", () => {
  it("returns 1 for new entry with no history", () => {
    const current: TrendItem = {
      id: "1",
      rank: 1,
      title: "Song",
      author: "Artist",
      play_count: 100,
      cover_url: "",
    };

    expect(calculateGrowthRate(current, undefined)).toBe(1);
  });

  it("calculates play count growth when available", () => {
    const current: TrendItem = {
      id: "1",
      rank: 2,
      title: "Song",
      author: "Artist",
      play_count: 150,
      cover_url: "",
    };

    const previous: HistoryRow = {
      id: "1",
      play_count: 100,
      rank: 5,
      snapshot_at: Date.now(),
    };

    expect(calculateGrowthRate(current, previous)).toBeCloseTo(0.5, 4);
  });

  it("falls back to rank delta when play count is missing", () => {
    const current: TrendItem = {
      id: "1",
      rank: 2,
      title: "Song",
      author: "Artist",
      play_count: 0,
      cover_url: "",
    };

    const previous: HistoryRow = {
      id: "1",
      play_count: 0,
      rank: 4,
      snapshot_at: Date.now(),
    };

    expect(calculateGrowthRate(current, previous)).toBeCloseTo(0.5, 4);
  });
});
