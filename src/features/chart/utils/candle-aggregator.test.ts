import { describe, it, expect } from "vitest";
import {
  getCandleBoundary,
  parseUpbitCandles,
  mergeTickIntoCandle,
  UP_COLOR_SEMI,
  DOWN_COLOR_SEMI,
} from "./candle-aggregator";
import type { UpbitRestCandle } from "@/services/api";

describe("candle-aggregator utils", () => {
  describe("getCandleBoundary", () => {
    it("aligns timestamp to 1-minute bucket", () => {
      // 2026-09-14 10:15:23 UTC -> should align to 10:15:00 UTC
      const date = new Date("2026-09-14T10:15:23Z").getTime();
      const boundary = getCandleBoundary(date, 1);
      const expected = Math.floor(
        new Date("2026-09-14T10:15:00Z").getTime() / 1000,
      );
      expect(boundary).toBe(expected);
    });

    it("aligns timestamp to 5-minute bucket", () => {
      // 2026-09-14 10:17:45 UTC -> should align to 10:15:00 UTC
      const date = new Date("2026-09-14T10:17:45Z").getTime();
      const boundary = getCandleBoundary(date, 5);
      const expected = Math.floor(
        new Date("2026-09-14T10:15:00Z").getTime() / 1000,
      );
      expect(boundary).toBe(expected);
    });

    it("aligns timestamp to 60-minute bucket", () => {
      // 2026-09-14 10:45:00 UTC -> should align to 10:00:00 UTC
      const date = new Date("2026-09-14T10:45:00Z").getTime();
      const boundary = getCandleBoundary(date, 60);
      const expected = Math.floor(
        new Date("2026-09-14T10:00:00Z").getTime() / 1000,
      );
      expect(boundary).toBe(expected);
    });
  });

  describe("parseUpbitCandles", () => {
    it("sorts candles chronologically and assigns volume colors", () => {
      const mockRaw: UpbitRestCandle[] = [
        {
          market: "KRW-BTC",
          candle_date_time_utc: "2026-09-14T10:02:00",
          candle_date_time_kst: "2026-09-14T19:02:00",
          opening_price: 100,
          high_price: 105,
          low_price: 98,
          trade_price: 99, // down candle
          timestamp: 1789348200000,
          candle_acc_trade_price: 10000,
          candle_acc_trade_volume: 10,
        },
        {
          market: "KRW-BTC",
          candle_date_time_utc: "2026-09-14T10:01:00",
          candle_date_time_kst: "2026-09-14T19:01:00",
          opening_price: 90,
          high_price: 102,
          low_price: 89,
          trade_price: 100, // up candle
          timestamp: 1789348140000,
          candle_acc_trade_price: 15000,
          candle_acc_trade_volume: 15,
        },
      ];

      const { candles, volumes } = parseUpbitCandles(mockRaw);

      expect(candles).toHaveLength(2);
      // Chronological order: 10:01 then 10:02
      expect(candles[0]?.open).toBe(90);
      expect(candles[1]?.open).toBe(100);

      // Volume color verification
      expect(volumes[0]?.color).toBe(UP_COLOR_SEMI);
      expect(volumes[1]?.color).toBe(DOWN_COLOR_SEMI);
    });

    it("returns empty arrays when input is empty", () => {
      const { candles, volumes } = parseUpbitCandles([]);
      expect(candles).toEqual([]);
      expect(volumes).toEqual([]);
    });
  });

  describe("mergeTickIntoCandle", () => {
    it("initiates new candle when lastCandle is null", () => {
      const timeMs = new Date("2026-09-14T10:00:15Z").getTime();
      const result = mergeTickIntoCandle(null, 100, 2.5, timeMs, 1);

      expect(result.isNewCandle).toBe(true);
      expect(result.candle.open).toBe(100);
      expect(result.candle.close).toBe(100);
      expect(result.candle.high).toBe(100);
      expect(result.candle.low).toBe(100);
      expect(result.candle.volume).toBe(2.5);
    });

    it("updates high, low, close and volume within the same minute", () => {
      const baseTime = getCandleBoundary(
        new Date("2026-09-14T10:00:00Z").getTime(),
        1,
      );
      const initialCandle = {
        time: baseTime,
        open: 100,
        high: 102,
        low: 99,
        close: 101,
        volume: 5,
      };

      // Higher price tick at 10:00:25
      const tick1 = new Date("2026-09-14T10:00:25Z").getTime();
      const res1 = mergeTickIntoCandle(initialCandle, 106, 3, tick1, 1);

      expect(res1.isNewCandle).toBe(false);
      expect(res1.candle.high).toBe(106); // High updated
      expect(res1.candle.low).toBe(99);
      expect(res1.candle.close).toBe(106);
      expect(res1.candle.volume).toBe(8);

      // Lower price tick at 10:00:40
      const tick2 = new Date("2026-09-14T10:00:40Z").getTime();
      const res2 = mergeTickIntoCandle(res1.candle, 95, 2, tick2, 1);

      expect(res2.isNewCandle).toBe(false);
      expect(res2.candle.high).toBe(106);
      expect(res2.candle.low).toBe(95); // Low updated
      expect(res2.candle.close).toBe(95);
      expect(res2.candle.volume).toBe(10);
    });

    it("initiates new candle when tick crosses minute boundary", () => {
      const baseTime = getCandleBoundary(
        new Date("2026-09-14T10:00:00Z").getTime(),
        1,
      );
      const currentCandle = {
        time: baseTime,
        open: 100,
        high: 105,
        low: 98,
        close: 104,
        volume: 10,
      };

      // Tick arriving in the next minute (10:01:05)
      const nextMinuteTick = new Date("2026-09-14T10:01:05Z").getTime();
      const result = mergeTickIntoCandle(
        currentCandle,
        105,
        1.2,
        nextMinuteTick,
        1,
      );

      expect(result.isNewCandle).toBe(true);
      expect(result.candle.time).toBeGreaterThan(baseTime);
      expect(result.candle.open).toBe(105);
      expect(result.candle.close).toBe(105);
      expect(result.candle.volume).toBe(1.2);
    });
  });
});
