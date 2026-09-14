import React, { useState } from "react";
import { Zap } from "lucide-react";
import { useMarketStore } from "@/stores";
import {
  SymbolSelector,
  HeaderRealtimeSection,
  ErrorBoundary,
  Button,
} from "@/components";
import { TickerList } from "@/features/ticker-list";
import { TradingChart } from "@/features/chart";
import { TradeStream } from "@/features/trade-stream";
import { OrderBook } from "@/features/orderbook";

type RightPanelTab = "split" | "orderbook" | "trades";

export const App: React.FC = () => {
  const connectionStatus = useMarketStore((state) => state.connectionStatus);
  const [rightTab, setRightTab] = useState<RightPanelTab>("split");

  return (
    <div className="flex h-screen w-screen select-none flex-col overflow-hidden bg-zinc-950 font-mono text-zinc-100 antialiased">
      {/* Top Header Bar */}
      <header className="flex h-12 w-full items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Zap
              className="h-5 w-5 fill-emerald-500/20 text-emerald-400"
              aria-hidden="true"
            />
            <span className="text-base font-bold tracking-wider text-zinc-100">
              PULSE<span className="text-emerald-400">STREAM</span>
            </span>
          </div>
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
            Phase 3
          </span>
          <div className="mx-1 h-4 w-px bg-zinc-800" aria-hidden="true" />

          {/* Quick Symbol Switcher */}
          <SymbolSelector />
        </div>

        {/* Right Realtime Stream & Telemetry Section (Isolated 60FPS rendering boundary) */}
        <HeaderRealtimeSection />
      </header>

      {/* Main Terminal Grid Layout */}
      <main className="grid flex-1 grid-cols-12 gap-1 overflow-hidden bg-zinc-900/20 p-1">
        {/* Left Col: Ticker Watchlist (3 cols) */}
        <section className="col-span-3 flex flex-col overflow-hidden rounded border border-zinc-800/80 bg-zinc-950/70">
          <ErrorBoundary fallbackTitle="종목 감시창 오류">
            <TickerList />
          </ErrorBoundary>
        </section>

        {/* Center Col: Lightweight Canvas Candlestick Chart (6 cols) */}
        <section className="col-span-6 flex flex-col overflow-hidden rounded border border-zinc-800/80 bg-zinc-950/70">
          <ErrorBoundary fallbackTitle="Canvas 차트 엔진 오류">
            <TradingChart />
          </ErrorBoundary>
        </section>

        {/* Right Col: 50-Depth Orderbook & Realtime Trades (3 cols) */}
        <section className="col-span-3 flex flex-col overflow-hidden rounded border border-zinc-800/80 bg-zinc-950/70">
          {/* Panel Tab Switcher */}
          <div className="flex h-7 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/80 px-2 text-[10px]">
            <span className="font-semibold text-zinc-400">
              MARKET DEPTH & FEED
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="tab"
                size="xs"
                isActive={rightTab === "split"}
                onClick={() => setRightTab("split")}
                className={`h-5 px-1.5 py-0 text-[10px] ${
                  rightTab === "split"
                    ? "text-emerald-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                동시분할
              </Button>
              <Button
                variant="tab"
                size="xs"
                isActive={rightTab === "orderbook"}
                onClick={() => setRightTab("orderbook")}
                className={`h-5 px-1.5 py-0 text-[10px] ${
                  rightTab === "orderbook"
                    ? "text-emerald-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                호가
              </Button>
              <Button
                variant="tab"
                size="xs"
                isActive={rightTab === "trades"}
                onClick={() => setRightTab("trades")}
                className={`h-5 px-1.5 py-0 text-[10px] ${
                  rightTab === "trades"
                    ? "text-emerald-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                체결
              </Button>
            </div>
          </div>

          {/* Dynamic Content Views */}
          {rightTab === "split" ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex h-[56%] flex-col overflow-hidden border-b border-zinc-800/80">
                <ErrorBoundary fallbackTitle="50단계 호가창 오류">
                  <OrderBook />
                </ErrorBoundary>
              </div>
              <div className="flex h-[44%] flex-col overflow-hidden">
                <ErrorBoundary fallbackTitle="실시간 체결창 오류">
                  <TradeStream />
                </ErrorBoundary>
              </div>
            </div>
          ) : rightTab === "orderbook" ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <ErrorBoundary fallbackTitle="50단계 호가창 오류">
                <OrderBook />
              </ErrorBoundary>
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden">
              <ErrorBoundary fallbackTitle="실시간 체결창 오류">
                <TradeStream />
              </ErrorBoundary>
            </div>
          )}
        </section>
      </main>

      {/* Bottom Status Bar */}
      <footer className="flex h-7 w-full items-center justify-between border-t border-zinc-800/80 bg-zinc-900/90 px-3 text-[11px] text-zinc-500">
        <div className="flex items-center gap-3">
          <span>Engine: Vite + React 19 Strict</span>
          <span>Chart: Lightweight Charts (Canvas)</span>
          <span>Pipeline: RingBuffer + RAFScheduler (60FPS)</span>
          <span>Worker: SMA / Bollinger Bands</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Upbit Public Feed: {connectionStatus}</span>
          <span className="font-medium text-zinc-400">
            Batch Interval: 16.6ms (60FPS)
          </span>
        </div>
      </footer>
    </div>
  );
};
