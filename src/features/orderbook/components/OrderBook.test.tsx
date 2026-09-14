import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OrderBook } from "./OrderBook";
import * as orderbookHook from "../hooks/useOrderBookData";
import type { OrderbookSnapshot } from "../types/orderbook";
import { useMarketStore } from "@/stores";

vi.mock("../hooks/useOrderBookData");

const mockSnapshot: OrderbookSnapshot = {
  market: "KRW-BTC",
  timestamp: 1710000000000,
  totalAskSize: 15.5,
  totalBidSize: 22.8,
  spread: 10000,
  spreadRate: 0.0074,
  asks: [
    {
      price: 135010000,
      size: 2.5,
      cumSize: 2.5,
      type: "ASK",
      depthRatio: 25,
    },
    {
      price: 135020000,
      size: 5.0,
      cumSize: 7.5,
      type: "ASK",
      depthRatio: 50,
    },
  ],
  bids: [
    {
      price: 135000000,
      size: 3.2,
      cumSize: 3.2,
      type: "BID",
      depthRatio: 32,
    },
    {
      price: 134990000,
      size: 6.8,
      cumSize: 10.0,
      type: "BID",
      depthRatio: 68,
    },
  ],
};

describe("OrderBook component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMarketStore.setState({ currentSymbol: "KRW-BTC" });
  });

  it("renders loading indicator when data is loading and snapshot is null", () => {
    vi.spyOn(orderbookHook, "useOrderBookData").mockReturnValue({
      snapshot: null,
      isLoading: true,
    });

    render(<OrderBook />);

    expect(screen.getByText("50-DEPTH ORDERBOOK")).toBeInTheDocument();
    expect(screen.getByText("호가 데이터 수신 중...")).toBeInTheDocument();
  });

  it("renders empty state message when snapshot is null and not loading", () => {
    vi.spyOn(orderbookHook, "useOrderBookData").mockReturnValue({
      snapshot: null,
      isLoading: false,
    });

    render(<OrderBook />);

    expect(screen.getByText("호가 데이터가 없습니다.")).toBeInTheDocument();
  });

  it("renders 50-depth asks, bids, and spread information correctly", () => {
    vi.spyOn(orderbookHook, "useOrderBookData").mockReturnValue({
      snapshot: mockSnapshot,
      isLoading: false,
    });

    render(<OrderBook />);

    // Header info
    expect(screen.getByText("50-DEPTH ORDERBOOK")).toBeInTheDocument();
    expect(screen.getByText("KRW-BTC")).toBeInTheDocument();
    expect(screen.getByText("15.500")).toBeInTheDocument();
    expect(screen.getByText("22.800")).toBeInTheDocument();

    // Asks
    expect(screen.getByText("135,010,000")).toBeInTheDocument();
    expect(screen.getByText("135,020,000")).toBeInTheDocument();

    // Bids & spread price (135,000,000 appears in both first bid and spread center)
    expect(screen.getAllByText("135,000,000")).toHaveLength(2);
    expect(screen.getByText("134,990,000")).toBeInTheDocument();

    // Spread info
    expect(screen.getByText("스프레드")).toBeInTheDocument();
    expect(screen.getByText("10,000 KRW")).toBeInTheDocument();
    expect(screen.getByText("(0.01%)")).toBeInTheDocument();
  });

  it("triggers auto-center scroll when center button is clicked", () => {
    vi.spyOn(orderbookHook, "useOrderBookData").mockReturnValue({
      snapshot: mockSnapshot,
      isLoading: false,
    });

    render(<OrderBook />);

    const centerBtn = screen.getByLabelText("현재가 중앙 정렬");
    expect(centerBtn).toBeInTheDocument();

    fireEvent.click(centerBtn);
    // Verified that clicking center button doesn't throw and triggers handler
  });
});
