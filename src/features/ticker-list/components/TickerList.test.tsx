import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TickerList } from "./TickerList";
import * as tickerListHook from "../hooks/useTickerList";
import type { TickerItem } from "../types/ticker";
import { useMarketStore } from "@/stores";

vi.mock("../hooks/useTickerList");

const mockTickers: TickerItem[] = [
  {
    market: "KRW-BTC",
    symbol: "BTC",
    koreanName: "비트코인",
    englishName: "Bitcoin",
    tradePrice: 135000000,
    change: "RISE",
    signedChangeRate: 0.025,
    signedChangePrice: 3292000,
    accTradePrice24h: 520000000000,
    accTradeVolume24h: 3800,
    highPrice: 136000000,
    lowPrice: 131000000,
    isBookmarked: false,
  },
  {
    market: "KRW-ETH",
    symbol: "ETH",
    koreanName: "이더리움",
    englishName: "Ethereum",
    tradePrice: 4200000,
    change: "FALL",
    signedChangeRate: -0.012,
    signedChangePrice: -51000,
    accTradePrice24h: 210000000000,
    accTradeVolume24h: 50000,
    highPrice: 4300000,
    lowPrice: 4150000,
    isBookmarked: true,
  },
];

describe("TickerList component", () => {
  const setKeywordMock = vi.fn();
  const setTabMock = vi.fn();
  const handleSortMock = vi.fn();
  const toggleBookmarkMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useMarketStore.setState({ currentSymbol: "KRW-BTC" });

    vi.spyOn(tickerListHook, "useTickerList").mockReturnValue({
      tickers: mockTickers,
      totalCount: 2,
      isLoading: false,
      keyword: "",
      setKeyword: setKeywordMock,
      tab: "all",
      setTab: setTabMock,
      sortField: "acc_trade_price_24h",
      sortDirection: "desc",
      handleSort: handleSortMock,
      toggleBookmark: toggleBookmarkMock,
      isBookmarked: (market: string) => market === "KRW-ETH",
    });
  });

  it("renders loading state when isLoading is true and tickers list is empty", () => {
    vi.spyOn(tickerListHook, "useTickerList").mockReturnValue({
      tickers: [],
      totalCount: 0,
      isLoading: true,
      keyword: "",
      setKeyword: setKeywordMock,
      tab: "all",
      setTab: setTabMock,
      sortField: "acc_trade_price_24h",
      sortDirection: "desc",
      handleSort: handleSortMock,
      toggleBookmark: toggleBookmarkMock,
      isBookmarked: () => false,
    });

    render(<TickerList />);

    expect(screen.getByText("마켓 데이터 수신 중...")).toBeInTheDocument();
  });

  it("renders empty state message when tickers list is empty and not loading", () => {
    vi.spyOn(tickerListHook, "useTickerList").mockReturnValue({
      tickers: [],
      totalCount: 0,
      isLoading: false,
      keyword: "nonexistent",
      setKeyword: setKeywordMock,
      tab: "all",
      setTab: setTabMock,
      sortField: "acc_trade_price_24h",
      sortDirection: "desc",
      handleSort: handleSortMock,
      toggleBookmark: toggleBookmarkMock,
      isBookmarked: () => false,
    });

    render(<TickerList />);

    expect(screen.getByText("검색 결과가 없습니다.")).toBeInTheDocument();
  });

  it("renders virtualized ticker rows and handles item selection", () => {
    render(<TickerList />);

    expect(screen.getByText("비트코인")).toBeInTheDocument();
    expect(screen.getByText("이더리움")).toBeInTheDocument();
    expect(screen.getByText("135,000,000")).toBeInTheDocument();
    expect(screen.getByText("+2.50%")).toBeInTheDocument();
    expect(screen.getByText("-1.20%")).toBeInTheDocument();

    // Clicking Ethereum row changes store's currentSymbol
    const ethRow = screen.getByText("이더리움").closest('[role="button"]');
    expect(ethRow).toBeInTheDocument();
    fireEvent.click(ethRow!);

    expect(useMarketStore.getState().currentSymbol).toBe("KRW-ETH");
  });

  it("handles search input change, sort column clicks, and bookmark toggling", () => {
    render(<TickerList />);

    // Search input
    const input = screen.getByPlaceholderText(
      "코인명 / 심볼 검색 (예: BTC, 비트)",
    );
    fireEvent.change(input, { target: { value: "이더" } });
    expect(setKeywordMock).toHaveBeenCalledWith("이더");

    // Click sort header "현재가"
    const priceSortBtn = screen.getByRole("button", { name: /현재가/i });
    fireEvent.click(priceSortBtn);
    expect(handleSortMock).toHaveBeenCalledWith("trade_price");

    // Toggle bookmark for Bitcoin
    const bookmarkBtn = screen.getByLabelText("비트코인 즐겨찾기 토글");
    fireEvent.click(bookmarkBtn);
    expect(toggleBookmarkMock).toHaveBeenCalledWith("KRW-BTC");

    // Tab switch to "관심"
    const bookmarkTabBtn = screen.getByRole("button", { name: /관심/i });
    fireEvent.click(bookmarkTabBtn);
    expect(setTabMock).toHaveBeenCalledWith("bookmarks");
  });
});
