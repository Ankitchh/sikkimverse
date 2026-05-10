"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Star,
  BookOpen,
  Users,
  Trophy,
  ChevronRight,
  Play,
  Lock,
  Target,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ApiCourse {
  id: string;
  title: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  coverImage: string | null;
  totalLessons: number;
  enrolledCount: number;
  community: { id: string; name: string; slug: string; colorPrimary: string } | null;
  language: { name: string } | null;
}

interface Course {
  id: string;
  title: string;
  community: string;
  communitySlug: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  lessons: number;
  enrolled: number;
  progress?: number;
  color: string;
  emoji: string;
  description: string;
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string | null;
  xp: number;
  streak: number;
  community: { name: string } | null;
  isCurrentUser?: boolean;
}

// ── Static cultural metadata ──────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: 'from-emerald-600 to-teal-700',
  INTERMEDIATE: 'from-amber-500 to-orange-600',
  ADVANCED: 'from-red-600 to-rose-700',
}

const COMMUNITY_EMOJIS: Record<string, string> = {
  lepcha: '🌿', bhutia: '🏔️', limbu: '🌄', tamang: '🥁',
  rai: '🌾', gurung: '🏞️', sherpa: '⛰️', magar: '🌺',
  newar: '🏛️', sunwar: '🎶', nepali: '📜',
}

const LEVEL_LABEL: Record<string, Course['level']> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

const XP_PER_LEVEL = 1000

function xpToLevel(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

const LEVEL_NAMES = [
  'Novice', 'Seeker', 'Explorer', 'Apprentice', 'Scholar',
  'Keeper', 'Guardian', 'Elder', 'Sage', 'Heritage Master',
]

function levelName(level: number): string {
  return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)]
}

// PATH_NODES are illustrative — a real implementation would fetch user lesson progress
const PATH_NODES = [
  { id: 1, label: "Greetings", done: true },
  { id: 2, label: "Numbers", done: true },
  { id: 3, label: "Family", done: true },
  { id: 4, label: "Colors", active: true },
  { id: 5, label: "Food", locked: true },
  { id: 6, label: "Nature", locked: true },
  { id: 7, label: "Traditions", locked: true },
];

// ── Level Badge ────────────────────────────────────────────────────────────────
function LevelBadge({ level }: { level: Course["level"] }) {
  const config = {
    Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Intermediate: "bg-amber-100 text-amber-700 border-amber-200",
    Advanced: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", config[level])}>
      {level}
    </span>
  );
}

// ── Course Card ────────────────────────────────────────────────────────────────
function CourseCard({ course }: { course: Course }) {
  const hasProgress = course.progress != null && course.progress > 0;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="bg-background-secondary rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={cn("h-28 bg-gradient-to-br flex items-center justify-center text-5xl relative", course.color)}>
        <span>{course.emoji}</span>
        <div className="absolute top-3 right-3">
          <LevelBadge level={course.level} />
        </div>
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-white/80 transition-all" style={{ width: `${course.progress}%` }} />
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
            {course.community}
          </p>
          <h3 className="font-bold text-foreground mt-0.5 leading-snug">{course.title}</h3>
          <p className="text-sm text-foreground-secondary mt-1 line-clamp-2">{course.description}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-foreground-muted">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {course.lessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {course.enrolled.toLocaleString()} enrolled
          </span>
        </div>

        {hasProgress && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-foreground-muted">
              <span>Progress</span>
              <span className="font-medium text-primary">{course.progress}%</span>
            </div>
            <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        )}

        <Link href={`/learn/${course.id}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full py-2 rounded-xl text-sm font-semibold transition-all",
              hasProgress
                ? "bg-primary text-white hover:bg-primary-hover"
                : "bg-background-tertiary text-foreground hover:bg-border"
            )}
          >
            {hasProgress ? "Continue" : "Start Learning"}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

// ── Learning Path ──────────────────────────────────────────────────────────────
function LearningPath() {
  return (
    <div className="bg-background-secondary rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-foreground text-lg">Learning Path</h2>
        <span className="text-sm text-foreground-muted">Lepcha Beginners</span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {PATH_NODES.map((node, i) => (
          <div key={node.id} className="flex items-center shrink-0">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "w-14 h-14 rounded-full flex flex-col items-center justify-center text-center border-2 transition-all cursor-pointer relative",
                node.done && "bg-primary border-primary text-white",
                node.active && "bg-saffron border-saffron text-white shadow-lg scale-110",
                node.locked && "bg-background-tertiary border-border text-foreground-muted"
              )}
            >
              {node.done && <CheckCircle2 className="w-5 h-5" />}
              {node.active && <Play className="w-5 h-5" />}
              {node.locked && <Lock className="w-4 h-4" />}
              {node.active && (
                <motion.div
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full border-2 border-saffron opacity-40"
                />
              )}
            </motion.div>
            {i < PATH_NODES.length - 1 && (
              <div className={cn("w-6 h-0.5 mx-0.5", node.done ? "bg-primary" : "bg-border")} />
            )}
            <div className="absolute mt-16 w-14 text-center">
              <p className="text-xs text-foreground-muted leading-tight">{node.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton for course cards ─────────────────────────────────────────────────
function CourseCardSkeleton() {
  return (
    <div className="bg-background-secondary rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="h-28 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-3 w-4/5 bg-gray-200 rounded" />
        <div className="h-9 w-full bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function LearnPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  const user = session?.user;
  const xp = user?.xp ?? 0;
  const streak = user?.streak ?? 0;
  const currentLevel = xpToLevel(xp);
  const xpIntoLevel = xp % XP_PER_LEVEL;
  const firstName = user?.name?.split(' ')[0] ?? 'Learner';

  // Fetch courses
  useEffect(() => {
    fetch('/api/courses?limit=20')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.data) return;
        const mapped: Course[] = (data.data as ApiCourse[]).map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          level: LEVEL_LABEL[c.level] ?? 'Beginner',
          lessons: c.totalLessons,
          enrolled: c.enrolledCount,
          community: c.community?.name ?? 'Community',
          communitySlug: c.community?.slug ?? '',
          color: LEVEL_COLORS[c.level] ?? 'from-emerald-600 to-teal-700',
          emoji: COMMUNITY_EMOJIS[c.community?.slug ?? ''] ?? '📚',
        }));
        setCourses(mapped);
      })
      .catch(() => {})
      .finally(() => setLoadingCourses(false));
  }, []);

  // Fetch leaderboard
  useEffect(() => {
    fetch('/api/leaderboard?limit=5')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.leaderboard) return;
        const entries = (data.leaderboard as (LeaderboardEntry & { id: string })[]).map(e => ({
          ...e,
          isCurrentUser: e.id === user?.id,
        }));
        setLeaderboard(entries);
      })
      .catch(() => {})
      .finally(() => setLoadingLeaderboard(false));
  }, [user?.id]);

  const communityTabs = useMemo(() => {
    const names = Array.from(new Set(courses.map(c => c.community))).sort();
    return ['All', ...names];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (activeTab === 'All') return courses;
    return courses.filter(c => c.community === activeTab);
  }, [courses, activeTab]);

  const inProgressCourse = courses.find(c => c.progress && c.progress > 0);

  // Gap to top 3
  const top3Xp = leaderboard[2]?.xp ?? 0;
  const xpGap = Math.max(0, top3Xp - xp + 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-cultural px-4 pt-10 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between"
          >
            <div>
              <p className="text-white/70 text-sm font-medium">Good morning,</p>
              <h1 className="text-2xl font-bold text-white mt-1">{firstName} 👋</h1>
            </div>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-2 rounded-xl"
              >
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="text-white font-bold">{streak}</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-2 rounded-xl"
              >
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-bold">{xp.toLocaleString()}</span>
              </motion.div>
            </div>
          </motion.div>

          {/* XP Progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 bg-white/10 backdrop-blur rounded-2xl p-4"
          >
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Level {currentLevel} — {levelName(currentLevel)}</span>
              <span>{xpIntoLevel.toLocaleString()} / {XP_PER_LEVEL.toLocaleString()} XP</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(xpIntoLevel / XP_PER_LEVEL) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 pb-16 space-y-6">
        {/* Continue Learning */}
        {inProgressCourse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-background-secondary rounded-2xl border border-border shadow-md overflow-hidden"
          >
            <div className="flex items-center gap-4 p-5">
              <div className={cn("w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-3xl shrink-0", inProgressCourse.color)}>
                {inProgressCourse.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                  Continue Learning
                </p>
                <h2 className="font-bold text-foreground mt-0.5">{inProgressCourse.title}</h2>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${inProgressCourse.progress}%` }} />
                  </div>
                  <span className="text-xs text-foreground-muted font-medium">{inProgressCourse.progress}%</span>
                </div>
              </div>
              <Link href={`/learn/${inProgressCourse.id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Continue
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Daily Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Daily Challenge</p>
                <p className="text-white/80 text-sm">Translate 5 phrases • 50 XP reward</p>
              </div>
            </div>
            <Link href="/learn/lesson/daily-challenge">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-orange-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-orange-50 transition-colors"
              >
                Start
              </motion.button>
            </Link>
          </div>
          <div className="mt-3 flex items-center gap-2 text-white/70 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Resets at midnight</span>
          </div>
        </motion.div>

        {/* Learning Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <LearningPath />
        </motion.div>

        {/* Browse Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Browse Courses</h2>
            <span className="text-sm text-foreground-muted">
              {loadingCourses ? '—' : `${filteredCourses.length} courses`}
            </span>
          </div>

          {/* Community Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(loadingCourses ? ['All'] : communityTabs).map((community) => (
              <motion.button
                key={community}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(community)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeTab === community
                    ? "bg-primary text-white shadow-md"
                    : "bg-background-secondary text-foreground-secondary border border-border hover:border-primary hover:text-primary"
                )}
              >
                {community}
              </motion.button>
            ))}
          </div>

          {/* Course Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {loadingCourses
                ? Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)
                : filteredCourses.map(course => <CourseCard key={course.id} course={course} />)
              }
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* XP Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-background-secondary rounded-2xl border border-border overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-foreground">Top Learners</h2>
            </div>
            <Link href="/leaderboard" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loadingLeaderboard
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                    <div className="w-6 h-4 bg-gray-200 rounded" />
                    <div className="w-9 h-9 rounded-full bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-3 w-32 bg-gray-200 rounded mb-1" />
                      <div className="h-3 w-20 bg-gray-200 rounded" />
                    </div>
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                  </div>
                ))
              : leaderboard.map((entry, i) => {
                  const initials = entry.name
                    ? entry.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                    : 'U'
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className={cn(
                        "flex items-center gap-4 px-5 py-3.5 transition-colors",
                        entry.isCurrentUser && "bg-primary/5 border-l-2 border-l-primary"
                      )}
                    >
                      <span className={cn(
                        "w-6 text-center font-bold text-sm",
                        entry.rank === 1 && "text-amber-500",
                        entry.rank === 2 && "text-slate-400",
                        entry.rank === 3 && "text-amber-700",
                        entry.rank > 3 && "text-foreground-muted"
                      )}>
                        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-semibold text-sm", entry.isCurrentUser && "text-primary")}>
                          {entry.name ?? 'Learner'} {entry.isCurrentUser && "(You)"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-foreground-muted mt-0.5">
                          <Flame className="w-3 h-3 text-orange-400" />
                          <span>{entry.streak} day streak</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground text-sm">{entry.xp.toLocaleString()}</p>
                        <p className="text-xs text-foreground-muted">XP</p>
                      </div>
                    </motion.div>
                  )
                })
            }
          </div>

          <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/5 border-t border-border">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-primary" />
              {xpGap > 0 ? (
                <p className="text-sm text-foreground-secondary">
                  <span className="font-semibold text-foreground">{xpGap.toLocaleString()} XP more</span> to reach Top 3!
                </p>
              ) : (
                <p className="text-sm text-foreground-secondary font-semibold text-foreground">You&apos;re in the Top 3! 🎉</p>
              )}
              <TrendingUp className="w-4 h-4 text-primary ml-auto" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
