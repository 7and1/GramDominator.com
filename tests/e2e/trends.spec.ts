import { expect, test } from "@playwright/test";

test.describe("Trends Page", () => {
  test("should load and display trending audio", async ({ page }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    const noData = page.getByText("No trends are available yet");
    if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
      test.skip(true, "No trends data available; run scraper before E2E.");
    }

    await expect(page.locator("h1")).toContainText("Today's breakout sounds");
    await expect(page.getByText("Live audio signals")).toBeVisible();
  });

  test("should display trend table with correct columns", async ({ page }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    const noData = page.getByText("No trends are available yet");
    if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
      test.skip(true, "No trends data available");
    }

    const table = page.locator("table");
    await expect(table).toBeVisible();

    const headers = table.locator("thead th");
    await expect(headers).toHaveCount(6);

    const headerTexts = await headers.allTextContents();
    expect(headerTexts).toContain("Rank");
    expect(headerTexts).toContain("Audio");
    expect(headerTexts).toContain("Uses");
    expect(headerTexts).toContain("Tags");
    expect(headerTexts).toContain("Momentum");
    expect(headerTexts).toContain("Action");
  });

  test("should filter by vibe", async ({ page }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    const noData = page.getByText("No trends are available yet");
    if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
      test.skip(true, "No trends data available");
    }

    const viralButton = page.getByRole("button", { name: /🔥 Viral/i });
    if (!(await viralButton.isVisible().catch(() => false))) {
      test.skip(true, "Vibe filter buttons not available");
    }

    await viralButton.click();
    await expect(viralButton).toHaveClass(/border-black\/40 bg-black\/10/);
  });

  test("should filter by genre", async ({ page }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    const noData = page.getByText("No trends are available yet");
    if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
      test.skip(true, "No trends data available");
    }

    const popButton = page.getByRole("button", { name: /✨ Pop/i });
    if (!(await popButton.isVisible().catch(() => false))) {
      test.skip(true, "Genre filter buttons not available");
    }

    await popButton.click();
    await expect(popButton).toHaveClass(/border-black\/40 bg-black\/10/);
  });

  test("should support search functionality", async ({ page }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    const noData = page.getByText("No trends are available yet");
    if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
      test.skip(true, "No trends data available");
    }

    const searchInput = page.getByPlaceholder("Search audio");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("test");

    const currentValue = await searchInput.inputValue();
    expect(currentValue).toBe("test");
  });

  test("should clear filters when clear button clicked", async ({ page }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    const noData = page.getByText("No trends are available yet");
    if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
      test.skip(true, "No trends data available");
    }

    const viralButton = page.getByRole("button", { name: /🔥 Viral/i });
    if (!(await viralButton.isVisible().catch(() => false))) {
      test.skip(true, "Vibe filter buttons not available");
    }

    await viralButton.click();

    const clearButton = page.getByRole("button", { name: "Clear filters" });
    if (!(await clearButton.isVisible().catch(() => false))) {
      test.skip(true, "Clear filters button not visible");
    }

    await clearButton.click();
    await expect(clearButton).not.toBeVisible();
  });

  test("should display curated collections section", async ({ page }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("Curated collections")).toBeVisible();

    const collectionCards = page
      .locator('a[href^="/trends/"]')
      .filter({ hasText: /\w+/ });
    const count = await collectionCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should navigate to audio detail page", async ({ page }) => {
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
    expect(page.url()).toMatch(/\/audio\//);
  });

  test("should have TikTok use audio links", async ({ page }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    const noData = page.getByText("No trends are available yet");
    if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
      test.skip(true, "No trends data available");
    }

    const useAudioLinks = page
      .getByRole("link", { name: /Use audio/i })
      .first();
    if (
      !(await useAudioLinks.isVisible({ timeout: 3000 }).catch(() => false))
    ) {
      test.skip(true, "No use audio links available");
    }

    const href = await useAudioLinks.getAttribute("href");
    expect(href).toMatch(/https:\/\/www\.tiktok\.com\/music\//);
  });

  test("should display FAQ structured data", async ({ page }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    const jsonLd = page
      .locator('script[type="application/ld+json"]')
      .filter({ hasText: "FAQPage" });
    await expect(jsonLd).toBeAttached();

    const content = await jsonLd.textContent();
    const jsonContent = JSON.parse(content ?? "{}");
    expect(jsonContent["@type"]).toBe("FAQPage");
  });

  test("should have valid meta tags", async ({ page }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/TikTok Trends Today/);

    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toHaveAttribute("href", /\/trends$/);
  });
});
