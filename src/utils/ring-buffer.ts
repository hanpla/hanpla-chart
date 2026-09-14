/**
 * CircularRingBuffer
 *
 * A high-performance, fixed-capacity circular ring buffer.
 * Provides O(1) push, pop, and bulk drain operations without array re-allocations.
 * When the buffer reaches capacity, newly pushed items overwrite the oldest items
 * (FIFO overflow semantics) to prevent unbounded memory growth and main thread blocking.
 */
export class CircularRingBuffer<T> {
  private readonly buffer: (T | undefined)[];
  private readonly capacity: number;
  private head: number = 0; // Next insertion index
  private tail: number = 0; // Oldest item index
  private count: number = 0;

  constructor(capacity: number = 2048) {
    if (capacity <= 0 || !Number.isInteger(capacity)) {
      throw new Error(
        `Invalid RingBuffer capacity: ${capacity}. Must be a positive integer.`,
      );
    }
    this.capacity = capacity;
    this.buffer = new Array<T | undefined>(capacity);
  }

  /**
   * Pushes a new item into the ring buffer.
   * If the buffer is full, it overwrites the oldest item.
   * @returns boolean - true if pushed without overflow, false if an item was overwritten
   */
  public push(item: T): boolean {
    const isOverwriting = this.count === this.capacity;

    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;

    if (isOverwriting) {
      // Overwritten oldest item, advance tail
      this.tail = (this.tail + 1) % this.capacity;
      return false;
    }

    this.count++;
    return true;
  }

  /**
   * Pops and removes the oldest item from the buffer.
   * @returns T | undefined
   */
  public pop(): T | undefined {
    if (this.count === 0) {
      return undefined;
    }

    const item = this.buffer[this.tail];
    // Release reference to avoid memory retention
    this.buffer[this.tail] = undefined;
    this.tail = (this.tail + 1) % this.capacity;
    this.count--;

    return item;
  }

  /**
   * Peeks at the oldest item without removing it.
   */
  public peek(): T | undefined {
    if (this.count === 0) {
      return undefined;
    }
    return this.buffer[this.tail];
  }

  /**
   * Drains all items currently in the buffer in FIFO order,
   * resetting the buffer to empty.
   * @returns T[]
   */
  public drainAll(): T[] {
    if (this.count === 0) {
      return [];
    }

    const total = this.count;
    const result = new Array<T>(total);

    for (let i = 0; i < total; i++) {
      const idx = (this.tail + i) % this.capacity;
      result[i] = this.buffer[idx] as T;
      this.buffer[idx] = undefined;
    }

    this.head = 0;
    this.tail = 0;
    this.count = 0;

    return result;
  }

  /**
   * Returns a copy of the buffer items in FIFO order without draining.
   */
  public toArray(): T[] {
    if (this.count === 0) {
      return [];
    }

    const result = new Array<T>(this.count);
    for (let i = 0; i < this.count; i++) {
      result[i] = this.buffer[(this.tail + i) % this.capacity] as T;
    }

    return result;
  }

  /**
   * Clears all items and resets pointers.
   */
  public clear(): void {
    for (let i = 0; i < this.capacity; i++) {
      this.buffer[i] = undefined;
    }
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  /** Current number of elements stored */
  public get size(): number {
    return this.count;
  }

  /** Maximum capacity of the buffer */
  public get maxCapacity(): number {
    return this.capacity;
  }

  /** Whether the buffer is currently empty */
  public get isEmpty(): boolean {
    return this.count === 0;
  }

  /** Whether the buffer is currently full */
  public get isFull(): boolean {
    return this.count === this.capacity;
  }
}
