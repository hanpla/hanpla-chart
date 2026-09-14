import { useEffect, useRef, useState, useCallback } from "react";
import type { CandleDataPoint } from "../types/chart";
import type {
  IndicatorOptions,
  IndicatorsResult,
  IndicatorWorkerOutgoingMessage,
  WorkerCalculateRequest,
} from "@/workers/types";
import { calculateAllIndicators } from "@/workers/indicators";

export interface UseIndicatorWorkerResult {
  indicators: IndicatorsResult | null;
  isCalculating: boolean;
  executionTimeMs: number;
  calculate: (candles: CandleDataPoint[], options: IndicatorOptions) => void;
}

export function useIndicatorWorker(): UseIndicatorWorkerResult {
  const workerRef = useRef<Worker | null>(null);
  const currentRequestIdRef = useRef<number>(0);

  const [indicators, setIndicators] = useState<IndicatorsResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(0);

  // Initialize Web Worker instance
  useEffect(() => {
    let worker: Worker | null = null;

    if (typeof Worker !== "undefined") {
      try {
        worker = new Worker(
          new URL("../../../workers/indicator.worker.ts", import.meta.url),
          { type: "module" },
        );

        worker.onmessage = (
          event: MessageEvent<IndicatorWorkerOutgoingMessage>,
        ) => {
          const msg = event.data;
          if (!msg) return;

          // Ignore stale responses
          if (msg.id !== String(currentRequestIdRef.current)) return;

          setIsCalculating(false);

          if (msg.type === "INDICATORS_SUCCESS") {
            setIndicators(msg.payload);
            setExecutionTimeMs(msg.payload.executionTimeMs);
          } else if (msg.type === "INDICATORS_ERROR") {
            console.error("Worker calculation error:", msg.error);
          }
        };

        worker.onerror = (err) => {
          console.error("Indicator Web Worker encountered an error:", err);
          setIsCalculating(false);
        };

        workerRef.current = worker;
      } catch (e) {
        console.warn(
          "Web Worker initialization failed, falling back to main-thread execution:",
          e,
        );
      }
    }

    return () => {
      if (worker) {
        worker.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const calculate = useCallback(
    (candles: CandleDataPoint[], options: IndicatorOptions) => {
      if (candles.length === 0) return;

      currentRequestIdRef.current += 1;
      const requestId = String(currentRequestIdRef.current);

      const worker = workerRef.current;
      if (worker) {
        setIsCalculating(true);
        const req: WorkerCalculateRequest = {
          type: "CALCULATE_INDICATORS",
          id: requestId,
          payload: {
            candles,
            options,
          },
        };
        worker.postMessage(req);
      } else {
        // Fallback to synchronous calculation (e.g. during SSR or unit test environments)
        setIsCalculating(true);
        try {
          const result = calculateAllIndicators(candles, options);
          setIndicators(result);
          setExecutionTimeMs(result.executionTimeMs);
        } finally {
          setIsCalculating(false);
        }
      }
    },
    [],
  );

  return {
    indicators,
    isCalculating,
    executionTimeMs,
    calculate,
  };
}
