export type PerformanceHealth = "optimal" | "warning" | "critical";

export interface PerformanceMetrics {
  fps: number;
  minFps: number;
  latencyMs: number;
  tps: number;
  totalTicks: number;
  domNodeCount: number;
  memoryMb: number | null;
  health: PerformanceHealth;
}
