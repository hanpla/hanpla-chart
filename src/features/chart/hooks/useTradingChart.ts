import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { fetchMinuteCandles } from "@/services/api";
import { useWebSocketBatch } from "@/services/websocket";
import {
  isUpbitTrade,
  isUpbitTicker,
  type UpbitWebSocketMessage,
} from "@/types/websocket";
import type {
  ChartTimeframe,
  CandleDataPoint,
  ChartOHLV,
} from "../types/chart";
import {
  parseUpbitCandles,
  mergeTickIntoCandle,
  getTimeframeOption,
  UP_COLOR,
  DOWN_COLOR,
} from "../utils/candle-aggregator";

export interface UseTradingChartOptions {
  symbol: string;
  timeframe: ChartTimeframe;
}

export function useTradingChart({ symbol, timeframe }: UseTradingChartOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const lastCandleRef = useRef<CandleDataPoint | null>(null);
  const [currentOHLV, setCurrentOHLV] = useState<ChartOHLV | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const timeframeOption = getTimeframeOption(timeframe);
  const timeframeUnitRef = useRef(timeframeOption.unit);

  useEffect(() => {
    timeframeUnitRef.current = timeframeOption.unit;
  }, [timeframeOption.unit]);

  // 1. Initialize Lightweight Charts canvas instance
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth || 600,
      height: container.clientHeight || 400,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#71717a", // zinc-500
        fontFamily: "monospace",
      },
      grid: {
        vertLines: { color: "rgba(39, 39, 42, 0.4)" }, // zinc-800 subtle
        horzLines: { color: "rgba(39, 39, 42, 0.4)" },
      },
      timeScale: {
        borderColor: "#27272a",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "#27272a",
        scaleMargins: {
          top: 0.1,
          bottom: 0.25, // Leaves bottom 25% for volume histogram
        },
      },
      crosshair: {
        vertLine: {
          color: "#52525b",
          width: 1,
          style: 3, // dashed
        },
        horzLine: {
          color: "#52525b",
          width: 1,
          style: 3,
        },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: UP_COLOR,
      downColor: DOWN_COLOR,
      borderVisible: false,
      wickUpColor: UP_COLOR,
      wickDownColor: DOWN_COLOR,
      priceFormat: {
        type: "price",
        precision: 0,
        minMove: 1,
      },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "", // Overlay on separate subscale
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // Positioned at bottom 20%
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // ResizeObserver for responsive layout
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && chartRef.current) {
        const { width, height } = entry.contentRect;
        chartRef.current.applyOptions({ width, height });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []); // Mounted once per container lifecycle

  // 2. Load historical candles whenever symbol or timeframe changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    async function loadCandles() {
      try {
        const rawCandles = await fetchMinuteCandles(
          symbol,
          timeframeOption.unit,
          200,
        );

        if (isCancelled) return;

        const { candles, volumes } = parseUpbitCandles(rawCandles);

        if (candleSeriesRef.current && volumeSeriesRef.current) {
          candleSeriesRef.current.setData(candles);
          volumeSeriesRef.current.setData(volumes);

          if (candles.length > 0) {
            const latest = candles[candles.length - 1]!;
            lastCandleRef.current = latest;
            setCurrentOHLV({
              open: latest.open,
              high: latest.high,
              low: latest.low,
              close: latest.close,
              volume: latest.volume,
            });

            // Adjust chart to fit data
            chartRef.current?.timeScale().fitContent();
          }
        }
      } catch (err) {
        console.error("Failed to load historical candles:", err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCandles();

    return () => {
      isCancelled = true;
    };
  }, [symbol, timeframeOption.unit]);

  // 3. Realtime tick merge directly on Lightweight Charts series (Zero React re-render)
  useWebSocketBatch(
    useCallback(
      (batch: UpbitWebSocketMessage[]) => {
        const candleSeries = candleSeriesRef.current;
        const volumeSeries = volumeSeriesRef.current;
        if (!candleSeries || !volumeSeries) return;

        let lastMerged: CandleDataPoint | null = null;

        for (let i = 0; i < batch.length; i++) {
          const msg = batch[i];
          if (!msg || msg.code !== symbol) continue;

          let tradePrice = 0;
          let tradeVolume = 0;
          let timestamp = Date.now();

          if (isUpbitTrade(msg)) {
            tradePrice = msg.trade_price;
            tradeVolume = msg.trade_volume;
            timestamp = msg.trade_timestamp;
          } else if (isUpbitTicker(msg)) {
            tradePrice = msg.trade_price;
            tradeVolume = msg.trade_volume;
            timestamp = msg.trade_timestamp;
          } else {
            continue;
          }

          const merged = mergeTickIntoCandle(
            lastCandleRef.current,
            tradePrice,
            tradeVolume,
            timestamp,
            timeframeUnitRef.current,
          );

          lastCandleRef.current = merged.candle;
          lastMerged = merged.candle;

          // Direct series update without React state
          candleSeries.update(merged.candle);
          volumeSeries.update(merged.volume);
        }

        if (lastMerged) {
          const updated = lastMerged;
          setCurrentOHLV((prev) => {
            if (
              prev &&
              prev.open === updated.open &&
              prev.high === updated.high &&
              prev.low === updated.low &&
              prev.close === updated.close &&
              prev.volume === updated.volume
            ) {
              return prev; // Maintain reference identity to prevent re-render
            }
            return {
              open: updated.open,
              high: updated.high,
              low: updated.low,
              close: updated.close,
              volume: updated.volume,
            };
          });
        }
      },
      [symbol],
    ),
  );

  return {
    containerRef,
    currentOHLV,
    isLoading,
  };
}
