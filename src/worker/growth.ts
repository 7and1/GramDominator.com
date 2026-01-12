import type { HistoryRow, TrendItem } from "./types";

const NEW_ENTRY_GROWTH = 1;

export function calculateGrowthRate(
  current: TrendItem,
  previous?: HistoryRow,
): number {
  if (!previous) return NEW_ENTRY_GROWTH;

  const prevPlay = previous.play_count ?? 0;
  const prevRank = previous.rank ?? 0;

  if (prevPlay > 0 && current.play_count > 0) {
    return (current.play_count - prevPlay) / prevPlay;
  }

  if (prevRank > 0) {
    const rankDelta = prevRank - current.rank;
    return rankDelta / prevRank;
  }

  return 0;
}
