import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchKrwMarkets,
  fetchMarketTickers,
  type UpbitMarketInfo,
  type UpbitRestTicker,
} from "@/services/api";
import { useWebSocketBatch } from "@/services/websocket";
import { isUpbitTicker, type UpbitWebSocketMessage } from "@/types/websocket";
import type {
  TickerItem,
  TickerSortField,
  SortDirection,
  TickerFilterTab,
} from "../types/ticker";
import { filterTickers, sortTickers } from "../utils/ticker-sorter";
import { useTickerBookmarks } from "./useTickerBookmarks";

export function useTickerList() {
  const [keyword, setKeyword] = useState<string>("");
  const [tab, setTab] = useState<TickerFilterTab>("all");
  const [sortField, setSortField] = useState<TickerSortField>(
    "acc_trade_price_24h",
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { bookmarks, toggleBookmark, isBookmarked } = useTickerBookmarks();

  // 1. Fetch KRW market list
  const { data: markets = [], isLoading: isMarketsLoading } = useQuery<
    UpbitMarketInfo[]
  >({
    queryKey: ["markets", "krw"],
    queryFn: fetchKrwMarkets,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  const marketCodes = useMemo(() => markets.map((m) => m.market), [markets]);

  // 2. Fetch initial 24h ticker data for all KRW markets
  const { data: rawTickers = [], isLoading: isTickersLoading } = useQuery<
    UpbitRestTicker[]
  >({
    queryKey: ["tickers", "krw", marketCodes.length],
    queryFn: () => fetchMarketTickers(marketCodes),
    enabled: marketCodes.length > 0,
    staleTime: 1000 * 30, // 30 seconds
  });

  // 3. In-memory map of latest tickers (keyed by market code)
  const [realtimeOverrides, setRealtimeOverrides] = useState<
    Record<string, Partial<TickerItem>>
  >({});

  // 4. Merge incoming WebSocket batches at 60 FPS
  useWebSocketBatch(
    useCallback((batch: UpbitWebSocketMessage[]) => {
      let hasUpdates = false;
      const updates: Record<string, Partial<TickerItem>> = {};

      for (let i = 0; i < batch.length; i++) {
        const msg = batch[i];
        if (msg && isUpbitTicker(msg)) {
          hasUpdates = true;
          updates[msg.code] = {
            tradePrice: msg.trade_price,
            change: msg.change,
            signedChangeRate: msg.signed_change_rate,
            signedChangePrice: msg.signed_change_price,
            accTradePrice24h: msg.acc_trade_price_24h,
            accTradeVolume24h: msg.acc_trade_volume_24h,
            highPrice: msg.high_price,
            lowPrice: msg.low_price,
          };
        }
      }

      if (hasUpdates) {
        setRealtimeOverrides((prev) => ({
          ...prev,
          ...updates,
        }));
      }
    }, []),
  );

  // 5. Build base TickerItem array
  const allTickers = useMemo<TickerItem[]>(() => {
    const marketMap = new Map(markets.map((m) => [m.market, m]));

    return rawTickers.map((ticker) => {
      const marketInfo = marketMap.get(ticker.market);
      const override = realtimeOverrides[ticker.market];

      const tradePrice = override?.tradePrice ?? ticker.trade_price;
      const change = override?.change ?? ticker.change;
      const signedChangeRate =
        override?.signedChangeRate ?? ticker.signed_change_rate;
      const signedChangePrice =
        override?.signedChangePrice ?? ticker.signed_change_price;
      const accTradePrice24h =
        override?.accTradePrice24h ?? ticker.acc_trade_price_24h;
      const accTradeVolume24h =
        override?.accTradeVolume24h ?? ticker.acc_trade_volume_24h;
      const highPrice = override?.highPrice ?? ticker.high_price;
      const lowPrice = override?.lowPrice ?? ticker.low_price;

      return {
        market: ticker.market,
        symbol: ticker.market.replace("KRW-", ""),
        koreanName: marketInfo?.korean_name ?? ticker.market,
        englishName: marketInfo?.english_name ?? ticker.market,
        tradePrice,
        change,
        signedChangeRate,
        signedChangePrice,
        accTradePrice24h,
        accTradeVolume24h,
        highPrice,
        lowPrice,
        isBookmarked: bookmarks.has(ticker.market),
        warning: marketInfo?.market_event?.warning,
      };
    });
  }, [markets, rawTickers, realtimeOverrides, bookmarks]);

  // 6. Filter & sort
  const filteredTickers = useMemo(() => {
    const filtered = filterTickers(allTickers, keyword, tab, bookmarks);
    return sortTickers(filtered, sortField, sortDirection);
  }, [allTickers, keyword, tab, bookmarks, sortField, sortDirection]);

  // Toggle sort field or invert direction
  const handleSort = useCallback(
    (field: TickerSortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("desc"); // Default to desc for newly clicked column
      }
    },
    [sortField],
  );

  return {
    tickers: filteredTickers,
    totalCount: allTickers.length,
    isLoading: isMarketsLoading || isTickersLoading,
    keyword,
    setKeyword,
    tab,
    setTab,
    sortField,
    sortDirection,
    handleSort,
    toggleBookmark,
    isBookmarked,
  };
}
