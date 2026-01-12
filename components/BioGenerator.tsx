"use client";

import { useState } from "react";

export function BioGenerator() {
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, niche, tone }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        const message =
          typeof payload.error === "string"
            ? payload.error
            : "Failed to generate";
        throw new Error(message);
      }

      const payload = (await response.json()) as Record<string, unknown>;
      const text = typeof payload.text === "string" ? payload.text : "";
      setResult(text);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-card rounded-2xl p-6 shadow-glow"
      data-testid="bio-generator"
    >
      <h2 className="font-display text-xl font-semibold">AI Bio Generator</h2>
      <p className="mt-2 text-sm text-black/60">
        Create a creator bio that matches your niche and tone.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name or handle"
          data-testid="bio-name-input"
          className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-black/70 outline-none"
        />
        <input
          value={niche}
          onChange={(event) => setNiche(event.target.value)}
          placeholder="Niche (fitness, comedy)"
          data-testid="bio-niche-input"
          className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-black/70 outline-none"
        />
        <input
          value={tone}
          onChange={(event) => setTone(event.target.value)}
          placeholder="Tone (playful, bold)"
          data-testid="bio-tone-input"
          className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-black/70 outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        data-testid="bio-submit-button"
        className="mt-4 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate bio"}
      </button>

      {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}
      {result ? (
        <div className="mt-4 rounded-xl border border-black/10 bg-white/70 p-4 text-sm text-black/70">
          {result}
        </div>
      ) : null}
    </div>
  );
}
