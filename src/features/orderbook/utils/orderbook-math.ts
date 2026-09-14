import type { UpbitOrderbookUnit } from "@/types/websocket";
import type {
  ProcessedOrderbookLevel,
  OrderbookSnapshot,
} from "../types/orderbook";

/**
 * Transforms raw Upbit orderbook units into processed cumulative depth levels.
 */
export function processOrderbookUnits(
  market: string,
  timestamp: number,
  totalAskSize: number,
  totalBidSize: number,
  units: UpbitOrderbookUnit[],
): OrderbookSnapshot {
  if (!units || units.length === 0) {
    return {
      market,
      timestamp,
      totalAskSize: 0,
      totalBidSize: 0,
      asks: [],
      bids: [],
      spread: 0,
      spreadRate: 0,
    };
  }

  // 1. Calculate cumulative sizes starting from best prices (unit 0)
  let runningAskCum = 0;
  const rawAsks: { price: number; size: number; cumSize: number }[] = [];

  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (!u || u.ask_price <= 0) continue;
    runningAskCum += u.ask_size;
    rawAsks.push({
      price: u.ask_price,
      size: u.ask_size,
      cumSize: runningAskCum,
    });
  }

  let runningBidCum = 0;
  const rawBids: { price: number; size: number; cumSize: number }[] = [];

  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (!u || u.bid_price <= 0) continue;
    runningBidCum += u.bid_size;
    rawBids.push({
      price: u.bid_price,
      size: u.bid_size,
      cumSize: runningBidCum,
    });
  }

  // Max cumulative size across both sides for normalized depth ratio
  const maxCumSize = Math.max(runningAskCum, runningBidCum, 0.0001);

  // Asks are displayed top-to-bottom descending (highest ask at top, best ask at bottom)
  const asks: ProcessedOrderbookLevel[] = rawAsks
    .map((item) => ({
      price: item.price,
      size: item.size,
      cumSize: item.cumSize,
      depthRatio: Math.min(100, Math.max(1, (item.cumSize / maxCumSize) * 100)),
      type: "ASK" as const,
    }))
    .reverse(); // Reverse so highest price is at top

  // Bids are displayed top-to-bottom descending (best bid at top, lowest bid at bottom)
  const bids: ProcessedOrderbookLevel[] = rawBids.map((item) => ({
    price: item.price,
    size: item.size,
    cumSize: item.cumSize,
    depthRatio: Math.min(100, Math.max(1, (item.cumSize / maxCumSize) * 100)),
    type: "BID" as const,
  }));

  const bestAsk = rawAsks[0]?.price ?? 0;
  const bestBid = rawBids[0]?.price ?? 0;
  const spread = bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0;
  const spreadRate = bestBid > 0 ? (spread / bestBid) * 100 : 0;

  return {
    market,
    timestamp,
    totalAskSize: totalAskSize || runningAskCum,
    totalBidSize: totalBidSize || runningBidCum,
    asks,
    bids,
    spread,
    spreadRate,
  };
}

/**
 * Formats orderbook volume with standard precision.
 */
export function formatOrderbookSize(size: number): string {
  if (!Number.isFinite(size) || size <= 0) {
    return "0.000";
  }
  if (size >= 100) {
    return size.toFixed(2);
  }
  return size.toFixed(3);
}
