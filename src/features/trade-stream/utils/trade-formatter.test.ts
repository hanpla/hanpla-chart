import { describe, it, expect } from "vitest";
import {
  getWhaleLevel,
  formatTradeTime,
  formatVolumeAmount,
  formatTotalValueKRW,
  LARGE_TRADE_THRESHOLD,
  MEGA_TRADE_THRESHOLD,
} from "./trade-formatter";

describe("trade-formatter utils", () => {
  describe("getWhaleLevel", () => {
    it("returns NORMAL for small trades", () => {
      expect(getWhaleLevel(500000)).toBe("NORMAL");
      expect(getWhaleLevel(9999999)).toBe("NORMAL");
    });

    it("returns LARGE for trades at or above 10 million KRW", () => {
      expect(getWhaleLevel(LARGE_TRADE_THRESHOLD)).toBe("LARGE");
      expect(getWhaleLevel(30000000)).toBe("LARGE");
      expect(getWhaleLevel(49999999)).toBe("LARGE");
    });

    it("returns MEGA for trades at or above 50 million KRW", () => {
      expect(getWhaleLevel(MEGA_TRADE_THRESHOLD)).toBe("MEGA");
      expect(getWhaleLevel(100000000)).toBe("MEGA");
    });
  });

  describe("formatTradeTime", () => {
    it("formats milliseconds into HH:mm:ss string", () => {
      // Create date with specific local time
      const date = new Date(2026, 8, 14, 9, 5, 8);
      const result = formatTradeTime(date.getTime());
      expect(result).toBe("09:05:08");
    });
  });

  describe("formatVolumeAmount", () => {
    it("formats large volume with 2 decimals", () => {
      expect(formatVolumeAmount(123.4567)).toBe("123.46");
    });

    it("formats fractional volume with 4 decimals", () => {
      expect(formatVolumeAmount(0.12345)).toBe("0.1235");
    });

    it("handles zero and invalid volume safely", () => {
      expect(formatVolumeAmount(0)).toBe("0.0000");
    });
  });

  describe("formatTotalValueKRW", () => {
    it("formats integer KRW with commas", () => {
      expect(formatTotalValueKRW(15000000)).toBe("15,000,000");
    });

    it("handles 0 or negative values", () => {
      expect(formatTotalValueKRW(0)).toBe("0");
    });
  });
});
