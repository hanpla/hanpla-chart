import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMarketStore } from "@/stores";
import { useTradeStreamData } from "../hooks/useTradeStreamData";
import { TradeHeader } from "./TradeHeader";
import { TradeItemRow } from "./TradeItemRow";

const ROW_HEIGHT = 28;

export const TradeStream: React.FC = () => {
  const currentSymbol = useMarketStore((state) => state.currentSymbol);
  const { trades, isLoading } = useTradeStreamData(currentSymbol);

  const parentRef = useRef<HTMLDivElement>(null);

  const getItemKey = React.useCallback(
    (index: number) => trades[index]?.id ?? index,
    [trades],
  );

  const rowVirtualizer = useVirtualizer({
    count: trades.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    getItemKey,
    overscan: 5, // Maintains exactly 20-25 DOM nodes in view
  });

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-zinc-950/70 p-2.5">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-2 text-xs font-semibold text-zinc-300">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="font-sans font-medium text-zinc-200">
            실시간 체결
          </span>
          <span className="text-[10px] text-zinc-500">REALTIME TRADES</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
          <span className="font-semibold text-zinc-400">{currentSymbol}</span>
          <span>{trades.length}건 누적</span>
        </div>
      </div>

      {/* Column Headers */}
      <TradeHeader />

      {/* Virtualized Scroll Container */}
      <div
        ref={parentRef}
        className="relative flex-1 overflow-y-auto overflow-x-hidden pt-0.5"
      >
        {isLoading && trades.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 font-mono text-xs text-zinc-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <span>체결 내역 수신 중...</span>
          </div>
        ) : trades.length === 0 ? (
          <div className="flex h-40 items-center justify-center font-mono text-xs text-zinc-500">
            체결 내역이 없습니다.
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = trades[virtualRow.index];
              if (!item) return null;

              return (
                <TradeItemRow
                  key={virtualRow.key}
                  item={item}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

TradeStream.displayName = "TradeStream";
