import React from "react";
import { useMarketStore } from "@/stores";
import { Button } from "@/components/ui";

const POPULAR_MARKETS = [
  { symbol: "KRW-BTC", label: "BTC", name: "비트코인" },
  { symbol: "KRW-ETH", label: "ETH", name: "이더리움" },
  { symbol: "KRW-SOL", label: "SOL", name: "솔라나" },
  { symbol: "KRW-XRP", label: "XRP", name: "리플" },
];

export const SymbolSelector: React.FC = React.memo(() => {
  const currentSymbol = useMarketStore((state) => state.currentSymbol);
  const setSymbol = useMarketStore((state) => state.setSymbol);

  return (
    <div
      className="flex items-center gap-1 text-xs"
      role="toolbar"
      aria-label="주요 마켓 선택"
    >
      {POPULAR_MARKETS.map((item) => {
        const isSelected = currentSymbol === item.symbol;
        return (
          <Button
            key={item.symbol}
            variant="tab"
            size="xs"
            isActive={isSelected}
            onClick={() => setSymbol(item.symbol)}
            title={`${item.name} (${item.symbol})`}
            aria-label={item.symbol}
            className="h-6 px-2 font-mono text-[11px]"
          >
            {item.label}
          </Button>
        );
      })}
    </div>
  );
});

SymbolSelector.displayName = "SymbolSelector";
