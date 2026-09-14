import React from "react";
import { Button } from "@/components/ui";
import { formatTickerPrice } from "@/features/ticker-list/utils/ticker-sorter";
import { TimeframeSelector } from "./TimeframeSelector";
import type {
  ChartTimeframe,
  ChartOHLV,
  ActiveIndicators,
  IndicatorKey,
} from "../types/chart";

export interface ChartHeaderProps {
  symbol: string;
  timeframe: ChartTimeframe;
  onTimeframeChange: (timeframe: ChartTimeframe) => void;
  ohlv: ChartOHLV | null;
  isLoading: boolean;
  activeIndicators: ActiveIndicators;
  onToggleIndicator: (key: IndicatorKey) => void;
  indicatorExecutionTimeMs?: number;
  isCalculatingIndicators?: boolean;
}

export const ChartHeader: React.FC<ChartHeaderProps> = React.memo(
  ({
    symbol,
    timeframe,
    onTimeframeChange,
    ohlv,
    isLoading,
    activeIndicators,
    onToggleIndicator,
    indicatorExecutionTimeMs: _indicatorExecutionTimeMs,
    isCalculatingIndicators: _isCalculatingIndicators,
  }) => {
    const isUp = ohlv ? ohlv.close >= ohlv.open : true;
    const colorClass = isUp ? "text-emerald-400" : "text-rose-400";

    return (
      <div className="flex select-none flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-sm font-bold tracking-tight text-zinc-100">
              {symbol}
            </span>
          </div>

          <TimeframeSelector
            selected={timeframe}
            onChange={onTimeframeChange}
          />

          <div className="h-3.5 w-px bg-zinc-800" aria-hidden="true" />

          {/* Indicator Toggles with Line Color Dots */}
          <div className="flex items-center gap-1 rounded border border-zinc-800/60 bg-zinc-900/90 p-0.5 font-mono text-[11px]">
            <Button
              variant="tab"
              size="xs"
              isActive={activeIndicators.sma20}
              onClick={() => onToggleIndicator("sma20")}
              className={`h-5 gap-1 px-1.5 py-0 text-[10px] ${
                activeIndicators.sma20
                  ? "font-semibold text-yellow-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
              <span>SMA 20</span>
            </Button>
            <Button
              variant="tab"
              size="xs"
              isActive={activeIndicators.sma60}
              onClick={() => onToggleIndicator("sma60")}
              className={`h-5 gap-1 px-1.5 py-0 text-[10px] ${
                activeIndicators.sma60
                  ? "font-semibold text-purple-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              <span>SMA 60</span>
            </Button>
            <Button
              variant="tab"
              size="xs"
              isActive={activeIndicators.sma120}
              onClick={() => onToggleIndicator("sma120")}
              className={`h-5 gap-1 px-1.5 py-0 text-[10px] ${
                activeIndicators.sma120
                  ? "font-semibold text-sky-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>SMA 120</span>
            </Button>
            <Button
              variant="tab"
              size="xs"
              isActive={activeIndicators.bollinger}
              onClick={() => onToggleIndicator("bollinger")}
              className={`h-5 gap-1 px-1.5 py-0 text-[10px] ${
                activeIndicators.bollinger
                  ? "font-semibold text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>BB 20</span>
            </Button>
          </div>
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
