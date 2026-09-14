import React from "react";
import { Activity, AlertCircle, Wifi } from "lucide-react";
import { useMarketStore } from "@/stores";

export const HeaderConnectionBadge: React.FC = React.memo(() => {
  const connectionStatus = useMarketStore((state) => state.connectionStatus);

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case "CONNECTED":
        return {
          bg: "bg-emerald-950/40 text-emerald-400 border-emerald-500/30",
          icon: (
            <Wifi className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
          ),
          label: "WS: LIVE",
        };
      case "CONNECTING":
      case "RECONNECTING":
        return {
          bg: "bg-amber-950/40 text-amber-400 border-amber-500/30",
          icon: (
            <Activity className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ),
          label: `WS: ${connectionStatus}`,
        };
      default:
        return {
          bg: "bg-rose-950/40 text-rose-400 border-rose-500/30",
          icon: <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />,
          label: `WS: ${connectionStatus}`,
        };
    }
  };

  const { bg, icon, label } = getStatusConfig();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs ${bg}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
});

HeaderConnectionBadge.displayName = "HeaderConnectionBadge";
