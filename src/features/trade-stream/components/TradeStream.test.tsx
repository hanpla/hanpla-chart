import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TradeStream } from "./TradeStream";
import * as tradeDataHook from "../hooks/useTradeStreamData";
import type { TradeRecord } from "../types/trade";
import { useMarketStore } from "@/stores";

vi.mock("../hooks/useTradeStreamData");

const mockTrades: TradeRecord[] = [
  {
    id: "1001",
    market: "KRW-BTC",
    price: 135000000,
    volume: 0.05,
    totalValue: 6750000,
    askBid: "BID",
    timestamp: 1710000000000,
    formattedTime: "12:00:00",
    whaleLevel: "NORMAL",
  },
  {
    id: "1002",
    market: "KRW-BTC",
    price: 135100000,
    volume: 0.1,
    totalValue: 13510000,
    askBid: "ASK",
    timestamp: 1710000001000,
    formattedTime: "12:00:01",
    whaleLevel: "NORMAL",
  },
  {
    id: "1003",
    market: "KRW-BTC",
    price: 135200000,
    volume: 1.5,
    totalValue: 202800000, // Whale trade (> 100M KRW)
    askBid: "BID",
    timestamp: 1710000002000,
    formattedTime: "12:00:02",
    whaleLevel: "MEGA",
  },
];

describe("TradeStream component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMarketStore.setState({ currentSymbol: "KRW-BTC" });
  });

  it("renders loading indicator when data is loading and no trades exist", () => {
    vi.spyOn(tradeDataHook, "useTradeStreamData").mockReturnValue({
      trades: [],
      isLoading: true,
    });

    render(<TradeStream />);

    expect(screen.getByText("REALTIME TRADES")).toBeInTheDocument();
    expect(screen.getByText("체결 내역 수신 중...")).toBeInTheDocument();
  });

  it("renders empty state message when trades array is empty and not loading", () => {
    vi.spyOn(tradeDataHook, "useTradeStreamData").mockReturnValue({
      trades: [],
      isLoading: false,
    });

    render(<TradeStream />);

    expect(screen.getByText("체결 내역이 없습니다.")).toBeInTheDocument();
    expect(screen.getByText("0건 누적")).toBeInTheDocument();
  });

  it("renders virtualized trade list items and whale badges", () => {
    vi.spyOn(tradeDataHook, "useTradeStreamData").mockReturnValue({
      trades: mockTrades,
      isLoading: false,
    });

    render(<TradeStream />);

    expect(screen.getByText("3건 누적")).toBeInTheDocument();
    expect(screen.getByText("KRW-BTC")).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText("체결시간")).toBeInTheDocument();
    expect(screen.getByText("체결가 (KRW)")).toBeInTheDocument();
    expect(screen.getByText("체결량")).toBeInTheDocument();

    // Check rendered trades
    expect(screen.getByText("135,000,000")).toBeInTheDocument();
    expect(screen.getByText("135,100,000")).toBeInTheDocument();
    expect(screen.getByText("135,200,000")).toBeInTheDocument();

    // Whale badge check (whaleLevel tier2 has whale badge)
    expect(screen.getByText("WHALE")).toBeInTheDocument();
  });
});
