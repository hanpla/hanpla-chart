import type { MarketChangeType } from "@/services/api";

export type TickerSortField =
  "acc_trade_price_24h" | "signed_change_rate" | "trade_price" | "korean_name";

export type SortDirection = "asc" | "desc";

export interface TickerItem {
  market: string;
  symbol: string; // e.g. "BTC" from "KRW-BTC"
  koreanName: string;
  englishName: string;
  tradePrice: number;
  change: MarketChangeType;
  signedChangeRate: number;
  signedChangePrice: number;
  accTradePrice24h: number;
  accTradeVolume24h: number;
  highPrice: number;
  lowPrice: number;
  isBookmarked: boolean;
  warning?: boolean;
}

export type TickerFilterTab = "all" | "bookmarks";
