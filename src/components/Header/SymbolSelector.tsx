import React from "react";
import { useMarketStore } from "@/stores";

const POPULAR_MARKETS = ["KRW-BTC", "KRW-ETH", "KRW-SOL", "KRW-XRP"];

export const SymbolSelector: React.FC = React.memo(() => {
  const currentSymbol = useMarketStore((state) => state.currentSymbol);
  const setSymbol = useMarketStore((state) => state.setSymbol);

  return (
    <div
      className="flex items-center gap-1.5 text-xs"
      role="toolbar"
      aria-label="주요 마켓 선택"
    >
      {POPULAR_MARKETS.map((symbol) => {
        const isSelected = currentSymbol === symbol;
        return (
          <button
            key={symbol}
            type="button"
            aria-pressed={isSelected}
            onClick={() => setSymbol(symbol)}
            className={`rounded px-2 py-1 font-mono transition-colors ${
              isSelected
                ? "border border-zinc-700 bg-zinc-800 font-semibold text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
          >
            {symbol}
          </button>
        );
      })}
    </div>
  );
});

SymbolSelector.displayName = "SymbolSelector";
