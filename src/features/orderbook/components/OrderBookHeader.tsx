import React from "react";
import { Crosshair } from "lucide-react";
import { formatOrderbookSize } from "../utils/orderbook-math";

export interface OrderBookHeaderProps {
  symbol: string;
  totalAskSize: number;
  totalBidSize: number;
  onCenter: () => void;
}

export const OrderBookHeader: React.FC<OrderBookHeaderProps> = React.memo(
  ({ symbol, totalAskSize, totalBidSize, onCenter }) => {
    return (
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 text-xs font-semibold text-zinc-400">
        <div className="flex items-center gap-2 font-mono">
          <span>50-DEPTH ORDERBOOK</span>
          <span className="text-[11px] text-zinc-500">{symbol}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Total Ask / Bid Balance indicator */}
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="text-rose-400">
              {formatOrderbookSize(totalAskSize)}
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-emerald-400">
              {formatOrderbookSize(totalBidSize)}
            </span>
          </div>

          {/* Auto-Centering Button */}
          <button
            type="button"
            onClick={onCenter}
            title="현재가 중앙 정렬"
            aria-label="현재가 중앙 정렬"
            className="flex items-center gap-1 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Crosshair className="h-3 w-3 text-emerald-400" />
            <span>중앙</span>
          </button>
        </div>
      </div>
    );
  },
);

OrderBookHeader.displayName = "OrderBookHeader";
