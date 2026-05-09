"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  streakDays: number;
  practicedDays?: boolean[]; // 7 booleans, Mon–Sun
  compact?: boolean;
  className?: string;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getStreakMessage(days: number): string {
  if (days === 0) return "Start your streak today!";
  if (days === 1) return "Great start! Come back tomorrow.";
  if (days < 5)  return "Keep it going!";
  if (days < 10) return "You're on fire! 🔥";
  if (days < 30) return "Incredible dedication!";
  if (days < 100) return "Legend in the making!";
  return "A true Heritage Guardian!";
}

function getFlameColor(days: number): { outer: string; inner: string } {
  if (days === 0) return { outer: "#94A3B8", inner: "#CBD5E1" };
  if (days < 5)   return { outer: "#F97316", inner: "#FDE68A" };
  if (days < 15)  return { outer: "#EF4444", inner: "#FCA5A5" };
  if (days < 30)  return { outer: "#DC2626", inner: "#F97316" };
  return { outer: "#7C3AED", inner: "#EC4899" };
}

export default function StreakDisplay({
  streakDays,
  practicedDays = [true, true, true, false, false, false, false],
  compact = false,
  className,
}: StreakDisplayProps) {
  const { outer, inner } = getFlameColor(streakDays);
  const isActive = streakDays > 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <motion.div
          animate={isActive ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Flame
            className="h-5 w-5"
            style={{ color: outer, fill: isActive ? outer : "none" }}
          />
        </motion.div>
        <span className="text-sm font-bold" style={{ color: isActive ? outer : undefined }}>
          {streakDays}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-background-secondary border border-border p-5 flex flex-col gap-4",
        className
      )}
    >
      {/* Flame + count row */}
      <div className="flex items-center gap-4">
        {/* Animated flame */}
        <div className="relative flex-shrink-0">
          <AnimatePresence mode="wait">
            {isActive ? (
              <motion.div
                key="active-flame"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="relative"
              >
                {/* Outer glow */}
                <motion.div
                  className="absolute inset-0 rounded-full blur-md"
                  style={{ backgroundColor: `${outer}50` }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Flame
                    className="h-14 w-14 relative z-10"
                    style={{ color: outer, fill: outer }}
                  />
                  {/* Inner flame highlight */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center z-20"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    <Flame
                      className="h-8 w-8"
                      style={{ color: inner, fill: inner }}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="inactive-flame"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <Flame className="h-14 w-14 text-foreground-muted/40" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Count + label */}
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <motion.span
              key={streakDays}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-black tabular-nums leading-none"
              style={{ color: isActive ? outer : undefined }}
            >
              {streakDays}
            </motion.span>
          </div>
          <p className="text-sm font-semibold text-foreground-secondary mt-0.5">
            {streakDays === 1 ? "Day Streak" : "Day Streak"}
          </p>
          <p className="text-xs text-foreground-muted mt-0.5">
            {getStreakMessage(streakDays)}
          </p>
        </div>
      </div>

      {/* Weekly calendar dots */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
          This week
        </p>
        <div className="flex items-center justify-between gap-1">
          {DAY_LABELS.map((day, i) => {
            const practiced = practicedDays[i] ?? false;
            const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[10px] font-medium text-foreground-muted">{day}</span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                  className="relative"
                >
                  {practiced ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <CheckCircle2
                        className="h-7 w-7"
                        style={{ color: outer, fill: `${outer}20` }}
                      />
                    </motion.div>
                  ) : (
                    <Circle
                      className={cn(
                        "h-7 w-7",
                        typeof isToday === "number" && i === isToday
                          ? "text-foreground-muted"
                          : "text-border"
                      )}
                    />
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone hint */}
      {isActive && streakDays < 7 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background-tertiary border border-border">
          <Flame className="h-3.5 w-3.5 flex-shrink-0" style={{ color: outer }} />
          <p className="text-xs text-foreground-muted">
            <span className="font-semibold text-foreground">{7 - streakDays} day{7 - streakDays !== 1 ? "s" : ""}</span>{" "}
            until your first week badge!
          </p>
        </div>
      )}
      {isActive && streakDays >= 7 && streakDays < 30 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background-tertiary border border-border">
          <Flame className="h-3.5 w-3.5 flex-shrink-0" style={{ color: outer }} />
          <p className="text-xs text-foreground-muted">
            <span className="font-semibold text-foreground">{30 - streakDays} day{30 - streakDays !== 1 ? "s" : ""}</span>{" "}
            to the monthly champion streak!
          </p>
        </div>
      )}
    </div>
  );
}
