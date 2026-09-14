import React from "react";
import { Activity } from "lucide-react";

export interface HeaderTelemetryProps {
  ticksCount: number;
}

export const HeaderTelemetry: React.FC<HeaderTelemetryProps> = React.memo(
  ({ ticksCount }) => {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-xs text-zinc-400">
        <Activity className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
        <span>Ticks: {ticksCount.toLocaleString()}</span>
      </div>
    );
  },
);

HeaderTelemetry.displayName = "HeaderTelemetry";
