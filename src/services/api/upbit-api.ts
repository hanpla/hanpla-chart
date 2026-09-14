import type {
  UpbitMarketInfo,
  UpbitRestTicker,
  UpbitRestCandle,
  UpbitRestTrade,
  UpbitRestOrderbook,
} from "./types";

export const DIRECT_BASE_URL = "https://api.upbit.com/v1";
export const PROXY_BASE_URL = "/api/upbit";

/**
 * Resolves the base URL for Upbit REST requests.
 * - In browser runtime, routes through /api/upbit proxy to eliminate
 *   client-side Origin rate limiting (HTTP 429 Too Many Requests).
 * - In Node.js / Vitest runtime, defaults to DIRECT_BASE_URL (absolute URL).
 */
export function getBaseUrl(): string {
  if (import.meta.env.VITE_UPBIT_API_URL) {
    return import.meta.env.VITE_UPBIT_API_URL;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return PROXY_BASE_URL;
  }
  return DIRECT_BASE_URL;
}

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
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });
  } catch (networkError) {
    // If proxy failed with a network error and we were using the proxy, attempt direct fallback
    if (baseUrl !== DIRECT_BASE_URL) {
      const fallbackUrl = `${DIRECT_BASE_URL}${endpoint}`;
      response = await fetch(fallbackUrl, {
        ...init,
        headers: {
          Accept: "application/json",
          ...init?.headers,
        },
      });
    } else {
      throw networkError;
    }
  }

  // If proxy returned 404 or 5xx, try direct fallback as well
  if (
    !response.ok &&
    baseUrl !== DIRECT_BASE_URL &&
    (response.status === 404 || response.status >= 500)
  ) {
    const fallbackUrl = `${DIRECT_BASE_URL}${endpoint}`;
    try {
      const fallbackResponse = await fetch(fallbackUrl, {
        ...init,
        headers: {
          Accept: "application/json",
          ...init?.headers,
        },
      });
      if (fallbackResponse.ok) {
        return (await fallbackResponse.json()) as T;
      }
    } catch {
      // Fallback failed, continue with original error
    }
  }

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
 * Chunks requests into batches of 100 markets to prevent URL length overflow
 * and uses Promise.allSettled for fault isolation.
 */
export async function fetchMarketTickers(
  markets: string[],
): Promise<UpbitRestTicker[]> {
  if (markets.length === 0) {
    return [];
  }

  const CHUNK_SIZE = 100;
  if (markets.length <= CHUNK_SIZE) {
    const joined = markets.join(",");
    return request<UpbitRestTicker[]>(`/ticker?markets=${joined}`);
  }

  const chunks: string[][] = [];
  for (let i = 0; i < markets.length; i += CHUNK_SIZE) {
    chunks.push(markets.slice(i, i + CHUNK_SIZE));
  }

  const settled = await Promise.allSettled(
    chunks.map((chunk) =>
      request<UpbitRestTicker[]>(`/ticker?markets=${chunk.join(",")}`),
    ),
  );

  const results: UpbitRestTicker[] = [];
  for (const item of settled) {
    if (item.status === "fulfilled" && Array.isArray(item.value)) {
      results.push(...item.value);
    } else if (item.status === "rejected") {
      console.warn("Failed to fetch ticker chunk:", item.reason);
    }
  }

  return results;
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
