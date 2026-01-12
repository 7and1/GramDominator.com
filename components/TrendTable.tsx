"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { AudioTrendRow } from "@/lib/types";
import { buildAudioSlug } from "@/lib/slug";
import { GENRE_OPTIONS, VIBE_OPTIONS } from "@/lib/categories";
import { formatNumber, formatPercent, getGrowthLabel } from "@/lib/format";
import { exportToCsv } from "@/lib/export-csv";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";

interface TrendTableProps {
  data: AudioTrendRow[];
}

const FILTER_PARAM_GENRE = "genre";
const FILTER_PARAM_VIBE = "vibe";
const FILTER_PARAM_QUERY = "q";

export function TrendTable({ data }: TrendTableProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const genreParam = searchParams.get(FILTER_PARAM_GENRE);
    const vibeParam = searchParams.get(FILTER_PARAM_VIBE);
    const queryParam = searchParams.get(FILTER_PARAM_QUERY);

    if (genreParam) setSelectedGenre(genreParam);
    if (vibeParam) setSelectedVibe(vibeParam);
    if (queryParam) setGlobalFilter(queryParam);

    setIsInitialized(true);
  }, [searchParams]);

  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();
    if (selectedGenre) params.set(FILTER_PARAM_GENRE, selectedGenre);
    if (selectedVibe) params.set(FILTER_PARAM_VIBE, selectedVibe);
    if (globalFilter) params.set(FILTER_PARAM_QUERY, globalFilter);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(newUrl, { scroll: false });
  }, [selectedGenre, selectedVibe, globalFilter, isInitialized, router]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const genreMatch = selectedGenre
        ? item.genre?.toLowerCase() === selectedGenre
        : true;
      const vibeMatch = selectedVibe
        ? item.vibe?.toLowerCase() === selectedVibe
        : true;
      return genreMatch && vibeMatch;
    });
  }, [data, selectedGenre, selectedVibe]);

  const handleExportCsv = () => {
    const filename =
      selectedGenre || selectedVibe
        ? `gramdominator-${selectedGenre ?? ""}-${selectedVibe ?? ""}-trends.csv`
        : "gramdominator-trends.csv";
    exportToCsv(filteredData, filename);
  };

  const hasActiveFilters = selectedGenre || selectedVibe || globalFilter;

  const columns = useMemo<ColumnDef<AudioTrendRow>[]>(
    () => [
      {
        header: "Rank",
        accessorKey: "rank",
        cell: ({ row }) => (
          <span className="font-semibold">#{row.original.rank ?? "-"}</span>
        ),
      },
      {
        header: "Audio",
        accessorKey: "title",
        cell: ({ row }) => (
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-medium text-black">{row.original.title}</p>
              <p className="text-xs text-black/50">
                {row.original.author ?? "Unknown artist"}
              </p>
            </div>
            <FavoriteButton audio={row.original} variant="icon" />
          </div>
        ),
      },
      {
        header: "Uses",
        accessorKey: "play_count",
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {formatNumber(row.original.play_count)}
          </span>
        ),
      },
      {
        header: "Tags",
        accessorKey: "genre",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.genre ? (
              <span className="rounded-full bg-black/5 px-2 py-1 text-xs font-semibold text-black/60">
                {row.original.genre}
              </span>
            ) : null}
            {row.original.vibe ? (
              <span className="rounded-full bg-black/5 px-2 py-1 text-xs font-semibold text-black/60">
                {row.original.vibe}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        header: "Momentum",
        accessorKey: "growth_rate",
        cell: ({ row }) => {
          const growth = row.original.growth_rate ?? 0;
          const badge = getGrowthLabel(growth);
          return (
            <div>
              <p className={`text-sm font-semibold ${badge.tone}`}>
                {badge.label}
              </p>
              <p className="text-xs text-black/50">{formatPercent(growth)}</p>
            </div>
          );
        },
      },
      {
        header: "Action",
        accessorKey: "id",
        cell: ({ row }) => {
          const slug = buildAudioSlug(row.original.title, row.original.id);
          return (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/audio/${slug}`}
                className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white transition hover:opacity-90"
              >
                Details
              </Link>
              <a
                href={`https://www.tiktok.com/music/${row.original.id}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-black/70 transition hover:border-black/20 hover:bg-black/5"
              >
                Use audio
              </a>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-glow">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">
            Live audio signals
          </h2>
          <p className="text-sm text-black/60">
            Filter by title or artist to find your next viral hook.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="Search audio"
            className="w-full rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-black/70 outline-none transition focus:border-black/20 md:w-64"
          />
          {hasActiveFilters && (
            <ShareButton variant="link" className="!static" />
          )}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold text-black/70 transition hover:border-black/20 hover:bg-black/5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-black/60">
        <span className="uppercase tracking-[0.2em] text-black/40">Vibes</span>
        {VIBE_OPTIONS.map((option) => (
          <button
            key={option.slug}
            type="button"
            onClick={() =>
              setSelectedVibe(selectedVibe === option.slug ? null : option.slug)
            }
            className={`rounded-full border px-3 py-1 font-semibold transition ${
              selectedVibe === option.slug
                ? "border-black/40 bg-black/10 text-black"
                : "border-black/10 bg-white text-black/60 hover:border-black/20"
            }`}
          >
            {option.emoji} {option.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-black/60">
        <span className="uppercase tracking-[0.2em] text-black/40">Genres</span>
        {GENRE_OPTIONS.map((option) => (
          <button
            key={option.slug}
            type="button"
            onClick={() =>
              setSelectedGenre(
                selectedGenre === option.slug ? null : option.slug,
              )
            }
            className={`rounded-full border px-3 py-1 font-semibold transition ${
              selectedGenre === option.slug
                ? "border-black/40 bg-black/10 text-black"
                : "border-black/10 bg-white text-black/60 hover:border-black/20"
            }`}
          >
            {option.emoji} {option.label}
          </button>
        ))}
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex items-center gap-3 text-xs text-black/50">
          <span>
            Showing {filteredData.length} of {data.length} results
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedGenre(null);
              setSelectedVibe(null);
              setGlobalFilter("");
            }}
            className="font-semibold text-blaze underline hover:text-blaze/80"
          >
            Clear all filters
          </button>
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-black/10 text-xs uppercase tracking-[0.2em] text-black/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-2"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <span className="text-[10px] text-black/40">
                          {{ asc: "▲", desc: "▼" }[
                            header.column.getIsSorted() as string
                          ] ?? ""}
                        </span>
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-black/5 transition-colors hover:bg-black/[0.02]"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && hasActiveFilters && (
        <div className="mt-6 rounded-xl border border-dashed border-black/20 bg-black/[0.02] p-8 text-center">
          <p className="text-sm text-black/60">
            No results match your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedGenre(null);
              setSelectedVibe(null);
              setGlobalFilter("");
            }}
            className="mt-2 text-sm font-semibold text-blaze underline hover:text-blaze/80"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
