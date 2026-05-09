"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Star,
  Users,
  Play,
  Lock,
  CheckCircle2,
  ChevronRight,
  Info,
  Globe,
  Scroll,
  Headphones,
  PenLine,
  MessageCircle,
  Trophy,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Lesson {
  id: string;
  number: number;
  title: string;
  type: "vocabulary" | "grammar" | "pronunciation" | "script" | "culture";
  duration: number; // minutes
  xp: number;
  status: "completed" | "current" | "locked";
}

interface CourseData {
  id: string;
  title: string;
  community: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  longDescription: string;
  color: string;
  gradient: string;
  emoji: string;
  lessons: Lesson[];
  totalXP: number;
  enrolled: number;
  rating: number;
  estimatedHours: number;
  prerequisites: string[];
  culturalContext: {
    script: string;
    speakers: string;
    region: string;
    facts: string[];
  };
}

// ── Course Data ────────────────────────────────────────────────────────────────
const COURSES_DATA: Record<string, CourseData> = {
  "lepcha-beginners": {
    id: "lepcha-beginners",
    title: "Lepcha Beginners",
    community: "Lepcha",
    level: "Beginner",
    description: "Start your journey into the ancient Lepcha script and spoken language.",
    longDescription:
      "The Lepcha (Róng) people are the earliest known inhabitants of Sikkim. This course introduces you to the foundations of the Lepcha language — greetings, numbers, family terms, and the beautiful Róng script. Each lesson is crafted with guidance from native Lepcha speakers and cultural experts.",
    color: "#16A34A",
    gradient: "from-emerald-600 to-teal-700",
    emoji: "🌿",
    totalXP: 400,
    enrolled: 1842,
    rating: 4.8,
    estimatedHours: 10,
    prerequisites: [],
    culturalContext: {
      script: "Róng script (unique to Lepcha people)",
      speakers: "~50,000 speakers worldwide",
      region: "North & West Sikkim, Darjeeling",
      facts: [
        "Lepcha is one of the few Himalayan languages with its own indigenous script.",
        "The script reads from left to right and has 34 consonants and 10 vowels.",
        "Lepcha oral literature includes ritual songs called Zo and myth cycles about Mayel Lyang, the hidden paradise.",
        "The language is classified as Endangered by UNESCO.",
      ],
    },
    lessons: [
      { id: "l1-1", number: 1, title: "Greetings & Introductions", type: "vocabulary", duration: 10, xp: 20, status: "completed" },
      { id: "l1-2", number: 2, title: "Numbers 1–10", type: "vocabulary", duration: 8, xp: 15, status: "completed" },
      { id: "l1-3", number: 3, title: "Family Members", type: "vocabulary", duration: 12, xp: 20, status: "completed" },
      { id: "l1-4", number: 4, title: "Colors of Nature", type: "vocabulary", duration: 10, xp: 20, status: "completed" },
      { id: "l1-5", number: 5, title: "Daily Phrases", type: "grammar", duration: 15, xp: 25, status: "completed" },
      { id: "l1-6", number: 6, title: "The Róng Script — Consonants Part 1", type: "script", duration: 20, xp: 30, status: "completed" },
      { id: "l1-7", number: 7, title: "The Róng Script — Consonants Part 2", type: "script", duration: 20, xp: 30, status: "current" },
      { id: "l1-8", number: 8, title: "Vowel Signs in Róng Script", type: "script", duration: 18, xp: 25, status: "locked" },
      { id: "l1-9", number: 9, title: "Food & Nature Vocabulary", type: "vocabulary", duration: 12, xp: 20, status: "locked" },
      { id: "l1-10", number: 10, title: "Pronunciation — Tones & Aspirates", type: "pronunciation", duration: 15, xp: 25, status: "locked" },
      { id: "l1-11", number: 11, title: "Simple Sentences", type: "grammar", duration: 15, xp: 25, status: "locked" },
      { id: "l1-12", number: 12, title: "Animals in the Forest", type: "vocabulary", duration: 10, xp: 20, status: "locked" },
      { id: "l1-13", number: 13, title: "Seasons & Weather", type: "culture", duration: 12, xp: 20, status: "locked" },
      { id: "l1-14", number: 14, title: "Traditional Festivals", type: "culture", duration: 15, xp: 25, status: "locked" },
      { id: "l1-15", number: 15, title: "Mayel Lyang — The Hidden Paradise", type: "culture", duration: 20, xp: 30, status: "locked" },
      { id: "l1-16", number: 16, title: "Verbs — Actions & Movement", type: "grammar", duration: 15, xp: 25, status: "locked" },
      { id: "l1-17", number: 17, title: "Writing Practice — Your Name", type: "script", duration: 20, xp: 30, status: "locked" },
      { id: "l1-18", number: 18, title: "Conversational Review", type: "pronunciation", duration: 15, xp: 25, status: "locked" },
      { id: "l1-19", number: 19, title: "Cultural Song — Zo Ritual Chant", type: "culture", duration: 18, xp: 30, status: "locked" },
      { id: "l1-20", number: 20, title: "Final Assessment", type: "grammar", duration: 25, xp: 50, status: "locked" },
    ],
  },
  "bhutia-essentials": {
    id: "bhutia-essentials",
    title: "Bhutia Essentials",
    community: "Bhutia",
    level: "Beginner",
    description: "Learn everyday Bhutia expressions and cultural practices.",
    longDescription:
      "The Bhutia (Lhopos) are Tibetan-origin people who have called Sikkim home for centuries. This course covers essential Bhutia phrases, Tibetan script basics as used in the Sikkimese context, and an introduction to Buddhist cultural terms used in daily life.",
    color: "#DC2626",
    gradient: "from-blue-600 to-indigo-700",
    emoji: "🏔️",
    totalXP: 300,
    enrolled: 1204,
    rating: 4.7,
    estimatedHours: 8,
    prerequisites: [],
    culturalContext: {
      script: "Tibetan script (Uchen & Umé styles)",
      speakers: "~70,000 speakers in Sikkim",
      region: "East & North Sikkim",
      facts: [
        "Bhutia (Drenjongke) is spoken by the Lhopos, descendants of Tibetan migrants from the 13th–16th centuries.",
        "The language uses the classical Tibetan script but has its own phonological system.",
        "Cham dance, performed at monasteries, is an integral part of Bhutia cultural expression.",
        "Thangka painting tradition is uniquely Bhutia and considered a form of sacred scholarship.",
      ],
    },
    lessons: [
      { id: "l2-1", number: 1, title: "Tashi Delek — Greetings", type: "vocabulary", duration: 10, xp: 20, status: "completed" },
      { id: "l2-2", number: 2, title: "Buddhist Vocabulary", type: "culture", duration: 12, xp: 20, status: "completed" },
      { id: "l2-3", number: 3, title: "Numbers & Counting", type: "vocabulary", duration: 8, xp: 15, status: "current" },
      { id: "l2-4", number: 4, title: "Tibetan Script Basics", type: "script", duration: 20, xp: 30, status: "locked" },
      { id: "l2-5", number: 5, title: "Family & Kinship Terms", type: "vocabulary", duration: 12, xp: 20, status: "locked" },
      { id: "l2-6", number: 6, title: "Daily Life Phrases", type: "grammar", duration: 15, xp: 25, status: "locked" },
      { id: "l2-7", number: 7, title: "Food & Hospitality", type: "vocabulary", duration: 12, xp: 20, status: "locked" },
      { id: "l2-8", number: 8, title: "Monastery & Religion", type: "culture", duration: 18, xp: 30, status: "locked" },
      { id: "l2-9", number: 9, title: "Pronunciation — Retroflex Sounds", type: "pronunciation", duration: 15, xp: 25, status: "locked" },
      { id: "l2-10", number: 10, title: "Colours & Descriptions", type: "vocabulary", duration: 10, xp: 20, status: "locked" },
      { id: "l2-11", number: 11, title: "Seasons & Festivals", type: "culture", duration: 15, xp: 25, status: "locked" },
      { id: "l2-12", number: 12, title: "Simple Conversations", type: "grammar", duration: 15, xp: 25, status: "locked" },
      { id: "l2-13", number: 13, title: "Cham Dance Vocabulary", type: "culture", duration: 12, xp: 20, status: "locked" },
      { id: "l2-14", number: 14, title: "Writing Tibetan — Your Name", type: "script", duration: 20, xp: 30, status: "locked" },
      { id: "l2-15", number: 15, title: "Final Review & Assessment", type: "grammar", duration: 25, xp: 50, status: "locked" },
    ],
  },
  "limbu-script-mastery": {
    id: "limbu-script-mastery",
    title: "Limbu Script Mastery",
    community: "Limbu",
    level: "Intermediate",
    description: "Master the beautiful Sirijonga script used in Limbu writing.",
    longDescription:
      "The Sirijonga script was revived in the 18th century for the Limbu language. This intermediate course takes you through the full script — all consonants, vowels, numerals, and punctuation — as well as reading practice with traditional Mundhum oral scripture fragments. Prior basic knowledge of the Limbu language is recommended.",
    color: "#D97706",
    gradient: "from-orange-500 to-amber-600",
    emoji: "✍️",
    totalXP: 500,
    enrolled: 987,
    rating: 4.9,
    estimatedHours: 15,
    prerequisites: ["Basic spoken Limbu (recommended)", "Familiarity with any indigenous script is helpful"],
    culturalContext: {
      script: "Sirijonga script (Kirat Sirijonga)",
      speakers: "~400,000 speakers across Nepal, India & Bhutan",
      region: "East Sikkim & Kalimpong",
      facts: [
        "The Sirijonga script was developed by Te-ongsi Sirijonga Thoebe Hang in the 18th century.",
        "The script has 59 letters and reads left to right.",
        "Limbu oral tradition (Mundhum) is recited by Phedangma priests during rituals.",
        "The Limbu people are classified as Kirat, one of the oldest Himalayan civilizations.",
      ],
    },
    lessons: [
      { id: "l3-1", number: 1, title: "History of Sirijonga Script", type: "culture", duration: 12, xp: 20, status: "completed" },
      { id: "l3-2", number: 2, title: "Consonants — Group 1 (k, kh, g)", type: "script", duration: 20, xp: 25, status: "completed" },
      { id: "l3-3", number: 3, title: "Consonants — Group 2 (c, ch, j)", type: "script", duration: 20, xp: 25, status: "completed" },
      { id: "l3-4", number: 4, title: "Consonants — Group 3 (t, th, d)", type: "script", duration: 20, xp: 25, status: "completed" },
      { id: "l3-5", number: 5, title: "Consonants — Group 4 (p, ph, b)", type: "script", duration: 20, xp: 25, status: "current" },
      { id: "l3-6", number: 6, title: "Nasal & Semivowel Consonants", type: "script", duration: 18, xp: 25, status: "locked" },
      { id: "l3-7", number: 7, title: "Vowel Marks — Part 1", type: "script", duration: 18, xp: 25, status: "locked" },
      { id: "l3-8", number: 8, title: "Vowel Marks — Part 2", type: "script", duration: 18, xp: 25, status: "locked" },
      { id: "l3-9", number: 9, title: "Sirijonga Numerals 0–9", type: "script", duration: 12, xp: 20, status: "locked" },
      { id: "l3-10", number: 10, title: "Punctuation & Spacing Rules", type: "grammar", duration: 10, xp: 15, status: "locked" },
      { id: "l3-11", number: 11, title: "Writing Practice — Simple Words", type: "script", duration: 25, xp: 35, status: "locked" },
      { id: "l3-12", number: 12, title: "Reading — Greetings in Sirijonga", type: "pronunciation", duration: 20, xp: 30, status: "locked" },
      { id: "l3-13", number: 13, title: "Mundhum Text — Creation Verse", type: "culture", duration: 20, xp: 30, status: "locked" },
      { id: "l3-14", number: 14, title: "Reading Comprehension Exercise 1", type: "grammar", duration: 20, xp: 30, status: "locked" },
      { id: "l3-15", number: 15, title: "Writing Full Sentences", type: "script", duration: 25, xp: 35, status: "locked" },
      { id: "l3-16", number: 16, title: "Traditional Song in Sirijonga", type: "culture", duration: 18, xp: 25, status: "locked" },
      { id: "l3-17", number: 17, title: "Reading Comprehension Exercise 2", type: "grammar", duration: 20, xp: 30, status: "locked" },
      { id: "l3-18", number: 18, title: "Pronunciation — Tonal Pairs", type: "pronunciation", duration: 15, xp: 25, status: "locked" },
      { id: "l3-19", number: 19, title: "Calligraphy — Beautiful Script Writing", type: "script", duration: 30, xp: 40, status: "locked" },
      { id: "l3-20", number: 20, title: "Mundhum Excerpt — Cosmology", type: "culture", duration: 20, xp: 30, status: "locked" },
      { id: "l3-21", number: 21, title: "Advanced Consonant Clusters", type: "script", duration: 25, xp: 35, status: "locked" },
      { id: "l3-22", number: 22, title: "Reading Passage — Village Life", type: "grammar", duration: 20, xp: 30, status: "locked" },
      { id: "l3-23", number: 23, title: "Writing Practice — Short Paragraph", type: "script", duration: 25, xp: 35, status: "locked" },
      { id: "l3-24", number: 24, title: "Speed Reading Challenge", type: "pronunciation", duration: 15, xp: 25, status: "locked" },
      { id: "l3-25", number: 25, title: "Final Assessment — Full Script", type: "grammar", duration: 30, xp: 60, status: "locked" },
    ],
  },
};

const LESSON_TYPE_CONFIG = {
  vocabulary: { icon: BookOpen, color: "bg-blue-100 text-blue-700", label: "Vocabulary" },
  grammar: { icon: MessageCircle, color: "bg-purple-100 text-purple-700", label: "Grammar" },
  pronunciation: { icon: Headphones, color: "bg-green-100 text-green-700", label: "Pronunciation" },
  script: { icon: PenLine, color: "bg-orange-100 text-orange-700", label: "Script" },
  culture: { icon: Globe, color: "bg-pink-100 text-pink-700", label: "Culture" },
};

// ── Lesson Row ────────────────────────────────────────────────────────────────
function LessonRow({ lesson, index }: { lesson: Lesson; index: number }) {
  const config = LESSON_TYPE_CONFIG[lesson.type];
  const Icon = config.icon;
  const isLocked = lesson.status === "locked";
  const isCompleted = lesson.status === "completed";
  const isCurrent = lesson.status === "current";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-all",
        isLocked && "opacity-60 cursor-not-allowed bg-background-tertiary border-border-subtle",
        isCompleted && "bg-background-secondary border-border hover:border-primary/30 cursor-pointer",
        isCurrent && "bg-background-secondary border-primary/40 shadow-md cursor-pointer ring-1 ring-primary/20"
      )}
    >
      {/* Number / Status Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm",
          isCompleted && "bg-primary text-white",
          isCurrent && "bg-secondary text-white",
          isLocked && "bg-background-tertiary text-foreground-muted border border-border"
        )}
      >
        {isCompleted && <CheckCircle2 className="w-5 h-5" />}
        {isCurrent && <Play className="w-4 h-4 fill-white" />}
        {isLocked && <Lock className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-foreground-muted font-medium">Lesson {lesson.number}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", config.color)}>
            <Icon className="w-3 h-3 inline mr-1" />
            {config.label}
          </span>
        </div>
        <p className={cn("font-semibold mt-0.5", isLocked ? "text-foreground-muted" : "text-foreground")}>
          {lesson.title}
        </p>
      </div>

      {/* Meta */}
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1 text-xs text-foreground-muted justify-end">
          <Clock className="w-3.5 h-3.5" />
          <span>{lesson.duration}m</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-amber-600 mt-1 justify-end">
          <Star className="w-3.5 h-3.5" />
          <span>{lesson.xp} XP</span>
        </div>
      </div>

      {!isLocked && <ChevronRight className="w-4 h-4 text-foreground-muted shrink-0" />}
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [showAllLessons, setShowAllLessons] = useState(false);

  const course = COURSES_DATA[courseId] ?? COURSES_DATA["lepcha-beginners"];

  const completedLessons = course.lessons.filter((l) => l.status === "completed").length;
  const currentLesson = course.lessons.find((l) => l.status === "current");
  const progress = Math.round((completedLessons / course.lessons.length) * 100);
  const displayedLessons = showAllLessons ? course.lessons : course.lessons.slice(0, 8);

  const levelConfig = {
    Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Intermediate: "bg-amber-100 text-amber-700 border-amber-200",
    Advanced: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className={cn("bg-gradient-to-br relative overflow-hidden", course.gradient)}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-5xl mx-auto px-4 pt-6 pb-16">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to courses
          </Link>

          <div className="flex items-start gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-5xl shrink-0"
            >
              {course.emoji}
            </motion.div>
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-2 mb-2"
              >
                <span className="text-white/70 text-sm font-medium">{course.community} Community</span>
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border bg-white/10 border-white/30 text-white")}>
                  {course.level}
                </span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-3xl font-bold text-white leading-tight"
              >
                {course.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-white/80 mt-2 text-sm max-w-xl"
              >
                {course.longDescription}
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap items-center gap-4 mt-4 text-white/80 text-sm"
              >
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {course.enrolled.toLocaleString()} enrolled
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  {course.rating} rating
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  ~{course.estimatedHours} hours
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  {course.totalXP} XP total
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — CTA card */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background-secondary rounded-2xl border border-border shadow-lg p-5 sticky top-4"
            >
              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-foreground">Your Progress</span>
                  <span className="text-primary font-bold">{progress}%</span>
                </div>
                <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <p className="text-xs text-foreground-muted mt-1.5">
                  {completedLessons} of {course.lessons.length} lessons completed
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { icon: BookOpen, label: "Lessons", value: course.lessons.length },
                  { icon: Clock, label: "Est. Time", value: `${course.estimatedHours}h` },
                  { icon: Star, label: "Total XP", value: course.totalXP },
                  { icon: Trophy, label: "Level", value: course.level },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-background-tertiary rounded-xl p-3 text-center">
                    <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-xs text-foreground-muted">{label}</p>
                    <p className="font-bold text-foreground text-sm mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link href={`/learn/lesson/${currentLesson?.id ?? course.lessons[0].id}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
                    `bg-gradient-to-r ${course.gradient} hover:opacity-90 shadow-md`
                  )}
                >
                  <Play className="w-5 h-5 fill-white" />
                  {completedLessons > 0 ? "Continue Course" : "Start Course"}
                </motion.button>
              </Link>

              {completedLessons > 0 && (
                <p className="text-xs text-foreground-muted text-center mt-2">
                  Next: Lesson {(currentLesson?.number ?? 1)} — {currentLesson?.title}
                </p>
              )}
            </motion.div>

            {/* Prerequisites */}
            {course.prerequisites.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-amber-800 text-sm">Prerequisites</span>
                </div>
                <ul className="space-y-1">
                  {course.prerequisites.map((p) => (
                    <li key={p} className="text-sm text-amber-700 flex items-start gap-1.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Right column — Lessons + Cultural Context */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cultural Context */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-gradient-to-br from-background-secondary to-background-tertiary rounded-2xl border border-border p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Scroll className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-foreground text-lg">Cultural Context</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Script</p>
                  <p className="text-sm font-semibold text-foreground">{course.culturalContext.script}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Speakers</p>
                  <p className="text-sm font-semibold text-foreground">{course.culturalContext.speakers}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Region</p>
                  <p className="text-sm font-semibold text-foreground">{course.culturalContext.region}</p>
                </div>
              </div>
              <div className="space-y-2">
                {course.culturalContext.facts.map((fact, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="flex items-start gap-2 text-sm text-foreground-secondary"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{fact}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Lesson List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="font-bold text-foreground text-lg mb-3">
                Lessons ({course.lessons.length})
              </h2>
              <div className="space-y-2">
                {displayedLessons.map((lesson, i) => (
                  <div key={lesson.id}>
                    {lesson.status !== "locked" ? (
                      <Link href={`/learn/lesson/${lesson.id}`}>
                        <LessonRow lesson={lesson} index={i} />
                      </Link>
                    ) : (
                      <LessonRow lesson={lesson} index={i} />
                    )}
                  </div>
                ))}
              </div>

              {course.lessons.length > 8 && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setShowAllLessons((v) => !v)}
                  className="mt-3 w-full py-3 rounded-xl border border-border text-foreground-secondary hover:border-primary hover:text-primary transition-all text-sm font-medium"
                >
                  {showAllLessons
                    ? "Show fewer lessons"
                    : `Show all ${course.lessons.length} lessons`}
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
