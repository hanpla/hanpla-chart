import React from "react";
import { Search, Star, ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react";
import { Button, Input } from "@/components/ui";
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
            <Button
              variant="tab"
              size="xs"
              isActive={tab === "all"}
              onClick={() => onTabChange("all")}
            >
              전체
            </Button>
            <Button
              variant="tab"
              size="xs"
              isActive={tab === "bookmarks"}
              onClick={() => onTabChange("bookmarks")}
              className={
                tab === "bookmarks"
                  ? "text-amber-400"
                  : "hover:text-amber-400/80"
              }
            >
              <Star className="mr-1 h-3 w-3 fill-current" />
              관심
            </Button>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            {filteredCount} / {totalCount}
          </span>
        </div>

        {/* Search Input */}
        <Input
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="코인명 / 심볼 검색 (예: BTC, 비트)"
          leftElement={<Search className="h-3.5 w-3.5 text-zinc-500" />}
          rightElement={
            keyword ? (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onKeywordChange("")}
                aria-label="검색어 지우기"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            ) : null
          }
        />

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
