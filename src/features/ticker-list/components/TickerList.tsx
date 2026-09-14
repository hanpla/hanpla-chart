import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMarketStore } from "@/stores";
import { useTickerList } from "../hooks/useTickerList";
import { TickerHeader } from "./TickerHeader";
import { TickerItemRow } from "./TickerItemRow";

const ROW_HEIGHT = 44;

export const TickerList: React.FC = () => {
  const currentSymbol = useMarketStore((state) => state.currentSymbol);
  const setSymbol = useMarketStore((state) => state.setSymbol);

  const {
    tickers,
    totalCount,
    isLoading,
    keyword,
    setKeyword,
    tab,
    setTab,
    sortField,
    sortDirection,
    handleSort,
    toggleBookmark,
  } = useTickerList();

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: tickers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5, // Maintains visible items + 5 padding -> strictly < 30 DOM nodes
  });

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-zinc-950/60 p-2.5">
      {/* Header with Search, Tabs, and Sort controls */}
      <TickerHeader
        keyword={keyword}
        onKeywordChange={setKeyword}
        tab={tab}
        onTabChange={setTab}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        totalCount={totalCount}
        filteredCount={tickers.length}
      />

      {/* Virtualized List Container */}
      <div
        ref={parentRef}
        className="relative flex-1 overflow-y-auto overflow-x-hidden pt-1"
      >
        {isLoading && tickers.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-xs text-zinc-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <span>마켓 데이터 수신 중...</span>
          </div>
        ) : tickers.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-xs text-zinc-500">
            {tab === "bookmarks"
              ? "즐겨찾기한 종목이 없습니다."
              : "검색 결과가 없습니다."}
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
              const item = tickers[virtualRow.index];
              if (!item) return null;

              return (
                <TickerItemRow
                  key={item.market}
                  item={item}
                  isSelected={currentSymbol === item.market}
                  onSelect={setSymbol}
                  onToggleBookmark={toggleBookmark}
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

TickerList.displayName = "TickerList";
