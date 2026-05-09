"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium tracking-wide",
    "rounded-lg",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none",
    "whitespace-nowrap",
    "relative overflow-hidden",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-white",
          "hover:bg-primary-hover hover:shadow-glow-green",
          "active:scale-[0.98]",
        ],
        outline: [
          "border border-border bg-transparent text-foreground",
          "hover:bg-background-secondary hover:border-primary hover:text-primary",
          "active:scale-[0.98]",
        ],
        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-background-secondary",
          "active:scale-[0.98]",
        ],
        destructive: [
          "bg-red-600 text-white",
          "hover:bg-red-700 hover:shadow-[0_0_20px_rgba(220,38,38,0.35)]",
          "active:scale-[0.98]",
        ],
        cultural: [
          "text-white font-semibold",
          "bg-gradient-to-r from-forest to-saffron",
          "hover:from-forest-light hover:to-saffron-light",
          "hover:shadow-glow-green",
          "active:scale-[0.98]",
          "before:absolute before:inset-0 before:bg-white/0 hover:before:bg-white/10 before:transition-colors before:duration-200",
        ],
        secondary: [
          "bg-saffron text-white",
          "hover:bg-saffron-light hover:shadow-glow-saffron",
          "active:scale-[0.98]",
        ],
        link: [
          "bg-transparent text-primary underline-offset-4",
          "hover:underline hover:text-primary-hover",
          "p-0 h-auto font-normal",
        ],
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-md gap-1.5",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg rounded-xl gap-3",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-md",
        "icon-lg": "h-12 w-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && (
            <span className="shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )
        )}
        {children}
        {!loading && rightIcon && (
          <span className="shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
