import React from "react";
import { Search, Star, ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react";
import type {
  TickerSortField,
  SortDirection,
  TickerFilterTab,
} from "../types/ticker";

export interface TickerHeaderProps {
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  tab: TickerFilterTab;
  onTabChange: (tab: TickerFilterTab) => void;
  sortField: TickerSortField;
  sortDirection: SortDirection;
  onSort: (field: TickerSortField) => void;
  totalCount: number;
  filteredCount: number;
}

export const TickerHeader: React.FC<TickerHeaderProps> = React.memo(
  ({
    keyword,
    onKeywordChange,
    tab,
    onTabChange,
    sortField,
    sortDirection,
    onSort,
    totalCount,
    filteredCount,
  }) => {
    const renderSortIcon = (field: TickerSortField) => {
      if (sortField !== field) {
        return <ArrowUpDown className="h-3 w-3 opacity-40" />;
      }
      return sortDirection === "asc" ? (
        <ArrowUp className="h-3 w-3 text-emerald-400" />
      ) : (
        <ArrowDown className="h-3 w-3 text-rose-400" />
      );
    };

    return (
      <div className="flex flex-col gap-2 border-b border-zinc-800/80 pb-2">
        {/* Top: Tabs & Counts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded bg-zinc-900 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onTabChange("all")}
              className={`rounded px-2.5 py-1 transition-colors ${
                tab === "all"
                  ? "bg-zinc-800 font-semibold text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => onTabChange("bookmarks")}
              className={`flex items-center gap-1 rounded px-2.5 py-1 transition-colors ${
                tab === "bookmarks"
                  ? "bg-zinc-800 font-semibold text-amber-400 shadow-sm"
                  : "text-zinc-400 hover:text-amber-400/80"
              }`}
            >
              <Star className="h-3 w-3 fill-current" />
              관심
            </button>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            {filteredCount} / {totalCount}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="코인명 / 심볼 검색 (예: BTC, 비트)"
            className="h-7 w-full rounded border border-zinc-800 bg-zinc-900/90 pl-8 pr-7 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => onKeywordChange("")}
              className="absolute right-2 text-zinc-500 hover:text-zinc-300"
              aria-label="검색어 지우기"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Column Headers for Sorting */}
        <div className="grid grid-cols-12 items-center px-2 text-[10px] font-semibold text-zinc-500">
          <button
            type="button"
            onClick={() => onSort("korean_name")}
            className="col-span-4 flex items-center gap-1 text-left hover:text-zinc-300"
          >
            <span>자산</span>
            {renderSortIcon("korean_name")}
          </button>
          <button
            type="button"
            onClick={() => onSort("trade_price")}
            className="col-span-3 flex items-center justify-end gap-1 text-right hover:text-zinc-300"
          >
            <span>현재가</span>
            {renderSortIcon("trade_price")}
          </button>
          <button
            type="button"
            onClick={() => onSort("signed_change_rate")}
            className="col-span-2 flex items-center justify-end gap-1 text-right hover:text-zinc-300"
          >
            <span>전일대비</span>
            {renderSortIcon("signed_change_rate")}
          </button>
          <button
            type="button"
            onClick={() => onSort("acc_trade_price_24h")}
            className="col-span-3 flex items-center justify-end gap-1 text-right hover:text-zinc-300"
          >
            <span>거래대금</span>
            {renderSortIcon("acc_trade_price_24h")}
          </button>
        </div>
      </div>
    );
  },
);

TickerHeader.displayName = "TickerHeader";
