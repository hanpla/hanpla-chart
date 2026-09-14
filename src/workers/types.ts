import type { UTCTimestamp } from "lightweight-charts";
import type { CandleDataPoint } from "@/features/chart/types/chart";

export interface LineDataPoint {
  time: UTCTimestamp;
  value: number;
}

export interface BollingerBandsResult {
  upper: LineDataPoint[];
  middle: LineDataPoint[];
  lower: LineDataPoint[];
}

export interface IndicatorOptions {
  smaPeriods?: number[];
  bollinger?: {
    period: number;
    multiplier: number;
  };
}

export interface IndicatorsResult {
  sma: Record<number, LineDataPoint[]>;
  bollinger?: BollingerBandsResult;
  executionTimeMs: number;
}

export interface WorkerCalculateRequest {
  type: "CALCULATE_INDICATORS";
  id: string;
  payload: {
    candles: CandleDataPoint[];
    options: IndicatorOptions;
  };
}

export interface WorkerSuccessResponse {
  type: "INDICATORS_SUCCESS";
  id: string;
  payload: IndicatorsResult;
}

export interface WorkerErrorResponse {
  type: "INDICATORS_ERROR";
  id: string;
  error: string;
}

export type IndicatorWorkerIncomingMessage = WorkerCalculateRequest;
export type IndicatorWorkerOutgoingMessage =
  WorkerSuccessResponse | WorkerErrorResponse;
