import type { UTCTimestamp } from "lightweight-charts";

export type ChartTimeframe = "1m" | "3m" | "5m" | "15m" | "60m" | "240m" | "1d";

export interface TimeframeOption {
  value: ChartTimeframe;
  label: string;
  unit: number; // in minutes
  type: "minute" | "day";
}

export interface CandleDataPoint {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface VolumeDataPoint {
  time: UTCTimestamp;
  value: number;
  color: string;
}

export interface ChartOHLV {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
