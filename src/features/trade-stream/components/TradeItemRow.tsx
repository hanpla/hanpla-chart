import React from "react";
import { Badge } from "@/components/ui";
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
        className={`grid select-none grid-cols-12 items-center border-b border-zinc-900/40 bg-zinc-950 px-2.5 font-mono text-xs transition-colors ${whaleBgClass}`}
      >
        {/* Col 1: Timestamp & Whale Badge (3 cols) */}
        <div className="col-span-3 flex items-center gap-1 overflow-hidden whitespace-nowrap text-[11px] text-zinc-400">
          <span className="tabular-nums">{item.formattedTime}</span>
          {isMega && (
            <Badge intent="whale" size="xs" className="px-1 py-0 text-[9px]">
              WHALE
            </Badge>
          )}
        </div>

        {/* Col 2: Price (4 cols) */}
        <div
          className={`col-span-4 truncate whitespace-nowrap text-right font-semibold tabular-nums ${textColorClass} ${
            isMega || isLarge ? "font-bold" : ""
          }`}
        >
          {formatTickerPrice(item.price)}
        </div>

        {/* Col 3: Volume (2 cols) */}
        <div
          className={`col-span-2 truncate whitespace-nowrap text-right text-[11px] tabular-nums ${
            isBid ? "text-emerald-300/90" : "text-rose-300/90"
          }`}
        >
          {formatVolumeAmount(item.volume)}
        </div>

        {/* Col 4: Total Value (3 cols) */}
        <div
          className={`col-span-3 truncate whitespace-nowrap text-right text-[11px] tabular-nums ${
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
