import { Activity, Radio, Wifi, Zap } from "lucide-react";

export const App = () => {
  return (
    <div className="flex h-screen w-screen select-none flex-col overflow-hidden bg-zinc-950 font-mono text-zinc-100 antialiased">
      {/* Top Header Bar */}
      <header className="flex h-12 w-full items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Zap className="h-5 w-5 fill-emerald-500/20 text-emerald-400" />
            <span className="text-base font-bold tracking-wider text-zinc-100">
              PULSE<span className="text-emerald-400">STREAM</span>
            </span>
          </div>
          <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            v0.1.0-alpha
          </span>
          <div className="mx-1 h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">TARGET:</span>
            <span className="font-semibold text-zinc-200">KRW-BTC</span>
          </div>
        </div>

        {/* Right Status / Telemetry Indicators */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-emerald-400">
            <Wifi className="h-3.5 w-3.5 animate-pulse" />
            <span className="font-medium">WS: READY</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-zinc-400">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>60 FPS</span>
          </div>
        </div>
      </header>

      {/* Main Terminal Grid Placeholder */}
      <main className="grid flex-1 grid-cols-12 gap-1 overflow-hidden bg-zinc-900/20 p-1">
        {/* Left Col: Ticker Watchlist (3 cols) */}
        <section className="col-span-3 flex flex-col rounded border border-zinc-800/80 bg-zinc-950/70 p-3">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2 text-xs font-semibold text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-zinc-500" />
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
              <span className="text-[11px] text-emerald-400">KRW-BTC 1M</span>
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
          <span>Upbit Public Feed: Ready</span>
          <span className="font-medium text-zinc-400">Latency: ~0ms</span>
        </div>
      </footer>
    </div>
  );
};
