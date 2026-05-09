"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { PreservationRingWithOverlay } from "./PreservationRing";
import { cn } from "@/lib/utils";

interface CommunityCardProps {
  name: string;
  slug: string;
  emoji: string;
  description: string;
  speakers: number;
  preservationScore: number;
  colorPrimary: string;
  colorSecondary: string;
  languages: string[];
  lessonCount?: number;
  className?: string;
}

function formatSpeakers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function getPreservationLabel(score: number): string {
  if (score >= 75) return "Stable";
  if (score >= 50) return "Vulnerable";
  if (score >= 25) return "Endangered";
  return "Critical";
}

function getPreservationBadgeClass(score: number): string {
  if (score >= 75) return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
  if (score >= 50) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
  if (score >= 25) return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
  return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
}

export default function CommunityCard({
  name,
  slug,
  emoji,
  description,
  speakers,
  preservationScore,
  colorPrimary,
  colorSecondary,
  languages,
  lessonCount,
  className,
}: CommunityCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("group relative flex flex-col h-full rounded-2xl overflow-hidden", className)}
      style={{
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      }}
    >
      {/* Gradient hero strip */}
      <div
        className="relative h-28 sm:h-32 flex items-end p-4"
        style={{
          background: `linear-gradient(135deg, ${colorPrimary} 0%, ${colorSecondary} 60%, ${colorPrimary}cc 100%)`,
        }}
      >
        {/* Decorative pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, white 1px, transparent 1px),
                              radial-gradient(circle at 80% 70%, white 1px, transparent 1px),
                              radial-gradient(circle at 50% 50%, white 0.5px, transparent 0.5px)`,
            backgroundSize: "30px 30px, 25px 25px, 15px 15px",
          }}
        />

        {/* Emoji + name */}
        <div className="relative flex items-center gap-3 z-10">
          <span
            className="text-4xl drop-shadow-md"
            role="img"
            aria-label={name}
          >
            {emoji}
          </span>
          <div>
            <h3 className="text-xl font-bold text-white drop-shadow-sm">
              {name}
            </h3>
            {lessonCount !== undefined && (
              <p className="text-xs text-white/80 font-medium">
                {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Preservation score ring — top right */}
        <div className="absolute top-3 right-3 z-10">
          <PreservationRingWithOverlay
            score={preservationScore}
            size={52}
            strokeWidth={5}
            animated
          />
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 bg-background-secondary border border-t-0 border-border rounded-b-2xl p-4 gap-3">
        {/* Preservation badge */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-0.5 rounded-full",
              getPreservationBadgeClass(preservationScore)
            )}
          >
            {getPreservationLabel(preservationScore)}
          </span>
          {/* Speaker count */}
          <span className="flex items-center gap-1 text-xs text-foreground-muted font-medium">
            <Users className="h-3.5 w-3.5" />
            {formatSpeakers(speakers)} speakers
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground-secondary leading-relaxed line-clamp-3">
          {description}
        </p>

        {/* Language tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {languages.slice(0, 3).map((lang) => (
            <span
              key={lang}
              className="text-xs px-2 py-0.5 rounded-md font-medium"
              style={{
                backgroundColor: `${colorPrimary}18`,
                color: colorPrimary,
                border: `1px solid ${colorPrimary}30`,
              }}
            >
              {lang}
            </span>
          ))}
          {languages.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-background-tertiary text-foreground-muted border border-border font-medium">
              +{languages.length - 3} more
            </span>
          )}
        </div>

        {/* Explore button */}
        <Link
          href={`/communities/${slug}`}
          className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 group-hover:gap-3"
          style={{
            background: `linear-gradient(90deg, ${colorPrimary}, ${colorSecondary})`,
            boxShadow: `0 2px 8px ${colorPrimary}40`,
          }}
        >
          Explore Community
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}
