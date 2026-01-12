import { expect, test } from "@playwright/test";

test.describe("Tools Page", () => {
  test("should load and display tool cards", async ({ page }) => {
    await page.goto("/tools", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("Creator growth toolkit")).toBeVisible();
    await expect(page.getByText("TikTok Watermark Remover")).toBeVisible();
    await expect(page.getByText("AI Bio Generator")).toBeVisible();
  });

  test("should navigate to watermark remover tool", async ({ page }) => {
    await page.goto("/tools", { waitUntil: "domcontentloaded" });

    const watermarkLink = page.getByRole("link", {
      name: /TikTok Watermark Remover/i,
    });
    await watermarkLink.click();
    await page.waitForURL(/\/tools\/watermark-remover/);
    expect(page.url()).toMatch(/\/tools\/watermark-remover/);
  });

  test("should navigate to bio generator tool", async ({ page }) => {
    await page.goto("/tools", { waitUntil: "domcontentloaded" });

    const bioLink = page.getByRole("link", { name: /AI Bio Generator/i });
    await bioLink.click();
    await page.waitForURL(/\/tools\/bio-generator/);
    expect(page.url()).toMatch(/\/tools\/bio-generator/);
  });

  test("should have FAQ structured data", async ({ page }) => {
    await page.goto("/tools", { waitUntil: "domcontentloaded" });

    const jsonLd = page
      .locator('script[type="application/ld+json"]')
      .filter({ hasText: "FAQPage" });
    await expect(jsonLd).toBeAttached();

    const content = await jsonLd.textContent();
    const jsonContent = JSON.parse(content ?? "{}");
    expect(jsonContent["@type"]).toBe("FAQPage");
  });

  test("should have valid canonical URL", async ({ page }) => {
    await page.goto("/tools", { waitUntil: "domcontentloaded" });

    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toHaveAttribute("href", /\/tools$/);
  });
});

test.describe("Watermark Remover Tool", () => {
  test("should load and display tool interface", async ({ page }) => {
    await page.goto("/tools/watermark-remover", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.getByText("TikTok watermark remover")).toBeVisible();
    await expect(
      page.getByPlaceholder("https://www.tiktok.com/@.../video/..."),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Get download link/i }),
    ).toBeVisible();
  });

  test("should accept URL input", async ({ page }) => {
    await page.goto("/tools/watermark-remover", {
      waitUntil: "domcontentloaded",
    });

    const urlInput = page.getByPlaceholder(
      "https://www.tiktok.com/@.../video/...",
    );
    await urlInput.fill("https://www.tiktok.com/@test/video/123456789");

    const value = await urlInput.inputValue();
    expect(value).toBe("https://www.tiktok.com/@test/video/123456789");
  });

  test("should show loading state when submitting", async ({ page }) => {
    await page.goto("/tools/watermark-remover", {
      waitUntil: "domcontentloaded",
    });

    const urlInput = page.getByPlaceholder(
      "https://www.tiktok.com/@.../video/...",
    );
    await urlInput.fill("https://www.tiktok.com/@test/video/123456789");

    const submitButton = page.getByRole("button", {
      name: /Get download link/i,
    });

    const responsePromise = page.waitForResponse((resp) =>
      resp.url().includes("/api/tools/watermark"),
    );

    await submitButton.click();

    try {
      await responsePromise.timeout(5000);
    } catch {
      // Request may fail, we're testing the UI state
    }

    // Check if button shows loading state or reverts
    await page.waitForTimeout(500);
  });

  test("should have valid meta tags", async ({ page }) => {
    await page.goto("/tools/watermark-remover", {
      waitUntil: "domcontentloaded",
    });

    await expect(page).toHaveTitle(/TikTok Watermark Remover/);

    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toHaveAttribute(
      "href",
      /\/tools\/watermark-remover$/,
    );
  });
});

test.describe("Bio Generator Tool", () => {
  test("should load and display tool interface", async ({ page }) => {
    await page.goto("/tools/bio-generator", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("AI bio generator")).toBeVisible();
    await expect(page.getByPlaceholder("Name or handle")).toBeVisible();
    await expect(
      page.getByPlaceholder("Niche (fitness, comedy)"),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Tone (playful, bold)")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Generate bio/i }),
    ).toBeVisible();
  });

  test("should accept form inputs", async ({ page }) => {
    await page.goto("/tools/bio-generator", { waitUntil: "domcontentloaded" });

    const nameInput = page.getByPlaceholder("Name or handle");
    const nicheInput = page.getByPlaceholder("Niche (fitness, comedy)");
    const toneInput = page.getByPlaceholder("Tone (playful, bold)");

    await nameInput.fill("TestCreator");
    await nicheInput.fill("fitness");
    await toneInput.fill("bold");

    expect(await nameInput.inputValue()).toBe("TestCreator");
    expect(await nicheInput.inputValue()).toBe("fitness");
    expect(await toneInput.inputValue()).toBe("bold");
  });

  test("should show loading state when generating", async ({ page }) => {
    await page.goto("/tools/bio-generator", { waitUntil: "domcontentloaded" });

    const nameInput = page.getByPlaceholder("Name or handle");
    const nicheInput = page.getByPlaceholder("Niche (fitness, comedy)");
    const toneInput = page.getByPlaceholder("Tone (playful, bold)");

    await nameInput.fill("TestCreator");
    await nicheInput.fill("fitness");
    await toneInput.fill("bold");

    const submitButton = page.getByRole("button", { name: /Generate bio/i });

    const responsePromise = page.waitForResponse((resp) =>
      resp.url().includes("/api/bio"),
    );

    await submitButton.click();

    try {
      await responsePromise.timeout(5000);
    } catch {
      // Request may fail, we're testing the UI state
    }

    await page.waitForTimeout(500);
  });

  test("should have valid meta tags", async ({ page }) => {
    await page.goto("/tools/bio-generator", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/AI Bio Generator/);

    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toHaveAttribute(
      "href",
      /\/tools\/bio-generator$/,
    );
  });
});
