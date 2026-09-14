/**
 * Upbit WebSocket API type definitions and type guards.
 */

export type AskBid = "ASK" | "BID";
export type ChangeType = "RISE" | "EVEN" | "FALL";

export interface UpbitTickerMessage {
  type: "ticker";
  code: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  prev_closing_price: number;
  change: ChangeType;
  change_price: number;
  signed_change_price: number;
  change_rate: number;
  signed_change_rate: number;
  trade_volume: number;
  acc_trade_volume: number;
  acc_trade_volume_24h: number;
  acc_trade_price: number;
  acc_trade_price_24h: number;
  trade_date: string;
  trade_time: string;
  trade_timestamp: number;
  ask_bid: AskBid;
  timestamp: number;
}

export interface UpbitOrderbookUnit {
  ask_price: number;
  bid_price: number;
  ask_size: number;
  bid_size: number;
}

export interface UpbitOrderbookMessage {
  type: "orderbook";
  code: string;
  total_ask_size: number;
  total_bid_size: number;
  orderbook_units: UpbitOrderbookUnit[];
  timestamp: number;
}

export interface UpbitTradeMessage {
  type: "trade";
  code: string;
  trade_price: number;
  trade_volume: number;
  ask_bid: AskBid;
  prev_closing_price: number;
  change: ChangeType;
  change_price: number;
  trade_date: string;
  trade_time: string;
  trade_timestamp: number;
  timestamp: number;
  sequential_id: number;
}

export type UpbitWebSocketMessage =
  UpbitTickerMessage | UpbitOrderbookMessage | UpbitTradeMessage;

export function isUpbitTicker(
  msg: UpbitWebSocketMessage,
): msg is UpbitTickerMessage {
  return msg.type === "ticker";
}

export function isUpbitOrderbook(
  msg: UpbitWebSocketMessage,
): msg is UpbitOrderbookMessage {
  return msg.type === "orderbook";
}

export function isUpbitTrade(
  msg: UpbitWebSocketMessage,
): msg is UpbitTradeMessage {
  return msg.type === "trade";
}
