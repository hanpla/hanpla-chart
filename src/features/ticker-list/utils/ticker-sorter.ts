import type {
  TickerItem,
  TickerSortField,
  SortDirection,
  TickerFilterTab,
} from "../types/ticker";

/**
 * Filters ticker items by keyword and bookmark tab.
 */
export function filterTickers(
  tickers: TickerItem[],
  keyword: string,
  tab: TickerFilterTab,
  bookmarks: Set<string>,
): TickerItem[] {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return tickers.filter((item) => {
    // 1. Tab check
    if (tab === "bookmarks" && !bookmarks.has(item.market)) {
      return false;
    }

    // 2. Keyword check
    if (!normalizedKeyword) {
      return true;
    }

    return (
      item.koreanName.toLowerCase().includes(normalizedKeyword) ||
      item.englishName.toLowerCase().includes(normalizedKeyword) ||
      item.symbol.toLowerCase().includes(normalizedKeyword) ||
      item.market.toLowerCase().includes(normalizedKeyword)
    );
  });
}

/**
 * Sorts ticker items by specified field and direction.
 */
export function sortTickers(
  tickers: TickerItem[],
  field: TickerSortField,
  direction: SortDirection,
): TickerItem[] {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...tickers].sort((a, b) => {
    if (field === "korean_name") {
      return multiplier * a.koreanName.localeCompare(b.koreanName, "ko");
    }

    if (field === "signed_change_rate") {
      return multiplier * (a.signedChangeRate - b.signedChangeRate);
    }

    if (field === "trade_price") {
      return multiplier * (a.tradePrice - b.tradePrice);
    }

    // Default: acc_trade_price_24h
    return multiplier * (a.accTradePrice24h - b.accTradePrice24h);
  });
}

/**
 * Formats price according to Korean crypto standard formatting.
 */
export function formatTickerPrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) {
    return "-";
  }

  if (price >= 100) {
    return Math.round(price).toLocaleString("ko-KR");
  }
  if (price >= 1) {
    return price.toLocaleString("ko-KR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return price.toLocaleString("ko-KR", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

/**
 * Formats 24h trade value into millions of KRW.
 */
export function formatTradeValue(val: number): string {
  if (!Number.isFinite(val) || val <= 0) {
    return "-";
  }
  const millions = Math.floor(val / 1000000);
  return `${millions.toLocaleString("ko-KR")}백만`;
}
