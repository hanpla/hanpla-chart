import { create } from "zustand";
import type { ConnectionStatus } from "@/types";

export interface MarketState {
  currentSymbol: string;
  connectionStatus: ConnectionStatus;
  lastHeartbeat: number;

  // Actions
  setSymbol: (symbol: string) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setLastHeartbeat: (timestamp: number) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  currentSymbol: "KRW-BTC",
  connectionStatus: "DISCONNECTED",
  lastHeartbeat: 0,

  setSymbol: (symbol: string) => set({ currentSymbol: symbol }),
  setConnectionStatus: (status: ConnectionStatus) =>
    set({ connectionStatus: status }),
  setLastHeartbeat: (timestamp: number) => set({ lastHeartbeat: timestamp }),
}));
