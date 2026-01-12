import { expect, test } from "@playwright/test";

test.describe("SEO Tests", () => {
  test("should have canonical URL on homepage", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toBeAttached();
    const href = await canonicalLink.getAttribute("href");
    expect(href).toBeTruthy();
  });

  test("should have canonical URL on trends page", async ({ page }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toHaveAttribute("href", /\/trends$/);
  });

  test("should have canonical URL on tools page", async ({ page }) => {
    await page.goto("/tools", { waitUntil: "domcontentloaded" });

    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toHaveAttribute("href", /\/tools$/);
  });

  test("should have OG meta tags on homepage", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const ogTitle = page.locator('meta[property="og:title"]');
    const ogType = page.locator('meta[property="og:type"]');
    const ogDescription = page.locator('meta[property="og:description"]');

    await expect(ogTitle).toBeAttached();
    await expect(ogType).toBeAttached();
    await expect(ogDescription).toBeAttached();

    const ogTitleContent = await ogTitle.getAttribute("content");
    expect(ogTitleContent).toContain("GramDominator");
  });

  test("should have Twitter card meta tags", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const twitterCard = page.locator('meta[name="twitter:card"]');
    const twitterTitle = page.locator('meta[name="twitter:title"]');
    const twitterDescription = page.locator('meta[name="twitter:description"]');

    await expect(twitterCard).toBeAttached();
    await expect(twitterTitle).toBeAttached();
    await expect(twitterDescription).toBeAttached();

    const cardContent = await twitterCard.getAttribute("content");
    expect(cardContent).toBe("summary_large_image");
  });

  test("should have structured data (JSON-LD) on trends page", async ({
    page,
  }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();

    expect(count).toBeGreaterThan(0);

    const content = await jsonLdScripts.first().textContent();
    const parsed = JSON.parse(content ?? "{}");
    expect(parsed["@context"]).toBe("https://schema.org");
  });

  test("should have robots.txt accessible", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toContain("User-agent");
  });

  test("should have sitemap.xml accessible", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toContain("<?xml");
  });

  test("should have MusicRecording structured data on audio detail", async ({
    page,
  }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    const noData = page.getByText("No trends are available yet");
    if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
      test.skip(true, "No trends data available");
    }

    const detailsLink = page.getByRole("link", { name: /Details/i }).first();
    if (!(await detailsLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "No details link available");
    }

    await detailsLink.click();
    await page.waitForURL(/\/audio\//);

    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();

    let foundMusicRecording = false;
    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      if (content) {
        try {
          const parsed = JSON.parse(content);
          if (parsed["@type"] === "MusicRecording") {
            foundMusicRecording = true;
            break;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }

    expect(foundMusicRecording).toBe(true);
  });

  test("should have proper page titles", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/GramDominator/);

    await page.goto("/trends", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/TikTok Trends/);

    await page.goto("/tools", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Creator Tools/);
  });

  test("should have meta descriptions", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toBeAttached();

    const content = await metaDescription.getAttribute("content");
    expect(content?.length).toBeGreaterThan(50);
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    const noData = page.getByText("No trends are available yet");
    if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
      test.skip(true, "No trends data available");
    }

    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();

    const h1Text = await h1.textContent();
    expect(h1Text?.length).toBeGreaterThan(0);
  });

  test("should have alt text for images", async ({ page }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    const noData = page.getByText("No trends are available yet");
    if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
      test.skip(true, "No trends data available");
    }

    const detailsLink = page.getByRole("link", { name: /Details/i }).first();
    if (!(await detailsLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "No details link available");
    }

    await detailsLink.click();
    await page.waitForURL(/\/audio\//);

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      const src = await images.nth(i).getAttribute("src");
      if (src) {
        expect(alt).toBeTruthy();
      }
    }
  });

  test("sitemap should contain key pages", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toContain("<loc>");
    expect(text).toContain("</loc>");
  });

  test("should have favicon link", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const favicon = page.locator('link[rel="icon"], link[rel="shortcut icon"]');
    await expect(favicon).toBeAttached();
  });
});
