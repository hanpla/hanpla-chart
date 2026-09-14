import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RAFScheduler } from "./raf-scheduler";
import { CircularRingBuffer } from "./ring-buffer";

describe("RAFScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization & Validation", () => {
    it("should initialize in stopped state", () => {
      const callback = vi.fn();
      const scheduler = new RAFScheduler<number>(callback);

      expect(scheduler.isRunning).toBe(false);
      expect(scheduler.buffer.maxCapacity).toBe(2048);
      expect(scheduler.metrics.totalBatches).toBe(0);
      expect(scheduler.metrics.totalProcessedTicks).toBe(0);
    });

    it("should accept an existing CircularRingBuffer instance", () => {
      const ringBuffer = new CircularRingBuffer<string>(64);
      const callback = vi.fn();
      const scheduler = new RAFScheduler<string>(callback, ringBuffer);

      expect(scheduler.buffer).toBe(ringBuffer);
      expect(scheduler.buffer.maxCapacity).toBe(64);
    });

    it("should throw when initialized without a valid callback", () => {
      // @ts-expect-error testing invalid argument at runtime
      expect(() => new RAFScheduler<number>(null)).toThrow();
    });
  });

  describe("Batch Scheduling & Dispatching", () => {
    it("should batch multiple enqueued items and flush once per animation frame", () => {
      const flushedBatches: number[][] = [];
      const callback = vi.fn((batch: number[]) => {
        flushedBatches.push(batch);
      });

      const scheduler = new RAFScheduler<number>(callback);
      scheduler.start();
      expect(scheduler.isRunning).toBe(true);

      // Enqueue 5 items during frame 1
      scheduler.enqueue(1);
      scheduler.enqueue(2);
      scheduler.enqueue(3);
      scheduler.enqueue(4);
      scheduler.enqueue(5);

      expect(callback).not.toHaveBeenCalled();

      // Advance time by 16ms (simulating 1 frame tick)
      vi.advanceTimersByTime(16);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(flushedBatches[0]).toEqual([1, 2, 3, 4, 5]);
      expect(scheduler.metrics.totalBatches).toBe(1);
      expect(scheduler.metrics.totalProcessedTicks).toBe(5);
      expect(scheduler.metrics.lastBatchSize).toBe(5);
      expect(scheduler.metrics.pendingCount).toBe(0);

      scheduler.stop();
    });

    it("should not call callback on frame tick if buffer is empty", () => {
      const callback = vi.fn();
      const scheduler = new RAFScheduler<string>(callback);
      scheduler.start();

      vi.advanceTimersByTime(32); // 2 frames

      expect(callback).not.toHaveBeenCalled();
      expect(scheduler.metrics.totalBatches).toBe(0);

      scheduler.stop();
    });

    it("should handle bursts of hundreds of items in a single batch", () => {
      const callback = vi.fn();
      const scheduler = new RAFScheduler<number>(callback, 500);
      scheduler.start();

      const items = Array.from({ length: 250 }, (_, i) => i);
      scheduler.enqueueBatch(items);

      expect(scheduler.metrics.pendingCount).toBe(250);

      vi.advanceTimersByTime(16);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(items);
      expect(scheduler.metrics.lastBatchSize).toBe(250);
      expect(scheduler.metrics.totalProcessedTicks).toBe(250);

      scheduler.stop();
    });
  });

  describe("Manual Flush & Lifecycle Control", () => {
    it("should immediately flush pending items when flush() is invoked", () => {
      const callback = vi.fn();
      const scheduler = new RAFScheduler<string>(callback);

      scheduler.enqueue("tick-1");
      scheduler.enqueue("tick-2");
      expect(callback).not.toHaveBeenCalled();

      scheduler.flush();

      expect(callback).toHaveBeenCalledWith(["tick-1", "tick-2"]);
      expect(scheduler.metrics.pendingCount).toBe(0);
    });

    it("should stop the loop and cancel future frame callbacks when stop() is called", () => {
      const callback = vi.fn();
      const scheduler = new RAFScheduler<number>(callback);

      scheduler.start();
      expect(scheduler.isRunning).toBe(true);

      scheduler.stop();
      expect(scheduler.isRunning).toBe(false);

      scheduler.enqueue(42);
      vi.advanceTimersByTime(50);

      // Should not flush because it was stopped
      expect(callback).not.toHaveBeenCalled();
      expect(scheduler.metrics.pendingCount).toBe(1);
    });
  });
});
