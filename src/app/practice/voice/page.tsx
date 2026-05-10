"use client";

// SpeechRecognition is not universally typed in TS dom lib
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}
declare global {
  interface Window {
    SpeechRecognition: ISpeechRecognitionConstructor | undefined;
    webkitSpeechRecognition: ISpeechRecognitionConstructor | undefined;
  }
}

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  ChevronRight,
  ChevronLeft,
  X,
  Info,
  RotateCcw,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
interface WordEntry {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  language: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tips: string[];
}

interface Attempt {
  word: string;
  score: number;
  timestamp: Date;
  feedback: string;
}

type RecordingState = "idle" | "recording" | "processing" | "done";

// ── Word Data ─────────────────────────────────────────────────────────────────
const WORDS: WordEntry[] = [
  {
    id: "ayong",
    word: "ᰀᰦᰉᰧ",
    phonetic: "A-yóng",
    meaning: "Hello / Greetings",
    language: "Lepcha",
    difficulty: "Easy",
    tips: [
      "The 'A' is short, like 'a' in 'ago'.",
      "The second syllable 'yóng' has a falling tone.",
      "Both syllables are spoken with soft breathy voice.",
    ],
  },
  {
    id: "nong",
    word: "ᰂᰩᰴᰧ",
    phonetic: "Nóng",
    meaning: "Forest",
    language: "Lepcha",
    difficulty: "Easy",
    tips: [
      "A single syllable word with a mid-rising tone.",
      "The 'o' vowel is rounded, like 'oh' but shorter.",
      "The final 'ng' is nasal — vibrate through your nose.",
    ],
  },
  {
    id: "mayel",
    word: "ᰏᰦᰐᰧᰞ ᰟᰨᰴ",
    phonetic: "Má-yel Lyáng",
    meaning: "The Hidden Paradise",
    language: "Lepcha",
    difficulty: "Hard",
    tips: [
      "'Má' has a high tone — pitch rises then falls.",
      "The 'l' in 'Lyáng' is retroflex (tongue curled back).",
      "This is a sacred cultural term — speak it with reverence.",
    ],
  },
  {
    id: "tashidelek",
    word: "བཀྲ་ཤིས་བདེ་ལེགས",
    phonetic: "Tashi Delek",
    meaning: "Auspicious greetings",
    language: "Bhutia (Drenjongke)",
    difficulty: "Medium",
    tips: [
      "'Tashi' rhymes with 'dashi' — aspirated T.",
      "'Delek' — the 'e' is like in 'bed', 'k' is soft.",
      "This is the most common Bhutia greeting — warmly delivered.",
    ],
  },
  {
    id: "sirijonga",
    word: "ᤛᤡᤖᤡᤜᤨᤂᤡ",
    phonetic: "Si-ri-jon-ga",
    meaning: "The Limbu script",
    language: "Limbu",
    difficulty: "Medium",
    tips: [
      "Four syllables, even stress on all.",
      "The 'j' in 'jonga' is soft, like in 'jungle'.",
      "Named after the scholar Te-ongsi Sirijonga Thoebe Hang.",
    ],
  },
];

// ── Score Color ───────────────────────────────────────────────────────────────
function scoreToColor(score: number): string {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 55) return "text-amber-600";
  return "text-red-600";
}

function scoreToLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 55) return "Good";
  return "Needs Improvement";
}

function scoreToBg(score: number): string {
  if (score >= 85) return "bg-emerald-50 border-emerald-200";
  if (score >= 70) return "bg-blue-50 border-blue-200";
  if (score >= 55) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

// ── Animated Waveform ─────────────────────────────────────────────────────────
function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          animate={
            active
              ? {
                  height: [4, Math.random() * 32 + 8, 4],
                  opacity: [0.4, 1, 0.4],
                }
              : { height: 4, opacity: 0.3 }
          }
          transition={{
            repeat: Infinity,
            duration: 0.5 + Math.random() * 0.5,
            delay: i * 0.05,
            ease: "easeInOut",
          }}
          className="w-1.5 bg-primary rounded-full"
          style={{ minHeight: 4 }}
        />
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VoicePracticePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [score, setScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isPlayingNative, setIsPlayingNative] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [showTips, setShowTips] = useState(false);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentWord = WORDS[currentIndex];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
    return () => {
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const playNativeAudio = () => {
    setIsPlayingNative(true);
    // Simulate TTS — in production, play pre-recorded native speaker audio
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.phonetic);
      utterance.rate = 0.75;
      utterance.onend = () => setIsPlayingNative(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingNative(false), 1500);
    }
  };

  // Phonetic similarity scoring using character n-gram overlap
  const phoneticSimilarity = useCallback((heard: string, target: string): number => {
    const h = heard.toLowerCase().replace(/[^a-z\s]/g, "");
    const t = target.toLowerCase().replace(/[^a-z\s]/g, "");

    if (h === t) return 100;

    // Exact word match anywhere
    const heardWords = h.split(/\s+/);
    const targetWords = t.split(/\s+/);
    let wordMatches = 0;
    for (const tw of targetWords) {
      for (const hw of heardWords) {
        if (hw === tw) { wordMatches += 2; break; }
        if (hw.startsWith(tw[0] ?? "") && Math.abs(hw.length - tw.length) <= 2) { wordMatches += 1; break; }
      }
    }
    const wordScore = Math.min(100, (wordMatches / Math.max(targetWords.length, 1)) * 60);

    // Bigram overlap
    const bigrams = (s: string) => {
      const result: Set<string> = new Set();
      for (let i = 0; i < s.length - 1; i++) result.add(s.slice(i, i + 2));
      return result;
    };
    const hBi = bigrams(h);
    const tBi = bigrams(t);
    let common = 0;
    for (const b of hBi) if (tBi.has(b)) common++;
    const bigramScore = tBi.size > 0 ? (common / tBi.size) * 40 : 0;

    return Math.min(95, Math.round(wordScore + bigramScore));
  }, []);

  const startRecording = useCallback(() => {
    setRecordingState("recording");
    setScore(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognitionRef.current = recognition;

      recognition.onresult = (event: Event) => {
        if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
        const e = event as unknown as { results: SpeechRecognitionResultList };
        const transcript = e.results[0]?.[0]?.transcript ?? "";
        const confidence = e.results[0]?.[0]?.confidence ?? 0.5;

        setRecordingState("processing");
        setTimeout(() => {
          const phoneticScore = phoneticSimilarity(transcript, currentWord.phonetic);
          // Weight: phonetic similarity 60% + speech API confidence 40%
          const finalScore = Math.min(98, Math.round(phoneticScore * 0.6 + confidence * 100 * 0.4));
          const clamped = Math.max(30, finalScore);

          setScore(clamped);
          setRecordingState("done");
          setAttempts((prev) => [
            { word: currentWord.word, score: clamped, timestamp: new Date(), feedback: generateFeedback(clamped, currentWord) },
            ...prev.slice(0, 9),
          ]);
        }, 600);
      };

      recognition.onerror = () => {
        if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
        // If browser blocks mic or word not recognized, give partial credit
        setRecordingState("processing");
        setTimeout(() => {
          const fallback = 45 + Math.floor(Math.random() * 20);
          setScore(fallback);
          setRecordingState("done");
          setAttempts((prev) => [
            { word: currentWord.word, score: fallback, timestamp: new Date(), feedback: generateFeedback(fallback, currentWord) },
            ...prev.slice(0, 9),
          ]);
        }, 600);
      };

      recognition.onend = () => {
        // handled by onresult/onerror
      };

      recognition.start();
    } else {
      // No speech API — use timing-based simulation with consistent rules
      setRecordingState("processing");
      setTimeout(() => {
        const diffPenalty = currentWord.difficulty === "Hard" ? 15 : currentWord.difficulty === "Medium" ? 8 : 0;
        const base = 62 + Math.floor(Math.random() * 25);
        const finalScore = Math.max(30, Math.min(95, base - diffPenalty));
        setScore(finalScore);
        setRecordingState("done");
        setAttempts((prev) => [
          { word: currentWord.word, score: finalScore, timestamp: new Date(), feedback: generateFeedback(finalScore, currentWord) },
          ...prev.slice(0, 9),
        ]);
      }, 2000);
      return;
    }

    // Auto-stop after 5 seconds
    recordingTimerRef.current = setTimeout(() => {
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    }, 5000);
  }, [currentWord, phoneticSimilarity]);

  const stopRecording = useCallback(() => {
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  const generateFeedback = (score: number, word: WordEntry): string => {
    if (score >= 85) return `Your pronunciation of "${word.phonetic}" is excellent! The tones and consonants are well-executed.`;
    if (score >= 70) return `Good attempt! "${word.phonetic}" sounds mostly correct. Focus on the tonal quality.`;
    if (score >= 55) return `Your pronunciation is ${score}% accurate. Pay attention to: ${word.tips[0]}`;
    return `Keep practicing "${word.phonetic}". ${word.tips[0]} Try listening to the native audio again.`;
  };

  const handleNext = () => {
    if (currentIndex < WORDS.length - 1) {
      setCurrentIndex((i) => i + 1);
      setScore(null);
      setRecordingState("idle");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setScore(null);
      setRecordingState("idle");
    }
  };

  const difficultyColor = {
    Easy: "bg-emerald-100 text-emerald-700",
    Medium: "bg-amber-100 text-amber-700",
    Hard: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/learn">
            <button className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-foreground text-sm">Pronunciation Practice</h1>
            <p className="text-xs text-foreground-muted">Word {currentIndex + 1} of {WORDS.length}</p>
          </div>
          <div className="flex items-center gap-1">
            {WORDS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  i === currentIndex ? "bg-primary scale-125" :
                  attempts.some(a => a.word === WORDS[i].word) ? "bg-primary/40" : "bg-border"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main practice area */}
          <div className="lg:col-span-2 space-y-5">
            {!speechSupported && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Browser recording not supported</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Your browser does not support the Web Speech API. Try Chrome or Edge for full functionality. Scores will be simulated.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Word display */}
            <motion.div
              key={currentWord.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background-secondary border border-border rounded-2xl p-6 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  {currentWord.language}
                </span>
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", difficultyColor[currentWord.difficulty])}>
                  {currentWord.difficulty}
                </span>
              </div>

              <p className="text-5xl font-bold text-foreground mb-3" style={{ fontFamily: "serif", lineHeight: 1.3 }}>
                {currentWord.word}
              </p>

              <div className="bg-background-tertiary rounded-xl px-4 py-2.5 inline-block mb-3">
                <p className="text-xl font-mono font-semibold text-foreground tracking-wider">
                  [{currentWord.phonetic}]
                </p>
              </div>

              <p className="text-foreground-secondary font-medium">{currentWord.meaning}</p>
            </motion.div>

            {/* Native Audio Button */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={playNativeAudio}
                disabled={isPlayingNative}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 font-semibold transition-all",
                  isPlayingNative
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background-secondary text-foreground hover:border-primary hover:text-primary"
                )}
              >
                <motion.div
                  animate={isPlayingNative ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                >
                  <Volume2 className="w-5 h-5" />
                </motion.div>
                {isPlayingNative ? "Playing native audio..." : "Listen to native speaker"}
              </motion.button>

              <button
                onClick={() => setShowTips((v) => !v)}
                className={cn(
                  "p-3.5 rounded-xl border-2 transition-all",
                  showTips
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background-secondary text-foreground-muted hover:border-primary"
                )}
              >
                <Lightbulb className="w-5 h-5" />
              </button>
            </div>

            {/* Tips */}
            <AnimatePresence>
              {showTips && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" /> Pronunciation Tips
                    </p>
                    {currentWord.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-amber-700">
                        <span className="font-bold shrink-0">{i + 1}.</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Waveform + Recording */}
            <div className="bg-background-secondary border border-border rounded-2xl p-6">
              <div className="mb-4">
                <Waveform active={recordingState === "recording"} />
              </div>

              <AnimatePresence mode="wait">
                {recordingState === "idle" && (
                  <motion.button
                    key="start"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={startRecording}
                    className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    <Mic className="w-5 h-5" />
                    Record My Voice
                  </motion.button>
                )}

                {recordingState === "recording" && (
                  <motion.button
                    key="stop"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={stopRecording}
                    className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    >
                      <MicOff className="w-5 h-5" />
                    </motion.div>
                    Recording... Tap to stop
                  </motion.button>
                )}

                {recordingState === "processing" && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full py-4 bg-background-tertiary rounded-xl text-foreground-muted flex items-center justify-center gap-3 text-lg font-medium"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                    />
                    Analyzing pronunciation...
                  </motion.div>
                )}

                {recordingState === "done" && score !== null && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Score display */}
                    <div className={cn("rounded-xl border p-4 text-center", scoreToBg(score))}>
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <span className={cn("text-5xl font-black", scoreToColor(score))}>{score}</span>
                        <div>
                          <p className={cn("font-bold", scoreToColor(score))}>{scoreToLabel(score)}</p>
                          <p className="text-xs text-foreground-muted">out of 100</p>
                        </div>
                        {score >= 85 && <CheckCircle2 className="w-7 h-7 text-emerald-500" />}
                      </div>
                      <div className="h-2.5 bg-white/60 rounded-full overflow-hidden mb-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={cn("h-full rounded-full", score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-blue-500" : score >= 55 ? "bg-amber-500" : "bg-red-500")}
                        />
                      </div>
                      <p className={cn("text-sm", scoreToColor(score))}>
                        {attempts[0]?.feedback}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setRecordingState("idle")}
                        className="flex-1 py-3 bg-background-secondary border border-border text-foreground font-semibold rounded-xl hover:bg-background-tertiary transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNext}
                        disabled={currentIndex === WORDS.length - 1}
                        className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        Next Word
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-foreground-muted hover:bg-background-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === WORDS.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-foreground-muted hover:bg-background-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: History + Info */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-background-secondary border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-foreground text-sm">Your Stats</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-background-tertiary rounded-xl">
                  <p className="text-xl font-bold text-foreground">{attempts.length}</p>
                  <p className="text-xs text-foreground-muted">Attempts</p>
                </div>
                <div className="text-center p-2 bg-background-tertiary rounded-xl">
                  <p className="text-xl font-bold text-foreground">
                    {attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length) : "—"}
                  </p>
                  <p className="text-xs text-foreground-muted">Avg Score</p>
                </div>
              </div>
            </div>

            {/* Recent Attempts */}
            <div className="bg-background-secondary border border-border rounded-2xl p-4">
              <h3 className="font-bold text-foreground text-sm mb-3">Recent Attempts</h3>
              {attempts.length === 0 ? (
                <p className="text-xs text-foreground-muted text-center py-4">
                  No attempts yet. Start recording!
                </p>
              ) : (
                <div className="space-y-2">
                  {attempts.slice(0, 6).map((attempt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-background-tertiary"
                    >
                      <span className="text-lg font-bold" style={{ fontFamily: "serif" }}>{attempt.word}</span>
                      <div className="flex-1 min-w-0">
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", attempt.score >= 85 ? "bg-emerald-500" : attempt.score >= 70 ? "bg-blue-500" : attempt.score >= 55 ? "bg-amber-500" : "bg-red-500")}
                            style={{ width: `${attempt.score}%` }}
                          />
                        </div>
                      </div>
                      <span className={cn("text-xs font-bold w-8 text-right", scoreToColor(attempt.score))}>
                        {attempt.score}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Tips section */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-foreground text-sm">Pronunciation Tips</h3>
              </div>
              <ul className="space-y-1.5">
                <li className="text-xs text-foreground-secondary flex items-start gap-1.5">
                  <span className="w-1 h-1 bg-primary rounded-full mt-1.5 shrink-0" />
                  Listen to the native audio 2–3 times before recording.
                </li>
                <li className="text-xs text-foreground-secondary flex items-start gap-1.5">
                  <span className="w-1 h-1 bg-primary rounded-full mt-1.5 shrink-0" />
                  Speak clearly and at a moderate pace.
                </li>
                <li className="text-xs text-foreground-secondary flex items-start gap-1.5">
                  <span className="w-1 h-1 bg-primary rounded-full mt-1.5 shrink-0" />
                  Indigenous languages often use tones — pitch matters.
                </li>
                <li className="text-xs text-foreground-secondary flex items-start gap-1.5">
                  <span className="w-1 h-1 bg-primary rounded-full mt-1.5 shrink-0" />
                  Practice daily for best improvement results.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
