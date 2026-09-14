import { createContext } from "react";
import type { RAFScheduler } from "@/utils/raf-scheduler";
import type { WebSocketManager } from "./websocket-manager";
import type { UpbitWebSocketMessage } from "@/types/websocket";

export type BatchListener = (batch: UpbitWebSocketMessage[]) => void;

export interface StreamContextValue {
  manager: WebSocketManager | null;
  scheduler: RAFScheduler<UpbitWebSocketMessage> | null;
  subscribeBatch: (listener: BatchListener) => () => void;
}

export const StreamContext = createContext<StreamContextValue | null>(null);
