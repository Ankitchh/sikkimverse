"use client";

import { motion } from "framer-motion";
import {
  Lock,
  CheckCircle2,
  PlayCircle,
  Clock,
  Zap,
  BookOpen,
  Edit3,
  Mic,
  Pen,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

type LessonType =
  | "Vocabulary"
  | "Grammar"
  | "Pronunciation"
  | "Script"
  | "Culture";

interface LessonCardProps {
  order: number;
  title: string;
  type: LessonType;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  xpReward: number;
  estimatedMinutes: number;
  onClick?: () => void;
  className?: string;
  progressPercent?: number; // 0–100, for current lesson
}

const LESSON_TYPE_CONFIG: Record<
  LessonType,
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  Vocabulary: {
    icon: BookOpen,
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
  },
  Grammar: {
    icon: Edit3,
    color: "text-purple-700 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
  },
  Pronunciation: {
    icon: Mic,
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/40",
    border: "border-green-200 dark:border-green-800",
  },
  Script: {
    icon: Pen,
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-200 dark:border-orange-800",
  },
  Culture: {
    icon: Globe,
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-800",
  },
};

export default function LessonCard({
  order,
  title,
  type,
  isCompleted,
  isLocked,
  isCurrent,
  xpReward,
  estimatedMinutes,
  onClick,
  className,
  progressPercent = 0,
}: LessonCardProps) {
  const config = LESSON_TYPE_CONFIG[type];
  const TypeIcon = config.icon;

  const isClickable = !isLocked;

  return (
    <motion.button
      onClick={isClickable ? onClick : undefined}
      disabled={isLocked}
      whileHover={isClickable ? { x: 4 } : {}}
      whileTap={isClickable ? { scale: 0.99 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "w-full text-left rounded-xl border transition-all duration-200 overflow-hidden",
        isLocked
          ? "opacity-50 cursor-not-allowed bg-background-tertiary border-border"
          : isCurrent
            ? "bg-background-secondary border-primary/40 shadow-md cursor-pointer"
            : isCompleted
              ? "bg-background-secondary border-border hover:border-primary/30 cursor-pointer"
              : "bg-background-secondary border-border hover:border-border hover:shadow-sm cursor-pointer",
        className,
      )}
      aria-label={`${isLocked ? "Locked: " : ""}Lesson ${order}: ${title}`}
    >
      <div className="p-4 flex items-center gap-4">
        {/* Status icon circle */}
        <div className="shrink-0 relative">
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
              isLocked
                ? "bg-border/60"
                : isCompleted
                  ? "bg-green-500"
                  : isCurrent
                    ? "bg-primary"
                    : "bg-background-tertiary border-2 border-border",
            )}
          >
            {isLocked ? (
              <Lock className="h-4 w-4 text-foreground-muted" />
            ) : isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-white fill-white" />
            ) : isCurrent ? (
              <PlayCircle className="h-5 w-5 text-white fill-white/20" />
            ) : (
              <span className="text-sm font-bold text-foreground-muted">
                {order}
              </span>
            )}
          </div>

          {/* Current lesson pulse */}
          {isCurrent && !isLocked && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: title + badges */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <p
              className={cn(
                "text-sm font-semibold leading-snug",
                isLocked ? "text-foreground-muted" : "text-foreground",
              )}
            >
              {title}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              {/* XP badge */}
              {!isLocked && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                    isCompleted
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
                  )}
                >
                  <Zap className="h-2.5 w-2.5" />+{xpReward}
                </span>
              )}
            </div>
          </div>

          {/* Type badge + time */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                config.color,
                config.bg,
                config.border,
              )}
            >
              <TypeIcon className="h-2.5 w-2.5" />
              {type}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-foreground-muted">
              <Clock className="h-2.5 w-2.5" />
              {estimatedMinutes} min
            </span>
          </div>

          {/* Progress bar for current lesson */}
          {isCurrent && progressPercent > 0 && (
            <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          )}
        </div>

        {/* Right arrow indicator */}
        {isClickable && (
          <motion.div
            className="shrink-0"
            animate={isCurrent ? { x: [0, 3, 0] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg
              className={cn(
                "h-4 w-4",
                isCurrent ? "text-primary" : "text-foreground-muted",
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
