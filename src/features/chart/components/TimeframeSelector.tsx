import React from "react";
import { TIMEFRAME_OPTIONS } from "../utils/candle-aggregator";
import type { ChartTimeframe } from "../types/chart";

export interface TimeframeSelectorProps {
  selected: ChartTimeframe;
  onChange: (timeframe: ChartTimeframe) => void;
}

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = React.memo(
  ({ selected, onChange }) => {
    return (
      <div className="flex items-center gap-1 rounded bg-zinc-900 p-0.5 font-mono text-xs">
        {TIMEFRAME_OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                isSelected
                  ? "bg-zinc-800 font-semibold text-emerald-400 shadow-sm"
                  : "hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  },
);

TimeframeSelector.displayName = "TimeframeSelector";
