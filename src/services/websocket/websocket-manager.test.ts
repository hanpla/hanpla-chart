import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WebSocketManager } from "./websocket-manager";
import type { ConnectionStatus } from "@/types";
import type { UpbitWebSocketMessage } from "@/types/websocket";

// Mock WebSocket class
class MockWebSocket {
  public static OPEN = 1;
  public static CONNECTING = 0;
  public static CLOSING = 2;
  public static CLOSED = 3;

  public readyState: number = MockWebSocket.CONNECTING;
  public binaryType: string = "blob";
  public url: string;

  public onopen: (() => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((error: Event) => void) | null = null;
  public onclose: (() => void) | null = null;

  public sentMessages: string[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  public send(data: string): void {
    this.sentMessages.push(data);
  }

  public close(): void {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose();
    }
  }

  // Helper to trigger open
  public simulateOpen(): void {
    this.readyState = MockWebSocket.OPEN;
    if (this.onopen) {
      this.onopen();
    }
  }

  // Helper to trigger message
  public simulateMessage(data: string | ArrayBuffer): void {
    if (this.onmessage) {
      this.onmessage({ data } as MessageEvent);
    }
  }

  public static instances: MockWebSocket[] = [];
  public static clear(): void {
    MockWebSocket.instances = [];
  }
}

describe("WebSocketManager", () => {
  const originalWebSocket = globalThis.WebSocket;

  beforeEach(() => {
    vi.useFakeTimers();
    MockWebSocket.clear();
    // @ts-expect-error Mocking global WebSocket
    globalThis.WebSocket = MockWebSocket;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.WebSocket = originalWebSocket;
  });

  it("should initialize with default parameters", () => {
    const manager = new WebSocketManager({ initialSymbol: "KRW-BTC" });
    expect(manager.getStatus()).toBe("DISCONNECTED");
    expect(manager.getSymbol()).toBe("KRW-BTC");
  });

  it("should connect and send subscription payload upon open", () => {
    const statusChanges: ConnectionStatus[] = [];
    const manager = new WebSocketManager({
      initialSymbol: "KRW-BTC",
      onStatusChange: (status) => statusChanges.push(status),
    });

    manager.connect();
    expect(manager.getStatus()).toBe("CONNECTING");

    const socket = MockWebSocket.instances[0];
    expect(socket).toBeDefined();
    expect(socket?.binaryType).toBe("arraybuffer");

    socket?.simulateOpen();

    expect(manager.getStatus()).toBe("CONNECTED");
    expect(statusChanges).toContain("CONNECTING");
    expect(statusChanges).toContain("CONNECTED");

    // Verify subscription payload
    expect(socket?.sentMessages.length).toBe(1);
    const payload = JSON.parse(socket!.sentMessages[0]!);
    expect(payload[1]).toEqual({ type: "ticker", codes: ["KRW-BTC"] });
    expect(payload[2]).toEqual({ type: "orderbook", codes: ["KRW-BTC"] });
    expect(payload[3]).toEqual({ type: "trade", codes: ["KRW-BTC"] });
  });

  it("should parse text and binary messages and invoke onMessage", async () => {
    const receivedMessages: UpbitWebSocketMessage[] = [];
    const manager = new WebSocketManager({
      initialSymbol: "KRW-BTC",
      onMessage: (msg) => receivedMessages.push(msg),
    });

    manager.connect();
    const socket = MockWebSocket.instances[0];
    socket?.simulateOpen();

    const mockTicker = {
      type: "ticker",
      code: "KRW-BTC",
      trade_price: 100000000,
      timestamp: Date.now(),
    };

    // 1. Test string message
    socket?.simulateMessage(JSON.stringify(mockTicker));
    await Promise.resolve();
    expect(receivedMessages.length).toBe(1);
    expect(receivedMessages[0]?.type).toBe("ticker");

    // 2. Test binary ArrayBuffer message
    const encoder = new TextEncoder();
    const binaryData = encoder.encode(JSON.stringify(mockTicker)).buffer;
    socket?.simulateMessage(binaryData);
    await Promise.resolve();
    expect(receivedMessages.length).toBe(2);
    expect(receivedMessages[1]?.code).toBe("KRW-BTC");
  });

  it("should switch subscription when subscribe is called on OPEN socket", () => {
    const manager = new WebSocketManager({ initialSymbol: "KRW-BTC" });
    manager.connect();

    const socket = MockWebSocket.instances[0];
    socket?.simulateOpen();
    expect(socket?.sentMessages.length).toBe(1);

    manager.subscribe("KRW-ETH");
    expect(manager.getSymbol()).toBe("KRW-ETH");
    expect(socket?.sentMessages.length).toBe(2);

    const payload = JSON.parse(socket!.sentMessages[1]!);
    expect(payload[1].codes).toEqual(["KRW-ETH"]);
  });

  it("should trigger exponential backoff reconnect on socket closure", () => {
    const statusChanges: ConnectionStatus[] = [];
    const manager = new WebSocketManager({
      baseReconnectDelayMs: 1000,
      maxReconnectDelayMs: 4000,
      onStatusChange: (status) => statusChanges.push(status),
    });

    manager.connect();
    const socket1 = MockWebSocket.instances[0];
    socket1?.simulateOpen();

    // Abrupt socket close
    socket1?.close();
    expect(manager.getStatus()).toBe("RECONNECTING");

    // Advance time to trigger reconnect timer (2000ms base + up to 500ms jitter)
    vi.advanceTimersByTime(3000);

    // A second socket should have been created
    expect(MockWebSocket.instances.length).toBe(2);
    expect(manager.getStatus()).toBe("RECONNECTING");

    MockWebSocket.instances[1]?.simulateOpen();
    expect(manager.getStatus()).toBe("CONNECTED");
  });

  it("should trigger watchdog reconnect if heartbeat times out", () => {
    const manager = new WebSocketManager({
      heartbeatTimeoutMs: 5000,
    });

    manager.connect();
    const socket1 = MockWebSocket.instances[0];
    socket1?.simulateOpen();
    expect(manager.getStatus()).toBe("CONNECTED");

    // Advance time past heartbeat timeout (5000ms)
    vi.advanceTimersByTime(5001);

    // Socket should have closed and scheduled reconnect
    expect(socket1?.readyState).toBe(MockWebSocket.CLOSED);
    expect(manager.getStatus()).toBe("RECONNECTING");

    manager.destroy();
  });

  it("should cleanly disconnect without reconnecting", () => {
    const manager = new WebSocketManager();
    manager.connect();
    const socket = MockWebSocket.instances[0];
    socket?.simulateOpen();

    manager.disconnect();
    expect(manager.getStatus()).toBe("DISCONNECTED");
    expect(socket?.readyState).toBe(MockWebSocket.CLOSED);

    // Even if time advances, no new connection is made
    vi.advanceTimersByTime(10000);
    expect(MockWebSocket.instances.length).toBe(1);
  });
});
