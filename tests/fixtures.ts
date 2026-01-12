import { test as base, type Page } from "@playwright/test";
import { expect } from "@playwright/test";

type TestFixtures = {
  trendsPage: Page;
  toolsPage: Page;
  audioDetailPage: Page;
};

export const test = base.extend<TestFixtures>({
  trendsPage: async ({ page }, use) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });
    const noData = page.getByText("No trends are available yet");
    if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
      test.skip(true, "No trends data available");
    }
    await use(page);
  },

  toolsPage: async ({ page }, use) => {
    await page.goto("/tools", { waitUntil: "domcontentloaded" });
    await use(page);
  },

  audioDetailPage: async ({ page }, use) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });
    const noData = page.getByText("No trends are available yet");
    if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
      test.skip(true, "No trends data available");
    }
    const detailsLink = page.getByRole("link", { name: /Details/i }).first();
    if (!(await detailsLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "No audio detail link available");
    }
    await detailsLink.click();
    await page.waitForURL(/\/audio\//);
    await use(page);
  },
});

async function skipIfNoData(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector).first();
  if (!(await element.isVisible({ timeout: 3000 }).catch(() => false))) {
    test.skip(true, `No data available for selector: ${selector}`);
  }
  return true;
}

async function waitForNetworkIdle(page: Page, timeout = 10000): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout }).catch(() => {
    // Networkidle may fail if there are background requests, continue anyway
  });
}

function getTestIds() {
  return {
    trendsPage: "trends-page",
    trendTable: "trend-table",
    searchInput: "search-input",
    vibeFilter: "vibe-filter",
    genreFilter: "genre-filter",
    clearFilters: "clear-filters",
    audioCard: "audio-card",
    detailsButton: "details-button",
    audioDetailPage: "audio-detail-page",
    hashtagPanel: "hashtag-panel",
    copyHashtagsButton: "copy-hashtags-button",
    trendChart: "trend-chart",
    toolsPage: "tools-page",
    watermarkTool: "watermark-tool",
    bioGenerator: "bio-generator",
    urlInput: "url-input",
    generateButton: "generate-button",
    relatedContent: "related-content",
    breadcrumb: "breadcrumb",
  };
}

export const testIds = getTestIds();
export { skipIfNoData, waitForNetworkIdle };
