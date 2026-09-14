import React, { useRef, useCallback, useEffect } from "react";
import { useMarketStore } from "@/stores";
import { useOrderBookData } from "../hooks/useOrderBookData";
import { OrderBookHeader } from "./OrderBookHeader";
import { OrderBookRow } from "./OrderBookRow";
import { OrderBookSpread } from "./OrderBookSpread";

export const OrderBook: React.FC = () => {
  const currentSymbol = useMarketStore((state) => state.currentSymbol);
  const { snapshot, isLoading } = useOrderBookData(currentSymbol);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const midPointRef = useRef<HTMLDivElement | null>(null);
  const initialCenteredRef = useRef<boolean>(false);

  const scrollToCenter = useCallback(() => {
    if (midPointRef.current && containerRef.current) {
      const container = containerRef.current;
      const target = midPointRef.current;
      const targetTop = target.offsetTop;
      const targetHeight = target.offsetHeight;
      const containerHeight = container.clientHeight;

      container.scrollTo({
        top: targetTop - containerHeight / 2 + targetHeight / 2,
        behavior: "smooth",
      });
    }
  }, []);

  // Auto-center on initial snapshot arrival or symbol change
  useEffect(() => {
    if (snapshot && !initialCenteredRef.current) {
      // Small timeout to allow DOM to layout before scrolling
      const timer = setTimeout(() => {
        scrollToCenter();
        initialCenteredRef.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [snapshot, scrollToCenter]);

  useEffect(() => {
    initialCenteredRef.current = false;
  }, [currentSymbol]);

  const bestBidPrice = snapshot?.bids[0]?.price ?? 0;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-zinc-950/70 p-2.5">
      {/* Header */}
      <OrderBookHeader
        symbol={currentSymbol}
        totalAskSize={snapshot?.totalAskSize ?? 0}
        totalBidSize={snapshot?.totalBidSize ?? 0}
        onCenter={scrollToCenter}
      />

      {/* Column Titles */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-2 py-1 font-mono text-[10px] font-semibold text-zinc-500">
        <span>가격 (KRW)</span>
        <div className="flex items-center gap-2">
          <span>잔량</span>
          <span className="w-11 text-right">누적</span>
        </div>
      </div>

      {/* Scrollable Orderbook Container */}
      <div
        ref={containerRef}
        className="relative flex-1 select-none overflow-y-auto overflow-x-hidden pt-1"
      >
        {isLoading && !snapshot ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 font-mono text-xs text-zinc-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <span>호가 데이터 수신 중...</span>
          </div>
        ) : snapshot ? (
          <div className="flex flex-col">
            {/* Asks (매도호가 - 상단 역순 정렬) */}
            <div className="flex flex-col">
              {snapshot.asks.map((level) => (
                <OrderBookRow key={`ask-${level.price}`} item={level} />
              ))}
            </div>

            {/* Mid-point Anchor & Spread Bar */}
            <OrderBookSpread
              ref={midPointRef}
              spread={snapshot.spread}
              spreadRate={snapshot.spreadRate}
              bestBidPrice={bestBidPrice}
            />

            {/* Bids (매수호가 - 하단 정순 정렬) */}
            <div className="flex flex-col">
              {snapshot.bids.map((level) => (
                <OrderBookRow key={`bid-${level.price}`} item={level} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center font-mono text-xs text-zinc-500">
            호가 데이터가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

OrderBook.displayName = "OrderBook";
