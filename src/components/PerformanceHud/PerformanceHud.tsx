import React, { useState, useRef, useEffect } from "react";
import {
  Activity,
  Gauge,
  Cpu,
  Layers,
  HardDrive,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { usePerformanceMetrics } from "./hooks/usePerformanceMetrics";

export interface PerformanceHudProps {
  totalTicks?: number;
}

export const PerformanceHud: React.FC<PerformanceHudProps> = React.memo(
  ({ totalTicks = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement | null>(null);

    const metrics = usePerformanceMetrics({ totalTicks });

    // Close panel on escape key or outside click
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsOpen(false);
      };

      const handleClickOutside = (e: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    const healthColor =
      metrics.health === "optimal"
        ? "text-emerald-400"
        : metrics.health === "warning"
          ? "text-amber-400"
          : "text-rose-400";

    const healthBadgeIntent =
      metrics.health === "optimal"
        ? "live"
        : metrics.health === "warning"
          ? "warning"
          : "down";

    return (
      <div className="relative inline-block" ref={panelRef}>
        {/* Header HUD Mini Trigger Pill */}
        <Button
          variant="outline"
          size="xs"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 border-zinc-800 bg-zinc-900/90 font-mono text-[11px] transition-colors hover:border-zinc-700 ${
            isOpen
              ? "border-emerald-500/50 bg-zinc-800/80 text-zinc-100"
              : "text-zinc-300"
          }`}
          title="성능 진단 HUD 열기/닫기"
          aria-expanded={isOpen}
        >
          <Activity
            className={`h-3.5 w-3.5 ${healthColor}`}
            aria-hidden="true"
          />
          <span className="font-bold">{metrics.fps} FPS</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400">{metrics.latencyMs}ms</span>
        </Button>

        {/* Floating Detailed HUD Dashboard Modal */}
        {isOpen && (
          <div
            role="dialog"
            aria-label="실시간 시스템 성능 진단 대시보드"
            aria-modal="false"
            className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-zinc-800 bg-zinc-950/95 p-3.5 font-mono text-xs shadow-2xl backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-emerald-400" />
                <span className="font-bold tracking-wider text-zinc-100">
                  PERFORMANCE HUD
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge intent={healthBadgeIntent} size="xs">
                  {metrics.health.toUpperCase()}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300"
                  aria-label="닫기"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Metrics 2x2 Grid */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {/* FPS Card */}
              <div className="border-zinc-850 rounded border bg-zinc-900/50 p-2.5">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px]">FRAME RATE</span>
                  <Activity className={`h-3 w-3 ${healthColor}`} />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`text-xl font-bold ${healthColor}`}>
                    {metrics.fps}
                  </span>
                  <span className="text-[10px] text-zinc-500">FPS</span>
                </div>
                <div className="mt-0.5 text-[9px] text-zinc-500">
                  Min: {metrics.minFps} FPS (1% Low)
                </div>
              </div>

              {/* Main Thread Latency Card */}
              <div className="border-zinc-850 rounded border bg-zinc-900/50 p-2.5">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px]">EVENT LOOP LAG</span>
                  <Cpu className="h-3 w-3 text-emerald-400" />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-zinc-100">
                    {metrics.latencyMs}
                  </span>
                  <span className="text-[10px] text-zinc-500">ms</span>
                </div>
                <div className="mt-0.5 text-[9px] text-zinc-500">
                  {metrics.latencyMs < 10 ? "Optimal (<10ms)" : "High Delay"}
                </div>
              </div>

              {/* Webhook Throughput (TPS) Card */}
              <div className="border-zinc-850 rounded border bg-zinc-900/50 p-2.5">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px]">THROUGHPUT</span>
                  <CheckCircle2 className="h-3 w-3 text-sky-400" />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-sky-400">
                    {metrics.tps}
                  </span>
                  <span className="text-[10px] text-zinc-500">TPS</span>
                </div>
                <div className="mt-0.5 text-[9px] text-zinc-500">
                  Total: {metrics.totalTicks.toLocaleString()}
                </div>
              </div>

              {/* Virtualized DOM Node Count */}
              <div className="border-zinc-850 rounded border bg-zinc-900/50 p-2.5">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px]">ACTIVE DOM NODES</span>
                  <Layers className="h-3 w-3 text-purple-400" />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-purple-400">
                    {metrics.domNodeCount}
                  </span>
                  <span className="text-[10px] text-zinc-500">NODES</span>
                </div>
                <div className="mt-0.5 text-[9px] text-zinc-500">
                  Virtualization active
                </div>
              </div>
            </div>

            {/* Memory Usage (if available) */}
            {metrics.memoryMb !== null && (
              <div className="border-zinc-850 mt-2 flex items-center justify-between rounded border bg-zinc-900/40 px-2.5 py-1.5 text-[10px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="h-3 w-3 text-zinc-500" />
                  <span>JS Heap Footprint:</span>
                </div>
                <span className="font-semibold text-zinc-200">
                  {metrics.memoryMb} MB
                </span>
              </div>
            )}

            {/* Pipeline Defense Architecture Footnote */}
            <div className="border-zinc-850 mt-2.5 border-t pt-2 text-[10px] text-zinc-500">
              <div className="flex items-center gap-1 text-emerald-400/90">
                <AlertTriangle className="h-2.5 w-2.5" />
                <span>60 FPS Defense Stack Active</span>
              </div>
              <ul className="mt-1 space-y-0.5 text-[9px] text-zinc-400">
                <li>• RingBuffer (O(1)) + RAF 16.6ms Batching</li>
                <li>• Web Worker Indicator Math (Off-main-thread)</li>
                <li>• TanStack Virtualization (DOM &lt; 200 nodes)</li>
                <li>• CSS Variable GPU Depth Compositing</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  },
);

PerformanceHud.displayName = "PerformanceHud";
