import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const skeletonVariants = cva(
  [
    "shimmer-bg",
    "animate-shimmer",
    "transition-opacity duration-300",
  ],
  {
    variants: {
      shape: {
        rect: "rounded-md",
        circle: "rounded-full",
        text: "rounded h-4",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      shape: "rect",
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, shape, width, height, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(skeletonVariants({ shape, className }))}
      aria-hidden="true"
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  )
);

Skeleton.displayName = "Skeleton";

// Pre-built skeleton patterns
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          shape="text"
          style={{ width: i === lines - 1 ? "70%" : "100%" }}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background-secondary p-6 flex flex-col gap-4",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" width={40} height={40} />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton shape="text" style={{ width: "60%" }} />
          <Skeleton shape="text" style={{ width: "40%", height: "12px" }} />
        </div>
      </div>
      <SkeletonText lines={3} />
      <Skeleton height={160} shape="rect" />
    </div>
  );
}

function SkeletonAvatar({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton
      shape="circle"
      width={size}
      height={size}
      className={className}
    />
  );
}

function SkeletonButton({
  width = 120,
  className,
}: {
  width?: number | string;
  className?: string;
}) {
  return (
    <Skeleton
      shape="pill"
      width={width}
      height={40}
      className={className}
    />
  );
}

function SkeletonBadge({ className }: { className?: string }) {
  return (
    <Skeleton shape="pill" width={72} height={22} className={className} />
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonBadge,
  skeletonVariants,
};
