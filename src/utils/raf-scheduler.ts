import { CircularRingBuffer } from "./ring-buffer";

export type BatchFlushCallback<T> = (batch: T[]) => void;

export interface RAFSchedulerMetrics {
  totalProcessedTicks: number;
  totalBatches: number;
  lastBatchSize: number;
  pendingCount: number;
}

/**
 * RAFScheduler
 *
 * Synchronizes high-frequency tick inputs with the browser display refresh rate
 * (typically 60Hz / 16.6ms) using requestAnimationFrame.
 * Collects high-volume incoming ticks into an internal CircularRingBuffer and flushes
 * them in a single batch per animation frame to protect the main thread and React state.
 */
export class RAFScheduler<T> {
  private readonly ringBuffer: CircularRingBuffer<T>;
  private readonly callback: BatchFlushCallback<T>;
  private rafHandle: number | ReturnType<typeof setTimeout> | null = null;
  private running: boolean = false;

  private totalProcessedTicks: number = 0;
  private totalBatches: number = 0;
  private lastBatchSize: number = 0;

  constructor(
    callback: BatchFlushCallback<T>,
    bufferOrCapacity: CircularRingBuffer<T> | number = 2048,
  ) {
    if (typeof callback !== "function") {
      throw new Error("RAFScheduler requires a valid callback function.");
    }

    if (bufferOrCapacity instanceof CircularRingBuffer) {
      this.ringBuffer = bufferOrCapacity;
    } else {
      this.ringBuffer = new CircularRingBuffer<T>(bufferOrCapacity);
    }

    this.callback = callback;
  }

  /**
   * Starts the RAF scheduler loop.
   */
  public start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.scheduleNextFrame();
  }

  /**
   * Stops the RAF scheduler loop and cancels any pending frame requests.
   */
  public stop(): void {
    if (!this.running) {
      return;
    }
    this.running = false;
    this.cancelScheduledFrame();
  }

  /**
   * Enqueues an item into the internal ring buffer.
   * @returns boolean - true if queued without overflow, false if oldest was overwritten
   */
  public enqueue(item: T): boolean {
    return this.ringBuffer.push(item);
  }

  /**
   * Enqueues multiple items into the buffer.
   */
  public enqueueBatch(items: T[]): void {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item !== undefined) {
        this.ringBuffer.push(item);
      }
    }
  }

  /**
   * Manually flushes any pending items in the buffer immediately.
   */
  public flush(): void {
    if (this.ringBuffer.isEmpty) {
      return;
    }

    const batch = this.ringBuffer.drainAll();
    if (batch.length > 0) {
      this.totalProcessedTicks += batch.length;
      this.totalBatches += 1;
      this.lastBatchSize = batch.length;

      this.callback(batch);
    }
  }

  /**
   * Internal RAF tick execution.
   */
  private tick = (): void => {
    if (!this.running) {
      return;
    }

    this.flush();
    this.scheduleNextFrame();
  };

  /**
   * Schedules the next frame using requestAnimationFrame or setTimeout fallback.
   */
  private scheduleNextFrame(): void {
    if (!this.running) {
      return;
    }

    if (
      typeof window !== "undefined" &&
      typeof window.requestAnimationFrame === "function"
    ) {
      this.rafHandle = window.requestAnimationFrame(this.tick);
    } else {
      // Fallback for node or non-browser environments
      this.rafHandle = setTimeout(this.tick, 16);
    }
  }

  /**
   * Cancels the scheduled frame.
   */
  private cancelScheduledFrame(): void {
    if (this.rafHandle === null) {
      return;
    }

    if (
      typeof window !== "undefined" &&
      typeof window.cancelAnimationFrame === "function"
    ) {
      if (typeof this.rafHandle === "number") {
        window.cancelAnimationFrame(this.rafHandle);
      }
    } else {
      clearTimeout(this.rafHandle);
    }

    this.rafHandle = null;
  }

  /** Current running state of the scheduler */
  public get isRunning(): boolean {
    return this.running;
  }

  /** Reference to the underlying ring buffer */
  public get buffer(): CircularRingBuffer<T> {
    return this.ringBuffer;
  }

  /** Telemetry metrics for performance monitoring */
  public get metrics(): RAFSchedulerMetrics {
    return {
      totalProcessedTicks: this.totalProcessedTicks,
      totalBatches: this.totalBatches,
      lastBatchSize: this.lastBatchSize,
      pendingCount: this.ringBuffer.size,
    };
  }
}
