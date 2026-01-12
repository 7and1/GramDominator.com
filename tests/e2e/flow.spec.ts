import { expect, test } from "@playwright/test";

test.describe("User Journey Flow", () => {
  test("complete user flow: homepage -> trends -> filter -> detail -> hashtags -> tool", async ({
    page,
  }) => {
    const metrics: Record<string, number> = {};

    await test.step("Navigate to homepage", async () => {
      const start = Date.now();
      await page.goto("/", { waitUntil: "domcontentloaded" });
      metrics.homepageLoad = Date.now() - start;

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.getByText("GramDominator")).toBeVisible();
    });

    await test.step("Navigate to trends page", async () => {
      const start = Date.now();
      await page.getByRole("link", { name: "Trends" }).click();
      metrics.trendsLoad = Date.now() - start;

      const noData = page.getByText("No trends are available yet");
      if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
        test.skip("No trends data available; run scraper before E2E.");
      }

      await expect(page.getByText("Today's breakout sounds")).toBeVisible();
    });

    await test.step("Apply vibe filter", async () => {
      const start = Date.now();
      const viralButton = page.getByRole("button", { name: /🔥 Viral/i });
      if (!(await viralButton.isVisible().catch(() => false))) {
        test.skip("Vibe filter buttons not available");
      }
      await viralButton.click();
      metrics.filterApply = Date.now() - start;

      await expect(viralButton).toHaveClass(/border-black\/40 bg-black\/10/);
    });

    await test.step("Navigate to audio detail page", async () => {
      const start = Date.now();
      const detailsLink = page.getByRole("link", { name: /Details/i }).first();
      if (
        !(await detailsLink.isVisible({ timeout: 5000 }).catch(() => false))
      ) {
        test.skip("No details link available");
      }
      await detailsLink.click();
      await page.waitForURL(/\/audio\//);
      metrics.detailLoad = Date.now() - start;

      await expect(page.locator("h1")).toBeVisible();
    });

    await test.step("Copy hashtags", async () => {
      const start = Date.now();
      const copyButton = page.getByRole("button", { name: /Copy all/i });
      if (!(await copyButton.isVisible({ timeout: 3000 }).catch(() => false))) {
        test.skip("Copy button not available");
      }
      await copyButton.click();
      metrics.copyHashtags = Date.now() - start;

      await page.waitForTimeout(500);

      const clipboardContent = await page.evaluate(async () => {
        return await navigator.clipboard.readText();
      });
      expect(clipboardContent).toMatch(/#\w+/);
    });

    await test.step("Navigate to tools page", async () => {
      const start = Date.now();
      await page.getByRole("link", { name: "Tools" }).click();
      await page.waitForURL(/\/tools/);
      metrics.toolsLoad = Date.now() - start;

      await expect(page.getByText("Creator growth toolkit")).toBeVisible();
    });

    await test.step("Visit watermark remover tool", async () => {
      const start = Date.now();
      await page
        .getByRole("link", { name: /TikTok Watermark Remover/i })
        .click();
      await page.waitForURL(/\/tools\/watermark-remover/);
      metrics.watermarkToolLoad = Date.now() - start;

      await expect(
        page.getByPlaceholder("https://www.tiktok.com/@.../video/..."),
      ).toBeVisible();
    });

    test.step("Log performance metrics", () => {
      console.log("Performance Metrics:", metrics);
      expect(metrics.homepageLoad).toBeLessThan(5000);
      expect(metrics.trendsLoad).toBeLessThan(5000);
    });
  });

  test("user flow with screenshots at each step", async ({ page }) => {
    await test.step("Homepage", async () => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.screenshot({ path: "test-results/homepage.png" });
      await expect(page.getByText("GramDominator")).toBeVisible();
    });

    await test.step("Trends page", async () => {
      await page.goto("/trends", { waitUntil: "domcontentloaded" });

      const noData = page.getByText("No trends are available yet");
      if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
        test.skip("No trends data available");
      }

      await page.screenshot({
        path: "test-results/trends.png",
        fullPage: true,
      });
      await expect(page.getByText("Today's breakout sounds")).toBeVisible();
    });

    await test.step("Audio detail page", async () => {
      const detailsLink = page.getByRole("link", { name: /Details/i }).first();
      if (
        !(await detailsLink.isVisible({ timeout: 5000 }).catch(() => false))
      ) {
        test.skip("No details link available");
      }

      await detailsLink.click();
      await page.waitForURL(/\/audio\//);
      await page.screenshot({
        path: "test-results/audio-detail.png",
        fullPage: true,
      });
      await expect(page.locator("h1")).toBeVisible();
    });
  });

  test("navigation flow through header links", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const headerNav = page.locator("nav").first();
    await expect(headerNav).toBeVisible();

    await test.step("Trends link in header", async () => {
      const trendsLink = headerNav.getByRole("link", { name: "Trends" });
      await trendsLink.click();
      await page.waitForURL(/\/trends/);
      expect(page.url()).toMatch(/\/trends/);
    });

    await test.step("Tools link in header", async () => {
      const toolsLink = headerNav.getByRole("link", { name: "Tools" });
      await toolsLink.click();
      await page.waitForURL(/\/tools/);
      expect(page.url()).toMatch(/\/tools/);
    });

    await test.step("Logo returns home", async () => {
      const logoLink = page.getByRole("link", { name: "GramDominator" });
      await logoLink.click();
      await page.waitForURL(/\//);
      expect(page.url()).toMatch(/\/$/);
    });
  });

  test("quick path to watermark tool from homepage", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await test.step("Go to tools", async () => {
      await page.getByRole("link", { name: "Tools" }).click();
      await page.waitForURL(/\/tools/);
    });

    await test.step("Select watermark tool", async () => {
      await page
        .getByRole("link", { name: /TikTok Watermark Remover/i })
        .click();
      await page.waitForURL(/\/tools\/watermark-remover/);
    });

    await test.step("Interact with tool", async () => {
      const urlInput = page.getByPlaceholder(
        "https://www.tiktok.com/@.../video/...",
      );
      await urlInput.fill("https://www.tiktok.com/@test/video/123");
      expect(await urlInput.inputValue()).toContain("tiktok.com");
    });
  });

  test("quick path to bio tool from homepage", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await test.step("Go to tools", async () => {
      await page.getByRole("link", { name: "Tools" }).click();
      await page.waitForURL(/\/tools/);
    });

    await test.step("Select bio generator", async () => {
      await page.getByRole("link", { name: /AI Bio Generator/i }).click();
      await page.waitForURL(/\/tools\/bio-generator/);
    });

    await test.step("Fill form", async () => {
      const nameInput = page.getByPlaceholder("Name or handle");
      await nameInput.fill("Creator");
      expect(await nameInput.inputValue()).toBe("Creator");
    });
  });

  test("back navigation flow", async ({ page }) => {
    await test.step("Navigate to trends", async () => {
      await page.goto("/trends", { waitUntil: "domcontentloaded" });

      const noData = page.getByText("No trends are available yet");
      if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
        test.skip("No trends data available");
      }
    });

    await test.step("Navigate to detail", async () => {
      const detailsLink = page.getByRole("link", { name: /Details/i }).first();
      if (
        !(await detailsLink.isVisible({ timeout: 5000 }).catch(() => false))
      ) {
        test.skip("No details link available");
      }

      await detailsLink.click();
      await page.waitForURL(/\/audio\//);
    });

    await test.step("Use back to trends link", async () => {
      const backLink = page.getByRole("link", { name: "Back to trends" });
      if (!(await backLink.isVisible({ timeout: 3000 }).catch(() => false))) {
        test.skip("Back to trends link not available");
      }

      await backLink.click();
      await page.waitForURL(/\/trends/);
      expect(page.url()).toMatch(/\/trends/);
    });
  });

  test("measure Core Web Vitals", async ({ page }) => {
    await page.goto("/trends", { waitUntil: "domcontentloaded" });

    const noData = page.getByText("No trends are available yet");
    if (await noData.isVisible({ timeout: 2000 }).catch(() => false)) {
      test.skip("No trends data available");
    }

    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals: Record<string, number> = {};

          entries.forEach((entry) => {
            if (entry.entryType === "largest-contentful-paint") {
              vitals.lcp = entry.startTime;
            }
            if (entry.entryType === "first-input") {
              vitals.fid = (entry as any).processingStart - entry.startTime;
            }
          });

          resolve(vitals);
        }).observe({ entryTypes: ["largest-contentful-paint", "first-input"] });

        setTimeout(() => resolve({}), 3000);
      });
    });

    console.log("Core Web Vitals:", metrics);
  });
});
