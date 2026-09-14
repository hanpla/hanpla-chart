import React from "react";
import type { TradeRecord } from "../types/trade";
import {
  formatVolumeAmount,
  formatTotalValueKRW,
} from "../utils/trade-formatter";
import { formatTickerPrice } from "@/features/ticker-list/utils/ticker-sorter";

export interface TradeItemRowProps {
  item: TradeRecord;
  style?: React.CSSProperties;
}

export const TradeItemRow: React.FC<TradeItemRowProps> = React.memo(
  ({ item, style }) => {
    const isBid = item.askBid === "BID";
    const textColorClass = isBid ? "text-emerald-400" : "text-rose-400";

    const isMega = item.whaleLevel === "MEGA";
    const isLarge = item.whaleLevel === "LARGE";

    const whaleBgClass = isMega
      ? "bg-amber-500/15 border-y border-amber-500/30 animate-pulse"
      : isLarge
        ? isBid
          ? "bg-emerald-500/10"
          : "bg-rose-500/10"
        : "hover:bg-zinc-900/60";

    return (
      <div
        style={style}
        className={`grid grid-cols-12 items-center px-2.5 font-mono text-xs transition-colors ${whaleBgClass}`}
      >
        {/* Col 1: Timestamp & Whale Badge (3 cols) */}
        <div className="col-span-3 flex items-center gap-1 overflow-hidden text-[11px] text-zinc-500">
          <span>{item.formattedTime}</span>
          {isMega && (
            <span className="py-0.2 rounded bg-amber-400 px-1 text-[9px] font-bold text-zinc-950">
              WHALE
            </span>
          )}
        </div>

        {/* Col 2: Price (3 cols) */}
        <div
          className={`col-span-3 text-right font-medium ${textColorClass} ${
            isMega || isLarge ? "font-bold" : ""
          }`}
        >
          {formatTickerPrice(item.price)}
        </div>

        {/* Col 3: Volume (3 cols) */}
        <div
          className={`col-span-3 text-right text-[11px] ${
            isBid ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {formatVolumeAmount(item.volume)}
        </div>

        {/* Col 4: Total Value (3 cols) */}
        <div
          className={`col-span-3 text-right text-[11px] ${
            isMega ? "font-bold text-amber-300" : "text-zinc-400"
          }`}
        >
          {formatTotalValueKRW(item.totalValue)}
        </div>
      </div>
    );
  },
);

TradeItemRow.displayName = "TradeItemRow";
