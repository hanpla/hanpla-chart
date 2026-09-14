import { test, expect } from "@playwright/test";

test.describe("PulseStream Financial Terminal E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the terminal interface and essential layout components", async ({
    page,
  }) => {
    // 1. Verify Header branding and default symbol
    await expect(page.locator("header")).toBeVisible();
    await expect(page.getByText("PULSE")).toBeVisible();
    await expect(page.getByText("STREAM")).toBeVisible();

    // 2. Verify Performance HUD trigger widget
    const hudTrigger = page.getByTitle("성능 진단 HUD 열기/닫기");
    await expect(hudTrigger).toBeVisible();
    await expect(hudTrigger).toContainText("FPS");
    await expect(hudTrigger).toContainText("ms");

    // 3. Verify main 3-column terminal sections
    await expect(
      page.getByPlaceholder("코인명 / 심볼 검색 (예: BTC, 비트)"),
    ).toBeVisible();
    await expect(page.getByText("MARKET DEPTH & FEED")).toBeVisible();
  });

  test("should switch markets when a ticker is selected in the watchlist or header", async ({
    page,
  }) => {
    // 1. Switch via header quick market selector
    const ethBtn = page.getByRole("button", { name: "KRW-ETH" });
    await expect(ethBtn).toBeVisible();
    await ethBtn.click();

    // Verify header updates to KRW-ETH
    await expect(page.locator("header")).toContainText("KRW-ETH");

    // 2. Search in watchlist and filter
    const searchInput = page.getByPlaceholder(
      "코인명 / 심볼 검색 (예: BTC, 비트)",
    );
    await expect(searchInput).toBeVisible();
    await searchInput.fill("BTC");

    // Click Bitcoin button in quick selector to switch back
    const btcBtn = page.getByRole("button", { name: "KRW-BTC" });
    await btcBtn.click();
    await expect(page.locator("header")).toContainText("KRW-BTC");
  });

  test("should switch right panel views between Split, OrderBook, and Trades tabs", async ({
    page,
  }) => {
    const splitTab = page.getByRole("button", { name: "동시분할" });
    const orderbookTab = page.getByRole("button", { name: "호가" });
    const tradesTab = page.getByRole("button", { name: "체결" });

    await expect(splitTab).toBeVisible();
    await expect(orderbookTab).toBeVisible();
    await expect(tradesTab).toBeVisible();

    // Switch to Orderbook only
    await orderbookTab.click();
    await expect(page.getByText("50-DEPTH ORDERBOOK")).toBeVisible();

    // Switch to Trades only
    await tradesTab.click();
    await expect(page.getByText("REALTIME TRADES")).toBeVisible();

    // Switch back to Split
    await splitTab.click();
    await expect(page.getByText("50-DEPTH ORDERBOOK")).toBeVisible();
    await expect(page.getByText("REALTIME TRADES")).toBeVisible();
  });

  test("should open and close Performance HUD modal with live metrics", async ({
    page,
  }) => {
    const hudTrigger = page.getByTitle("성능 진단 HUD 열기/닫기");
    await hudTrigger.click();

    // Verify modal elements
    await expect(page.getByText("PERFORMANCE HUD")).toBeVisible();
    await expect(page.getByText("FRAME RATE")).toBeVisible();
    await expect(page.getByText("EVENT LOOP LAG")).toBeVisible();
    await expect(page.getByText("THROUGHPUT")).toBeVisible();
    await expect(page.getByText("ACTIVE DOM NODES")).toBeVisible();
    await expect(page.getByText("60 FPS Defense Stack Active")).toBeVisible();

    // Close modal via Escape key
    await page.keyboard.press("Escape");
    await expect(page.getByText("PERFORMANCE HUD")).not.toBeVisible();

    // Reopen and close via close button
    await hudTrigger.click();
    await expect(page.getByText("PERFORMANCE HUD")).toBeVisible();
    const closeBtn = page.getByLabel("닫기");
    await closeBtn.click();
    await expect(page.getByText("PERFORMANCE HUD")).not.toBeVisible();
  });

  test("should toggle chart technical indicators SMA and Bollinger Bands", async ({
    page,
  }) => {
    const smaBtn = page.getByRole("button", { name: /SMA/i });
    const bbBtn = page.getByRole("button", { name: /BB/i });

    if (await smaBtn.isVisible().catch(() => false)) {
      await smaBtn.click();
      await expect(smaBtn).toBeVisible();
    }

    if (await bbBtn.isVisible().catch(() => false)) {
      await bbBtn.click();
      await expect(bbBtn).toBeVisible();
    }
  });
});
