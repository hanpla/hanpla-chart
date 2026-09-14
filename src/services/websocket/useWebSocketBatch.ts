import { useContext, useEffect, useRef } from "react";
import {
  StreamContext,
  type BatchListener,
  type StreamContextValue,
} from "./stream-context";

/**
 * Hook to consume batched WebSocket ticks at 60 FPS (16.6ms).
 */
export function useWebSocketBatch(listener?: BatchListener): void {
  const context = useContext(StreamContext);
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!context || !listener) {
      return;
    }

    const unsubscribe = context.subscribeBatch((batch) => {
      if (listenerRef.current) {
        listenerRef.current(batch);
      }
    });

    return unsubscribe;
  }, [context, listener]);
}

/**
 * Hook to access stream telemetry and raw manager/scheduler instances.
 */
export function useStreamContext(): StreamContextValue {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
}
