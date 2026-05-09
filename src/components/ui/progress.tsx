"use client";

import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressTrackVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-background-tertiary",
  {
    variants: {
      size: {
        xs: "h-1",
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4",
        xl: "h-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const progressFillVariants = cva(
  [
    "h-full rounded-full transition-all duration-500 ease-out",
    "relative overflow-hidden",
  ],
  {
    variants: {
      color: {
        primary: "bg-primary",
        secondary: "bg-secondary",
        accent: "bg-accent",
        cultural: "bg-gradient-to-r from-forest via-forest-light to-saffron",
        gold: "bg-gradient-to-r from-gold-dark to-gold-light",
        forest: "bg-gradient-to-r from-forest-dark to-forest-light",
        saffron: "bg-gradient-to-r from-saffron-dark to-saffron-light",
        success: "bg-emerald-500",
        danger: "bg-red-500",
        mountain: "bg-gradient-to-r from-mountain-dark to-mountain-light",
      },
    },
    defaultVariants: {
      color: "cultural",
    },
  }
);

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof progressTrackVariants>,
    VariantProps<typeof progressFillVariants> {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  animated?: boolean;
  striped?: boolean;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      size,
      color,
      value,
      max = 100,
      label,
      showValue = false,
      animated = true,
      striped = false,
      ...props
    },
    ref
  ) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
        {(label || showValue) && (
          <div className="flex items-center justify-between gap-2">
            {label && (
              <span className="text-sm font-medium text-foreground-secondary truncate">
                {label}
              </span>
            )}
            {showValue && (
              <span className="text-xs font-medium text-foreground-muted tabular-nums shrink-0">
                {Math.round(pct)}%
              </span>
            )}
          </div>
        )}

        <div
          className={cn(progressTrackVariants({ size }))}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        >
          <div
            className={cn(
              progressFillVariants({ color }),
              striped && [
                "bg-[length:16px_16px]",
                "bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]",
                animated && "animate-[progress-stripes_1s_linear_infinite]",
              ]
            )}
            style={{ width: `${pct}%` }}
          >
            {animated && !striped && (
              <span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                style={{ backgroundSize: "200% 100%" }}
                aria-hidden
              />
            )}
          </div>
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

// Circular progress variant
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: React.ReactNode;
  className?: string;
}

function CircularProgress({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  color = "var(--primary)",
  trackColor = "var(--border)",
  label,
  className,
}: CircularProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          {label}
        </div>
      )}
    </div>
  );
}

export { Progress, CircularProgress, progressTrackVariants, progressFillVariants };
