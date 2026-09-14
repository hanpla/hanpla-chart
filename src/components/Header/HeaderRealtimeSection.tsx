import React, { useState, useCallback } from "react";
import { useMarketStore } from "@/stores";
import { useWebSocketStream } from "@/services/websocket";
import { isUpbitTicker } from "@/types/websocket";
import type { UpbitWebSocketMessage } from "@/types/websocket";
import { HeaderConnectionBadge } from "./HeaderConnectionBadge";
import { HeaderMarketTicker } from "./HeaderMarketTicker";
import { HeaderTelemetry } from "./HeaderTelemetry";

export const HeaderRealtimeSection: React.FC = React.memo(() => {
  const currentSymbol = useMarketStore((state) => state.currentSymbol);

  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [changeRate, setChangeRate] = useState<number | null>(null);
  const [ticksCount, setTicksCount] = useState<number>(0);

  const handleBatch = useCallback((batch: UpbitWebSocketMessage[]) => {
    setTicksCount((prev) => prev + batch.length);

    // Scan batch from latest to oldest for the latest ticker price
    for (let i = batch.length - 1; i >= 0; i--) {
      const msg = batch[i];
      if (msg && isUpbitTicker(msg)) {
        setLastPrice(msg.trade_price);
        setChangeRate(msg.signed_change_rate);
        break;
      }
    }
  }, []);

  useWebSocketStream({
    onBatch: handleBatch,
  });

  return (
    <div className="flex items-center gap-3">
      <HeaderMarketTicker
        symbol={currentSymbol}
        price={lastPrice}
        changeRate={changeRate}
      />
      <HeaderConnectionBadge />
      <HeaderTelemetry ticksCount={ticksCount} />
    </div>
  );
});

HeaderRealtimeSection.displayName = "HeaderRealtimeSection";
