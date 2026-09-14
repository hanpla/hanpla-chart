import { useState, useEffect, useCallback } from "react";
import { fetchOrderbook } from "@/services/api";
import { useWebSocketBatch } from "@/services/websocket";
import {
  isUpbitOrderbook,
  type UpbitWebSocketMessage,
} from "@/types/websocket";
import type { OrderbookSnapshot } from "../types/orderbook";
import { processOrderbookUnits } from "../utils/orderbook-math";

export function useOrderBookData(symbol: string) {
  const [snapshot, setSnapshot] = useState<OrderbookSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Initial REST snapshot fetch when symbol changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    async function loadSnapshot() {
      try {
        const rawBook = await fetchOrderbook(symbol);
        if (isCancelled || !rawBook) return;

        const processed = processOrderbookUnits(
          rawBook.market,
          rawBook.timestamp,
          rawBook.total_ask_size,
          rawBook.total_bid_size,
          rawBook.orderbook_units,
        );

        setSnapshot(processed);
      } catch (err) {
        console.error("Failed to load initial orderbook snapshot:", err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSnapshot();

    return () => {
      isCancelled = true;
    };
  }, [symbol]);

  // 2. Consume realtime 60FPS batched orderbook updates from WebSocket
  useWebSocketBatch(
    useCallback(
      (batch: UpbitWebSocketMessage[]) => {
        // Scan backwards for newest orderbook frame for this symbol
        for (let i = batch.length - 1; i >= 0; i--) {
          const msg = batch[i];
          if (msg && isUpbitOrderbook(msg) && msg.code === symbol) {
            const processed = processOrderbookUnits(
              msg.code,
              msg.timestamp,
              msg.total_ask_size,
              msg.total_bid_size,
              msg.orderbook_units,
            );
            setSnapshot(processed);
            break;
          }
        }
      },
      [symbol],
    ),
  );

  return {
    snapshot,
    isLoading,
  };
}
