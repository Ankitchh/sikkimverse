"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Heart, Flame, Volume2, CheckCircle2, XCircle,
  ChevronRight, Trophy, Star, Zap, ArrowLeft, BookOpen,
  Globe, ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
interface VocabItem {
  word: string;
  meaning: string;
  pronunciation: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}

interface ContentSection {
  id: string;
  type: string;
  content: string;
}

interface LessonContent {
  sections?: ContentSection[];
  vocabulary?: VocabItem[];
  culturalNotes?: string;
}

interface QuizItem {
  id: string;
  type: string;
  question: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  xpReward: number;
}

interface LessonData {
  id: string;
  title: string;
  description: string | null;
  type: string;
  xpReward: number;
  estimatedMinutes: number;
  order: number;
  content: LessonContent;
  course: {
    id: string;
    title: string;
    level: string;
    community: { id: string; name: string; slug: string; colorPrimary: string };
    language: { id: string; name: string; code: string };
  };
  quizzes: QuizItem[];
  navigation: {
    prev: { id: string; title: string; order: number } | null;
    next: { id: string; title: string; order: number } | null;
    currentIndex: number;
    total: number;
  };
  userProgress: { completed: boolean; score: number | null } | null;
}

// ── Exercise step types ────────────────────────────────────────────────────────
type Step =
  | { kind: "text"; section: ContentSection }
  | { kind: "vocab"; item: VocabItem; language: string }
  | { kind: "cultural"; notes: string; communityName: string }
  | { kind: "quiz"; quiz: QuizItem }
  | { kind: "complete" };

function buildSteps(lesson: LessonData): Step[] {
  const steps: Step[] = [];
  const lang = lesson.course.language.name;
  const community = lesson.course.community.name;

  // Text sections first
  for (const s of lesson.content.sections ?? []) {
    steps.push({ kind: "text", section: s });
  }

  // Vocabulary cards
  for (const v of lesson.content.vocabulary ?? []) {
    steps.push({ kind: "vocab", item: v, language: lang });
  }

  // Cultural notes
  if (lesson.content.culturalNotes) {
    steps.push({ kind: "cultural", notes: lesson.content.culturalNotes, communityName: community });
  }

  // Quiz questions
  for (const q of lesson.quizzes) {
    steps.push({ kind: "quiz", quiz: q });
  }

  steps.push({ kind: "complete" });
  return steps;
}

// ── XP Burst ─────────────────────────────────────────────────────────────────
function XpBurst({ xp }: { xp: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], y: -60, scale: [0.5, 1.3, 1, 0.8] }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-50"
    >
      <div className="flex items-center gap-1 bg-amber-400 text-amber-900 font-bold px-3 py-1 rounded-full text-sm shadow-lg">
        <Zap className="w-3.5 h-3.5" />+{xp} XP
      </div>
    </motion.div>
  );
}

// ── Text Step ─────────────────────────────────────────────────────────────────
function TextStep({ section, color, onNext }: { section: ContentSection; color: string; onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Globe className="w-7 h-7" style={{ color }} />
        </div>
        <p className="text-foreground-muted text-sm uppercase tracking-wider font-medium">Cultural Context</p>
      </div>
      <div className="bg-background-secondary rounded-2xl p-6 border border-border">
        <p className="text-foreground leading-relaxed text-center">{section.content}</p>
      </div>
      <button onClick={onNext}
        className="w-full py-4 rounded-2xl font-bold text-white transition-colors"
        style={{ backgroundColor: color }}>
        Continue <ChevronRight className="inline w-4 h-4" />
      </button>
    </div>
  );
}

// ── Vocab Step ────────────────────────────────────────────────────────────────
function VocabStep({ item, language, color, onNext }: { item: VocabItem; language: string; color: string; onNext: () => void }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-foreground-muted text-sm font-medium uppercase tracking-wider">New Word</p>
        <p className="text-xs text-foreground-muted mt-1">{language}</p>
      </div>
      <motion.div className="relative w-full cursor-pointer" onClick={() => setFlipped(v => !v)} style={{ perspective: 1000 }}>
        <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5 }}
          style={{ transformStyle: "preserve-3d" }} className="relative">
          {/* Front */}
          <div className="rounded-3xl p-10 text-center text-white" style={{ backfaceVisibility: "hidden", background: `linear-gradient(135deg, ${color}, #1e4a8c)` }}>
            <p className="text-5xl font-bold mb-3">{item.word}</p>
            <p className="text-white/80 text-lg">[{item.pronunciation}]</p>
            <p className="text-white/50 text-sm mt-4">Tap to reveal meaning</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 rounded-3xl p-8 text-center bg-background-secondary border-2 border-border"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <p className="text-2xl font-bold text-foreground mb-2">{item.meaning}</p>
            {item.exampleSentence && (
              <div className="mt-4 text-left bg-background-tertiary rounded-xl p-3">
                <p className="text-sm text-foreground font-medium">{item.exampleSentence}</p>
                {item.exampleTranslation && (
                  <p className="text-xs text-foreground-muted mt-1 italic">{item.exampleTranslation}</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      <div className="flex items-center justify-center gap-1.5 text-foreground-muted text-xs">
        <Volume2 className="w-3.5 h-3.5" /> Click to flip
      </div>
      <button onClick={onNext}
        className={cn("w-full py-4 rounded-2xl font-bold transition-colors", flipped ? "text-white" : "bg-background-secondary text-foreground-muted border border-border")}
        style={flipped ? { backgroundColor: color } : undefined}>
        {flipped ? <>Got it! Continue <ChevronRight className="inline w-4 h-4" /></> : "Skip for now"}
      </button>
    </div>
  );
}

// ── Cultural Notes Step ───────────────────────────────────────────────────────
function CulturalStep({ notes, communityName, color, onNext }: { notes: string; communityName: string; color: string; onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <BookOpen className="w-7 h-7" style={{ color }} />
        </div>
        <p className="text-sm font-semibold text-foreground">{communityName} Cultural Note</p>
      </div>
      <div className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${color}dd, ${color}99)` }}>
        <p className="leading-relaxed italic">"{notes}"</p>
      </div>
      <button onClick={onNext}
        className="w-full py-4 rounded-2xl font-bold text-white transition-colors"
        style={{ backgroundColor: color }}>
        Continue <ChevronRight className="inline w-4 h-4" />
      </button>
    </div>
  );
}

// ── Quiz Step ─────────────────────────────────────────────────────────────────
function QuizStep({ quiz, onAnswer }: { quiz: QuizItem; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const options: string[] = quiz.options ?? [];

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const correct = options[i] === quiz.correctAnswer || i.toString() === quiz.correctAnswer;
    setTimeout(() => onAnswer(correct), 1200);
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-foreground-muted text-sm uppercase tracking-wider font-medium">Quiz</p>
      </div>
      <div className="bg-background-secondary rounded-2xl p-5 border border-border">
        <p className="text-foreground font-semibold text-center">{quiz.question}</p>
      </div>
      <div className="space-y-3">
        {options.map((opt, i) => {
          const isCorrect = opt === quiz.correctAnswer || i.toString() === quiz.correctAnswer;
          const isSelected = selected === i;
          return (
            <motion.button
              key={i}
              whileTap={selected === null ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={cn(
                "w-full p-4 rounded-xl border-2 font-medium text-left transition-all",
                selected === null && "border-border bg-background-secondary hover:border-primary/40",
                isSelected && isCorrect && "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700",
                isSelected && !isCorrect && "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700",
                !isSelected && selected !== null && isCorrect && "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 border-current">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {selected !== null && isCorrect && <CheckCircle2 className="w-5 h-5 ml-auto text-emerald-600" />}
                {isSelected && !isCorrect && <XCircle className="w-5 h-5 ml-auto text-red-600" />}
              </div>
            </motion.button>
          );
        })}
      </div>
      {selected !== null && quiz.explanation && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-background-secondary rounded-xl p-4 border border-border">
          <p className="text-xs text-foreground-muted">{quiz.explanation}</p>
        </motion.div>
      )}
    </div>
  );
}

// ── Complete Step ─────────────────────────────────────────────────────────────
function CompleteStep({
  lesson, xpEarned, nextLesson, courseId,
}: {
  lesson: LessonData; xpEarned: number; nextLesson: { id: string; title: string } | null; courseId: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 py-8">
      <div className="relative inline-block">
        <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
          <Trophy className="w-12 h-12 text-amber-500" />
        </div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Star className="w-4 h-4 text-white fill-white" />
        </motion.div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground">Lesson Complete! 🎉</h2>
        <p className="text-foreground-muted mt-1">{lesson.title}</p>
      </div>

      <div className="flex justify-center gap-4">
        <div className="bg-background-secondary rounded-2xl p-4 border border-border min-w-[100px]">
          <p className="text-2xl font-bold text-amber-500 flex items-center justify-center gap-1">
            <Zap className="w-5 h-5" />{xpEarned}
          </p>
          <p className="text-xs text-foreground-muted mt-1">XP Earned</p>
        </div>
        <div className="bg-background-secondary rounded-2xl p-4 border border-border min-w-[100px]">
          <p className="text-2xl font-bold text-primary">{lesson.order}</p>
          <p className="text-xs text-foreground-muted mt-1">of {lesson.navigation.total}</p>
        </div>
      </div>

      <div className="space-y-3">
        {nextLesson ? (
          <Link
            href={`/learn/lesson/${nextLesson.id}`}
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold transition-colors hover:bg-primary-hover"
          >
            Next Lesson <ChevronRight className="w-5 h-5" />
          </Link>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-200">
            <p className="text-emerald-700 dark:text-emerald-400 font-semibold">🏆 Course complete!</p>
          </div>
        )}
        <Link href={`/learn/${courseId}`}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-border rounded-2xl font-semibold text-foreground hover:border-primary/40 transition-colors">
          Back to Course
        </Link>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  const router = useRouter();

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpBurst, setShowXpBurst] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data) {
          setLesson(data.data);
          setSteps(buildSteps(data.data));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lessonId]);

  const currentStep = steps[stepIndex];
  const progress = steps.length > 0 ? (stepIndex / (steps.length - 1)) * 100 : 0;

  const awardXP = useCallback((amount: number) => {
    setXpEarned(x => x + amount);
    setShowXpBurst(true);
    setTimeout(() => setShowXpBurst(false), 1200);
  }, []);

  const saveProgress = useCallback(async (score: number) => {
    if (!lesson || progressSaved) return;
    setProgressSaved(true);
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          courseId: lesson.course.id,
          score,
          completed: true,
        }),
      });
    } catch {}
  }, [lesson, progressSaved]);

  const goNext = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      if (steps[stepIndex + 1]?.kind === "complete") {
        const score = Math.min(100, Math.round((xpEarned / Math.max(lesson?.xpReward ?? 10, 1)) * 100));
        saveProgress(score);
      }
      setStepIndex(i => i + 1);
    }
  }, [stepIndex, steps, xpEarned, lesson, saveProgress]);

  const handleQuizAnswer = useCallback((correct: boolean) => {
    if (correct) {
      awardXP(5);
    } else {
      setLives(l => Math.max(0, l - 1));
    }
    goNext();
  }, [awardXP, goNext]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📚</p>
          <p className="text-foreground font-semibold">Lesson not found</p>
          <Link href="/learn" className="text-primary text-sm hover:underline mt-2 block">← Back to Learn</Link>
        </div>
      </div>
    );
  }

  const color = lesson.course.community.colorPrimary;

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <Link href={`/learn/${lesson.course.id}`} className="text-foreground-muted hover:text-foreground transition-colors p-1">
            <X className="w-5 h-5" />
          </Link>
          <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} className={cn("w-5 h-5", i < lives ? "text-red-500 fill-red-500" : "text-border fill-border")} />
            ))}
          </div>
        </div>
      </div>

      {/* Lesson Header */}
      <div className="border-b border-border bg-background-secondary">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground-muted">{lesson.course.community.name} · {lesson.course.language.name}</p>
            <p className="text-sm font-semibold text-foreground truncate">{lesson.title}</p>
          </div>
          <div className="flex items-center gap-1 text-amber-600 text-sm font-bold shrink-0">
            <Flame className="w-4 h-4" />{xpEarned} XP
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 py-8 relative">
        {showXpBurst && <XpBurst xp={5} />}

        <AnimatePresence mode="wait">
          {currentStep && (
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {currentStep.kind === "text" && (
                <TextStep section={currentStep.section} color={color} onNext={() => { awardXP(2); goNext(); }} />
              )}
              {currentStep.kind === "vocab" && (
                <VocabStep item={currentStep.item} language={currentStep.language} color={color} onNext={() => { awardXP(3); goNext(); }} />
              )}
              {currentStep.kind === "cultural" && (
                <CulturalStep notes={currentStep.notes} communityName={currentStep.communityName} color={color} onNext={() => { awardXP(2); goNext(); }} />
              )}
              {currentStep.kind === "quiz" && (
                <QuizStep quiz={currentStep.quiz} onAnswer={handleQuizAnswer} />
              )}
              {currentStep.kind === "complete" && (
                <CompleteStep
                  lesson={lesson}
                  xpEarned={xpEarned}
                  nextLesson={lesson.navigation.next}
                  courseId={lesson.course.id}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
