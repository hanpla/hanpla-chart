import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useMarketStore } from "@/stores";
import { RAFScheduler } from "@/utils/raf-scheduler";
import { WebSocketManager } from "./websocket-manager";
import {
  StreamContext,
  type BatchListener,
  type StreamContextValue,
} from "./stream-context";
import type { UpbitWebSocketMessage } from "@/types/websocket";

export interface StreamProviderProps {
  children: React.ReactNode;
  url?: string;
  initialSymbol?: string;
}

/**
 * StreamProvider
 *
 * App-level provider that maintains a single, multiplexed WebSocket connection
 * to the Upbit Public Feed, buffered through a 60FPS RAFScheduler.
 * Distributes batched messages to any registered child listeners.
 */
export const StreamProvider: React.FC<StreamProviderProps> = ({
  children,
  url,
  initialSymbol,
}) => {
  const currentSymbol = useMarketStore((state) => state.currentSymbol);
  const setConnectionStatus = useMarketStore(
    (state) => state.setConnectionStatus,
  );
  const setLastHeartbeat = useMarketStore((state) => state.setLastHeartbeat);

  const listenersRef = useRef<Set<BatchListener>>(new Set());
  const managerRef = useRef<WebSocketManager | null>(null);
  const schedulerRef = useRef<RAFScheduler<UpbitWebSocketMessage> | null>(null);
  const currentSymbolRef = useRef(currentSymbol);

  useEffect(() => {
    currentSymbolRef.current = currentSymbol;
  }, [currentSymbol]);

  // Listener registration callback
  const subscribeBatch = useCallback((listener: BatchListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  // Initialize RAFScheduler & WebSocketManager on mount
  useEffect(() => {
    const scheduler = new RAFScheduler<UpbitWebSocketMessage>((batch) => {
      setLastHeartbeat(Date.now());
      // Broadcast batch to all registered listeners
      listenersRef.current.forEach((listener) => {
        try {
          listener(batch);
        } catch (error) {
          console.error("Error in batch listener:", error);
        }
      });
    }, 2048);

    scheduler.start();
    schedulerRef.current = scheduler;

    const manager = new WebSocketManager({
      url,
      initialSymbol: initialSymbol ?? currentSymbolRef.current,
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
      schedulerRef.current = null;
      managerRef.current = null;
    };
  }, [url, initialSymbol, setConnectionStatus, setLastHeartbeat]);

  // Handle active symbol change
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.subscribe(currentSymbol);
    }
  }, [currentSymbol]);

  const value = useMemo<StreamContextValue>(
    () => ({
      manager: managerRef.current,
      scheduler: schedulerRef.current,
      subscribeBatch,
    }),
    [subscribeBatch],
  );

  return (
    <StreamContext.Provider value={value}>{children}</StreamContext.Provider>
  );
};
