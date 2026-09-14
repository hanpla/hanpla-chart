import React from "react";
import { Radio, Zap } from "lucide-react";
import { useMarketStore } from "@/stores";
import { SymbolSelector, HeaderRealtimeSection } from "@/components";

export const App: React.FC = () => {
  const currentSymbol = useMarketStore((state) => state.currentSymbol);
  const connectionStatus = useMarketStore((state) => state.connectionStatus);

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
          <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            Phase 1
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
        <section className="col-span-3 flex flex-col rounded border border-zinc-800/80 bg-zinc-950/70 p-3">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2 text-xs font-semibold text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
              MARKETS
            </span>
            <span className="text-[11px] text-zinc-500">KRW</span>
          </div>
          <div className="flex flex-1 items-center justify-center text-xs text-zinc-600">
            Ticker Watchlist Module (Phase 2)
          </div>
        </section>

        {/* Center Col: Lightweight Chart & Orderbook (6 cols) */}
        <section className="col-span-6 flex flex-col gap-1">
          {/* Chart Panel */}
          <div className="flex flex-1 flex-col rounded border border-zinc-800/80 bg-zinc-950/70 p-3">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2 text-xs font-semibold text-zinc-400">
              <span>CANVAS CHART (TradingView Engine)</span>
              <span className="text-[11px] text-emerald-400">
                {currentSymbol} 1M
              </span>
            </div>
            <div className="flex flex-1 items-center justify-center text-xs text-zinc-600">
              Lightweight Charts Integration (Phase 2)
            </div>
          </div>
          {/* Orderbook Panel */}
          <div className="flex h-44 flex-col rounded border border-zinc-800/80 bg-zinc-950/70 p-3">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2 text-xs font-semibold text-zinc-400">
              <span>50-DEPTH ORDERBOOK</span>
              <span className="text-[11px] text-zinc-500">Auto-Centering</span>
            </div>
            <div className="flex flex-1 items-center justify-center text-xs text-zinc-600">
              50-Depth Visualizer Module (Phase 2)
            </div>
          </div>
        </section>

        {/* Right Col: Trade Stream (3 cols) */}
        <section className="col-span-3 flex flex-col rounded border border-zinc-800/80 bg-zinc-950/70 p-3">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2 text-xs font-semibold text-zinc-400">
            <span>REALTIME TRADES</span>
            <span className="text-[11px] text-zinc-500">Virtual DOM</span>
          </div>
          <div className="flex flex-1 items-center justify-center text-xs text-zinc-600">
            Trade Stream Module (Phase 2)
          </div>
        </section>
      </main>

      {/* Bottom Status Bar */}
      <footer className="flex h-7 w-full items-center justify-between border-t border-zinc-800/80 bg-zinc-900/90 px-3 text-[11px] text-zinc-500">
        <div className="flex items-center gap-3">
          <span>Engine: Vite + React 19 Strict</span>
          <span>Pipeline: RingBuffer + RAFScheduler</span>
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
