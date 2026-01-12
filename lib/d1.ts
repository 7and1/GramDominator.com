import { getRequestContext } from "@cloudflare/next-on-pages";

type PagesEnv = Record<string, unknown> & {
  DB: D1Database;
};

export function getDB(): D1Database {
  const context = getRequestContext();
  const database = (context?.env as PagesEnv | undefined)?.DB;

  if (!database) {
    throw new Error(
      "D1 binding not available. Run via Cloudflare Pages or configure Pages bindings.",
    );
  }

  return database;
}
