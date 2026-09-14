import React from "react";
import { Crosshair } from "lucide-react";
import { Button } from "@/components/ui";
import { formatOrderbookSize } from "../utils/orderbook-math";

export interface OrderBookHeaderProps {
  symbol: string;
  totalAskSize: number;
  totalBidSize: number;
  onCenter: () => void;
}

export const OrderBookHeader: React.FC<OrderBookHeaderProps> = React.memo(
  ({ symbol, totalAskSize, totalBidSize, onCenter }) => {
    const total = totalAskSize + totalBidSize;
    const askRatio = total > 0 ? (totalAskSize / total) * 100 : 50;
    const bidRatio = total > 0 ? (totalBidSize / total) * 100 : 50;

    return (
      <div className="flex select-none flex-col gap-1.5 border-b border-zinc-800/80 pb-2">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-sans font-medium text-zinc-200">호가</span>
            <span className="text-[10px] font-normal text-zinc-500">
              50-DEPTH ORDERBOOK
            </span>
            <span className="text-[11px] font-semibold text-zinc-400">
              {symbol}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Total Ask / Bid Balance indicator */}
            <div className="flex items-center gap-1.5 font-mono text-[10px] tabular-nums">
              <span className="text-rose-400">
                {formatOrderbookSize(totalAskSize)}
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-emerald-400">
                {formatOrderbookSize(totalBidSize)}
              </span>
            </div>

            {/* Auto-Centering Button */}
            <Button
              variant="ghost"
              size="xs"
              onClick={onCenter}
              title="현재가 중앙 정렬"
              aria-label="현재가 중앙 정렬"
              className="h-5 gap-1 bg-zinc-900 px-1.5 py-0 text-[10px] text-zinc-300 hover:bg-zinc-800"
            >
              <Crosshair className="h-3 w-3 text-emerald-400" />
              <span>중앙</span>
            </Button>
          </div>
        </div>

        {/* Orderbook Imbalance Gauge Bar */}
        <div className="flex flex-col gap-0.5">
          <div className="flex h-1 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-rose-500/70 transition-all duration-150"
              style={{ width: `${askRatio}%` }}
              title={`매도 총잔량 비율: ${askRatio.toFixed(1)}%`}
            />
            <div
              className="h-full bg-emerald-500/70 transition-all duration-150"
              style={{ width: `${bidRatio}%` }}
              title={`매수 총잔량 비율: ${bidRatio.toFixed(1)}%`}
            />
          </div>
          <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500">
            <span className="text-rose-400/80">
              {askRatio.toFixed(1)}% 매도
            </span>
            <span className="text-emerald-400/80">
              {bidRatio.toFixed(1)}% 매수
            </span>
          </div>
        </div>
      </div>
    );
  },
);

OrderBookHeader.displayName = "OrderBookHeader";
