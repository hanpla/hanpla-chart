import React from "react";
import { Button } from "@/components/ui";
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
            <Button
              key={opt.value}
              variant="tab"
              size="xs"
              isActive={isSelected}
              onClick={() => onChange(opt.value)}
              className={isSelected ? "text-emerald-400" : undefined}
            >
              {opt.label}
            </Button>
          );
        })}
      </div>
    );
  },
);

TimeframeSelector.displayName = "TimeframeSelector";
