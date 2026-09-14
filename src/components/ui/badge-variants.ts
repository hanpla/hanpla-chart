import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center justify-center font-mono font-medium transition-colors select-none",
  {
    variants: {
      intent: {
        up: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        down: "border border-rose-500/20 bg-rose-500/10 text-rose-400",
        neutral: "border border-zinc-700 bg-zinc-800 text-zinc-300",
        warning: "border border-amber-500/30 bg-amber-500/15 text-amber-400",
        whale: "bg-amber-400 font-bold text-zinc-950 shadow-sm",
        live: "border border-emerald-500/30 bg-emerald-950/40 text-emerald-400",
      },
      size: {
        xs: "rounded px-1 py-0.2 text-[9px]",
        sm: "rounded px-1.5 py-0.5 text-[10px]",
        md: "rounded-md px-2 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      intent: "neutral",
      size: "sm",
    },
  },
);

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
