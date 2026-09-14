import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { StreamProvider } from "./StreamProvider";
import { useWebSocketBatch } from "./useWebSocketBatch";
import type { UpbitWebSocketMessage } from "@/types/websocket";

// Mock WebSocket
class MockWebSocket {
  public static OPEN = 1;
  public readyState = MockWebSocket.OPEN;
  public binaryType = "arraybuffer";
  public onopen: (() => void) | null = null;
  public onmessage: ((e: MessageEvent) => void) | null = null;
  public onerror: ((e: unknown) => void) | null = null;
  public onclose: (() => void) | null = null;

  public send = vi.fn();
  public close = vi.fn();
}

describe("StreamProvider & useWebSocketBatch", () => {
  const originalWS = globalThis.WebSocket;

  beforeEach(() => {
    vi.useFakeTimers();
    // @ts-expect-error Mocking global WebSocket
    globalThis.WebSocket = MockWebSocket;
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.WebSocket = originalWS;
  });

  it("registers batch listener and initializes without errors", () => {
    const receivedBatches: UpbitWebSocketMessage[][] = [];

    const TestConsumer: React.FC = () => {
      useWebSocketBatch((batch) => {
        receivedBatches.push(batch);
      });
      return <div>Consumer</div>;
    };

    render(
      <StreamProvider>
        <TestConsumer />
      </StreamProvider>,
    );

    expect(receivedBatches).toEqual([]);
  });

  it("handles unmounting consumer without breaking provider", () => {
    const listener = vi.fn();

    const TestConsumer: React.FC = () => {
      useWebSocketBatch(listener);
      return <div>Consumer</div>;
    };

    const { unmount } = render(
      <StreamProvider>
        <TestConsumer />
      </StreamProvider>,
    );

    expect(() => unmount()).not.toThrow();
  });
});
