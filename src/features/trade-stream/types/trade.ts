import type { MarketAskBid } from "@/services/api";

export type WhaleLevel = "NORMAL" | "LARGE" | "MEGA";

export interface TradeRecord {
  id: string;
  market: string;
  price: number;
  volume: number;
  totalValue: number;
  askBid: MarketAskBid;
  timestamp: number;
  formattedTime: string;
  whaleLevel: WhaleLevel;
}
