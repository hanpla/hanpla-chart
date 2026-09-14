import React from "react";
import { inputVariants, type InputVariantProps } from "./input-variants";
import { cn } from "@/utils/cn";

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    InputVariantProps {
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      leftElement,
      rightElement,
      type = "text",
      ...props
    },
    ref,
  ) => {
    if (leftElement || rightElement) {
      return (
        <div className="relative flex w-full items-center">
          {leftElement && (
            <div className="pointer-events-none absolute left-2.5 flex items-center justify-center text-zinc-500">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              inputVariants({ variant, inputSize }),
              leftElement && "pl-8",
              rightElement && "pr-8",
              className,
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-2 flex items-center justify-center text-zinc-500">
              {rightElement}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type={type}
        className={cn(inputVariants({ variant, inputSize }), className)}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
