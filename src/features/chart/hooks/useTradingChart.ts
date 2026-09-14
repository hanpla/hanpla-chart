import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
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
  ActiveIndicators,
} from "../types/chart";
import {
  parseUpbitCandles,
  mergeTickIntoCandle,
  getTimeframeOption,
  UP_COLOR,
  DOWN_COLOR,
} from "../utils/candle-aggregator";
import { useIndicatorWorker } from "./useIndicatorWorker";

export interface UseTradingChartOptions {
  symbol: string;
  timeframe: ChartTimeframe;
  activeIndicators: ActiveIndicators;
}

export function useTradingChart({
  symbol,
  timeframe,
  activeIndicators,
}: UseTradingChartOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  // Technical Indicator Series Refs
  const sma20SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const sma60SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const sma120SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbUpperSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbMiddleSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbLowerSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const lastCandleRef = useRef<CandleDataPoint | null>(null);
  const [currentOHLV, setCurrentOHLV] = useState<ChartOHLV | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const activeIndicatorsRef = useRef(activeIndicators);
  useEffect(() => {
    activeIndicatorsRef.current = activeIndicators;
  }, [activeIndicators]);

  const timeframeOption = getTimeframeOption(timeframe);
  const timeframeUnitRef = useRef(timeframeOption.unit);

  useEffect(() => {
    timeframeUnitRef.current = timeframeOption.unit;
  }, [timeframeOption.unit]);

  // Web Worker offloaded indicator calculations
  const {
    indicators,
    isCalculating: isCalculatingIndicators,
    executionTimeMs: indicatorExecutionTimeMs,
    calculate: calculateIndicators,
  } = useIndicatorWorker();

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

    // Technical indicator line series (SMA 20, 60, 120, Bollinger Bands)
    const sma20 = chart.addSeries(LineSeries, {
      color: "#facc15", // yellow-400
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    sma20.applyOptions({ visible: activeIndicatorsRef.current.sma20 });

    const sma60 = chart.addSeries(LineSeries, {
      color: "#a855f7", // purple-500
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    sma60.applyOptions({ visible: activeIndicatorsRef.current.sma60 });

    const sma120 = chart.addSeries(LineSeries, {
      color: "#38bdf8", // sky-400
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    sma120.applyOptions({ visible: activeIndicatorsRef.current.sma120 });

    const bbUpper = chart.addSeries(LineSeries, {
      color: "rgba(52, 211, 153, 0.8)", // emerald-400
      lineWidth: 1,
      lineStyle: 2, // dashed
      priceLineVisible: false,
      lastValueVisible: false,
    });
    bbUpper.applyOptions({ visible: activeIndicatorsRef.current.bollinger });

    const bbMiddle = chart.addSeries(LineSeries, {
      color: "rgba(52, 211, 153, 0.4)",
      lineWidth: 1,
      lineStyle: 0,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    bbMiddle.applyOptions({ visible: activeIndicatorsRef.current.bollinger });

    const bbLower = chart.addSeries(LineSeries, {
      color: "rgba(52, 211, 153, 0.8)",
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    bbLower.applyOptions({ visible: activeIndicatorsRef.current.bollinger });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    sma20SeriesRef.current = sma20;
    sma60SeriesRef.current = sma60;
    sma120SeriesRef.current = sma120;
    bbUpperSeriesRef.current = bbUpper;
    bbMiddleSeriesRef.current = bbMiddle;
    bbLowerSeriesRef.current = bbLower;

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
      sma20SeriesRef.current = null;
      sma60SeriesRef.current = null;
      sma120SeriesRef.current = null;
      bbUpperSeriesRef.current = null;
      bbMiddleSeriesRef.current = null;
      bbLowerSeriesRef.current = null;
    };
  }, []); // Mounted once per container lifecycle

  // 2. Dynamically update indicator series visibility when activeIndicators changes
  useEffect(() => {
    sma20SeriesRef.current?.applyOptions({ visible: activeIndicators.sma20 });
    sma60SeriesRef.current?.applyOptions({ visible: activeIndicators.sma60 });
    sma120SeriesRef.current?.applyOptions({ visible: activeIndicators.sma120 });
    const bbVisible = activeIndicators.bollinger;
    bbUpperSeriesRef.current?.applyOptions({ visible: bbVisible });
    bbMiddleSeriesRef.current?.applyOptions({ visible: bbVisible });
    bbLowerSeriesRef.current?.applyOptions({ visible: bbVisible });
  }, [activeIndicators]);

  // 3. Load historical candles whenever symbol or timeframe changes
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

            // Offload technical indicators calculation to Web Worker
            calculateIndicators(candles, {
              smaPeriods: [20, 60, 120],
              bollinger: { period: 20, multiplier: 2 },
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
  }, [symbol, timeframeOption.unit, calculateIndicators]);

  // 4. Update indicator line series data when worker computation finishes
  useEffect(() => {
    if (!indicators) return;

    if (indicators.sma[20] && sma20SeriesRef.current) {
      sma20SeriesRef.current.setData(indicators.sma[20]);
    }
    if (indicators.sma[60] && sma60SeriesRef.current) {
      sma60SeriesRef.current.setData(indicators.sma[60]);
    }
    if (indicators.sma[120] && sma120SeriesRef.current) {
      sma120SeriesRef.current.setData(indicators.sma[120]);
    }
    if (indicators.bollinger) {
      bbUpperSeriesRef.current?.setData(indicators.bollinger.upper);
      bbMiddleSeriesRef.current?.setData(indicators.bollinger.middle);
      bbLowerSeriesRef.current?.setData(indicators.bollinger.lower);
    }
  }, [indicators]);

  // 5. Realtime tick merge directly on Lightweight Charts series (Zero React re-render)
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
    indicatorExecutionTimeMs,
    isCalculatingIndicators,
  };
}
