import React from "react";

export interface HeaderMarketTickerProps {
  symbol: string;
  price: number | null;
  changeRate: number | null;
}

export const HeaderMarketTicker: React.FC<HeaderMarketTickerProps> = React.memo(
  ({ symbol, price, changeRate }) => {
    if (price === null) {
      return null;
    }

    const isRise = changeRate !== null && changeRate > 0;
    const isFall = changeRate !== null && changeRate < 0;

    return (
      <div
        className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-xs"
        aria-live="polite"
      >
        <span className="text-zinc-400">{symbol}:</span>
        <span className="font-bold text-zinc-100">
          {price.toLocaleString()} KRW
        </span>
        {changeRate !== null && (
          <span
            className={
              isRise
                ? "text-emerald-400"
                : isFall
                  ? "text-rose-400"
                  : "text-zinc-400"
            }
          >
            {(changeRate * 100).toFixed(2)}%
          </span>
        )}
      </div>
    );
  },
);

HeaderMarketTicker.displayName = "HeaderMarketTicker";
