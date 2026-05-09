"use client";

import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  containerClassName?: string;
  labelClassName?: string;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      labelClassName,
      wrapperClassName,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      id: propId,
      type = "text",
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = propId ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium text-foreground-secondary leading-none",
              disabled && "opacity-50",
              labelClassName
            )}
          >
            {label}
          </label>
        )}

        <div className={cn("relative flex items-center", wrapperClassName)}>
          {leftIcon && (
            <span
              className={cn(
                "absolute left-3 flex items-center justify-center text-foreground-muted pointer-events-none",
                "h-4 w-4 shrink-0"
              )}
              aria-hidden
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              [errorId, hintId].filter(Boolean).join(" ") || undefined
            }
            className={cn(
              "w-full rounded-md border bg-background-secondary text-foreground",
              "px-3.5 py-2.5 text-sm leading-none",
              "placeholder:text-foreground-muted",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error
                ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/30"
                : "border-border hover:border-foreground-muted/50",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <span
              className={cn(
                "absolute right-3 flex items-center justify-center text-foreground-muted",
                "h-4 w-4 shrink-0",
                onRightIconClick
                  ? "cursor-pointer hover:text-foreground transition-colors"
                  : "pointer-events-none"
              )}
              onClick={onRightIconClick}
              aria-hidden={!onRightIconClick}
              role={onRightIconClick ? "button" : undefined}
              tabIndex={onRightIconClick ? 0 : undefined}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && hint && (
          <p
            id={hintId}
            className="text-xs text-foreground-muted"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
