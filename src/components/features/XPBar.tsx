"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface XPBarProps {
  currentXP: number;
  level: number;
  xpForNextLevel: number;
  xpForCurrentLevel?: number;
  compact?: boolean;
  className?: string;
  showLevelUp?: boolean;
}

function getXPColor(level: number): { from: string; to: string } {
  if (level >= 20) return { from: "#7C3AED", to: "#EC4899" };
  if (level >= 15) return { from: "#DC2626", to: "#F97316" };
  if (level >= 10) return { from: "#2563EB", to: "#7C3AED" };
  if (level >= 5)  return { from: "#D97706", to: "#CA8A04" };
  return { from: "#1a5c3a", to: "#D4A017" };
}

function getLevelTitle(level: number): string {
  if (level >= 20) return "Master Guardian";
  if (level >= 15) return "Heritage Elder";
  if (level >= 10) return "Language Keeper";
  if (level >= 5)  return "Culture Explorer";
  if (level >= 3)  return "Word Seeker";
  return "Newcomer";
}

interface ConfettiParticle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

function generateConfetti(): ConfettiParticle[] {
  const colors = ["#D4A017", "#1a5c3a", "#e8871a", "#DC2626", "#2563EB", "#7C3AED"];
  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    duration: 0.8 + Math.random() * 0.8,
    size: 4 + Math.random() * 6,
  }));
}

// Animated counter for XP numbers
function AnimatedXP({ value }: { value: number }) {
  const motionVal = useMotionValue(value);
  const rounded = useTransform(motionVal, (v) => Math.round(v).toLocaleString());
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 0.8, ease: "easeOut" });
    return controls.stop;
  }, [value, motionVal]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsubscribe;
  }, [rounded]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}

export default function XPBar({
  currentXP,
  level,
  xpForNextLevel,
  xpForCurrentLevel = 0,
  compact = false,
  className,
  showLevelUp = false,
}: XPBarProps) {
  const [levelUp, setLevelUp] = useState(showLevelUp);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const prevLevel = useRef(level);

  const xpRange = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = currentXP - xpForCurrentLevel;
  const progressPercent = xpRange > 0 ? Math.min(100, (xpProgress / xpRange) * 100) : 100;

  const { from, to } = getXPColor(level);

  // Detect level-up
  useEffect(() => {
    if (level > prevLevel.current) {
      setLevelUp(true);
      setConfetti(generateConfetti());
      const timer = setTimeout(() => {
        setLevelUp(false);
        setConfetti([]);
      }, 3000);
      prevLevel.current = level;
      return () => clearTimeout(timer);
    }
  }, [level]);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {/* Level badge */}
        <div
          className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          {level}
        </div>

        {/* Progress bar */}
        <div className="flex-1 min-w-0">
          <div className="h-2 rounded-full bg-border overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* XP label */}
        <span className="text-xs text-foreground-muted font-medium tabular-nums flex-shrink-0">
          <AnimatedXP value={currentXP} /> XP
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Confetti celebration */}
      <AnimatePresence>
        {levelUp && confetti.length > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-20">
            {confetti.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-sm"
                style={{
                  left: `${p.x}%`,
                  top: "-4px",
                  width: p.size,
                  height: p.size * 0.6,
                  backgroundColor: p.color,
                }}
                initial={{ y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  y: ["0%", "120%"],
                  opacity: [1, 1, 0],
                  rotate: [0, 180 + Math.random() * 360],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeIn",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Level up banner */}
      <AnimatePresence>
        {levelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 px-5 py-2 rounded-full text-white text-sm font-bold shadow-lg whitespace-nowrap flex items-center gap-2"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            <Star className="h-4 w-4 fill-white" />
            Level Up! You&apos;re now Level {level}!
            <Star className="h-4 w-4 fill-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-2xl bg-background-secondary border border-border p-5 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-center gap-4">
          {/* Level circle */}
          <motion.div
            className="relative flex-shrink-0"
            animate={levelUp ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <div
              className="h-14 w-14 rounded-full flex flex-col items-center justify-center text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              <span className="text-xl font-black leading-none">{level}</span>
              <span className="text-[9px] font-medium opacity-80 uppercase tracking-wide">lvl</span>
            </div>
            {/* Glow ring on level up */}
            <AnimatePresence>
              {levelUp && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: `0 0 24px ${from}` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: 2 }}
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Title & XP info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div>
                <p className="text-sm font-semibold text-foreground">{getLevelTitle(level)}</p>
                <p className="text-xs text-foreground-muted">Level {level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground tabular-nums">
                  <AnimatedXP value={currentXP} /> XP
                </p>
                <p className="text-xs text-foreground-muted tabular-nums">
                  / {xpForNextLevel.toLocaleString()} XP
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-3 rounded-full bg-border overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${from}, ${to})`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              {/* Shimmer overlay */}
              <div
                className="absolute inset-0 rounded-full opacity-40"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s linear infinite",
                  width: `${progressPercent}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>
              <span className="font-semibold text-foreground">
                {(xpForNextLevel - currentXP).toLocaleString()}
              </span>{" "}
              XP to Level {level + 1}
            </span>
          </div>
          <span className="text-xs font-semibold tabular-nums" style={{ color: from }}>
            {Math.round(progressPercent)}% complete
          </span>
        </div>
      </div>
    </div>
  );
}
