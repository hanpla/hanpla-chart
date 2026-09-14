import React, { useState } from "react";
import { useMarketStore } from "@/stores";
import { useTradingChart } from "../hooks/useTradingChart";
import { ChartHeader } from "./ChartHeader";
import type { ChartTimeframe } from "../types/chart";

export const TradingChart: React.FC = () => {
  const currentSymbol = useMarketStore((state) => state.currentSymbol);
  const [timeframe, setTimeframe] = useState<ChartTimeframe>("1m");

  const { containerRef, currentOHLV, isLoading } = useTradingChart({
    symbol: currentSymbol,
    timeframe,
  });

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-zinc-950/70 p-3">
      {/* Chart Control Header */}
      <ChartHeader
        symbol={currentSymbol}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        ohlv={currentOHLV}
        isLoading={isLoading}
      />

      {/* Canvas Mount Container */}
      <div className="relative flex-1 overflow-hidden pt-1">
        {isLoading && !currentOHLV && (
          <div className="backdrop-blur-xs absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/60">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <span>차트 캔들 데이터 수신 중...</span>
            </div>
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
};

TradingChart.displayName = "TradingChart";
