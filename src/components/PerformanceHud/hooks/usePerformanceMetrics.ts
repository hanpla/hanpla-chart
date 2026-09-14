import { useState, useEffect, useRef } from "react";
import type { PerformanceMetrics, PerformanceHealth } from "../types";

export interface UsePerformanceMetricsOptions {
  totalTicks?: number;
}

export function usePerformanceMetrics({
  totalTicks = 0,
}: UsePerformanceMetricsOptions = {}): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    minFps: 60,
    latencyMs: 0,
    tps: 0,
    totalTicks: 0,
    domNodeCount: 0,
    memoryMb: null,
    health: "optimal",
  });

  const frameTimestampsRef = useRef<number[]>([]);
  const lastMetricsUpdateRef = useRef<number>(
    typeof performance !== "undefined" ? performance.now() : Date.now(),
  );
  const totalTicksRef = useRef<number>(totalTicks);
  const lastTicksSampleRef = useRef<number>(totalTicks);

  useEffect(() => {
    totalTicksRef.current = totalTicks;
  }, [totalTicks]);

  // 1. RAF FPS measurement loop
  useEffect(() => {
    let rafId: number;
    let isRunning = true;

    const onFrame = (now: number) => {
      if (!isRunning) return;

      const timestamps = frameTimestampsRef.current;
      timestamps.push(now);

      // Keep only timestamps from the last 1000ms via single-pass splice (O(1) amortized)
      const cutoff = now - 1000;
      let firstValidIdx = 0;
      while (
        firstValidIdx < timestamps.length &&
        (timestamps[firstValidIdx] ?? 0) < cutoff
      ) {
        firstValidIdx++;
      }
      if (firstValidIdx > 0) {
        timestamps.splice(0, firstValidIdx);
      }

      rafId = requestAnimationFrame(onFrame);
    };

    rafId = requestAnimationFrame(onFrame);

    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
    };
  }, []);

  // 2. Periodic metric sampling & event-loop latency calculation (every 500ms)
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;
    let isCancelled = false;

    let expectedTime =
      (typeof performance !== "undefined" ? performance.now() : Date.now()) +
      500;

    const sample = () => {
      if (isCancelled) return;

      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const rawLag = Math.max(0, now - expectedTime);
      expectedTime = now + 500;

      // Calculate FPS from RAF timestamps
      const timestamps = frameTimestampsRef.current;
      const calculatedFps = Math.min(60, Math.max(0, timestamps.length));

      // Calculate instantaneous minimum frame rate based on delta spikes
      let maxDelta = 16.6;
      for (let i = 1; i < timestamps.length; i++) {
        const delta = (timestamps[i] ?? 0) - (timestamps[i - 1] ?? 0);
        if (delta > maxDelta) maxDelta = delta;
      }
      const calculatedMinFps = Math.min(
        calculatedFps,
        Math.max(1, Math.round(1000 / maxDelta)),
      );

      // Calculate TPS (Ticks Per Second)
      const elapsedSec = Math.max(
        0.1,
        (now - lastMetricsUpdateRef.current) / 1000,
      );
      lastMetricsUpdateRef.current = now;

      const currentTotalTicks = totalTicksRef.current;
      const ticksDiff = Math.max(
        0,
        currentTotalTicks - lastTicksSampleRef.current,
      );
      lastTicksSampleRef.current = currentTotalTicks;
      const calculatedTps = Math.round(ticksDiff / elapsedSec);

      // DOM Node Count
      const domCount =
        typeof document !== "undefined"
          ? document.querySelectorAll("*").length
          : 0;

      // Memory (Chrome performance.memory extension)
      let memoryMb: number | null = null;
      if (typeof window !== "undefined" && "performance" in window) {
        const perf = window.performance as unknown as {
          memory?: { usedJSHeapSize: number };
        };
        if (perf.memory?.usedJSHeapSize) {
          memoryMb =
            Math.round((perf.memory.usedJSHeapSize / (1024 * 1024)) * 10) / 10;
        }
      }

      // Health evaluation
      let health: PerformanceHealth = "optimal";
      if (calculatedFps < 40 || rawLag > 40) {
        health = "critical";
      } else if (calculatedFps < 55 || rawLag > 15) {
        health = "warning";
      }

      setMetrics({
        fps: calculatedFps,
        minFps: calculatedMinFps,
        latencyMs: Math.round(rawLag),
        tps: calculatedTps,
        totalTicks: currentTotalTicks,
        domNodeCount: domCount,
        memoryMb,
        health,
      });

      timerId = setTimeout(sample, 500);
    };

    timerId = setTimeout(sample, 500);

    return () => {
      isCancelled = true;
      clearTimeout(timerId);
    };
  }, []);

  return metrics;
}
