"use client";

import React, { forwardRef, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

const avatarVariants = cva(
  [
    "relative inline-flex items-center justify-center shrink-0",
    "overflow-hidden rounded-full font-semibold select-none",
    "bg-gradient-to-br from-forest to-forest-light text-white",
    "transition-all duration-200",
  ],
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[9px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
        "2xl": "h-20 w-20 text-xl",
      },
      ring: {
        none: "",
        default: "ring-2 ring-border ring-offset-1 ring-offset-background",
        primary: "ring-2 ring-primary ring-offset-1 ring-offset-background",
        secondary: "ring-2 ring-secondary ring-offset-1 ring-offset-background",
        gold: "ring-2 ring-gold ring-offset-1 ring-offset-background",
        cultural: [
          "ring-2 ring-offset-1 ring-offset-background",
          "ring-forest",
        ],
      },
    },
    defaultVariants: {
      size: "md",
      ring: "none",
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  name?: string;
  fallback?: React.ReactNode;
}

const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      className,
      size,
      ring,
      src,
      alt,
      name,
      fallback,
      ...props
    },
    ref
  ) => {
    const [imgError, setImgError] = useState(false);
    const showImage = src && !imgError;
    const initials = name ? getInitials(name) : null;

    return (
      <span
        ref={ref}
        className={cn(avatarVariants({ size, ring, className }))}
        role={alt ? "img" : undefined}
        aria-label={alt ?? name}
        {...props}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt ?? name ?? "avatar"}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
            draggable={false}
          />
        ) : fallback ? (
          fallback
        ) : initials ? (
          <span className="leading-none">{initials}</span>
        ) : (
          <DefaultAvatarIcon />
        )}
      </span>
    );
  }
);

Avatar.displayName = "Avatar";

function DefaultAvatarIcon() {
  return (
    <svg
      className="h-[60%] w-[60%] text-white/80"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

// Avatar group for stacked display
interface AvatarGroupProps {
  avatars: Array<{ src?: string | null; name?: string; alt?: string }>;
  max?: number;
  size?: VariantProps<typeof avatarVariants>["size"];
  className?: string;
}

function AvatarGroup({ avatars, max = 4, size = "sm", className }: AvatarGroupProps) {
  const displayed = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayed.map((av, i) => (
        <Avatar
          key={i}
          src={av.src}
          name={av.name}
          alt={av.alt}
          size={size}
          ring="default"
          className="relative z-[calc(10-var(--i,0))]"
          style={{ "--i": i } as React.CSSProperties}
        />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            avatarVariants({ size, ring: "default" }),
            "bg-background-tertiary text-foreground-secondary text-[10px] font-semibold z-0"
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

export { Avatar, AvatarGroup, avatarVariants };
