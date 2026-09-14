export * from "./websocket";

/**
 * Common domain types for PulseStream
 */

export type MarketCode = string; // e.g., "KRW-BTC"

export type ConnectionStatus =
  "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "RECONNECTING" | "ERROR";

export interface MarketSummary {
  code: MarketCode;
  koreanName: string;
  englishName: string;
  tradePrice: number;
  signedChangePrice: number;
  signedChangeRate: number;
  accTradeVolume24h: number;
  accTradePrice24h: number;
  timestamp: number;
}
