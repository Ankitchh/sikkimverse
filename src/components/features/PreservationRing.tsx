"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface PreservationRingProps {
  score: number;          // 0–100
  size?: number;          // px, default 80
  strokeWidth?: number;   // default 6
  label?: string;
  className?: string;
  color?: string;         // override colour
  animated?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#16a34a";   // green
  if (score >= 50) return "#ca8a04";   // yellow
  return "#dc2626";                     // red
}

function getScoreLabel(score: number): string {
  if (score >= 75) return "Stable";
  if (score >= 50) return "Vulnerable";
  if (score >= 25) return "Endangered";
  return "Critical";
}

export default function PreservationRing({
  score,
  size = 80,
  strokeWidth = 6,
  label,
  className,
  color,
  animated = true,
}: PreservationRingProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const resolvedColor = color ?? getScoreColor(clampedScore);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const motionScore = useMotionValue(0);
  const dashOffset = useTransform(
    motionScore,
    [0, 100],
    [circumference, 0]
  );

  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!animated || !inView) return;
    const controls = animate(motionScore, clampedScore, {
      duration: 1.4,
      ease: "easeOut",
    });
    return controls.stop;
  }, [inView, animated, clampedScore, motionScore]);

  // Non-animated: set immediately
  useEffect(() => {
    if (!animated) {
      motionScore.set(clampedScore);
    }
  }, [animated, clampedScore, motionScore]);

  const cx = size / 2;
  const cy = size / 2;
  const fontSize = size < 60 ? size * 0.22 : size * 0.2;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
        aria-label={`Preservation score: ${clampedScore}%`}
        role="img"
      >
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border opacity-40"
        />
        {/* Progress arc */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>

      {/* Score number overlay — counter-rotate */}
      <div
        className="absolute flex flex-col items-center justify-center pointer-events-none"
        style={{ width: size, height: size }}
      >
        <motion.span
          className="font-bold tabular-nums leading-none"
          style={{
            fontSize: fontSize,
            color: resolvedColor,
          }}
        >
          {animated
            ? <AnimatedNumber from={0} to={clampedScore} inView={inView} />
            : clampedScore}
        </motion.span>
        <span
          className="text-foreground-muted font-medium"
          style={{ fontSize: fontSize * 0.55 }}
        >
          /100
        </span>
      </div>

      {label !== undefined && (
        <p className="text-xs text-foreground-muted text-center font-medium">
          {label || getScoreLabel(clampedScore)}
        </p>
      )}
    </div>
  );
}

// Positioned wrapper that overlays the number on the SVG
export function PreservationRingWithOverlay({
  score,
  size = 80,
  strokeWidth = 6,
  label,
  className,
  color,
  animated = true,
}: PreservationRingProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const resolvedColor = color ?? getScoreColor(clampedScore);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const motionScore = useMotionValue(0);
  const dashOffset = useTransform(motionScore, [0, 100], [circumference, 0]);

  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!animated || !inView) return;
    const controls = animate(motionScore, clampedScore, { duration: 1.4, ease: "easeOut" });
    return controls.stop;
  }, [inView, animated, clampedScore, motionScore]);

  useEffect(() => {
    if (!animated) motionScore.set(clampedScore);
  }, [animated, clampedScore, motionScore]);

  const cx = size / 2;
  const cy = size / 2;
  const fontSize = size < 60 ? size * 0.22 : size * 0.2;

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg]"
        >
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border opacity-40"
          />
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <span
            className="font-bold tabular-nums leading-none"
            style={{ fontSize: fontSize, color: resolvedColor }}
          >
            {animated
              ? <AnimatedNumber from={0} to={clampedScore} inView={inView} />
              : clampedScore}
          </span>
          <span
            className="text-foreground-muted font-medium"
            style={{ fontSize: fontSize * 0.55 }}
          >
            /100
          </span>
        </div>
      </div>
      {label !== undefined && (
        <p className="text-xs text-foreground-muted text-center font-medium">
          {label || getScoreLabel(clampedScore)}
        </p>
      )}
    </div>
  );
}

function AnimatedNumber({
  from,
  to,
  inView,
}: {
  from: number;
  to: number;
  inView: boolean;
}) {
  const value = useMotionValue(from);
  const rounded = useTransform(value, (v) => Math.round(v));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, to, { duration: 1.4, ease: "easeOut" });
    return controls.stop;
  }, [inView, to, value]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = String(v);
    });
    return unsubscribe;
  }, [rounded]);

  return <span ref={ref}>{from}</span>;
}
