import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "border border-zinc-700 bg-zinc-800 text-zinc-100 shadow-sm hover:bg-zinc-700 hover:text-white",
        tab: "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200",
        outline:
          "border border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
        ghost: "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
        danger:
          "border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
      },
      size: {
        xs: "h-6 rounded px-2 text-[11px]",
        sm: "h-7 rounded px-2.5 text-xs",
        md: "h-8 rounded-md px-3 text-xs",
        icon: "h-7 w-7 rounded p-0",
        "icon-xs": "h-5 w-5 rounded p-0",
      },
      active: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "tab",
        active: true,
        className:
          "border border-zinc-700/80 bg-zinc-800 font-semibold text-zinc-100 shadow-sm",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "sm",
      active: false,
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
