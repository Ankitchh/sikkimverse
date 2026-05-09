"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Volume2, ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type QuizType = "multiple-choice" | "audio" | "translation";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizCardProps {
  question: string;
  type: QuizType;
  options?: QuizOption[];
  audioUrl?: string;
  xpReward?: number;
  onAnswer: (isCorrect: boolean, selectedId?: string) => void;
  onContinue?: () => void;
  className?: string;
}

const TYPE_LABELS: Record<QuizType, string> = {
  "multiple-choice": "Multiple Choice",
  audio: "Listen & Choose",
  translation: "Translate",
};

const TYPE_COLORS: Record<QuizType, string> = {
  "multiple-choice": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  audio: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  translation: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
};

export default function QuizCard({
  question,
  type,
  options = [],
  audioUrl,
  xpReward = 10,
  onAnswer,
  onContinue,
  className,
}: QuizCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showXP, setShowXP] = useState(false);
  const [translationInput, setTranslationInput] = useState("");

  const handleOptionSelect = useCallback(
    (option: QuizOption) => {
      if (answered) return;
      setSelectedId(option.id);
      setAnswered(true);
      const correct = option.isCorrect;
      setIsCorrect(correct);
      if (correct) setShowXP(true);
      onAnswer(correct, option.id);
    },
    [answered, onAnswer]
  );

  const handleTranslationSubmit = useCallback(() => {
    if (answered || !translationInput.trim()) return;
    const correct = options[0]?.isCorrect ?? false; // Simplified — real app would fuzzy-match
    setAnswered(true);
    setIsCorrect(correct);
    if (correct) setShowXP(true);
    onAnswer(correct);
  }, [answered, translationInput, options, onAnswer]);

  const getOptionStyle = (option: QuizOption) => {
    if (!answered) {
      return "border-border bg-background-secondary hover:border-primary/40 hover:bg-background-tertiary cursor-pointer";
    }
    if (option.isCorrect) {
      return "border-green-500 bg-green-50 dark:bg-green-950/40 cursor-default";
    }
    if (option.id === selectedId && !option.isCorrect) {
      return "border-red-400 bg-red-50 dark:bg-red-950/40 cursor-default";
    }
    return "border-border/50 bg-background-secondary/60 opacity-60 cursor-default";
  };

  return (
    <div
      className={cn(
        "rounded-2xl bg-background-secondary border border-border overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", TYPE_COLORS[type])}>
            {TYPE_LABELS[type]}
          </span>

          {/* XP reward floating indicator */}
          <div className="relative">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-0.5 rounded-full">
              <Zap className="h-3 w-3" />+{xpReward} XP
            </span>
            <AnimatePresence>
              {showXP && (
                <motion.span
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: -40, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="absolute right-0 top-0 text-sm font-black text-amber-500 pointer-events-none whitespace-nowrap"
                >
                  +{xpReward} XP!
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Audio play button for audio type */}
        {(type === "audio" || audioUrl) && (
          <div className="mb-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-sm font-medium transition-colors"
              onClick={() => {
                if (audioUrl) {
                  const audio = new Audio(audioUrl);
                  audio.play().catch(() => {});
                }
              }}
            >
              <Volume2 className="h-4 w-4" />
              Play Audio
            </motion.button>
          </div>
        )}

        <p className="text-base font-semibold text-foreground leading-snug">{question}</p>
      </div>

      {/* Options / Translation input */}
      <div className="p-5 flex flex-col gap-3">
        {type === "translation" ? (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={translationInput}
              onChange={(e) => setTranslationInput(e.target.value)}
              disabled={answered}
              placeholder="Type your translation..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 disabled:opacity-60"
              onKeyDown={(e) => { if (e.key === "Enter") handleTranslationSubmit(); }}
            />
            {!answered && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleTranslationSubmit}
                disabled={!translationInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40 hover:bg-primary-hover transition-colors"
              >
                Submit
              </motion.button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 8 }}
                animate={
                  answered && option.id === selectedId && !option.isCorrect
                    ? { opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }
                    : { opacity: 1, y: 0 }
                }
                transition={
                  answered && option.id === selectedId && !option.isCorrect
                    ? { delay: index * 0.06, duration: 0.4, ease: "easeInOut" }
                    : { delay: index * 0.06 }
                }
                onClick={() => handleOptionSelect(option)}
                disabled={answered}
                className={cn(
                  "relative w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
                  getOptionStyle(option)
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      answered && option.isCorrect
                        ? "text-green-800 dark:text-green-300"
                        : answered && option.id === selectedId && !option.isCorrect
                        ? "text-red-700 dark:text-red-400"
                        : "text-foreground"
                    )}
                  >
                    {option.text}
                  </span>

                  {answered && option.isCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600 fill-green-100 flex-shrink-0" />
                    </motion.div>
                  )}
                  {answered && option.id === selectedId && !option.isCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      <XCircle className="h-4 w-4 text-red-500 fill-red-100 flex-shrink-0" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Feedback bar */}
        <AnimatePresence>
          {answered && isCorrect !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  "flex items-center justify-between gap-3 px-4 py-3 rounded-xl",
                  isCorrect
                    ? "bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800"
                )}
              >
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p
                      className={cn(
                        "text-sm font-bold",
                        isCorrect ? "text-green-800 dark:text-green-300" : "text-red-700 dark:text-red-400"
                      )}
                    >
                      {isCorrect ? "Excellent!" : "Not quite!"}
                    </p>
                    {!isCorrect && (
                      <p className="text-xs text-foreground-muted">
                        Correct: {options.find((o) => o.isCorrect)?.text}
                      </p>
                    )}
                  </div>
                </div>

                {onContinue && (
                  <motion.button
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onContinue}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors",
                      isCorrect ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary-hover"
                    )}
                  >
                    Continue
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
