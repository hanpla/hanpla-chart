import type { ConnectionStatus } from "@/types";
import type { UpbitWebSocketMessage } from "@/types/websocket";

export interface WebSocketManagerOptions {
  url?: string;
  initialSymbol?: string;
  heartbeatTimeoutMs?: number;
  baseReconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
  onMessage?: (message: UpbitWebSocketMessage) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onError?: (error: unknown) => void;
}

/**
 * WebSocketManager
 *
 * Manages resilient, multiplexed WebSocket connection to Upbit Public WebSocket API.
 * Features:
 * - Binary ArrayBuffer decoding via TextDecoder
 * - Exponential backoff with random jitter for automatic reconnections
 * - Heartbeat watchdog timer to eliminate zombie/ghost connections
 * - Visibility change detection for seamless background-to-foreground recovery
 */
export class WebSocketManager {
  private readonly url: string;
  private currentSymbol: string;
  private readonly heartbeatTimeoutMs: number;
  private readonly baseReconnectDelayMs: number;
  private readonly maxReconnectDelayMs: number;

  private onMessageCallback?: (message: UpbitWebSocketMessage) => void;
  private onStatusChangeCallback?: (status: ConnectionStatus) => void;
  private onErrorCallback?: (error: unknown) => void;

  private ws: WebSocket | null = null;
  private status: ConnectionStatus = "DISCONNECTED";
  private reconnectAttempt: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly connectionTimeoutMs: number = 10000;
  private textDecoder: TextDecoder = new TextDecoder();
  private isDestroyed: boolean = false;

  constructor(options: WebSocketManagerOptions = {}) {
    this.url = options.url ?? "wss://api.upbit.com/websocket/v1";
    this.currentSymbol = options.initialSymbol ?? "KRW-BTC";
    this.heartbeatTimeoutMs = options.heartbeatTimeoutMs ?? 30000;
    this.baseReconnectDelayMs = options.baseReconnectDelayMs ?? 1000;
    this.maxReconnectDelayMs = options.maxReconnectDelayMs ?? 30000;

    this.onMessageCallback = options.onMessage;
    this.onStatusChangeCallback = options.onStatusChange;
    this.onErrorCallback = options.onError;

    this.attachVisibilityListener();
  }

  /**
   * Initiates the WebSocket connection.
   */
  public connect(symbol?: string): void {
    if (this.isDestroyed) {
      return;
    }

    if (symbol) {
      this.currentSymbol = symbol;
    }

    // Guard: Prevent tearing down an actively connecting or open socket
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.sendSubscriptionPayload();
      }
      return;
    }

    this.clearReconnectTimer();
    this.clearConnectionTimeoutTimer();
    this.closeExistingSocket();

    this.setStatus(this.reconnectAttempt > 0 ? "RECONNECTING" : "CONNECTING");

    try {
      const socket = new WebSocket(this.url);
      socket.binaryType = "arraybuffer";

      socket.onopen = this.handleOpen;
      socket.onmessage = this.handleMessage;
      socket.onerror = this.handleError;
      socket.onclose = this.handleClose;

      this.ws = socket;
      this.startConnectionTimeout();
    } catch (err) {
      this.handleError(err);
      this.scheduleReconnect();
    }
  }

  /**
   * Switches the active market subscription without reconnecting if socket is OPEN.
   */
  public subscribe(symbol: string): void {
    this.currentSymbol = symbol;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendSubscriptionPayload();
    }
  }

  /**
   * Manually disconnects the WebSocket.
   */
  public disconnect(): void {
    this.clearReconnectTimer();
    this.clearHeartbeatTimer();
    this.clearConnectionTimeoutTimer();
    this.reconnectAttempt = 0;
    this.closeExistingSocket();
    this.setStatus("DISCONNECTED");
  }

  /**
   * Completely destroys the manager, detaching event listeners.
   */
  public destroy(): void {
    this.isDestroyed = true;
    this.disconnect();
    this.detachVisibilityListener();
  }

  /**
   * Current connection status.
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Current subscribed symbol.
   */
  public getSymbol(): string {
    return this.currentSymbol;
  }

  // -------------------------------------------------------------
  // Internal Event Handlers
  // -------------------------------------------------------------

  private handleOpen = (): void => {
    if (this.isDestroyed) {
      return;
    }

    this.clearConnectionTimeoutTimer();
    this.reconnectAttempt = 0;
    this.setStatus("CONNECTED");
    this.sendSubscriptionPayload();
    this.resetHeartbeatTimer();
  };

  private handleMessage = (event: MessageEvent): void => {
    if (this.isDestroyed) {
      return;
    }

    this.resetHeartbeatTimer();

    try {
      const isBuffer =
        event.data instanceof ArrayBuffer ||
        ArrayBuffer.isView(event.data) ||
        Object.prototype.toString.call(event.data) === "[object ArrayBuffer]";

      if (isBuffer) {
        const rawText = this.textDecoder.decode(event.data as ArrayBuffer);
        this.dispatchMessage(rawText);
      } else if (typeof event.data === "string") {
        this.dispatchMessage(event.data);
      } else if (typeof Blob !== "undefined" && event.data instanceof Blob) {
        // Asynchronous fallback for Blob format
        event.data
          .text()
          .then((rawText) => {
            if (!this.isDestroyed) {
              this.dispatchMessage(rawText);
            }
          })
          .catch(this.handleError);
      }
    } catch (err) {
      this.handleError(err);
    }
  };

  private dispatchMessage(rawText: string): void {
    const parsed = JSON.parse(rawText) as UpbitWebSocketMessage;
    if (this.onMessageCallback) {
      this.onMessageCallback(parsed);
    }
  }

  private handleError = (err: unknown): void => {
    if (this.isDestroyed) {
      return;
    }

    if (this.onErrorCallback) {
      this.onErrorCallback(err);
    }
  };

  private handleClose = (): void => {
    if (this.isDestroyed) {
      return;
    }

    this.clearConnectionTimeoutTimer();
    this.clearHeartbeatTimer();

    if (this.status !== "DISCONNECTED") {
      this.scheduleReconnect();
    }
  };

  // -------------------------------------------------------------
  // Subscription & Protocol Helpers
  // -------------------------------------------------------------

  private sendSubscriptionPayload(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const ticket = `pulse-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const payload = [
      { ticket },
      { type: "ticker", codes: [this.currentSymbol] },
      { type: "orderbook", codes: [this.currentSymbol] },
      { type: "trade", codes: [this.currentSymbol] },
    ];

    this.ws.send(JSON.stringify(payload));
  }

  // -------------------------------------------------------------
  // Reconnection & Heartbeat Watchdog
  // -------------------------------------------------------------

  private scheduleReconnect(): void {
    this.clearReconnectTimer();

    this.setStatus("RECONNECTING");
    this.reconnectAttempt += 1;

    // Exponential backoff: Math.min(base * 2^attempt, max) + jitter
    const exponential =
      this.baseReconnectDelayMs * Math.pow(2, this.reconnectAttempt);
    const capped = Math.min(exponential, this.maxReconnectDelayMs);
    const jitter = Math.floor(Math.random() * 500);
    const delay = capped + jitter;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private resetHeartbeatTimer(): void {
    this.clearHeartbeatTimer();

    this.heartbeatTimer = setTimeout(() => {
      // Zombie connection detected (no frame received within heartbeatTimeoutMs)
      this.handleZombieConnection();
    }, this.heartbeatTimeoutMs);
  }

  private handleZombieConnection(): void {
    this.closeExistingSocket();
    this.scheduleReconnect();
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status === status) {
      return;
    }
    this.status = status;
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }

  private closeExistingSocket(): void {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close();
      }
      this.ws = null;
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearHeartbeatTimer(): void {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private startConnectionTimeout(): void {
    this.clearConnectionTimeoutTimer();
    this.connectionTimeoutTimer = setTimeout(() => {
      // Handshake timed out before reaching OPEN state
      if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
        this.closeExistingSocket();
        this.scheduleReconnect();
      }
    }, this.connectionTimeoutMs);
  }

  private clearConnectionTimeoutTimer(): void {
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
  }

  // -------------------------------------------------------------
  // Visibility State Handling
  // -------------------------------------------------------------

  private handleVisibilityChange = (): void => {
    if (typeof document === "undefined" || this.isDestroyed) {
      return;
    }

    if (document.visibilityState === "visible") {
      // When user returns to tab, only connect if socket is NOT OPEN and NOT CONNECTING
      if (
        !this.ws ||
        (this.ws.readyState !== WebSocket.OPEN &&
          this.ws.readyState !== WebSocket.CONNECTING)
      ) {
        this.reconnectAttempt = 0;
        this.connect();
      }
    }
  };

  private attachVisibilityListener(): void {
    if (
      typeof document !== "undefined" &&
      typeof document.addEventListener === "function"
    ) {
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange,
      );
    }
  }

  private detachVisibilityListener(): void {
    if (
      typeof document !== "undefined" &&
      typeof document.removeEventListener === "function"
    ) {
      document.removeEventListener(
        "visibilitychange",
        this.handleVisibilityChange,
      );
    }
  }
}
