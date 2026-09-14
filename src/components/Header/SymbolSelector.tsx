import React from "react";
import { useMarketStore } from "@/stores";
import { Button } from "@/components/ui";

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
          <Button
            key={symbol}
            variant="tab"
            size="xs"
            isActive={isSelected}
            onClick={() => setSymbol(symbol)}
            className="font-mono"
          >
            {symbol}
          </Button>
        );
      })}
    </div>
  );
});

SymbolSelector.displayName = "SymbolSelector";
