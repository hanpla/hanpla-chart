import { describe, it, expect } from "vitest";
import { processOrderbookUnits, formatOrderbookSize } from "./orderbook-math";
import type { UpbitOrderbookUnit } from "@/types/websocket";

describe("orderbook-math utils", () => {
  const mockUnits: UpbitOrderbookUnit[] = [
    { ask_price: 101, bid_price: 100, ask_size: 1.0, bid_size: 2.0 },
    { ask_price: 102, bid_price: 99, ask_size: 2.0, bid_size: 3.0 },
    { ask_price: 103, bid_price: 98, ask_size: 3.0, bid_size: 1.0 },
  ];

  it("calculates cumulative sizes and spread accurately", () => {
    const snapshot = processOrderbookUnits(
      "KRW-BTC",
      123456789,
      6.0,
      6.0,
      mockUnits,
    );

    expect(snapshot.market).toBe("KRW-BTC");
    expect(snapshot.spread).toBe(1); // 101 - 100
    expect(snapshot.spreadRate).toBeCloseTo(1.0); // (1 / 100) * 100

    // Asks: reversed so highest price is first
    expect(snapshot.asks).toHaveLength(3);
    expect(snapshot.asks[0]?.price).toBe(103);
    expect(snapshot.asks[0]?.cumSize).toBe(6.0); // 1 + 2 + 3

    expect(snapshot.asks[2]?.price).toBe(101); // Best ask right above spread
    expect(snapshot.asks[2]?.cumSize).toBe(1.0);

    // Bids: best bid first
    expect(snapshot.bids).toHaveLength(3);
    expect(snapshot.bids[0]?.price).toBe(100);
    expect(snapshot.bids[0]?.cumSize).toBe(2.0);

    expect(snapshot.bids[2]?.price).toBe(98);
    expect(snapshot.bids[2]?.cumSize).toBe(6.0); // 2 + 3 + 1
  });

  it("calculates normalized depth ratio between 1 and 100", () => {
    const snapshot = processOrderbookUnits(
      "KRW-BTC",
      123456789,
      6.0,
      6.0,
      mockUnits,
    );

    // Max cumSize is 6.0
    // Asks[0] (cumSize 6.0) should have depthRatio = 100
    expect(snapshot.asks[0]?.depthRatio).toBe(100);
    // Bids[0] (cumSize 2.0) should have depthRatio = (2 / 6) * 100 = 33.33%
    expect(snapshot.bids[0]?.depthRatio).toBeCloseTo(33.33, 1);
  });

  it("handles empty units gracefully", () => {
    const snapshot = processOrderbookUnits("KRW-BTC", 0, 0, 0, []);
    expect(snapshot.asks).toEqual([]);
    expect(snapshot.bids).toEqual([]);
    expect(snapshot.spread).toBe(0);
  });

  it("formatOrderbookSize formats quantities properly", () => {
    expect(formatOrderbookSize(123.4567)).toBe("123.46");
    expect(formatOrderbookSize(1.23456)).toBe("1.235");
    expect(formatOrderbookSize(0)).toBe("0.000");
  });
});
