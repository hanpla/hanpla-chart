import React from "react";
import { buttonVariants, type ButtonVariantProps } from "./button-variants";
import { cn } from "@/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
  isActive?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      active,
      isActive,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isButtonActive = isActive ?? active ?? false;

    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={variant === "tab" ? isButtonActive : undefined}
        className={cn(
          buttonVariants({ variant, size, active: isButtonActive }),
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
