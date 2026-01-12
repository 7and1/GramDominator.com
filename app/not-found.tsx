import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for could not be found.",
};

/**
 * Custom 404 Not Found Page
 * SEO-friendly with helpful navigation
 */
export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
      {/* Status indicator */}
      <p className="text-xs uppercase tracking-[0.3em] text-black/50">404</p>

      {/* Main heading */}
      <h1 className="mt-4 font-display text-3xl font-semibold">
        Page not found
      </h1>

      {/* Helpful message */}
      <p className="mt-3 text-sm text-black/60">
        The page you are looking for does not exist or has been moved.
      </p>

      {/* Navigation suggestions */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="inline-flex rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-black/80 transition-colors"
        >
          Go to homepage
        </Link>
        <Link
          href="/trends"
          className="inline-flex rounded-full border border-black/20 px-5 py-2 text-sm font-semibold hover:bg-black/5 transition-colors"
        >
          View trending audio
        </Link>
      </div>

      {/* Quick links section */}
      <div className="mt-12 border-t border-black/10 pt-8">
        <p className="text-xs font-medium text-black/50">
          Looking for something specific?
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
          <QuickLink href="/trends" label="Trending Audio" />
          <QuickLink href="/tools" label="Free Tools" />
          <QuickLink href="/tools/bio-generator" label="Bio Generator" />
          <QuickLink
            href="/tools/watermark-remover"
            label="Watermark Remover"
          />
        </div>
      </div>

      {/* Help section */}
      <div className="mt-8 rounded-lg bg-black/5 p-4 text-left">
        <p className="text-xs font-medium text-black/70">Common issues:</p>
        <ul className="mt-2 space-y-1 text-xs text-black/60">
          <li>• Audio links expire after trends cycle</li>
          <li>• Some content may only be available on TikTok</li>
          <li>• Check the URL for typos</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Quick link component for navigation suggestions
 */
function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-md border border-black/10 px-3 py-2 text-sm text-black/70 hover:border-black/20 hover:bg-black/5 transition-colors"
    >
      {label}
    </Link>
  );
}
