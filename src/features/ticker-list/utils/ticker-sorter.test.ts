import { describe, it, expect } from "vitest";
import {
  filterTickers,
  sortTickers,
  formatTickerPrice,
  formatTradeValue,
} from "./ticker-sorter";
import type { TickerItem } from "../types/ticker";

const createMockTicker = (
  market: string,
  koreanName: string,
  englishName: string,
  tradePrice: number,
  signedChangeRate: number,
  accTradePrice24h: number,
): TickerItem => ({
  market,
  symbol: market.replace("KRW-", ""),
  koreanName,
  englishName,
  tradePrice,
  change:
    signedChangeRate > 0 ? "RISE" : signedChangeRate < 0 ? "FALL" : "EVEN",
  signedChangeRate,
  signedChangePrice: tradePrice * signedChangeRate,
  accTradePrice24h,
  accTradeVolume24h: 100,
  highPrice: tradePrice * 1.05,
  lowPrice: tradePrice * 0.95,
  isBookmarked: false,
});

describe("ticker-sorter utils", () => {
  const mockTickers: TickerItem[] = [
    createMockTicker(
      "KRW-BTC",
      "비트코인",
      "Bitcoin",
      100000000,
      0.05,
      500000000000,
    ),
    createMockTicker(
      "KRW-ETH",
      "이더리움",
      "Ethereum",
      4000000,
      -0.02,
      300000000000,
    ),
    createMockTicker("KRW-SOL", "솔라나", "Solana", 250000, 0.12, 400000000000),
    createMockTicker("KRW-XRP", "리플", "Ripple", 800, -0.01, 200000000000),
  ];

  describe("filterTickers", () => {
    it("returns all tickers when search keyword is empty and tab is 'all'", () => {
      const result = filterTickers(mockTickers, "", "all", new Set());
      expect(result).toHaveLength(4);
    });

    it("filters by Korean name", () => {
      const result = filterTickers(mockTickers, "비트", "all", new Set());
      expect(result).toHaveLength(1);
      expect(result[0]?.market).toBe("KRW-BTC");
    });

    it("filters by English symbol case-insensitively", () => {
      const result = filterTickers(mockTickers, "eth", "all", new Set());
      expect(result).toHaveLength(1);
      expect(result[0]?.market).toBe("KRW-ETH");
    });

    it("filters by bookmarks tab", () => {
      const bookmarks = new Set(["KRW-ETH", "KRW-SOL"]);
      const result = filterTickers(mockTickers, "", "bookmarks", bookmarks);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.market)).toEqual(["KRW-ETH", "KRW-SOL"]);
    });

    it("combines bookmarks tab and keyword filter", () => {
      const bookmarks = new Set(["KRW-ETH", "KRW-SOL"]);
      const result = filterTickers(mockTickers, "솔라", "bookmarks", bookmarks);
      expect(result).toHaveLength(1);
      expect(result[0]?.market).toBe("KRW-SOL");
    });
  });

  describe("sortTickers", () => {
    it("sorts by acc_trade_price_24h descending", () => {
      const sorted = sortTickers(mockTickers, "acc_trade_price_24h", "desc");
      expect(sorted[0]?.market).toBe("KRW-BTC");
      expect(sorted[1]?.market).toBe("KRW-SOL");
      expect(sorted[2]?.market).toBe("KRW-ETH");
      expect(sorted[3]?.market).toBe("KRW-XRP");
    });

    it("sorts by signed_change_rate descending", () => {
      const sorted = sortTickers(mockTickers, "signed_change_rate", "desc");
      expect(sorted[0]?.market).toBe("KRW-SOL"); // +12%
      expect(sorted[1]?.market).toBe("KRW-BTC"); // +5%
      expect(sorted[3]?.market).toBe("KRW-ETH"); // -2%
    });

    it("sorts by trade_price ascending", () => {
      const sorted = sortTickers(mockTickers, "trade_price", "asc");
      expect(sorted[0]?.market).toBe("KRW-XRP"); // 800
      expect(sorted[3]?.market).toBe("KRW-BTC"); // 100,000,000
    });

    it("sorts by korean_name ascending (alphabetical)", () => {
      const sorted = sortTickers(mockTickers, "korean_name", "asc");
      expect(sorted[0]?.koreanName).toBe("리플");
      expect(sorted[1]?.koreanName).toBe("비트코인");
      expect(sorted[2]?.koreanName).toBe("솔라나");
      expect(sorted[3]?.koreanName).toBe("이더리움");
    });
  });

  describe("formatting helpers", () => {
    it("formatTickerPrice formats large prices with commas", () => {
      expect(formatTickerPrice(104593000)).toBe("104,593,000");
    });

    it("formatTickerPrice formats decimals for small prices", () => {
      expect(formatTickerPrice(12.3456)).toBe("12.35");
      expect(formatTickerPrice(0.0123)).toBe("0.0123");
    });

    it("formatTradeValue converts to millions KRW with suffix", () => {
      expect(formatTradeValue(500000000000)).toBe("500,000백만");
    });
  });
});
