"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  Flame,
  Volume2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trophy,
  Star,
  Zap,
  ArrowLeft,
  Mic,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
type ExerciseType = "vocabulary" | "multiple-choice" | "audio-match" | "translation";

interface VocabExercise {
  type: "vocabulary";
  word: string;
  phonetic: string;
  meaning: string;
  language: string;
  exampleSentence: string;
  exampleTranslation: string;
}

interface MultipleChoiceExercise {
  type: "multiple-choice";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface AudioMatchExercise {
  type: "audio-match";
  word: string;
  phonetic: string;
  meaning: string;
  instruction: string;
}

interface TranslationExercise {
  type: "translation";
  prompt: string;
  direction: "to-english" | "to-lepcha";
  correctAnswer: string;
  acceptableAnswers: string[];
  hint: string;
}

type Exercise = VocabExercise | MultipleChoiceExercise | AudioMatchExercise | TranslationExercise;

// ── Sample Lesson Data ─────────────────────────────────────────────────────────
const LESSON_EXERCISES: Exercise[] = [
  {
    type: "vocabulary",
    word: "ᰀᰦᰉᰧ",
    phonetic: "Ayóng",
    meaning: "Hello / Greetings",
    language: "Lepcha (Róng)",
    exampleSentence: "ᰀᰦᰉᰧ, ᰂᰪᰰ ᰓᰬ ᰖᰬ?",
    exampleTranslation: "Ayóng, nyu ka ya? (Hello, how are you?)",
  },
  {
    type: "multiple-choice",
    question: "What does 'Ayóng' mean in Lepcha?",
    options: ["Goodbye", "Hello / Greetings", "Thank you", "My name is"],
    correctIndex: 1,
    explanation: "'Ayóng' (ᰀᰦᰉᰧ) is the standard greeting in Lepcha, used at any time of day.",
  },
  {
    type: "audio-match",
    word: "ᰃᰪ",
    phonetic: "Nyu",
    meaning: "You",
    instruction: "Listen to the pronunciation and click the play button to hear 'Nyu'",
  },
  {
    type: "translation",
    prompt: "Translate to English: ᰃᰪᰰ ᰕᰬᰶ ᰒᰦᰞ?",
    direction: "to-english",
    correctAnswer: "What is your name?",
    acceptableAnswers: ["what is your name", "what's your name", "what is your name?"],
    hint: "This is a common introductory question",
  },
  {
    type: "vocabulary",
    word: "ᰂᰩᰴᰧ",
    phonetic: "Nóng",
    meaning: "Forest / Jungle",
    language: "Lepcha (Róng)",
    exampleSentence: "ᰂᰩᰴᰧ ᰅᰬ ᰙᰪᰴ ᰉᰬᰮᰰ",
    exampleTranslation: "Nóng fa tung kóm. (The forest is very beautiful.)",
  },
  {
    type: "multiple-choice",
    question: "Which of these is the Lepcha word for 'forest'?",
    options: ["ᰀᰦᰉᰧ (Ayóng)", "ᰂᰩᰴᰧ (Nóng)", "ᰃᰪ (Nyu)", "ᰕᰬᰶ (Yóng)"],
    correctIndex: 1,
    explanation: "'Nóng' (ᰂᰩᰴᰧ) means forest. The Lepcha people have a deep spiritual connection with forests.",
  },
  {
    type: "audio-match",
    word: "ᰀᰦᰉᰧ",
    phonetic: "Ayóng",
    meaning: "Hello",
    instruction: "Press play and repeat the pronunciation. The tone falls slightly on the second syllable.",
  },
  {
    type: "translation",
    prompt: "How do you say 'Hello' in Lepcha?",
    direction: "to-lepcha",
    correctAnswer: "Ayóng",
    acceptableAnswers: ["ayong", "ayóng", "ᰀᰦᰉᰧ"],
    hint: "You learned this in the first card!",
  },
];

const TOTAL_LESSONS = 20;
const LESSON_NUMBER = 7;
const XP_PER_CORRECT = 5;

// ── XP Burst Component ────────────────────────────────────────────────────────
function XpBurst({ xp }: { xp: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], y: -60, scale: [0.5, 1.3, 1, 0.8] }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-50"
    >
      <div className="flex items-center gap-1 bg-amber-400 text-amber-900 font-bold px-3 py-1 rounded-full text-sm shadow-lg">
        <Zap className="w-3.5 h-3.5" />
        +{xp} XP
      </div>
    </motion.div>
  );
}

// ── Vocabulary Card ───────────────────────────────────────────────────────────
function VocabularyCard({ exercise, onContinue }: { exercise: VocabExercise; onContinue: () => void }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-foreground-muted text-sm font-medium uppercase tracking-wider">New Word</p>
        <p className="text-xs text-foreground-muted mt-1">{exercise.language}</p>
      </div>

      <motion.div
        className="relative w-full cursor-pointer"
        onClick={() => setFlipped((v) => !v)}
        style={{ perspective: 1000 }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative"
        >
          {/* Front */}
          <div
            className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-10 text-center text-white"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-6xl font-bold mb-3" style={{ fontFamily: "serif" }}>
              {exercise.word}
            </p>
            <p className="text-white/80 text-xl font-light">[{exercise.phonetic}]</p>
            <p className="text-white/50 text-sm mt-4">Tap to reveal meaning</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-background-secondary rounded-3xl p-8 text-center border border-border"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-3xl font-bold text-foreground mb-2">{exercise.meaning}</p>
            <div className="mt-4 p-3 bg-background-tertiary rounded-xl text-left">
              <p className="text-xs text-foreground-muted mb-1">Example:</p>
              <p className="font-medium text-foreground text-sm">{exercise.exampleSentence}</p>
              <p className="text-foreground-secondary text-sm mt-1 italic">{exercise.exampleTranslation}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
      >
        Got it! Continue
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}

// ── Multiple Choice ───────────────────────────────────────────────────────────
function MultipleChoiceCard({
  exercise,
  onCorrect,
  onWrong,
}: {
  exercise: MultipleChoiceExercise;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === exercise.correctIndex) {
      setTimeout(onCorrect, 1400);
    } else {
      setTimeout(onWrong, 1400);
    }
  };

  const isCorrect = selected === exercise.correctIndex;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-foreground-muted text-sm font-medium uppercase tracking-wider mb-3">Choose the correct answer</p>
        <p className="text-xl font-bold text-foreground">{exercise.question}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {exercise.options.map((option, idx) => {
          const isSelected = selected === idx;
          const isRight = idx === exercise.correctIndex;
          return (
            <motion.button
              key={idx}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(idx)}
              className={cn(
                "p-4 rounded-xl border-2 text-left font-medium transition-all text-sm",
                !showResult && "border-border bg-background-secondary hover:border-primary hover:bg-primary/5",
                showResult && isRight && "border-emerald-500 bg-emerald-50 text-emerald-800",
                showResult && isSelected && !isRight && "border-red-500 bg-red-50 text-red-800",
                showResult && !isSelected && !isRight && "border-border bg-background-secondary opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold",
                    !showResult && "border-border text-foreground-muted",
                    showResult && isRight && "border-emerald-500 bg-emerald-500 text-white",
                    showResult && isSelected && !isRight && "border-red-500 bg-red-500 text-white"
                  )}
                >
                  {showResult && isRight ? <CheckCircle2 className="w-4 h-4" /> : showResult && isSelected && !isRight ? <XCircle className="w-4 h-4" /> : String.fromCharCode(65 + idx)}
                </div>
                {option}
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-xl border",
              isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
            )}
          >
            <p className="font-bold text-sm mb-1">{isCorrect ? "✓ Correct!" : "✗ Not quite"}</p>
            <p className="text-sm">{exercise.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Audio Match ───────────────────────────────────────────────────────────────
function AudioMatchCard({ exercise, onContinue }: { exercise: AudioMatchExercise; onContinue: () => void }) {
  const [played, setPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    setPlayed(true);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-foreground-muted text-sm font-medium uppercase tracking-wider mb-1">Listen & Learn</p>
        <p className="text-sm text-foreground-secondary">{exercise.instruction}</p>
      </div>

      <div className="bg-background-secondary rounded-3xl border border-border p-8 text-center">
        <p className="text-5xl font-bold text-foreground mb-2" style={{ fontFamily: "serif" }}>
          {exercise.word}
        </p>
        <p className="text-foreground-muted text-lg">[{exercise.phonetic}]</p>
        <p className="text-foreground-secondary font-medium mt-2">{exercise.meaning}</p>
      </div>

      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlay}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg",
            isPlaying ? "bg-primary text-white scale-110" : "bg-primary/10 text-primary border-2 border-primary/30 hover:bg-primary/20"
          )}
        >
          {isPlaying ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <Volume2 className="w-8 h-8" />
            </motion.div>
          ) : (
            <Volume2 className="w-8 h-8" />
          )}
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        disabled={!played}
        className={cn(
          "w-full py-4 rounded-2xl font-bold text-lg transition-all",
          played ? "bg-primary text-white hover:bg-primary-hover" : "bg-background-tertiary text-foreground-muted cursor-not-allowed"
        )}
      >
        Continue
        <ChevronRight className="w-5 h-5 inline ml-2" />
      </motion.button>
    </div>
  );
}

// ── Translation Exercise ──────────────────────────────────────────────────────
function TranslationCard({
  exercise,
  onCorrect,
  onWrong,
}: {
  exercise: TranslationExercise;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleCheck = () => {
    const normalized = answer.trim().toLowerCase();
    const correct = exercise.acceptableAnswers.some(
      (a) => a.toLowerCase() === normalized
    );
    setIsCorrect(correct);
    setChecked(true);
    if (correct) {
      setTimeout(onCorrect, 1400);
    } else {
      setTimeout(onWrong, 1400);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-foreground-muted text-sm font-medium uppercase tracking-wider mb-1">
          {exercise.direction === "to-english" ? "Translate to English" : "Translate to Lepcha"}
        </p>
      </div>

      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-6 text-center">
        <p className="text-xl font-bold text-foreground">{exercise.prompt}</p>
        <p className="text-xs text-foreground-muted mt-2 italic">Hint: {exercise.hint}</p>
      </div>

      <div>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={checked}
          placeholder="Type your answer here..."
          rows={3}
          className={cn(
            "w-full rounded-xl border p-4 text-foreground bg-background-secondary resize-none outline-none transition-all font-medium",
            !checked && "border-border focus:border-primary focus:ring-2 focus:ring-primary/20",
            checked && isCorrect && "border-emerald-500 bg-emerald-50",
            checked && !isCorrect && "border-red-500 bg-red-50"
          )}
        />
      </div>

      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-xl border",
              isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
            )}
          >
            <p className="font-bold text-sm">{isCorrect ? "✓ Correct!" : "✗ Incorrect"}</p>
            {!isCorrect && (
              <p className="text-sm mt-1">Correct answer: <span className="font-semibold">{exercise.correctAnswer}</span></p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!checked && (
        <motion.button
          whileHover={answer.trim() ? { scale: 1.02 } : {}}
          whileTap={answer.trim() ? { scale: 0.98 } : {}}
          onClick={handleCheck}
          disabled={!answer.trim()}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-lg transition-all",
            answer.trim()
              ? "bg-primary text-white hover:bg-primary-hover"
              : "bg-background-tertiary text-foreground-muted cursor-not-allowed"
          )}
        >
          Check Answer
        </motion.button>
      )}
    </div>
  );
}

// ── Completion Screen ─────────────────────────────────────────────────────────
function CompletionScreen({ xpEarned, streak }: { xpEarned: number; streak: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center p-6"
    >
      <div className="text-center text-white max-w-sm">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Trophy className="w-14 h-14 text-yellow-300" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold mb-2"
        >
          Lesson Complete!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/80 text-lg mb-8"
        >
          Excellent work on Lesson {LESSON_NUMBER}
        </motion.p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/15 rounded-2xl p-4"
          >
            <Star className="w-7 h-7 text-yellow-300 mx-auto mb-2" />
            <p className="text-2xl font-bold">+{xpEarned}</p>
            <p className="text-white/70 text-sm">XP earned</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/15 rounded-2xl p-4"
          >
            <Flame className="w-7 h-7 text-orange-300 mx-auto mb-2" />
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-white/70 text-sm">Day streak</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <Link href="/learn/lepcha-beginners">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-white text-emerald-700 font-bold rounded-2xl text-lg hover:bg-white/90 transition-colors"
            >
              Continue to Next Lesson
            </motion.button>
          </Link>
          <Link href="/learn">
            <button className="w-full py-3 text-white/80 hover:text-white font-medium transition-colors text-sm">
              Back to Learning Hub
            </button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Main Lesson Page ──────────────────────────────────────────────────────────
export default function LessonPage() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpBurst, setShowXpBurst] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [direction, setDirection] = useState(1);

  const currentExercise = LESSON_EXERCISES[exerciseIndex];
  const progress = ((exerciseIndex) / LESSON_EXERCISES.length) * 100;

  const handleCorrect = useCallback(() => {
    setXpEarned((xp) => xp + XP_PER_CORRECT);
    setShowXpBurst(true);
    setTimeout(() => setShowXpBurst(false), 1400);
    goNext();
  }, [exerciseIndex]);

  const handleWrong = useCallback(() => {
    setHearts((h) => Math.max(0, h - 1));
    goNext();
  }, [exerciseIndex]);

  const goNext = useCallback(() => {
    setDirection(1);
    if (exerciseIndex >= LESSON_EXERCISES.length - 1) {
      setXpEarned((xp) => xp + XP_PER_CORRECT); // bonus for last
      setCompleted(true);
    } else {
      setExerciseIndex((i) => i + 1);
    }
  }, [exerciseIndex]);

  if (completed) {
    return <CompletionScreen xpEarned={xpEarned} streak={13} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <Link href="/learn/lepcha-beginners">
            <button className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </Link>

          {/* Progress bar */}
          <div className="flex-1 h-3 bg-background-tertiary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          {/* Hearts */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={cn(
                  "w-5 h-5 transition-all",
                  i < hearts ? "text-red-500 fill-red-500" : "text-foreground-muted fill-none"
                )}
              />
            ))}
          </div>

          {/* Streak + XP */}
          <div className="flex items-center gap-1.5 text-sm font-bold text-amber-600">
            <Flame className="w-4 h-4 text-orange-500" />
            13
          </div>
        </div>
      </div>

      {/* Exercise area */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          {/* Exercise counter */}
          <p className="text-center text-xs text-foreground-muted mb-6 font-medium uppercase tracking-wider">
            {exerciseIndex + 1} / {LESSON_EXERCISES.length} — Lesson {LESSON_NUMBER} of {TOTAL_LESSONS}
          </p>

          {/* XP Burst */}
          <div className="relative">
            <AnimatePresence>{showXpBurst && <XpBurst xp={XP_PER_CORRECT} />}</AnimatePresence>
          </div>

          {/* Exercise Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={exerciseIndex}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {currentExercise.type === "vocabulary" && (
                <VocabularyCard
                  exercise={currentExercise as VocabExercise}
                  onContinue={() => { setXpEarned((xp) => xp + XP_PER_CORRECT); setShowXpBurst(true); setTimeout(() => setShowXpBurst(false), 1400); goNext(); }}
                />
              )}
              {currentExercise.type === "multiple-choice" && (
                <MultipleChoiceCard
                  exercise={currentExercise as MultipleChoiceExercise}
                  onCorrect={handleCorrect}
                  onWrong={handleWrong}
                />
              )}
              {currentExercise.type === "audio-match" && (
                <AudioMatchCard
                  exercise={currentExercise as AudioMatchExercise}
                  onContinue={() => { setXpEarned((xp) => xp + XP_PER_CORRECT); goNext(); }}
                />
              )}
              {currentExercise.type === "translation" && (
                <TranslationCard
                  exercise={currentExercise as TranslationExercise}
                  onCorrect={handleCorrect}
                  onWrong={handleWrong}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* XP counter */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-foreground-muted">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-foreground">{xpEarned}</span> XP earned this lesson
          </div>
        </div>
      </div>
    </div>
  );
}
