import { useEffect, useRef } from "react";
import { useMarketStore } from "@/stores";
import { RAFScheduler } from "@/utils/raf-scheduler";
import { WebSocketManager } from "./websocket-manager";
import type { UpbitWebSocketMessage } from "@/types/websocket";

export interface UseWebSocketStreamOptions {
  onBatch?: (batch: UpbitWebSocketMessage[]) => void;
}

/**
 * Custom React hook to orchestrate WebSocketManager and RAFScheduler.
 * Ensures incoming high-frequency websocket ticks are buffered into RAFScheduler
 * and flushed at 60 FPS without overloading React rendering cycles.
 */
export function useWebSocketStream(options: UseWebSocketStreamOptions = {}) {
  const currentSymbol = useMarketStore((state) => state.currentSymbol);
  const setConnectionStatus = useMarketStore(
    (state) => state.setConnectionStatus,
  );
  const setLastHeartbeat = useMarketStore((state) => state.setLastHeartbeat);

  const initialSymbolRef = useRef(currentSymbol);
  const managerRef = useRef<WebSocketManager | null>(null);
  const schedulerRef = useRef<RAFScheduler<UpbitWebSocketMessage>>(null);
  const onBatchRef = useRef(options.onBatch);

  useEffect(() => {
    onBatchRef.current = options.onBatch;
  }, [options.onBatch]);

  // 1. WebSocket connection and RAF scheduler lifecycle (mounted once)
  useEffect(() => {
    const scheduler = new RAFScheduler<UpbitWebSocketMessage>((batch) => {
      setLastHeartbeat(Date.now());
      if (onBatchRef.current) {
        onBatchRef.current(batch);
      }
    }, 2048);

    scheduler.start();
    schedulerRef.current = scheduler;

    const manager = new WebSocketManager({
      initialSymbol: initialSymbolRef.current,
      onStatusChange: (status) => {
        setConnectionStatus(status);
      },
      onMessage: (message) => {
        scheduler.enqueue(message);
      },
    });

    manager.connect();
    managerRef.current = manager;

    return () => {
      scheduler.stop();
      manager.destroy();
      managerRef.current = null;
      schedulerRef.current = null;
    };
  }, [setConnectionStatus, setLastHeartbeat]);

  // 2. Dynamic subscription multiplexing (switches feed without reconnecting)
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.subscribe(currentSymbol);
    }
  }, [currentSymbol]);

  return {
    manager: managerRef.current,
    scheduler: schedulerRef.current,
  };
}
