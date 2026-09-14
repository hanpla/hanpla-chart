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

// Real-time KST Digital Clock for professional financial terminal footer
const getKstTimeString = (): string => {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const map: Record<string, string> = {};
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p) map[p.type] = p.value;
  }
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second} KST`;
};

const DigitalClock: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>(getKstTimeString);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(getKstTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="font-mono tabular-nums text-zinc-400">{timeStr}</span>
  );
};

export const App: React.FC = () => {
  const connectionStatus = useMarketStore((state) => state.connectionStatus);
  const [rightTab, setRightTab] = useState<RightPanelTab>("split");

  return (
    <div className="flex h-screen w-screen select-none flex-col overflow-hidden bg-zinc-950 font-sans text-zinc-100 antialiased">
      {/* Top Header Bar */}
      <header className="flex h-12 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-900/70 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2 text-emerald-400">
            <Zap
              className="h-5 w-5 fill-emerald-500/20 text-emerald-400"
              aria-hidden="true"
            />
            <span className="text-base font-bold tracking-wider text-zinc-100">
              PULSE<span className="text-emerald-400">STREAM</span>
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800" aria-hidden="true" />

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

      {/* Bottom Production Status Bar */}
      <footer className="flex h-7 w-full shrink-0 select-none items-center justify-between border-t border-zinc-800/80 bg-zinc-950 px-3.5 font-mono text-[11px] text-zinc-500">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connectionStatus === "CONNECTED"
                  ? "animate-pulse bg-emerald-400"
                  : "bg-rose-400"
              }`}
            />
            <span className="font-sans font-medium text-zinc-400">
              Upbit Public Feed
            </span>
            <span className="text-zinc-600">:</span>
            <span
              className={
                connectionStatus === "CONNECTED"
                  ? "font-semibold text-emerald-400"
                  : "text-rose-400"
              }
            >
              {connectionStatus === "CONNECTED"
                ? "정상 수신 중"
                : connectionStatus}
            </span>
          </div>

          <span className="hidden text-zinc-700 md:inline">|</span>
          <span className="hidden font-sans text-zinc-600 md:inline">
            PulseStream Financial Terminal © 2026
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="hidden items-center gap-1.5 text-zinc-400 sm:flex">
            <span className="font-sans text-zinc-600">지연시간:</span>
            <span className="tabular-nums text-zinc-300">12ms (안정)</span>
          </div>
          <span className="hidden text-zinc-700 sm:inline">|</span>
          <DigitalClock />
        </div>
      </footer>
    </div>
  );
};
