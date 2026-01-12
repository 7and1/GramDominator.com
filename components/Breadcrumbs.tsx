"use client";

import Link from "next/link";
import ChevronRight from "./icons/ChevronRight";
import { JsonLd } from "./JsonLd";
import { buildBreadcrumbSchema } from "@/lib/seo";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumbs component with visual navigation trail and structured data.
 * Automatically generates Schema.org BreadcrumbList markup.
 *
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Trends', href: '/trends' },
 *     { label: 'Pop' }, // Current page, no href
 *   ]}
 * />
 * ```
 */
export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  // Build structured data from breadcrumb items
  const schemaItems = items.map((item) => ({
    name: item.label,
    href: item.href ?? "",
  }));

  const breadcrumbSchema = buildBreadcrumbSchema(schemaItems);

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-2 text-sm ${className}`}
      >
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {item.href ? (
              <Link
                href={item.href}
                className="text-black/50 transition hover:text-black/80"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-black/70" aria-current="page">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <ChevronRight className="h-4 w-4 text-black/30" />
            )}
          </div>
        ))}
      </nav>
      <JsonLd data={breadcrumbSchema} />
    </>
  );
}
