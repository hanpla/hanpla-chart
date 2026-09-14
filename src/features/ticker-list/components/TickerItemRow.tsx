import React from "react";
import { Star } from "lucide-react";
import type { TickerItem } from "../types/ticker";
import { formatTickerPrice, formatTradeValue } from "../utils/ticker-sorter";

export interface TickerItemRowProps {
  item: TickerItem;
  isSelected: boolean;
  onSelect: (market: string) => void;
  onToggleBookmark: (market: string) => void;
  style?: React.CSSProperties;
}

export const TickerItemRow: React.FC<TickerItemRowProps> = React.memo(
  ({ item, isSelected, onSelect, onToggleBookmark, style }) => {
    const isRise = item.change === "RISE";
    const isFall = item.change === "FALL";

    const changeColorClass = isRise
      ? "text-emerald-400"
      : isFall
        ? "text-rose-400"
        : "text-zinc-300";

    const formattedRate = `${item.signedChangeRate > 0 ? "+" : ""}${(
      item.signedChangeRate * 100
    ).toFixed(2)}%`;

    return (
      <div
        style={style}
        onClick={() => onSelect(item.market)}
        className={`grid cursor-pointer grid-cols-12 items-center px-2 py-1.5 text-xs transition-colors hover:bg-zinc-800/50 ${
          isSelected
            ? "border-l-2 border-emerald-500 bg-zinc-800/70 font-semibold"
            : "border-l-2 border-transparent"
        }`}
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(item.market);
          }
        }}
      >
        {/* Col 1: Star + Name / Symbol (4 cols) */}
        <div className="col-span-4 flex items-center gap-1.5 overflow-hidden pr-1">
          <button
            type="button"
            aria-label={`${item.koreanName} 즐겨찾기 토글`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(item.market);
            }}
            className="text-zinc-600 hover:text-amber-400 focus:outline-none"
          >
            <Star
              className={`h-3 w-3 ${
                item.isBookmarked
                  ? "fill-amber-400 text-amber-400"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
            />
          </button>
          <div className="flex flex-col truncate leading-tight">
            <div className="flex items-center gap-1 truncate">
              <span className="truncate text-xs text-zinc-200">
                {item.koreanName}
              </span>
              {item.warning && (
                <span className="py-0.2 rounded bg-amber-500/20 px-1 text-[9px] text-amber-400">
                  유의
                </span>
              )}
            </div>
            <span className="text-[10px] text-zinc-500">{item.symbol}</span>
          </div>
        </div>

        {/* Col 2: Current Price (3 cols) */}
        <div
          className={`col-span-3 text-right font-mono text-xs ${changeColorClass}`}
        >
          {formatTickerPrice(item.tradePrice)}
        </div>

        {/* Col 3: Change Rate (2 cols) */}
        <div
          className={`col-span-2 text-right font-mono text-[11px] ${changeColorClass}`}
        >
          {formattedRate}
        </div>

        {/* Col 4: 24h Volume (3 cols) */}
        <div className="col-span-3 text-right font-mono text-[11px] text-zinc-400">
          {formatTradeValue(item.accTradePrice24h)}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.item.market === nextProps.item.market &&
      prevProps.item.tradePrice === nextProps.item.tradePrice &&
      prevProps.item.change === nextProps.item.change &&
      prevProps.item.signedChangeRate === nextProps.item.signedChangeRate &&
      prevProps.item.accTradePrice24h === nextProps.item.accTradePrice24h &&
      prevProps.item.isBookmarked === nextProps.item.isBookmarked
    );
  },
);

TickerItemRow.displayName = "TickerItemRow";
