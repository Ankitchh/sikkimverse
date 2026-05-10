"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, Clock, Star, Users, Play, Lock,
  CheckCircle2, Globe, Headphones, PenLine, MessageCircle,
  Trophy, Info,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
interface LessonItem {
  id: string;
  order: number;
  title: string;
  type: string;
  xpReward: number;
  estimatedMinutes: number;
  status: "completed" | "current" | "locked";
  score: number | null;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  level: string;
  coverImage: string | null;
  totalLessons: number;
  community: { id: string; name: string; slug: string; colorPrimary: string; colorSecondary: string; region: string };
  language: { id: string; name: string; code: string; endangermentLevel: string };
  lessons: LessonItem[];
  userProgress: { completedLessons: number; totalLessons: number; percentComplete: number };
  enrolledCount: number;
}

const LESSON_TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  VOCABULARY:    { icon: BookOpen,     color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",     label: "Vocabulary" },
  GRAMMAR:       { icon: MessageCircle,color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400", label: "Grammar" },
  PRONUNCIATION: { icon: Headphones,   color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", label: "Pronunciation" },
  SCRIPT:        { icon: PenLine,      color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400", label: "Script" },
  CULTURE:       { icon: Globe,        color: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",     label: "Culture" },
  QUIZ:          { icon: Star,         color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400", label: "Quiz" },
};

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER:     "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200",
  INTERMEDIATE: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200",
  ADVANCED:     "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200",
};

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-border rounded-xl", className)} />;
}

function LessonRow({ lesson, communityColor }: { lesson: LessonItem; communityColor: string }) {
  const config = LESSON_TYPE_CONFIG[lesson.type] ?? LESSON_TYPE_CONFIG.VOCABULARY;
  const Icon = config.icon;
  const isLocked = lesson.status === "locked";
  const isCompleted = lesson.status === "completed";
  const isCurrent = lesson.status === "current";

  const inner = (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: lesson.order * 0.04, duration: 0.3 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-all",
        isLocked    && "opacity-55 cursor-not-allowed bg-background-tertiary border-border",
        isCompleted && "bg-background-secondary border-border hover:border-primary/30 cursor-pointer",
        isCurrent   && "bg-background-secondary border-primary/40 shadow-md cursor-pointer ring-1 ring-primary/20"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm",
        isCompleted && "bg-primary text-white",
        isCurrent   && "text-white",
        isLocked    && "bg-background-tertiary text-foreground-muted border border-border"
      )}
        style={isCurrent ? { backgroundColor: communityColor } : undefined}
      >
        {isCompleted && <CheckCircle2 className="w-5 h-5" />}
        {isCurrent   && <Play className="w-4 h-4 fill-white" />}
        {isLocked    && <Lock className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-xs text-foreground-muted font-medium">Lesson {lesson.order}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1", config.color)}>
            <Icon className="w-3 h-3" />{config.label}
          </span>
        </div>
        <p className={cn("font-semibold", isLocked ? "text-foreground-muted" : "text-foreground")}>
          {lesson.title}
        </p>
        {lesson.score !== null && (
          <p className="text-xs text-emerald-600 mt-0.5">Score: {lesson.score}%</p>
        )}
      </div>

      <div className="text-right shrink-0 space-y-1">
        <div className="flex items-center gap-1 text-xs text-foreground-muted justify-end">
          <Clock className="w-3.5 h-3.5" />
          <span>{lesson.estimatedMinutes}m</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-amber-600 justify-end">
          <Star className="w-3 h-3" />
          <span>{lesson.xpReward} XP</span>
        </div>
      </div>
    </motion.div>
  );

  if (isLocked) return inner;
  return <Link href={`/learn/lesson/${lesson.id}`}>{inner}</Link>;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        if (!r.ok) return null;
        return r.json();
      })
      .then(data => { if (data?.data) setCourse(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📚</p>
          <p className="text-foreground font-semibold">Course not found</p>
          <Link href="/learn" className="text-primary text-sm hover:underline mt-2 block">← Back to Learn</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Hero */}
      <div
        className="relative pt-16 pb-28 px-4 overflow-hidden"
        style={{ background: loading ? "linear-gradient(135deg, #1a5c3a, #1e4a8c)" : `linear-gradient(135deg, ${course?.community.colorPrimary ?? "#1a5c3a"}, #1e4a8c)` }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="max-w-2xl mx-auto relative">
          <Link href="/learn" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Courses
          </Link>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : course ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold border", LEVEL_COLORS[course.level] ?? LEVEL_COLORS.BEGINNER)}>
                  {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                </span>
                <span className="text-white/60 text-sm">{course.community.name} Community</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{course.title}</h1>
              <p className="text-white/80 leading-relaxed mb-5">{course.description}</p>

              <div className="flex flex-wrap gap-3">
                {[
                  { icon: BookOpen, label: `${course.totalLessons} Lessons` },
                  { icon: Users,    label: `${course.enrolledCount.toLocaleString()} Enrolled` },
                  { icon: Globe,    label: course.language.name },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1 text-white text-sm">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-12 space-y-5">
        {/* Progress Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-background-secondary rounded-2xl p-5 shadow-lg border border-border">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            </div>
          ) : course ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Your Progress</span>
                <span className="text-sm font-bold text-primary">{course.userProgress.percentComplete}%</span>
              </div>
              <div className="h-2.5 bg-border rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${course.userProgress.percentComplete}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: course.userProgress.completedLessons, label: "Completed" },
                  { value: course.userProgress.totalLessons - course.userProgress.completedLessons, label: "Remaining" },
                  { value: course.lessons.reduce((sum, l) => sum + (l.status === "completed" ? l.xpReward : 0), 0), label: "XP Earned" },
                ].map(({ value, label }) => (
                  <div key={label} className="bg-background-tertiary rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-foreground-muted mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {course.userProgress.completedLessons < course.totalLessons && (
                <Link
                  href={`/learn/lesson/${course.lessons.find(l => l.status === "current")?.id ?? course.lessons[0]?.id ?? ""}`}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-colors"
                  style={{ backgroundColor: course.community.colorPrimary }}
                >
                  <Play className="w-4 h-4 fill-white" />
                  {course.userProgress.completedLessons === 0 ? "Start Course" : "Continue Learning"}
                </Link>
              )}
              {course.userProgress.completedLessons === course.totalLessons && course.totalLessons > 0 && (
                <div className="mt-4 flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-700 dark:text-emerald-400 font-bold">
                  <Trophy className="w-4 h-4" /> Course Complete! 🎉
                </div>
              )}
            </>
          ) : null}
        </motion.div>

        {/* Course Info */}
        {course && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 flex gap-3">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{course.language.name} Language</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {course.community.region} · {course.language.endangermentLevel.replace(/_/g, " ").toLowerCase()} status
              </p>
            </div>
          </motion.div>
        )}

        {/* Lessons list */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Course Lessons</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background-secondary animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-border shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-20 bg-border rounded" />
                    <div className="h-4 w-3/4 bg-border rounded" />
                  </div>
                  <div className="space-y-1.5 text-right">
                    <div className="h-3 w-12 bg-border rounded" />
                    <div className="h-3 w-10 bg-border rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : course ? (
            <div className="space-y-3">
              {course.lessons.map(lesson => (
                <LessonRow key={lesson.id} lesson={lesson} communityColor={course.community.colorPrimary} />
              ))}
              {course.lessons.length === 0 && (
                <div className="text-center py-12 text-foreground-muted">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>Lessons coming soon</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
