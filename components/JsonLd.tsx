import type { FC } from "react";

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * JsonLd component for injecting structured data into the page.
 * Accepts a single schema object or an array of schemas.
 *
 * @example
 * ```tsx
 * <JsonLd data={buildOrganizationSchema()} />
 * <JsonLd data={[buildWebSiteSchema(), buildOrganizationSchema()]} />
 * ```
 */
export const JsonLd: FC<JsonLdProps> = ({ data }) => {
  const jsonLdString = JSON.stringify(data, null, 0);

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: jsonLdString }}
    />
  );
};
