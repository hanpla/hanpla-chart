import React, { useState, useCallback, useRef } from "react";
import { useMarketStore } from "@/stores";
import { useWebSocketStream } from "@/services/websocket";
import { isUpbitTicker } from "@/types/websocket";
import type { UpbitWebSocketMessage } from "@/types/websocket";
import { PerformanceHud } from "@/components/PerformanceHud";
import { HeaderConnectionBadge } from "./HeaderConnectionBadge";
import { HeaderMarketTicker } from "./HeaderMarketTicker";
import { HeaderTelemetry } from "./HeaderTelemetry";

export const HeaderRealtimeSection: React.FC = React.memo(() => {
  const currentSymbol = useMarketStore((state) => state.currentSymbol);

  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [changeRate, setChangeRate] = useState<number | null>(null);
  const [ticksCount, setTicksCount] = useState<number>(0);

  const ticksCountRef = useRef<number>(0);
  const lastTelemetryThrottleRef = useRef<number>(0);

  const handleBatch = useCallback((batch: UpbitWebSocketMessage[]) => {
    ticksCountRef.current += batch.length;

    // Scan batch from latest to oldest for the latest ticker price
    let foundTicker = false;
    let newPrice = 0;
    let newRate = 0;

    for (let i = batch.length - 1; i >= 0; i--) {
      const msg = batch[i];
      if (msg && isUpbitTicker(msg)) {
        newPrice = msg.trade_price;
        newRate = msg.signed_change_rate;
        foundTicker = true;
        break;
      }
    }

    if (foundTicker) {
      setLastPrice(newPrice);
      setChangeRate(newRate);
    }

    // Strict Performance Throttling: Throttle telemetry & HUD ticks updates to 250ms (4Hz)
    // to prevent 60FPS React state churn and wasteful DOM diffing
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - lastTelemetryThrottleRef.current >= 250) {
      lastTelemetryThrottleRef.current = now;
      setTicksCount(ticksCountRef.current);
    }
  }, []);

  useWebSocketStream({
    onBatch: handleBatch,
  });

  return (
    <div className="flex items-center gap-2.5">
      <HeaderMarketTicker
        symbol={currentSymbol}
        price={lastPrice}
        changeRate={changeRate}
      />
      <HeaderConnectionBadge />
      <HeaderTelemetry ticksCount={ticksCount} />
      <PerformanceHud totalTicks={ticksCount} />
    </div>
  );
});

HeaderRealtimeSection.displayName = "HeaderRealtimeSection";
