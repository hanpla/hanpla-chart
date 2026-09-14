import type { UTCTimestamp } from "lightweight-charts";
import type { UpbitRestCandle } from "@/services/api";
import type {
  CandleDataPoint,
  VolumeDataPoint,
  TimeframeOption,
  ChartTimeframe,
} from "../types/chart";

export const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { value: "1m", label: "1분", unit: 1, type: "minute" },
  { value: "3m", label: "3분", unit: 3, type: "minute" },
  { value: "5m", label: "5분", unit: 5, type: "minute" },
  { value: "15m", label: "15분", unit: 15, type: "minute" },
  { value: "60m", label: "1시간", unit: 60, type: "minute" },
  { value: "240m", label: "4시간", unit: 240, type: "minute" },
];

export const UP_COLOR = "#34d399"; // emerald-400
export const DOWN_COLOR = "#f43f5e"; // rose-500
export const UP_COLOR_SEMI = "rgba(52, 211, 153, 0.4)";
export const DOWN_COLOR_SEMI = "rgba(244, 63, 94, 0.4)";

/**
 * Calculates aligned UNIX timestamp bucket (in seconds) for a given timestamp and minute interval.
 */
export function getCandleBoundary(
  timestampMs: number,
  timeframeMinutes: number,
): UTCTimestamp {
  const intervalMs = timeframeMinutes * 60 * 1000;
  const bucketMs = Math.floor(timestampMs / intervalMs) * intervalMs;
  return Math.floor(bucketMs / 1000) as UTCTimestamp;
}

/**
 * Parses Upbit REST API candle response into ascending Lightweight Charts series data.
 */
export function parseUpbitCandles(rawCandles: UpbitRestCandle[]): {
  candles: CandleDataPoint[];
  volumes: VolumeDataPoint[];
} {
  if (!rawCandles || rawCandles.length === 0) {
    return { candles: [], volumes: [] };
  }

  // Upbit returns newest first; reverse to oldest first
  const sorted = [...rawCandles].sort((a, b) => a.timestamp - b.timestamp);

  const candles: CandleDataPoint[] = [];
  const volumes: VolumeDataPoint[] = [];
  const seenTimes = new Set<number>();

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    if (!item) continue;

    const timeSeconds = Math.floor(
      new Date(item.candle_date_time_utc + "Z").getTime() / 1000,
    ) as UTCTimestamp;

    if (seenTimes.has(timeSeconds)) {
      continue;
    }
    seenTimes.add(timeSeconds);

    const isUp = item.trade_price >= item.opening_price;

    candles.push({
      time: timeSeconds,
      open: item.opening_price,
      high: item.high_price,
      low: item.low_price,
      close: item.trade_price,
      volume: item.candle_acc_trade_volume,
    });

    volumes.push({
      time: timeSeconds,
      value: item.candle_acc_trade_volume,
      color: isUp ? UP_COLOR_SEMI : DOWN_COLOR_SEMI,
    });
  }

  return { candles, volumes };
}

export interface MergeResult {
  candle: CandleDataPoint;
  volume: VolumeDataPoint;
  isNewCandle: boolean;
}

/**
 * Merges an incoming realtime tick into the current candle bar.
 * If the tick crosses into a new candle boundary, a new candle is initiated.
 */
export function mergeTickIntoCandle(
  lastCandle: CandleDataPoint | null,
  tradePrice: number,
  tradeVolume: number,
  tradeTimestampMs: number,
  timeframeMinutes: number,
): MergeResult {
  const boundaryTime = getCandleBoundary(tradeTimestampMs, timeframeMinutes);

  if (!lastCandle || boundaryTime > lastCandle.time) {
    // New candle initiated
    const isUp = true;
    const newCandle: CandleDataPoint = {
      time: boundaryTime,
      open: tradePrice,
      high: tradePrice,
      low: tradePrice,
      close: tradePrice,
      volume: tradeVolume,
    };

    const newVol: VolumeDataPoint = {
      time: boundaryTime,
      value: tradeVolume,
      color: isUp ? UP_COLOR_SEMI : DOWN_COLOR_SEMI,
    };

    return { candle: newCandle, volume: newVol, isNewCandle: true };
  }

  // Update existing candle
  const high = Math.max(lastCandle.high, tradePrice);
  const low = Math.min(lastCandle.low, tradePrice);
  const close = tradePrice;
  const volume = lastCandle.volume + tradeVolume;
  const isUp = close >= lastCandle.open;

  const updatedCandle: CandleDataPoint = {
    time: lastCandle.time,
    open: lastCandle.open,
    high,
    low,
    close,
    volume,
  };

  const updatedVol: VolumeDataPoint = {
    time: lastCandle.time,
    value: volume,
    color: isUp ? UP_COLOR_SEMI : DOWN_COLOR_SEMI,
  };

  return { candle: updatedCandle, volume: updatedVol, isNewCandle: false };
}

export function getTimeframeOption(timeframe: ChartTimeframe): TimeframeOption {
  return (
    TIMEFRAME_OPTIONS.find((t) => t.value === timeframe) ??
    TIMEFRAME_OPTIONS[0]!
  );
}
