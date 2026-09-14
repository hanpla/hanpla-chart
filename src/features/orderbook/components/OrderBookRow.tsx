import React from "react";
import type { ProcessedOrderbookLevel } from "../types/orderbook";
import { formatOrderbookSize } from "../utils/orderbook-math";
import { formatTickerPrice } from "@/features/ticker-list/utils/ticker-sorter";

export interface OrderBookRowProps {
  item: ProcessedOrderbookLevel;
}

export const OrderBookRow: React.FC<OrderBookRowProps> = React.memo(
  ({ item }) => {
    const isAsk = item.type === "ASK";
    const textColorClass = isAsk ? "text-rose-400" : "text-emerald-400";
    const depthBgClass = isAsk ? "bg-rose-500/15" : "bg-emerald-500/15";

    return (
      <div
        className="relative flex h-5 items-center justify-between px-2 font-mono text-[11px] transition-colors hover:bg-zinc-900/60"
        style={
          { "--depth-ratio": `${item.depthRatio}%` } as React.CSSProperties
        }
      >
        {/* GPU-composited Depth Gauge Bar via CSS Variable */}
        <div
          className={`pointer-events-none absolute bottom-0 right-0 top-0 transition-all duration-75 ${depthBgClass}`}
          style={{ width: "var(--depth-ratio)" }}
        />

        {/* Price */}
        <span className={`z-10 font-medium ${textColorClass}`}>
          {formatTickerPrice(item.price)}
        </span>

        {/* Quantity & Cumulative Quantity */}
        <div className="z-10 flex items-center gap-2">
          <span className="text-zinc-200">
            {formatOrderbookSize(item.size)}
          </span>
          <span className="w-11 text-right text-[10px] text-zinc-500">
            {formatOrderbookSize(item.cumSize)}
          </span>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.price === nextProps.item.price &&
      prevProps.item.size === nextProps.item.size &&
      prevProps.item.cumSize === nextProps.item.cumSize &&
      prevProps.item.depthRatio === nextProps.item.depthRatio &&
      prevProps.item.type === nextProps.item.type
    );
  },
);

OrderBookRow.displayName = "OrderBookRow";
