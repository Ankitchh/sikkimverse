"use client";

import { useState } from "react";
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
  Zap,
  Target,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Course {
  id: string;
  title: string;
  community: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  lessons: number;
  enrolled: number;
  progress?: number;
  color: string;
  emoji: string;
  description: string;
  tags: string[];
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  avatar: string;
  isCurrentUser?: boolean;
}

// ── Sample Data ────────────────────────────────────────────────────────────────
const COURSES: Course[] = [
  {
    id: "lepcha-beginners",
    title: "Lepcha Beginners",
    community: "Lepcha",
    level: "Beginner",
    lessons: 20,
    enrolled: 1842,
    progress: 35,
    color: "from-emerald-600 to-teal-700",
    emoji: "🌿",
    description: "Start your journey into the ancient Lepcha script and spoken language.",
    tags: ["Script", "Conversation", "Culture"],
  },
  {
    id: "bhutia-essentials",
    title: "Bhutia Essentials",
    community: "Bhutia",
    level: "Beginner",
    lessons: 15,
    enrolled: 1204,
    progress: 0,
    color: "from-blue-600 to-indigo-700",
    emoji: "🏔️",
    description: "Learn everyday Bhutia expressions and cultural practices.",
    tags: ["Spoken", "Phrases", "Heritage"],
  },
  {
    id: "limbu-script-mastery",
    title: "Limbu Script Mastery",
    community: "Limbu",
    level: "Intermediate",
    lessons: 25,
    enrolled: 987,
    progress: 0,
    color: "from-orange-500 to-amber-600",
    emoji: "✍️",
    description: "Master the beautiful Sirijonga script used in Limbu writing.",
    tags: ["Script", "Writing", "Advanced"],
  },
  {
    id: "nepali-classical",
    title: "Classical Nepali Poetry",
    community: "Nepali",
    level: "Advanced",
    lessons: 18,
    enrolled: 3201,
    progress: 0,
    color: "from-red-500 to-rose-600",
    emoji: "📜",
    description: "Explore the rich tradition of Nepali classical literature.",
    tags: ["Literature", "Poetry", "Culture"],
  },
  {
    id: "rai-conversational",
    title: "Rai Conversational",
    community: "Rai",
    level: "Beginner",
    lessons: 12,
    enrolled: 678,
    progress: 0,
    color: "from-purple-600 to-violet-700",
    emoji: "🌸",
    description: "Everyday conversations in the Rai dialect of Eastern Sikkim.",
    tags: ["Conversation", "Daily Life"],
  },
  {
    id: "tamang-music-language",
    title: "Tamang Music & Language",
    community: "Tamang",
    level: "Beginner",
    lessons: 16,
    enrolled: 892,
    progress: 0,
    color: "from-pink-500 to-fuchsia-600",
    emoji: "🎵",
    description: "Learn Tamang through its vibrant musical traditions.",
    tags: ["Music", "Culture", "Language"],
  },
];

const COMMUNITIES = ["All", "Lepcha", "Bhutia", "Limbu", "Nepali", "Rai", "Tamang"];

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Priya Sharma", xp: 12480, streak: 47, avatar: "PS" },
  { rank: 2, name: "Tenzin Dorje", xp: 11230, streak: 32, avatar: "TD" },
  { rank: 3, name: "Aasha Rai", xp: 10890, streak: 28, avatar: "AR" },
  { rank: 4, name: "You", xp: 9750, streak: 12, avatar: "ME", isCurrentUser: true },
  { rank: 5, name: "Karma Bhutia", xp: 8920, streak: 21, avatar: "KB" },
];

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
      {/* Cover gradient */}
      <div className={cn("h-28 bg-gradient-to-br flex items-center justify-center text-5xl relative", course.color)}>
        <span>{course.emoji}</span>
        <div className="absolute top-3 right-3">
          <LevelBadge level={course.level} />
        </div>
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-white/80 transition-all"
              style={{ width: `${course.progress}%` }}
            />
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

// ── Main Component ─────────────────────────────────────────────────────────────
export default function LearnPage() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredCourses =
    activeTab === "All"
      ? COURSES
      : COURSES.filter((c) => c.community === activeTab);

  const inProgressCourse = COURSES.find((c) => c.progress && c.progress > 0);

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
              <h1 className="text-2xl font-bold text-white mt-1">Tenzin Namgyal 👋</h1>
            </div>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-2 rounded-xl"
              >
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="text-white font-bold">12</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-2 rounded-xl"
              >
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-bold">9,750</span>
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
              <span>Level 4 — Apprentice</span>
              <span>9,750 / 10,000 XP</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "97.5%" }}
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
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${inProgressCourse.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground-muted font-medium">
                    {inProgressCourse.progress}%
                  </span>
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
                <p className="text-white/80 text-sm">Translate 5 Lepcha phrases • 50 XP reward</p>
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
            <span>Resets in 14h 32m</span>
            <span className="ml-auto">3 of 5 completed</span>
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
            <span className="text-sm text-foreground-muted">{filteredCourses.length} courses</span>
          </div>

          {/* Community Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {COMMUNITIES.map((community) => (
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
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
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
              <h2 className="font-bold text-foreground">Weekly Leaderboard</h2>
            </div>
            <Link href="/leaderboard" className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {LEADERBOARD.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className={cn(
                  "flex items-center gap-4 px-5 py-3.5 transition-colors",
                  entry.isCurrentUser && "bg-primary/5 border-l-2 border-l-primary"
                )}
              >
                <span
                  className={cn(
                    "w-6 text-center font-bold text-sm",
                    entry.rank === 1 && "text-amber-500",
                    entry.rank === 2 && "text-slate-400",
                    entry.rank === 3 && "text-amber-700",
                    entry.rank > 3 && "text-foreground-muted"
                  )}
                >
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                </span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {entry.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-semibold text-sm", entry.isCurrentUser && "text-primary")}>
                    {entry.name} {entry.isCurrentUser && "(You)"}
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
            ))}
          </div>

          {/* Achievement teaser */}
          <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/5 border-t border-border">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-primary" />
              <p className="text-sm text-foreground-secondary">
                <span className="font-semibold text-foreground">250 XP more</span> to reach Top 3!
              </p>
              <TrendingUp className="w-4 h-4 text-primary ml-auto" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
