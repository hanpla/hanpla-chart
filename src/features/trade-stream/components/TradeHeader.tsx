import React from "react";

export const TradeHeader: React.FC = React.memo(() => {
  return (
    <div className="grid select-none grid-cols-12 items-center border-b border-zinc-800/80 px-2.5 pb-1.5 font-mono text-[10px] font-semibold text-zinc-500">
      <span className="col-span-3 text-left">체결시간</span>
      <span className="col-span-4 text-right">체결가 (KRW)</span>
      <span className="col-span-2 text-right">체결량</span>
      <span className="col-span-3 text-right">체결금액</span>
    </div>
  );
});

TradeHeader.displayName = "TradeHeader";
