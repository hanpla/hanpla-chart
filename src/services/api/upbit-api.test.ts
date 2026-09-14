import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchKrwMarkets,
  fetchMarketTickers,
  fetchMinuteCandles,
  fetchRecentTrades,
  fetchOrderbook,
  UpbitApiError,
} from "./upbit-api";

describe("upbit-api client", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("fetchKrwMarkets filters for only KRW markets", async () => {
    const mockData = [
      { market: "KRW-BTC", korean_name: "비트코인", english_name: "Bitcoin" },
      { market: "BTC-ETH", korean_name: "이더리움", english_name: "Ethereum" },
      { market: "KRW-ETH", korean_name: "이더리움", english_name: "Ethereum" },
      { market: "USDT-SOL", korean_name: "솔라나", english_name: "Solana" },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as unknown as Response);

    const result = await fetchKrwMarkets();
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.market)).toEqual(["KRW-BTC", "KRW-ETH"]);
  });

  it("fetchMarketTickers handles empty list without network call", async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const result = await fetchMarketTickers([]);
    expect(result).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetchMarketTickers queries joined market codes", async () => {
    const mockTickers = [
      { market: "KRW-BTC", trade_price: 100000000 },
      { market: "KRW-ETH", trade_price: 4000000 },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTickers,
    } as unknown as Response);

    const result = await fetchMarketTickers(["KRW-BTC", "KRW-ETH"]);
    expect(result).toEqual(mockTickers);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.upbit.com/v1/ticker?markets=KRW-BTC,KRW-ETH",
      expect.objectContaining({ headers: expect.anything() }),
    );
  });

  it("fetchMinuteCandles constructs correct query parameters", async () => {
    const mockCandles = [
      {
        market: "KRW-BTC",
        opening_price: 100,
        trade_price: 105,
        timestamp: 1000,
      },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCandles,
    } as unknown as Response);

    const result = await fetchMinuteCandles("KRW-BTC", 5, 50);
    expect(result).toEqual(mockCandles);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.upbit.com/v1/candles/minutes/5?market=KRW-BTC&count=50",
      expect.objectContaining({ headers: expect.anything() }),
    );
  });

  it("fetchOrderbook returns first element or null", async () => {
    const mockBook = {
      market: "KRW-BTC",
      total_ask_size: 10,
      total_bid_size: 15,
      orderbook_units: [],
      timestamp: 12345,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [mockBook],
    } as unknown as Response);

    const result = await fetchOrderbook("KRW-BTC");
    expect(result).toEqual(mockBook);

    // When empty
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as unknown as Response);

    const emptyResult = await fetchOrderbook("KRW-BTC");
    expect(emptyResult).toBeNull();
  });

  it("fetchRecentTrades retrieves trade tick records", async () => {
    const mockTrades = [
      {
        market: "KRW-BTC",
        trade_price: 100,
        trade_volume: 0.5,
        ask_bid: "BID",
        sequential_id: 1,
      },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTrades,
    } as unknown as Response);

    const result = await fetchRecentTrades("KRW-BTC", 10);
    expect(result).toEqual(mockTrades);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.upbit.com/v1/trades/ticks?market=KRW-BTC&count=10",
      expect.objectContaining({ headers: expect.anything() }),
    );
  });

  it("throws UpbitApiError on non-ok HTTP response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
    } as unknown as Response);

    await expect(fetchKrwMarkets()).rejects.toThrow(UpbitApiError);
  });
});
