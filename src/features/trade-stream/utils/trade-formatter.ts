import type { WhaleLevel } from "../types/trade";

export const LARGE_TRADE_THRESHOLD = 10_000_000; // 1천만 원
export const MEGA_TRADE_THRESHOLD = 50_000_000; // 5천만 원

/**
 * Determines whether a trade qualifies as a large or mega (whale) trade.
 */
export function getWhaleLevel(totalValue: number): WhaleLevel {
  if (totalValue >= MEGA_TRADE_THRESHOLD) {
    return "MEGA";
  }
  if (totalValue >= LARGE_TRADE_THRESHOLD) {
    return "LARGE";
  }
  return "NORMAL";
}

/**
 * Formats a UNIX millisecond timestamp into HH:mm:ss.
 */
export function formatTradeTime(timestampMs: number): string {
  const date = new Date(timestampMs);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Formats volume quantity with up to 4 decimal places.
 */
export function formatVolumeAmount(volume: number): string {
  if (!Number.isFinite(volume) || volume <= 0) {
    return "0.0000";
  }
  if (volume >= 100) {
    return volume.toFixed(2);
  }
  return volume.toFixed(4);
}

/**
 * Formats total transaction amount in KRW.
 */
export function formatTotalValueKRW(val: number): string {
  if (!Number.isFinite(val) || val <= 0) {
    return "0";
  }
  return Math.round(val).toLocaleString("ko-KR");
}
