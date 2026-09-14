import React, { forwardRef } from "react";
import { formatTickerPrice } from "@/features/ticker-list/utils/ticker-sorter";

export interface OrderBookSpreadProps {
  spread: number;
  spreadRate: number;
  bestBidPrice: number;
}

export const OrderBookSpread = React.memo(
  forwardRef<HTMLDivElement, OrderBookSpreadProps>(
    ({ spread, spreadRate, bestBidPrice }, ref) => {
      return (
        <div
          ref={ref}
          className="my-0.5 flex items-center justify-between border-y border-zinc-800/90 bg-zinc-900/80 px-2.5 py-1 font-mono text-[11px]"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-100">
              {formatTickerPrice(bestBidPrice)}
            </span>
            <span className="text-[10px] text-zinc-500">현재가</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <span>스프레드</span>
            <span className="font-medium text-zinc-300">
              {formatTickerPrice(spread)} KRW
            </span>
            <span className="text-zinc-500">({spreadRate.toFixed(2)}%)</span>
          </div>
        </div>
      );
    },
  ),
);

OrderBookSpread.displayName = "OrderBookSpread";
