import React from "react";
import { formatTickerPrice } from "@/features/ticker-list/utils/ticker-sorter";
import { TimeframeSelector } from "./TimeframeSelector";
import type { ChartTimeframe, ChartOHLV } from "../types/chart";

export interface ChartHeaderProps {
  symbol: string;
  timeframe: ChartTimeframe;
  onTimeframeChange: (timeframe: ChartTimeframe) => void;
  ohlv: ChartOHLV | null;
  isLoading: boolean;
}

export const ChartHeader: React.FC<ChartHeaderProps> = React.memo(
  ({ symbol, timeframe, onTimeframeChange, ohlv, isLoading }) => {
    const isUp = ohlv ? ohlv.close >= ohlv.open : true;
    const colorClass = isUp ? "text-emerald-400" : "text-rose-400";

    return (
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-sm font-bold tracking-tight text-zinc-100">
              {symbol}
            </span>
            <span className="font-mono text-[11px] text-zinc-400">
              Canvas Engine
            </span>
          </div>

          <TimeframeSelector
            selected={timeframe}
            onChange={onTimeframeChange}
          />
        </div>

        {/* Live OHLV Indicators */}
        <div className="flex items-center gap-2.5 font-mono text-[11px] text-zinc-400">
          {isLoading && !ohlv ? (
            <span className="text-zinc-500">차트 로딩 중...</span>
          ) : ohlv ? (
            <>
              <div>
                <span className="mr-1 text-zinc-500">시</span>
                <span>{formatTickerPrice(ohlv.open)}</span>
              </div>
              <div>
                <span className="mr-1 text-zinc-500">고</span>
                <span className="text-emerald-400">
                  {formatTickerPrice(ohlv.high)}
                </span>
              </div>
              <div>
                <span className="mr-1 text-zinc-500">저</span>
                <span className="text-rose-400">
                  {formatTickerPrice(ohlv.low)}
                </span>
              </div>
              <div>
                <span className="mr-1 text-zinc-500">종</span>
                <span className={colorClass}>
                  {formatTickerPrice(ohlv.close)}
                </span>
              </div>
              <div>
                <span className="mr-1 text-zinc-500">량</span>
                <span className="text-zinc-300">
                  {ohlv.volume >= 1
                    ? ohlv.volume.toFixed(2)
                    : ohlv.volume.toFixed(4)}
                </span>
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  },
);

ChartHeader.displayName = "ChartHeader";
