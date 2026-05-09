"use client";

import { motion } from "framer-motion";
import { Volume2, Clock, Calendar, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type StoryType = "FOLKTALE" | "MYTH" | "LEGEND" | "HISTORY" | "ORAL_HISTORY";

interface StoryCardProps {
  title: string;
  excerpt: string;
  community: string;
  type: StoryType;
  audioUrl?: string;
  imageUrl?: string;
  readTime: number; // minutes
  createdAt: Date | string;
  contributor: string;
  onClick?: () => void;
  className?: string;
}

const TYPE_CONFIG: Record<
  StoryType,
  { label: string; emoji: string; color: string; bg: string; border: string }
> = {
  FOLKTALE: {
    label: "Folk Tale",
    emoji: "🌙",
    color: "text-indigo-700 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  MYTH: {
    label: "Myth",
    emoji: "⚡",
    color: "text-purple-700 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
  },
  LEGEND: {
    label: "Legend",
    emoji: "🗡️",
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-800",
  },
  HISTORY: {
    label: "History",
    emoji: "📜",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
  },
  ORAL_HISTORY: {
    label: "Oral History",
    emoji: "🗣️",
    color: "text-teal-700 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    border: "border-teal-200 dark:border-teal-800",
  },
};

export default function StoryCard({
  title,
  excerpt,
  community,
  type,
  audioUrl,
  imageUrl,
  readTime,
  createdAt,
  contributor,
  onClick,
  className,
}: StoryCardProps) {
  const config = TYPE_CONFIG[type];
  const dateStr =
    createdAt instanceof Date
      ? formatDistanceToNow(createdAt, { addSuffix: true })
      : formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn(
        "group relative flex flex-col rounded-2xl bg-background-secondary border border-border overflow-hidden cursor-pointer",
        className
      )}
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      {/* Image header */}
      {imageUrl ? (
        <div className="relative h-44 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {/* Type badge overlay */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm",
                config.color,
                config.bg,
                config.border
              )}
            >
              <span>{config.emoji}</span>
              {config.label}
            </span>
          </div>
          {/* Audio badge */}
          {audioUrl && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-black/50 text-white border border-white/20 backdrop-blur-sm">
                <Volume2 className="h-3 w-3" />
                Audio
              </span>
            </div>
          )}
        </div>
      ) : (
        /* No image — decorative gradient strip */
        <div className="relative h-20 overflow-hidden">
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background: `linear-gradient(135deg, ${
                type === "FOLKTALE"
                  ? "#4F46E5, #7C3AED"
                  : type === "MYTH"
                  ? "#7C3AED, #EC4899"
                  : type === "LEGEND"
                  ? "#DC2626, #F97316"
                  : type === "HISTORY"
                  ? "#D97706, #CA8A04"
                  : "#0D9488, #0891B2"
              })`,
            }}
          />
          <div className="absolute inset-0 flex items-center px-5 gap-3">
            <span className="text-4xl drop-shadow-lg">{config.emoji}</span>
            {audioUrl && (
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-white/20 text-white border border-white/30">
                <Volume2 className="h-3 w-3" />
                Audio
              </span>
            )}
          </div>
          {/* Type badge */}
          <div className="absolute bottom-2 left-3">
            <span className={cn(
              "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border",
              config.color, config.bg, config.border
            )}>
              {config.label}
            </span>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Community badge (if no image – type badge is elsewhere) */}
        {imageUrl && (
          <div className="flex items-center justify-between">
            <span className={cn(
              "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border",
              config.color, config.bg, config.border
            )}>
              {config.emoji} {config.label}
            </span>
            <span className="text-[10px] font-medium text-foreground-muted px-2 py-0.5 rounded-full bg-background-tertiary border border-border">
              {community}
            </span>
          </div>
        )}
        {!imageUrl && (
          <span className="text-[10px] font-medium text-foreground-muted self-start px-2 py-0.5 rounded-full bg-background-tertiary border border-border">
            {community}
          </span>
        )}

        {/* Title */}
        <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Excerpt with fade-out */}
        <div className="relative flex-1">
          <p className="text-xs text-foreground-secondary leading-relaxed line-clamp-3">
            {excerpt}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background-secondary to-transparent" />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[10px] text-foreground-muted">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readTime} min
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {dateStr}
            </span>
          </div>

          <motion.div
            className="flex items-center gap-1 text-[10px] text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            initial={{ x: -4 }}
            whileHover={{ x: 0 }}
          >
            <User className="h-3 w-3" />
            <span className="font-medium max-w-[80px] truncate">{contributor}</span>
          </motion.div>
        </div>

        {/* Read more button */}
        <motion.div
          className="flex items-center justify-end gap-1 text-xs font-semibold text-primary"
          whileHover={{ x: 2 }}
        >
          Read Story
          <ArrowRight className="h-3.5 w-3.5" />
        </motion.div>
      </div>
    </motion.div>
  );
}
