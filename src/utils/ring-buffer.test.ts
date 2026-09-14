import { describe, it, expect } from "vitest";
import { CircularRingBuffer } from "./ring-buffer";

describe("CircularRingBuffer", () => {
  describe("Initialization & Validation", () => {
    it("should initialize with default capacity 2048", () => {
      const rb = new CircularRingBuffer<number>();
      expect(rb.maxCapacity).toBe(2048);
      expect(rb.size).toBe(0);
      expect(rb.isEmpty).toBe(true);
      expect(rb.isFull).toBe(false);
    });

    it("should initialize with custom capacity", () => {
      const rb = new CircularRingBuffer<string>(10);
      expect(rb.maxCapacity).toBe(10);
      expect(rb.size).toBe(0);
    });

    it("should throw on invalid capacity", () => {
      expect(() => new CircularRingBuffer<number>(0)).toThrow();
      expect(() => new CircularRingBuffer<number>(-5)).toThrow();
      expect(() => new CircularRingBuffer<number>(3.14)).toThrow();
    });
  });

  describe("Push & Pop Operations (FIFO)", () => {
    it("should push and pop items in FIFO order", () => {
      const rb = new CircularRingBuffer<number>(5);

      expect(rb.push(10)).toBe(true);
      expect(rb.push(20)).toBe(true);
      expect(rb.push(30)).toBe(true);

      expect(rb.size).toBe(3);
      expect(rb.isEmpty).toBe(false);
      expect(rb.isFull).toBe(false);

      expect(rb.pop()).toBe(10);
      expect(rb.pop()).toBe(20);
      expect(rb.pop()).toBe(30);
      expect(rb.pop()).toBeUndefined();
      expect(rb.isEmpty).toBe(true);
    });

    it("should peek the oldest item without removing it", () => {
      const rb = new CircularRingBuffer<string>(3);
      expect(rb.peek()).toBeUndefined();

      rb.push("first");
      rb.push("second");

      expect(rb.peek()).toBe("first");
      expect(rb.size).toBe(2);
      expect(rb.pop()).toBe("first");
      expect(rb.peek()).toBe("second");
    });
  });

  describe("Overflow & Wrap-around Behavior", () => {
    it("should overwrite the oldest item when full and return false on push", () => {
      const rb = new CircularRingBuffer<number>(3);

      expect(rb.push(1)).toBe(true);
      expect(rb.push(2)).toBe(true);
      expect(rb.push(3)).toBe(true);
      expect(rb.isFull).toBe(true);

      // Overflow pushes: oldest items (1, then 2) should be dropped
      expect(rb.push(4)).toBe(false);
      expect(rb.size).toBe(3);

      expect(rb.push(5)).toBe(false);
      expect(rb.size).toBe(3);

      // Remaining items in FIFO order: 3, 4, 5
      expect(rb.pop()).toBe(3);
      expect(rb.pop()).toBe(4);
      expect(rb.pop()).toBe(5);
      expect(rb.pop()).toBeUndefined();
    });

    it("should handle multi-cycle wrap-around correctly", () => {
      const capacity = 4;
      const rb = new CircularRingBuffer<number>(capacity);

      // Push 10 items into capacity 4
      for (let i = 0; i < 10; i++) {
        rb.push(i);
      }

      expect(rb.size).toBe(4);
      expect(rb.isFull).toBe(true);
      // Items remaining should be [6, 7, 8, 9]
      expect(rb.toArray()).toEqual([6, 7, 8, 9]);
    });
  });

  describe("drainAll & toArray", () => {
    it("should return empty array when draining empty buffer", () => {
      const rb = new CircularRingBuffer<number>(10);
      expect(rb.drainAll()).toEqual([]);
    });

    it("should drain all items and reset buffer state", () => {
      const rb = new CircularRingBuffer<number>(5);
      rb.push(100);
      rb.push(200);
      rb.push(300);

      const items = rb.drainAll();
      expect(items).toEqual([100, 200, 300]);
      expect(rb.size).toBe(0);
      expect(rb.isEmpty).toBe(true);

      // Can push again after draining
      rb.push(400);
      expect(rb.pop()).toBe(400);
    });

    it("should correctly drain items after rollover", () => {
      const rb = new CircularRingBuffer<number>(3);
      rb.push(1);
      rb.push(2);
      rb.push(3);
      rb.push(4); // Overwrites 1 -> [2, 3, 4]
      rb.push(5); // Overwrites 2 -> [3, 4, 5]

      const items = rb.drainAll();
      expect(items).toEqual([3, 4, 5]);
      expect(rb.size).toBe(0);
      expect(rb.isEmpty).toBe(true);
    });

    it("should return copy of elements with toArray without modifying buffer", () => {
      const rb = new CircularRingBuffer<string>(3);
      rb.push("a");
      rb.push("b");

      const arr = rb.toArray();
      expect(arr).toEqual(["a", "b"]);
      expect(rb.size).toBe(2);
    });
  });

  describe("clear", () => {
    it("should clear all elements and reset indices", () => {
      const rb = new CircularRingBuffer<number>(4);
      rb.push(1);
      rb.push(2);
      rb.push(3);
      rb.push(4);
      rb.push(5); // Wrap around

      rb.clear();
      expect(rb.size).toBe(0);
      expect(rb.isEmpty).toBe(true);
      expect(rb.isFull).toBe(false);
      expect(rb.pop()).toBeUndefined();
      expect(rb.drainAll()).toEqual([]);
    });
  });

  describe("High-Frequency Load Stress Test", () => {
    it("should sustain 10,000 rapid pushes without index corruption", () => {
      const capacity = 2048;
      const rb = new CircularRingBuffer<number>(capacity);

      for (let i = 0; i < 10000; i++) {
        rb.push(i);
      }

      expect(rb.size).toBe(capacity);
      expect(rb.isFull).toBe(true);

      // Expected last 2048 items: 10000 - 2048 = 7952 to 9999
      const drained = rb.drainAll();
      expect(drained.length).toBe(capacity);
      expect(drained[0]).toBe(10000 - capacity);
      expect(drained[capacity - 1]).toBe(9999);
      expect(rb.isEmpty).toBe(true);
    });
  });
});
