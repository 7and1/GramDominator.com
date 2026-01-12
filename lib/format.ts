export function formatNumber(value?: number | null): string {
  if (value === undefined || value === null) return "n/a";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value?: number | null): string {
  if (value === undefined || value === null) return "n/a";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(timestamp?: number | null): string {
  if (!timestamp) return "n/a";
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getGrowthLabel(value?: number | null): {
  label: string;
  tone: string;
} {
  if (value === null || value === undefined)
    return { label: "n/a", tone: "text-black/50" };
  if (value >= 0.5) return { label: "Breakout", tone: "text-emerald-600" };
  if (value >= 0.2) return { label: "Rising", tone: "text-emerald-600" };
  if (value >= 0.05) return { label: "Climbing", tone: "text-amber-600" };
  if (value <= -0.1) return { label: "Cooling", tone: "text-red-500" };
  return { label: "Steady", tone: "text-black/60" };
}
