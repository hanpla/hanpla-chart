import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../ui";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary caught an error]:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center font-mono">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-zinc-200">
              {this.props.fallbackTitle ?? "모듈 실행 중 오류가 발생했습니다."}
            </span>
            <span className="max-w-xs truncate text-[11px] text-zinc-500">
              {this.state.error?.message ?? "알 수 없는 런타임 예외"}
            </span>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={this.handleReset}
            className="gap-1.5"
          >
            <RefreshCw className="h-3 w-3" />
            <span>다시 시도</span>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
