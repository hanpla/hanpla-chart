import { useWebSocketBatch } from "./useWebSocketBatch";
import type { UpbitWebSocketMessage } from "@/types/websocket";

export interface UseWebSocketStreamOptions {
  onBatch?: (batch: UpbitWebSocketMessage[]) => void;
}

/**
 * Custom React hook to subscribe to the centralized 60 FPS WebSocket stream.
 * Buffers ticks through RAFScheduler and delivers them synchronously to display refresh rate.
 */
export function useWebSocketStream(
  options: UseWebSocketStreamOptions = {},
): void {
  useWebSocketBatch(options.onBatch);
}
