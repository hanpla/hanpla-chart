import React from "react";
import { badgeVariants, type BadgeVariantProps } from "./badge-variants";
import { cn } from "@/utils/cn";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, BadgeVariantProps {}

export const Badge: React.FC<BadgeProps> = ({
  className,
  intent,
  size,
  children,
  ...props
}) => {
  return (
    <span className={cn(badgeVariants({ intent, size }), className)} {...props}>
      {children}
    </span>
  );
};

Badge.displayName = "Badge";
