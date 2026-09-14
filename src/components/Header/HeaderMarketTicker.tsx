import React from "react";
import { formatTickerPrice } from "@/features/ticker-list/utils/ticker-sorter";

export interface HeaderMarketTickerProps {
  symbol: string;
  koreanName?: string;
  price: number | null;
  changeRate: number | null;
  changePrice?: number | null;
  highPrice?: number | null;
  lowPrice?: number | null;
  accTradePrice24h?: number | null;
}

const MARKET_KOREAN_NAMES: Record<string, string> = {
  "KRW-BTC": "비트코인",
  "KRW-ETH": "이더리움",
  "KRW-SOL": "솔라나",
  "KRW-XRP": "리플",
  "KRW-DOGE": "도지코인",
  "KRW-ADA": "에이다",
  "KRW-AVAX": "아발란체",
  "KRW-DOT": "폴카닷",
  "KRW-LINK": "체인링크",
  "KRW-NEAR": "니어프로토콜",
  "KRW-LSK": "리스크",
  "KRW-CVC": "시빅",
  "KRW-VTHO": "비체인토큰",
  "KRW-STEEM": "스팀",
  "KRW-BSV": "비트코인에스브이",
  "KRW-USDT": "테더",
  "KRW-ARK": "아크",
  "KRW-MTL": "메탈",
};

function format24hValue(val: number | null | undefined): string {
  if (!val || !Number.isFinite(val) || val <= 0) return "-";
  if (val >= 100_000_000) {
    const eok = Math.floor(val / 100_000_000);
    return `${eok.toLocaleString("ko-KR")}억`;
  }
  const millions = Math.floor(val / 1_000_000);
  return `${millions.toLocaleString("ko-KR")}백만`;
}

export const HeaderMarketTicker: React.FC<HeaderMarketTickerProps> = React.memo(
  ({
    symbol,
    koreanName,
    price,
    changeRate,
    changePrice,
    highPrice,
    lowPrice,
    accTradePrice24h,
  }) => {
    if (price === null) {
      return (
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span>시세 수신 대기 중...</span>
        </div>
      );
    }

    const isRise = changeRate !== null && changeRate > 0;
    const isFall = changeRate !== null && changeRate < 0;

    const priceColorClass = isRise
      ? "text-emerald-400"
      : isFall
        ? "text-rose-400"
        : "text-zinc-100";

    const changeBgClass = isRise
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : isFall
        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
        : "bg-zinc-800/40 text-zinc-400 border-zinc-700/30";

    const displayName =
      koreanName || MARKET_KOREAN_NAMES[symbol] || symbol.replace("KRW-", "");
    const baseCode = symbol.replace("KRW-", "");

    return (
      <div
        className="flex select-none items-center gap-3.5 text-xs"
        aria-live="polite"
      >
        {/* Symbol & Name */}
        <div className="flex items-baseline gap-1.5">
          <span className="font-sans text-sm font-bold tracking-tight text-zinc-100">
            {displayName}
          </span>
          <span className="font-mono text-[11px] font-medium text-zinc-500">
            {baseCode}/KRW
          </span>
        </div>

        {/* Current Large Price */}
        <div className="flex items-baseline gap-1 font-mono">
          <span
            className={`text-base font-bold tabular-nums tracking-tight ${priceColorClass}`}
          >
            {formatTickerPrice(price)}
          </span>
          <span className="font-sans text-[10px] text-zinc-500">KRW</span>
        </div>

        {/* Change Rate & Price Badge */}
        <div
          className={`flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${changeBgClass}`}
        >
          <span>{isRise ? "▲" : isFall ? "▼" : ""}</span>
          {changePrice != null && (
            <span>{Math.abs(changePrice).toLocaleString("ko-KR")}</span>
          )}
          {changeRate !== null && (
            <span>({(changeRate * 100).toFixed(2)}%)</span>
          )}
        </div>

        {/* 24H High / Low */}
        <div className="hidden items-center gap-3 border-l border-zinc-800/80 pl-3 font-mono text-[11px] md:flex">
          <div className="flex flex-col leading-tight">
            <span className="font-sans text-[9px] text-zinc-500">
              고가 (24H)
            </span>
            <span className="font-medium tabular-nums text-emerald-400/90">
              {highPrice ? formatTickerPrice(highPrice) : "-"}
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-sans text-[9px] text-zinc-500">
              저가 (24H)
            </span>
            <span className="font-medium tabular-nums text-rose-400/90">
              {lowPrice ? formatTickerPrice(lowPrice) : "-"}
            </span>
          </div>
        </div>

        {/* 24H Trade Volume */}
        <div className="hidden flex-col border-l border-zinc-800/80 pl-3 font-mono text-[11px] leading-tight lg:flex">
          <span className="font-sans text-[9px] text-zinc-500">
            거래대금 (24H)
          </span>
          <span className="font-medium tabular-nums text-zinc-300">
            {format24hValue(accTradePrice24h)}
          </span>
        </div>
      </div>
    );
  },
);

HeaderMarketTicker.displayName = "HeaderMarketTicker";
