import type { CandleDataPoint } from "@/features/chart/types/chart";
import type {
  LineDataPoint,
  BollingerBandsResult,
  IndicatorOptions,
  IndicatorsResult,
} from "./types";

/**
 * Calculates Simple Moving Average (SMA) using an optimized sliding window algorithm.
 * Time Complexity: O(N)
 * Space Complexity: O(N)
 *
 * @param candles Historical candle series
 * @param period Number of candles for the moving average window
 * @returns Array of line data points containing time and calculated SMA value
 */
export function calculateSMA(
  candles: CandleDataPoint[],
  period: number,
): LineDataPoint[] {
  if (!candles || candles.length < period || period <= 0) {
    return [];
  }

  const result: LineDataPoint[] = [];
  let windowSum = 0;

  // Initialize first window sum
  for (let i = 0; i < period; i++) {
    const candle = candles[i];
    if (candle) {
      windowSum += candle.close;
    }
  }

  const firstCandle = candles[period - 1];
  if (firstCandle) {
    result.push({
      time: firstCandle.time,
      value: windowSum / period,
    });
  }

  // Slide window across remaining candles
  for (let i = period; i < candles.length; i++) {
    const prevCandle = candles[i - period];
    const currCandle = candles[i];

    if (prevCandle && currCandle) {
      windowSum = windowSum - prevCandle.close + currCandle.close;
      result.push({
        time: currCandle.time,
        value: windowSum / period,
      });
    }
  }

  return result;
}

/**
 * Calculates Bollinger Bands (Upper, Middle, Lower) with specified period and standard deviation multiplier.
 * Formula:
 * - Middle Band = SMA(period)
 * - Upper Band = Middle + (multiplier * standard deviation)
 * - Lower Band = Middle - (multiplier * standard deviation)
 *
 * @param candles Historical candle series
 * @param period Number of candles in the window (standard: 20)
 * @param multiplier Standard deviation multiplier (standard: 2)
 * @returns Object containing upper, middle, and lower band line data series
 */
export function calculateBollingerBands(
  candles: CandleDataPoint[],
  period: number = 20,
  multiplier: number = 2,
): BollingerBandsResult {
  const result: BollingerBandsResult = {
    upper: [],
    middle: [],
    lower: [],
  };

  if (!candles || candles.length < period || period <= 0 || multiplier < 0) {
    return result;
  }

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const c = candles[j];
      if (c) {
        sum += c.close;
      }
    }

    const mean = sum / period;

    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const c = candles[j];
      if (c) {
        const diff = c.close - mean;
        varianceSum += diff * diff;
      }
    }

    const stdDev = Math.sqrt(varianceSum / period);
    const currCandle = candles[i];

    if (currCandle) {
      result.middle.push({
        time: currCandle.time,
        value: mean,
      });
      result.upper.push({
        time: currCandle.time,
        value: mean + multiplier * stdDev,
      });
      result.lower.push({
        time: currCandle.time,
        value: mean - multiplier * stdDev,
      });
    }
  }

  return result;
}

/**
 * Calculates all requested indicators in a single pass.
 */
export function calculateAllIndicators(
  candles: CandleDataPoint[],
  options: IndicatorOptions,
): IndicatorsResult {
  const startTime =
    typeof performance !== "undefined" ? performance.now() : Date.now();

  const smaMap: Record<number, LineDataPoint[]> = {};
  const smaPeriods = options.smaPeriods ?? [20, 60, 120];

  for (let i = 0; i < smaPeriods.length; i++) {
    const period = smaPeriods[i];
    if (period !== undefined) {
      smaMap[period] = calculateSMA(candles, period);
    }
  }

  let bollinger: BollingerBandsResult | undefined;
  if (options.bollinger) {
    bollinger = calculateBollingerBands(
      candles,
      options.bollinger.period,
      options.bollinger.multiplier,
    );
  }

  const endTime =
    typeof performance !== "undefined" ? performance.now() : Date.now();

  return {
    sma: smaMap,
    bollinger,
    executionTimeMs: Math.max(0, endTime - startTime),
  };
}
