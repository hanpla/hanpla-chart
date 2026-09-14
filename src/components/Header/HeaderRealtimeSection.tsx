import React, { useState, useCallback, useRef, useEffect } from "react";
import { Activity, X } from "lucide-react";
import { useMarketStore } from "@/stores";
import { useWebSocketStream } from "@/services/websocket";
import { isUpbitTicker } from "@/types/websocket";
import type { UpbitWebSocketMessage } from "@/types/websocket";
import { fetchMarketTickers } from "@/services/api";
import { PerformanceHud } from "@/components/PerformanceHud";
import { HeaderConnectionBadge } from "./HeaderConnectionBadge";
import { HeaderMarketTicker } from "./HeaderMarketTicker";
import { HeaderTelemetry } from "./HeaderTelemetry";

interface DetailedTickerData {
  price: number | null;
  changeRate: number | null;
  changePrice: number | null;
  highPrice: number | null;
  lowPrice: number | null;
  accTradePrice24h: number | null;
}

export const HeaderRealtimeSection: React.FC = React.memo(() => {
  const currentSymbol = useMarketStore((state) => state.currentSymbol);

  const [tickerData, setTickerData] = useState<DetailedTickerData>({
    price: null,
    changeRate: null,
    changePrice: null,
    highPrice: null,
    lowPrice: null,
    accTradePrice24h: null,
  });

  const [ticksCount, setTicksCount] = useState<number>(0);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);

  const ticksCountRef = useRef<number>(0);
  const lastTelemetryThrottleRef = useRef<number>(0);

  // 1. Initial REST ticker fetch on symbol change
  useEffect(() => {
    let isCancelled = false;

    async function loadTicker() {
      try {
        const tickers = await fetchMarketTickers([currentSymbol]);
        const initial = tickers[0];
        if (initial && !isCancelled) {
          setTickerData({
            price: initial.trade_price,
            changeRate: initial.signed_change_rate,
            changePrice: initial.signed_change_price,
            highPrice: initial.high_price,
            lowPrice: initial.low_price,
            accTradePrice24h: initial.acc_trade_price_24h,
          });
        }
      } catch (err) {
        console.warn("Failed to load initial header ticker:", err);
      }
    }

    loadTicker();

    return () => {
      isCancelled = true;
    };
  }, [currentSymbol]);

  // 2. Real-time stream processing
  const handleBatch = useCallback(
    (batch: UpbitWebSocketMessage[]) => {
      ticksCountRef.current += batch.length;

      // Scan batch from latest to oldest for the current symbol's ticker
      for (let i = batch.length - 1; i >= 0; i--) {
        const msg = batch[i];
        if (msg && isUpbitTicker(msg) && msg.code === currentSymbol) {
          setTickerData({
            price: msg.trade_price,
            changeRate: msg.signed_change_rate,
            changePrice: msg.signed_change_price,
            highPrice: msg.high_price,
            lowPrice: msg.low_price,
            accTradePrice24h: msg.acc_trade_price_24h,
          });
          break;
        }
      }

      // Throttle telemetry & HUD ticks updates to 250ms (4Hz)
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now - lastTelemetryThrottleRef.current >= 250) {
        lastTelemetryThrottleRef.current = now;
        setTicksCount(ticksCountRef.current);
      }
    },
    [currentSymbol],
  );

  useWebSocketStream({
    onBatch: handleBatch,
  });

  return (
    <div className="flex items-center gap-3">
      {/* Comprehensive Realtime Market Ticker Bar */}
      <HeaderMarketTicker
        symbol={currentSymbol}
        price={tickerData.price}
        changeRate={tickerData.changeRate}
        changePrice={tickerData.changePrice}
        highPrice={tickerData.highPrice}
        lowPrice={tickerData.lowPrice}
        accTradePrice24h={tickerData.accTradePrice24h}
      />

      <div className="h-4 w-px bg-zinc-800" aria-hidden="true" />

      {/* Clean Live Connection Badge */}
      <HeaderConnectionBadge />

      {/* Diagnostics / Engineering Metrics (Accessible via popover, not cluttering main UI) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDiagnosticsOpen((prev) => !prev)}
          title="엔진 실시간 진단 (FPS / 지연시간)"
          className={`flex h-7 w-7 items-center justify-center rounded border transition-colors ${
            isDiagnosticsOpen
              ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
              : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          }`}
          aria-label="엔진 성능 진단 팝오버 토글"
        >
          <Activity className="h-3.5 w-3.5" />
        </button>

        {/* Diagnostics Popover Menu */}
        {isDiagnosticsOpen && (
          <div className="absolute right-0 top-9 z-50 flex w-72 flex-col gap-2.5 rounded-lg border border-zinc-800 bg-zinc-950 p-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-mono text-xs font-semibold text-zinc-200">
                실시간 엔진 텔레메트리
              </span>
              <button
                type="button"
                onClick={() => setIsDiagnosticsOpen(false)}
                aria-label="진단 닫기"
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
                <span>누적 틱 스트림:</span>
                <HeaderTelemetry ticksCount={ticksCount} />
              </div>
              <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
                <span>렌더링 프레임 / 지연:</span>
                <PerformanceHud totalTicks={ticksCount} />
              </div>
            </div>

            <div className="rounded bg-zinc-900/70 p-1.5 font-mono text-[10px] text-zinc-500">
              * RAF 60FPS 스케줄러 & Web Worker 듀얼 파이프라인 모니터링
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

HeaderRealtimeSection.displayName = "HeaderRealtimeSection";
