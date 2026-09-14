import type {
  UpbitMarketInfo,
  UpbitRestTicker,
  UpbitRestCandle,
  UpbitRestTrade,
  UpbitRestOrderbook,
} from "./types";

const BASE_URL = "https://api.upbit.com/v1";

/**
 * Custom error class for Upbit API requests.
 */
export class UpbitApiError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(`UpbitApiError [${status}]: ${message}`);
    this.name = "UpbitApiError";
    this.status = status;
  }
}

async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new UpbitApiError(
      `Failed to fetch ${endpoint} (${response.statusText})`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

/**
 * Fetches all markets and returns only KRW-denominated markets.
 */
export async function fetchKrwMarkets(): Promise<UpbitMarketInfo[]> {
  const allMarkets = await request<UpbitMarketInfo[]>(
    "/market/all?isDetails=true",
  );
  return allMarkets.filter((item) => item.market.startsWith("KRW-"));
}

/**
 * Fetches current ticker info for a list of market codes.
 * Accepts up to ~100-300 markets per request.
 */
export async function fetchMarketTickers(
  markets: string[],
): Promise<UpbitRestTicker[]> {
  if (markets.length === 0) {
    return [];
  }
  const joined = markets.join(",");
  return request<UpbitRestTicker[]>(`/ticker?markets=${joined}`);
}

/**
 * Fetches minute candle data for a given market.
 * @param market Market code (e.g. KRW-BTC)
 * @param unit Minute candle unit (1, 3, 5, 10, 15, 30, 60, 240)
 * @param count Number of candles to return (up to 200)
 * @param to Optional end time ISO string
 */
export async function fetchMinuteCandles(
  market: string,
  unit: number = 1,
  count: number = 200,
  to?: string,
): Promise<UpbitRestCandle[]> {
  const query = new URLSearchParams({
    market,
    count: Math.min(count, 200).toString(),
  });
  if (to) {
    query.set("to", to);
  }
  return request<UpbitRestCandle[]>(
    `/candles/minutes/${unit}?${query.toString()}`,
  );
}

/**
 * Fetches recent trade tick records for a market.
 * @param market Market code (e.g. KRW-BTC)
 * @param count Number of trades to return (up to 200)
 */
export async function fetchRecentTrades(
  market: string,
  count: number = 50,
): Promise<UpbitRestTrade[]> {
  const query = new URLSearchParams({
    market,
    count: Math.min(count, 200).toString(),
  });
  return request<UpbitRestTrade[]>(`/trades/ticks?${query.toString()}`);
}

/**
 * Fetches current orderbook snapshot for a market.
 */
export async function fetchOrderbook(
  market: string,
): Promise<UpbitRestOrderbook | null> {
  const results = await request<UpbitRestOrderbook[]>(
    `/orderbook?markets=${market}`,
  );
  return results[0] ?? null;
}
