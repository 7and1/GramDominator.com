export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildAudioSlug(title: string, id: string): string {
  const base = slugify(title || "audio");
  return `${base}-${id}`;
}

export function parseAudioSlug(slug: string): string | null {
  const parts = slug.split("-");
  if (!parts.length) return null;
  const id = parts[parts.length - 1];
  return id || null;
}
