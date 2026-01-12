"use client";

import { useState } from "react";

export function WatermarkTool() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/tools/watermark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const payload = (await response.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;
      if (!response.ok) {
        const message =
          typeof payload.error === "string" ? payload.error : "Request failed";
        throw new Error(message);
      }

      const downloadUrl =
        typeof payload.downloadUrl === "string" ? payload.downloadUrl : "";
      setResult(downloadUrl);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-card rounded-2xl p-6 shadow-glow"
      data-testid="watermark-tool"
    >
      <h2 className="font-display text-xl font-semibold">
        TikTok Watermark Remover
      </h2>
      <p className="mt-2 text-sm text-black/60">
        Paste a TikTok URL to fetch a watermark-free version for editing.
      </p>

      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.tiktok.com/@.../video/..."
          data-testid="watermark-url-input"
          className="flex-1 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-black/70 outline-none"
        />
        <button
          type="button"
          onClick={handleSubmit}
          data-testid="watermark-submit-button"
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white"
          disabled={loading}
        >
          {loading ? "Fetching..." : "Get download link"}
        </button>
      </div>

      {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}
      {result ? (
        <div className="mt-4 rounded-xl border border-black/10 bg-white/70 p-4 text-sm text-black/70">
          <p className="mb-2">Download ready:</p>
          <a
            href={result}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {result}
          </a>
        </div>
      ) : null}
    </div>
  );
}
