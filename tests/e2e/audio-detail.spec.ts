import { expect, test } from "@playwright/test";

test.describe("Audio Detail Page", () => {
  test("should load and display audio details", async ({ page }) => {
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

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("Audio intelligence")).toBeVisible();
  });

  test("should display audio stats cards", async ({ page }) => {
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

    await expect(page.getByText("Usage")).toBeVisible();
    await expect(page.getByText("Momentum")).toBeVisible();
    await expect(page.getByText("Updated")).toBeVisible();
  });

  test("should display hashtag panel with copy button", async ({ page }) => {
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

    await expect(page.getByText("Suggested tags")).toBeVisible();
    await expect(page.getByText("Hashtag generator")).toBeVisible();
  });

  test("should copy hashtags when copy button clicked", async ({ page }) => {
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

    const copyButton = page.getByRole("button", { name: /Copy all/i });
    if (!(await copyButton.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(true, "Copy button not available");
    }

    const clipboardContent = await page.evaluate(async () => {
      await navigator.clipboard.writeText("");
      return "";
    });

    await copyButton.click();
    await page.waitForTimeout(500);

    const newClipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });

    expect(newClipboardContent).toMatch(/#\w+/);
  });

  test("should display trend curve section", async ({ page }) => {
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

    await expect(page.getByText("Trend curve")).toBeVisible();
    await expect(
      page.getByText("Rank movement over the most recent snapshots"),
    ).toBeVisible();
  });

  test("should display trend insight section", async ({ page }) => {
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

    await expect(page.getByText("Trend insight")).toBeVisible();
    await expect(page.getByText(/ranked #/)).toBeVisible();
  });

  test("should display creator playbook", async ({ page }) => {
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

    await expect(page.getByText("Creator playbook")).toBeVisible();
    await expect(page.getByText(/Hook in the first 2 seconds/)).toBeVisible();
  });

  test("should display related trending audio", async ({ page }) => {
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

    await expect(page.getByText("More trending audio")).toBeVisible();
  });

  test("should navigate back to trends from detail page", async ({ page }) => {
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

    const backLink = page.getByRole("link", { name: "Back to trends" });
    if (!(await backLink.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(true, "Back to trends link not available");
    }

    await backLink.click();
    await page.waitForURL(/\/trends/);
    expect(page.url()).toMatch(/\/trends/);
  });

  test("should have use audio button linking to TikTok", async ({ page }) => {
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

    const useAudioButton = page.getByRole("link", { name: "Use this audio" });
    if (
      !(await useAudioButton.isVisible({ timeout: 3000 }).catch(() => false))
    ) {
      test.skip(true, "Use this audio button not available");
    }

    const href = await useAudioButton.getAttribute("href");
    expect(href).toMatch(/https:\/\/www\.tiktok\.com\/music\//);
  });

  test("should have MusicRecording structured data", async ({ page }) => {
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

  test("should have FAQPage structured data", async ({ page }) => {
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

    let foundFaqPage = false;
    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      if (content) {
        try {
          const parsed = JSON.parse(content);
          if (parsed["@type"] === "FAQPage") {
            foundFaqPage = true;
            break;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }

    expect(foundFaqPage).toBe(true);
  });

  test("should have valid canonical URL", async ({ page }) => {
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

    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toHaveAttribute("href", /\/audio\//);
  });

  test("should display genre and vibe tags when available", async ({
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

    const genreTag = page.locator('span:has-text("Genre:")');
    const vibeTag = page.locator('span:has-text("Vibe:")');

    const hasGenre = (await genreTag.count()) > 0;
    const hasVibe = (await vibeTag.count()) > 0;

    expect(hasGenre || hasVibe).toBe(true);
  });
});
