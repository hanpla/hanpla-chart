import React from "react";
import { Cpu } from "lucide-react";
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
    indicatorExecutionTimeMs,
    isCalculatingIndicators,
  }) => {
    const isUp = ohlv ? ohlv.close >= ohlv.open : true;
    const colorClass = isUp ? "text-emerald-400" : "text-rose-400";

    return (
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
        <div className="flex flex-wrap items-center gap-2.5">
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

          <div className="h-3.5 w-px bg-zinc-800" aria-hidden="true" />

          {/* Indicator Toggles */}
          <div className="flex items-center gap-1 rounded bg-zinc-900 p-0.5 font-mono text-[11px]">
            <Button
              variant="tab"
              size="xs"
              isActive={activeIndicators.sma20}
              onClick={() => onToggleIndicator("sma20")}
              className={`h-5 px-1.5 py-0 text-[10px] ${
                activeIndicators.sma20
                  ? "font-semibold text-yellow-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              SMA 20
            </Button>
            <Button
              variant="tab"
              size="xs"
              isActive={activeIndicators.sma60}
              onClick={() => onToggleIndicator("sma60")}
              className={`h-5 px-1.5 py-0 text-[10px] ${
                activeIndicators.sma60
                  ? "font-semibold text-purple-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              SMA 60
            </Button>
            <Button
              variant="tab"
              size="xs"
              isActive={activeIndicators.sma120}
              onClick={() => onToggleIndicator("sma120")}
              className={`h-5 px-1.5 py-0 text-[10px] ${
                activeIndicators.sma120
                  ? "font-semibold text-sky-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              SMA 120
            </Button>
            <Button
              variant="tab"
              size="xs"
              isActive={activeIndicators.bollinger}
              onClick={() => onToggleIndicator("bollinger")}
              className={`h-5 px-1.5 py-0 text-[10px] ${
                activeIndicators.bollinger
                  ? "font-semibold text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              BB 20
            </Button>
          </div>

          {/* Worker Telemetry Indicator */}
          {indicatorExecutionTimeMs !== undefined &&
            indicatorExecutionTimeMs > 0 && (
              <div
                className="flex items-center gap-1 rounded border border-zinc-800/80 bg-zinc-900/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
                title="Web Worker 지표 계산 소요 시간"
              >
                <Cpu
                  className={`h-3 w-3 ${
                    isCalculatingIndicators
                      ? "animate-pulse text-yellow-400"
                      : "text-emerald-400"
                  }`}
                />
                <span>Worker: {indicatorExecutionTimeMs.toFixed(1)}ms</span>
              </div>
            )}
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
