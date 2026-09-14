import { describe, it, expect, beforeEach } from "vitest";
import { useMarketStore } from "./useMarketStore";

describe("useMarketStore", () => {
  beforeEach(() => {
    // Reset store state
    useMarketStore.setState({
      currentSymbol: "KRW-BTC",
      connectionStatus: "DISCONNECTED",
      lastHeartbeat: 0,
    });
  });

  it("should have initial default values", () => {
    const state = useMarketStore.getState();
    expect(state.currentSymbol).toBe("KRW-BTC");
    expect(state.connectionStatus).toBe("DISCONNECTED");
    expect(state.lastHeartbeat).toBe(0);
  });

  it("should update current symbol", () => {
    useMarketStore.getState().setSymbol("KRW-ETH");
    expect(useMarketStore.getState().currentSymbol).toBe("KRW-ETH");
  });

  it("should update connection status", () => {
    useMarketStore.getState().setConnectionStatus("CONNECTING");
    expect(useMarketStore.getState().connectionStatus).toBe("CONNECTING");

    useMarketStore.getState().setConnectionStatus("CONNECTED");
    expect(useMarketStore.getState().connectionStatus).toBe("CONNECTED");
  });

  it("should update last heartbeat timestamp", () => {
    const now = Date.now();
    useMarketStore.getState().setLastHeartbeat(now);
    expect(useMarketStore.getState().lastHeartbeat).toBe(now);
  });
});
