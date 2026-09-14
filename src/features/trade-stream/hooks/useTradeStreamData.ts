import { useState, useEffect, useRef, useCallback } from "react";
import { CircularRingBuffer } from "@/utils/ring-buffer";
import { fetchRecentTrades } from "@/services/api";
import { useWebSocketBatch } from "@/services/websocket";
import { isUpbitTrade, type UpbitWebSocketMessage } from "@/types/websocket";
import type { TradeRecord } from "../types/trade";
import { getWhaleLevel, formatTradeTime } from "../utils/trade-formatter";

const BUFFER_CAPACITY = 1000;

export function useTradeStreamData(symbol: string) {
  const ringBufferRef = useRef<CircularRingBuffer<TradeRecord>>(
    new CircularRingBuffer<TradeRecord>(BUFFER_CAPACITY),
  );

  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Initial REST fetch for recent trades when symbol changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const buffer = ringBufferRef.current;
    buffer.clear();

    async function loadInitialTrades() {
      try {
        const rawTrades = await fetchRecentTrades(symbol, 50);
        if (isCancelled) return;

        // Upbit returns newest first; push from oldest to newest into ring buffer
        const sorted = [...rawTrades].sort(
          (a, b) => a.sequential_id - b.sequential_id,
        );

        for (let i = 0; i < sorted.length; i++) {
          const t = sorted[i];
          if (!t) continue;
          const totalValue = t.trade_price * t.trade_volume;
          const record: TradeRecord = {
            id: t.sequential_id.toString(),
            market: t.market,
            price: t.trade_price,
            volume: t.trade_volume,
            totalValue,
            askBid: t.ask_bid,
            timestamp: t.timestamp,
            formattedTime: formatTradeTime(t.timestamp),
            whaleLevel: getWhaleLevel(totalValue),
          };
          buffer.push(record);
        }

        // Display newest first
        setTrades(buffer.toReversedArray());
      } catch (err) {
        console.error("Failed to load initial trade history:", err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInitialTrades();

    return () => {
      isCancelled = true;
    };
  }, [symbol]);

  // 2. Ingest 60FPS batched trade messages from WebSocket
  useWebSocketBatch(
    useCallback(
      (batch: UpbitWebSocketMessage[]) => {
        const buffer = ringBufferRef.current;
        let newTradesCount = 0;

        for (let i = 0; i < batch.length; i++) {
          const msg = batch[i];
          if (!msg || !isUpbitTrade(msg) || msg.code !== symbol) {
            continue;
          }

          const totalValue = msg.trade_price * msg.trade_volume;
          const record: TradeRecord = {
            id: `${msg.sequential_id}-${msg.timestamp}`,
            market: msg.code,
            price: msg.trade_price,
            volume: msg.trade_volume,
            totalValue,
            askBid: msg.ask_bid,
            timestamp: msg.timestamp,
            formattedTime: formatTradeTime(msg.timestamp),
            whaleLevel: getWhaleLevel(totalValue),
          };

          buffer.push(record);
          newTradesCount++;
        }

        if (newTradesCount > 0) {
          // Sync with UI state at 60 FPS (display newest on top)
          setTrades(buffer.toReversedArray());
        }
      },
      [symbol],
    ),
  );

  return {
    trades,
    isLoading,
  };
}
