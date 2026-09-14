import { cva, type VariantProps } from "class-variance-authority";

export const inputVariants = cva(
  "w-full rounded border text-xs transition-colors placeholder:text-zinc-500 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-zinc-800 bg-zinc-900/90 text-zinc-200 focus:border-zinc-700 focus:ring-emerald-500/30",
        filled:
          "border-transparent bg-zinc-800 text-zinc-200 focus:border-zinc-700 focus:ring-emerald-500/30",
      },
      inputSize: {
        xs: "h-6 px-2 text-[11px]",
        sm: "h-7 px-2.5 text-xs",
        md: "h-8 px-3 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "sm",
    },
  },
);

export type InputVariantProps = VariantProps<typeof inputVariants>;
