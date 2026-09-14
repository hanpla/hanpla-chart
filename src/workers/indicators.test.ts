import { describe, it, expect } from "vitest";
import type { UTCTimestamp } from "lightweight-charts";
import type { CandleDataPoint } from "@/features/chart/types/chart";
import {
  calculateSMA,
  calculateBollingerBands,
  calculateAllIndicators,
} from "./indicators";

function createMockCandles(prices: number[]): CandleDataPoint[] {
  const baseTime = 1700000000 as UTCTimestamp;
  return prices.map((price, idx) => ({
    time: ((baseTime as number) + idx * 60) as UTCTimestamp,
    open: price,
    high: price + 10,
    low: price - 10,
    close: price,
    volume: 100,
  }));
}

describe("indicators: calculateSMA", () => {
  it("returns an empty array when candle count is less than the period", () => {
    const candles = createMockCandles([10, 20, 30]);
    const sma = calculateSMA(candles, 5);
    expect(sma).toEqual([]);
  });

  it("returns an empty array when period is invalid (<= 0)", () => {
    const candles = createMockCandles([10, 20, 30]);
    expect(calculateSMA(candles, 0)).toEqual([]);
    expect(calculateSMA(candles, -1)).toEqual([]);
  });

  it("calculates SMA correctly for an exact window", () => {
    const candles = createMockCandles([10, 20, 30]);
    const sma = calculateSMA(candles, 3);
    expect(sma).toHaveLength(1);
    expect(sma[0]?.value).toBe((10 + 20 + 30) / 3);
    expect(sma[0]?.time).toBe(candles[2]?.time);
  });

  it("calculates SMA correctly with sliding window across multiple candles", () => {
    // 10, 20, 30 -> avg = 20
    // 20, 30, 40 -> avg = 30
    // 30, 40, 50 -> avg = 40
    const candles = createMockCandles([10, 20, 30, 40, 50]);
    const sma = calculateSMA(candles, 3);

    expect(sma).toHaveLength(3);
    expect(sma[0]?.value).toBe(20);
    expect(sma[1]?.value).toBe(30);
    expect(sma[2]?.value).toBe(40);
  });
});

describe("indicators: calculateBollingerBands", () => {
  it("returns empty bands when candle count is less than the period", () => {
    const candles = createMockCandles([10, 20]);
    const result = calculateBollingerBands(candles, 5);
    expect(result.upper).toEqual([]);
    expect(result.middle).toEqual([]);
    expect(result.lower).toEqual([]);
  });

  it("calculates upper, middle, and lower bands correctly", () => {
    // 4 candles with identical prices -> stdDev = 0 -> upper = middle = lower
    const flatCandles = createMockCandles([100, 100, 100, 100]);
    const resultFlat = calculateBollingerBands(flatCandles, 3, 2);

    expect(resultFlat.middle).toHaveLength(2);
    expect(resultFlat.middle[0]?.value).toBe(100);
    expect(resultFlat.upper[0]?.value).toBe(100);
    expect(resultFlat.lower[0]?.value).toBe(100);

    // Varied candles: [10, 20, 30] -> mean = 20, variance = ((10-20)^2 + (20-20)^2 + (30-20)^2)/3 = (100 + 0 + 100)/3 = 200/3
    // stdDev = sqrt(66.6667) ≈ 8.165
    // upper ≈ 20 + 2 * 8.165 = 36.33
    // lower ≈ 20 - 2 * 8.165 = 3.67
    const candles = createMockCandles([10, 20, 30]);
    const res = calculateBollingerBands(candles, 3, 2);

    expect(res.middle).toHaveLength(1);
    expect(res.middle[0]?.value).toBe(20);
    expect(res.upper[0]?.value).toBeGreaterThan(20);
    expect(res.lower[0]?.value).toBeLessThan(20);
    expect(res.upper[0]!.value - res.middle[0]!.value).toBeCloseTo(
      res.middle[0]!.value - res.lower[0]!.value,
      5,
    );
  });
});

describe("indicators: calculateAllIndicators", () => {
  it("calculates multiple SMAs and Bollinger Bands in one pass", () => {
    const prices = Array.from({ length: 65 }, (_, i) => 100 + i);
    const candles = createMockCandles(prices);

    const result = calculateAllIndicators(candles, {
      smaPeriods: [20, 60],
      bollinger: { period: 20, multiplier: 2 },
    });

    expect(result.sma[20]).toHaveLength(65 - 20 + 1);
    expect(result.sma[60]).toHaveLength(65 - 60 + 1);
    expect(result.bollinger).toBeDefined();
    expect(result.bollinger?.middle).toHaveLength(65 - 20 + 1);
    expect(typeof result.executionTimeMs).toBe("number");
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
  });
});
