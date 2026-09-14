import type { MarketAskBid } from "@/services/api";

export interface ProcessedOrderbookLevel {
  price: number;
  size: number;
  cumSize: number;
  depthRatio: number; // 0 to 100
  type: MarketAskBid;
}

export interface OrderbookSnapshot {
  market: string;
  timestamp: number;
  totalAskSize: number;
  totalBidSize: number;
  asks: ProcessedOrderbookLevel[];
  bids: ProcessedOrderbookLevel[];
  spread: number;
  spreadRate: number;
}
