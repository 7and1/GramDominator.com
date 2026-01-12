import type { AudioTrendRow } from "./types";

export interface ExportOptions {
  includeHeaders?: boolean;
  delimiter?: string;
}

export function exportToCsv(
  data: AudioTrendRow[],
  filename: string = "gramdominator-trends.csv",
  options: ExportOptions = {},
) {
  const { includeHeaders = true, delimiter = "," } = options;

  const headers = [
    "Title",
    "Author",
    "Play Count",
    "Growth Rate",
    "Rank",
    "Genre",
    "Vibe",
    "URL",
  ];

  const escapeCsvField = (
    field: string | number | null | undefined,
  ): string => {
    if (field === null || field === undefined) return "";
    const stringField = String(field);
    if (
      stringField.includes(delimiter) ||
      stringField.includes('"') ||
      stringField.includes("\n")
    ) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const rows = data.map((item) => [
    escapeCsvField(item.title),
    escapeCsvField(item.author ?? ""),
    escapeCsvField(item.play_count ?? 0),
    escapeCsvField(item.growth_rate ?? 0),
    escapeCsvField(item.rank ?? ""),
    escapeCsvField(item.genre ?? ""),
    escapeCsvField(item.vibe ?? ""),
    escapeCsvField(`https://www.tiktok.com/music/${item.id}`),
  ]);

  let csvContent = "";
  if (includeHeaders) {
    csvContent += headers.map(escapeCsvField).join(delimiter) + "\n";
  }
  csvContent += rows.map((row) => row.join(delimiter)).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function generateCsvContent(
  data: AudioTrendRow[],
  options: ExportOptions = {},
): string {
  const { includeHeaders = true, delimiter = "," } = options;

  const headers = [
    "Title",
    "Author",
    "Play Count",
    "Growth Rate",
    "Rank",
    "Genre",
    "Vibe",
    "URL",
  ];

  const escapeCsvField = (
    field: string | number | null | undefined,
  ): string => {
    if (field === null || field === undefined) return "";
    const stringField = String(field);
    if (
      stringField.includes(delimiter) ||
      stringField.includes('"') ||
      stringField.includes("\n")
    ) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const rows = data.map((item) => [
    escapeCsvField(item.title),
    escapeCsvField(item.author ?? ""),
    escapeCsvField(item.play_count ?? 0),
    escapeCsvField(item.growth_rate ?? 0),
    escapeCsvField(item.rank ?? ""),
    escapeCsvField(item.genre ?? ""),
    escapeCsvField(item.vibe ?? ""),
    escapeCsvField(`https://www.tiktok.com/music/${item.id}`),
  ]);

  let csvContent = "";
  if (includeHeaders) {
    csvContent += headers.map(escapeCsvField).join(delimiter) + "\n";
  }
  csvContent += rows.map((row) => row.join(delimiter)).join("\n");

  return csvContent;
}
