import { calculateAllIndicators } from "./indicators";
import type {
  IndicatorWorkerIncomingMessage,
  WorkerSuccessResponse,
  WorkerErrorResponse,
} from "./types";

// Setup event listener for worker messages
self.addEventListener(
  "message",
  (event: MessageEvent<IndicatorWorkerIncomingMessage>) => {
    const data = event.data;
    if (!data || data.type !== "CALCULATE_INDICATORS") return;

    const { id, payload } = data;

    try {
      const result = calculateAllIndicators(payload.candles, payload.options);

      const response: WorkerSuccessResponse = {
        type: "INDICATORS_SUCCESS",
        id,
        payload: result,
      };

      self.postMessage(response);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown indicator worker error";

      const errorResponse: WorkerErrorResponse = {
        type: "INDICATORS_ERROR",
        id,
        error: errorMessage,
      };

      self.postMessage(errorResponse);
    }
  },
);

export {};
