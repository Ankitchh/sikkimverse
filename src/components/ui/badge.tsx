import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5",
    "text-xs font-medium leading-none whitespace-nowrap",
    "transition-colors duration-150",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary/10 text-primary border border-primary/20",
          "dark:bg-primary/20 dark:text-primary",
        ],
        secondary: [
          "bg-background-tertiary text-foreground-secondary border border-border",
        ],
        destructive: [
          "bg-red-100 text-red-700 border border-red-200",
          "dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50",
        ],
        outline: [
          "bg-transparent text-foreground border border-border",
          "hover:bg-background-secondary",
        ],
        cultural: [
          "bg-gradient-to-r from-forest-dark via-forest to-saffron-dark",
          "text-white border-0",
        ],
        gold: [
          "bg-gold/15 text-gold-dark border border-gold/30",
          "dark:bg-gold/20 dark:text-gold dark:border-gold/30",
        ],
        success: [
          "bg-emerald-100 text-emerald-700 border border-emerald-200",
          "dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50",
        ],
        saffron: [
          "bg-saffron/15 text-saffron-dark border border-saffron/30",
          "dark:bg-saffron/20 dark:text-saffron dark:border-saffron/30",
        ],
        mountain: [
          "bg-mountain/10 text-mountain border border-mountain/20",
          "dark:bg-mountain/20 dark:text-mountain-light dark:border-mountain/30",
        ],
      },
      size: {
        sm: "px-2 py-px text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      {dot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80 shrink-0"
          aria-hidden
        />
      )}
      {children}
    </span>
  )
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
