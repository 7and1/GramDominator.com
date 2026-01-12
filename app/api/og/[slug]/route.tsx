import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";

import { getAudioById } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import { buildAudioSlug, parseAudioSlug } from "@/lib/slug";
import { getSiteUrl } from "@/lib/seo";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const id = parseAudioSlug(slug);
  if (!id) notFound();

  const audio = await getAudioById(id);
  if (!audio) notFound();

  const site = getSiteUrl();
  const cover =
    audio.cover_url && audio.cover_url.startsWith("http")
      ? audio.cover_url
      : undefined;
  const title = audio.title ?? "TikTok Audio";
  const playCount = formatNumber(audio.play_count ?? 0);
  const growth =
    audio.growth_rate !== null && audio.growth_rate !== undefined
      ? `${(audio.growth_rate * 100).toFixed(1)}%`
      : "n/a";
  const rank = audio.rank ?? "–";

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        background:
          "linear-gradient(135deg, #0f172a 0%, #111827 35%, #1f2937 100%)",
        color: "#f9fafb",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ flex: 1, padding: "60px" }}>
        <div
          style={{
            fontSize: "22px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          GramDominator · TikTok Audio
        </div>
        <div
          style={{
            marginTop: "28px",
            fontSize: "54px",
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: "760px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: "18px",
            fontSize: "22px",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          By {audio.author ?? "Unknown artist"}
        </div>
        <div
          style={{
            display: "flex",
            gap: "28px",
            marginTop: "32px",
            fontSize: "20px",
          }}
        >
          <Stat label="Rank" value={`#${rank}`} />
          <Stat label="Uses" value={playCount} />
          <Stat label="Growth" value={growth} />
        </div>
        <div
          style={{
            marginTop: "40px",
            fontSize: "18px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {site}/audio/{buildAudioSlug(audio.title, audio.id)}
        </div>
      </div>
      <div style={{ width: "360px", position: "relative", padding: "40px" }}>
        <div
          style={{
            position: "absolute",
            inset: "30px",
            borderRadius: "28px",
            background:
              "radial-gradient(circle at 30% 30%, rgba(255, 122, 61, 0.22), transparent 55%), radial-gradient(circle at 70% 70%, rgba(72, 216, 193, 0.18), transparent 60%)",
            filter: "blur(12px)",
          }}
        />
        <div
          style={{
            position: "relative",
            borderRadius: "24px",
            overflow: "hidden",
            width: "100%",
            height: "100%",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "#0b1220",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt="Cover"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "rgba(255,255,255,0.65)",
                fontSize: "18px",
              }}
            >
              No cover art available
            </div>
          )}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <span
        style={{
          fontSize: "14px",
          letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: "26px", fontWeight: 700 }}>{value}</span>
    </div>
  );
}
