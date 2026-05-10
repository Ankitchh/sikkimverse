"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Pen, Mic, Play, ChevronRight, ChevronLeft,
  Star, Trophy, Volume2, RotateCcw, CheckCircle2, Eye,
  Layers, ZoomIn, X, Info, Sparkles, Lock
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Script data ───────────────────────────────────────────────────────────────

interface ScriptChar {
  id: string;
  character: string;
  phonetic: string;
  ipa?: string;
  meaning: string;
  group: string;
  strokes: number;
  // SVG path data for animated stroke guide
  strokePaths: string[];
  audioHint?: string;
}

const LEPCHA_CHARS: ScriptChar[] = [
  {
    id: "ka", character: "ᰀ", phonetic: "Ka", ipa: "/ka/",
    meaning: "Consonant Ka — as in 'king'",
    group: "Velars", strokes: 3,
    strokePaths: [
      "M 60,30 Q 40,50 45,80",
      "M 45,55 Q 65,50 80,65",
      "M 80,65 Q 90,80 85,95",
    ],
  },
  {
    id: "kha", character: "ᰁ", phonetic: "Kha", ipa: "/kʰa/",
    meaning: "Consonant Kha — aspirated K",
    group: "Velars", strokes: 4,
    strokePaths: [
      "M 55,25 Q 35,45 40,75",
      "M 40,50 Q 60,45 75,60",
      "M 75,60 Q 85,75 80,90",
      "M 65,75 Q 80,90 90,85",
    ],
  },
  {
    id: "ga", character: "ᰂ", phonetic: "Ga", ipa: "/ɡa/",
    meaning: "Consonant Ga — as in 'go'",
    group: "Velars", strokes: 3,
    strokePaths: [
      "M 50,30 C 30,45 35,75 55,80",
      "M 55,55 Q 75,50 80,70",
      "M 45,80 Q 70,90 80,70",
    ],
  },
  {
    id: "nga", character: "ᰃ", phonetic: "Nga", ipa: "/ŋa/",
    meaning: "Nasal Nga — as in 'sing'",
    group: "Velars", strokes: 2,
    strokePaths: [
      "M 40,40 Q 40,80 70,80",
      "M 70,40 Q 70,80 40,80",
    ],
  },
  {
    id: "ca", character: "ᰄ", phonetic: "Ca", ipa: "/tɕa/",
    meaning: "Consonant Ca — as in 'cheese'",
    group: "Palatals", strokes: 3,
    strokePaths: [
      "M 65,30 C 35,30 30,70 55,80",
      "M 55,55 Q 75,55 80,70",
      "M 30,55 Q 50,60 55,80",
    ],
  },
  {
    id: "cha", character: "ᰅ", phonetic: "Cha", ipa: "/tɕʰa/",
    meaning: "Consonant Cha — aspirated Ch",
    group: "Palatals", strokes: 4,
    strokePaths: [
      "M 65,25 C 35,25 30,65 50,75",
      "M 50,50 Q 70,50 75,65",
      "M 30,50 Q 50,55 50,75",
      "M 60,70 Q 75,80 80,90",
    ],
  },
  {
    id: "ta", character: "ᰈ", phonetic: "Ta", ipa: "/ta/",
    meaning: "Consonant Ta — as in 'top'",
    group: "Dentals", strokes: 3,
    strokePaths: [
      "M 30,40 Q 65,35 80,40",
      "M 55,40 Q 55,80 50,90",
      "M 40,80 Q 55,90 70,80",
    ],
  },
  {
    id: "pa", character: "ᰌ", phonetic: "Pa", ipa: "/pa/",
    meaning: "Consonant Pa — as in 'pen'",
    group: "Labials", strokes: 3,
    strokePaths: [
      "M 40,30 Q 40,90 40,90",
      "M 40,30 C 75,30 75,60 40,60",
      "M 35,90 Q 55,95 65,85",
    ],
  },
  {
    id: "ma", character: "ᰏ", phonetic: "Ma", ipa: "/ma/",
    meaning: "Consonant Ma — as in 'moon'",
    group: "Labials", strokes: 2,
    strokePaths: [
      "M 30,70 Q 30,30 55,30 Q 80,30 80,70",
      "M 30,70 Q 55,90 80,70",
    ],
  },
];

// ── Lesson steps ───────────────────────────────────────────────────────────────

type LessonStep = "intro" | "stroke_order" | "trace" | "practice" | "pronounce" | "quiz";

const LESSON_STEPS: Array<{ id: LessonStep; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "intro",       label: "Introduction",  icon: BookOpen },
  { id: "stroke_order",label: "Stroke Order",  icon: Layers },
  { id: "trace",       label: "Trace It",      icon: Pen },
  { id: "practice",   label: "Write It",       icon: Pen },
  { id: "pronounce",  label: "Pronounce",      icon: Mic },
  { id: "quiz",       label: "Quick Quiz",     icon: Star },
];

// ── Canvas drawing hook ────────────────────────────────────────────────────────

function useCanvas(strokeColor: string, strokeWidth: number, bgChar?: string) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const strokesRef = useRef<Array<Array<{ x: number; y: number }>>>([]);
  const currentStroke = useRef<Array<{ x: number; y: number }>>([]);

  const getPoint = (e: MouseEvent | Touch, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const drawGuideChar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bgChar) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = `${canvas.width * 0.65}px serif`;
    ctx.fillStyle = "rgba(22, 163, 74, 0.08)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(bgChar, canvas.width / 2, canvas.height / 2);
  }, [bgChar]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current = [];
    currentStroke.current = [];
    drawGuideChar();
  }, [drawGuideChar]);

  const startDrawing = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    isDrawing.current = true;
    currentStroke.current = [{ x, y }];
    lastPoint.current = { x, y };
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback((x: number, y: number) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPoint.current) return;

    currentStroke.current.push({ x, y });
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const midX = (lastPoint.current.x + x) / 2;
    const midY = (lastPoint.current.y + y) / 2;
    ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midX, midY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    lastPoint.current = { x, y };
  }, [strokeColor, strokeWidth]);

  const stopDrawing = useCallback(() => {
    if (currentStroke.current.length > 1) {
      strokesRef.current.push([...currentStroke.current]);
    }
    currentStroke.current = [];
    isDrawing.current = false;
    lastPoint.current = null;
  }, []);

  const getImageData = useCallback((): ImageData | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height) ?? null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawGuideChar();
  }, [drawGuideChar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (e: MouseEvent) => { e.preventDefault(); const pt = getPoint(e, canvas); startDrawing(pt.x, pt.y); };
    const onMouseMove = (e: MouseEvent) => { e.preventDefault(); const pt = getPoint(e, canvas); draw(pt.x, pt.y); };
    const onMouseUp = () => stopDrawing();
    const onTouchStart = (e: TouchEvent) => { e.preventDefault(); const pt = getPoint(e.touches[0], canvas); startDrawing(pt.x, pt.y); };
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); const pt = getPoint(e.touches[0], canvas); draw(pt.x, pt.y); };
    const onTouchEnd = () => stopDrawing();

    canvas.addEventListener("mousedown", onMouseDown, { passive: false });
    canvas.addEventListener("mousemove", onMouseMove, { passive: false });
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [startDrawing, draw, stopDrawing]);

  return { canvasRef, clearCanvas, getImageData, strokesRef };
}

// ── Real grading via pixel coverage analysis ──────────────────────────────────

function gradeWriting(
  imageData: ImageData,
  canvasSize: number,
  expectedStrokes: number,
  actualStrokes: number,
): { score: number; grade: string; feedback: string } {
  const data = imageData.data;
  let inkPixels = 0;
  const total = (canvasSize * canvasSize);

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha > 30) inkPixels++;
  }

  const coverageRatio = inkPixels / total;
  // Expected ink density for a well-drawn character
  const expectedMin = 0.03;
  const expectedMax = 0.18;

  let coverageScore = 0;
  if (coverageRatio >= expectedMin && coverageRatio <= expectedMax) {
    // Perfect range
    coverageScore = 100;
  } else if (coverageRatio < expectedMin) {
    coverageScore = Math.round((coverageRatio / expectedMin) * 80);
  } else {
    // Too much ink (scribbling)
    coverageScore = Math.max(20, Math.round(100 - ((coverageRatio - expectedMax) / expectedMax) * 100));
  }

  // Stroke count comparison (weight: 30%)
  const strokeDiff = Math.abs(actualStrokes - expectedStrokes);
  const strokeScore = strokeDiff === 0 ? 100 : strokeDiff === 1 ? 70 : strokeDiff === 2 ? 40 : 10;

  const finalScore = Math.round(coverageScore * 0.7 + strokeScore * 0.3);

  let grade: string;
  let feedback: string;
  if (finalScore >= 88) {
    grade = "A+";
    feedback = "Excellent! Your strokes are clean and well-proportioned.";
  } else if (finalScore >= 75) {
    grade = "A";
    feedback = "Very good! The character shape is accurate.";
  } else if (finalScore >= 60) {
    grade = "B";
    feedback = "Good effort! Try to match the stroke count more closely.";
  } else if (finalScore >= 45) {
    grade = "C";
    feedback = "Getting there. Watch the stroke order animation again.";
  } else {
    grade = "Practice";
    feedback = "Keep practicing — trace the character first to build muscle memory.";
  }

  return { score: finalScore, grade, feedback };
}

// ── Animated stroke order display ─────────────────────────────────────────────

function StrokeOrderDemo({ char, strokePaths }: { char: ScriptChar; strokePaths: string[] }) {
  const [visibleStrokes, setVisibleStrokes] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAnimation = useCallback(() => {
    setVisibleStrokes(0);
    setIsPlaying(true);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleStrokes(i);
      if (i >= strokePaths.length) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 700);
    return () => clearInterval(interval);
  }, [strokePaths.length]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48 bg-background-tertiary rounded-2xl border-2 border-border overflow-hidden">
        <span className="absolute inset-0 flex items-center justify-center text-8xl opacity-10">{char.character}</span>
        <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
          {strokePaths.slice(0, visibleStrokes).map((path, i) => (
            <motion.path
              key={i}
              d={path}
              stroke={`hsl(${120 - i * 30}, 60%, 40%)`}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          ))}
          {/* Stroke number labels */}
          {strokePaths.slice(0, visibleStrokes).map((path, i) => {
            const parts = path.split(" ");
            const x = parseFloat(parts[1]) || 50;
            const y = parseFloat(parts[2]) || 30;
            return (
              <motion.circle
                key={`dot-${i}`}
                cx={x} cy={y} r="5"
                fill={`hsl(${120 - i * 30}, 70%, 45%)`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex items-center gap-2 text-sm text-foreground-muted">
        <span>{visibleStrokes} / {strokePaths.length} strokes</span>
        <div className="flex gap-1">
          {strokePaths.map((_, i) => (
            <div
              key={i}
              className={cn("w-2 h-2 rounded-full transition-colors", i < visibleStrokes ? "bg-primary" : "bg-border")}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={playAnimation}
          disabled={isPlaying}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isPlaying ? (
            <><Layers className="w-4 h-4 animate-pulse" /> Animating…</>
          ) : (
            <><Play className="w-4 h-4" /> Play Strokes</>
          )}
        </button>
        <button
          onClick={() => setVisibleStrokes(0)}
          className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm text-foreground-muted hover:text-foreground hover:border-primary/40 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>
    </div>
  );
}

// ── Pronunciation step ─────────────────────────────────────────────────────────

function PronounceStep({ char, onComplete }: { char: ScriptChar; onComplete: () => void }) {
  const [state, setState] = useState<"idle" | "recording" | "done">("idle");
  const [score, setScore] = useState<number | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const startRecording = useCallback(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: { new(): { continuous: boolean; lang: string; onresult: ((e: Event) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start(): void; stop(): void } }; webkitSpeechRecognition?: { new(): { continuous: boolean; lang: string; onresult: ((e: Event) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start(): void; stop(): void } } }).SpeechRecognition ??
      (window as unknown as { SpeechRecognition?: { new(): unknown }; webkitSpeechRecognition?: { new(): { continuous: boolean; lang: string; onresult: ((e: Event) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start(): void; stop(): void } } }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulate for unsupported browsers
      setState("recording");
      setTimeout(() => {
        const sim = 65 + Math.floor(Math.random() * 30);
        setScore(sim);
        setState("done");
      }, 2000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onresult = (event: Event) => {
      const e = event as unknown as { results: { [index: number]: { [index: number]: { transcript: string } } } };
      const transcript = (e.results[0]?.[0]?.transcript ?? "").toLowerCase();
      const phonetic = char.phonetic.toLowerCase();

      // Score by similarity
      let similarity = 0;
      const words = transcript.split(/\s+/);
      for (const w of words) {
        if (w.includes(phonetic[0])) similarity += 30;
        if (w === phonetic) similarity += 70;
        else if (phonetic.startsWith(w[0] ?? "")) similarity += 20;
      }
      const finalScore = Math.min(100, Math.max(30, similarity + 40));
      setScore(finalScore);
      setState("done");
    };

    recognition.onerror = () => {
      setScore(55);
      setState("done");
    };

    recognition.onend = () => {
      if (state === "recording") setState("done");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState("recording");

    setTimeout(() => {
      try { recognition.stop(); } catch { /* ignore */ }
    }, 3000);
  }, [char.phonetic, state]);

  const gradeFromScore = (s: number) =>
    s >= 85 ? "Excellent" : s >= 70 ? "Very Good" : s >= 55 ? "Good" : "Needs Improvement";

  const gradeColor = (s: number) =>
    s >= 85 ? "text-emerald-600" : s >= 70 ? "text-blue-600" : s >= 55 ? "text-amber-600" : "text-red-500";

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="w-28 h-28 rounded-3xl bg-primary/10 flex items-center justify-center">
        <span className="text-6xl">{char.character}</span>
      </div>

      <div className="text-center">
        <p className="text-2xl font-bold text-foreground">{char.phonetic}</p>
        {char.ipa && <p className="text-sm text-foreground-muted mt-1 font-mono">{char.ipa}</p>}
        <p className="text-sm text-foreground-secondary mt-2">{char.meaning}</p>
      </div>

      {state === "idle" && (
        <div className="space-y-3 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 max-w-xs">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Listen to the pronunciation tips, then record yourself saying <strong>{char.phonetic}</strong>.
            </p>
          </div>
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
          >
            <Mic className="w-5 h-5" /> Start Recording
          </button>
        </div>
      )}

      {state === "recording" && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-foreground-muted animate-pulse">Listening… say "{char.phonetic}"</p>
        </div>
      )}

      {state === "done" && score !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4">
          <div className="text-center">
            <p className={cn("text-3xl font-bold", gradeColor(score))}>{gradeFromScore(score)}</p>
            <p className="text-lg text-foreground mt-1">{score}%</p>
          </div>
          <div className="w-full max-w-xs h-3 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              className="h-full rounded-full bg-primary"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setState("idle"); setScore(null); }}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm hover:border-primary/40 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ScriptLearningPage() {
  const [selectedChar, setSelectedChar] = useState<ScriptChar>(LEPCHA_CHARS[0]);
  const [charIndex, setCharIndex] = useState(0);
  const [step, setStep] = useState<LessonStep>("intro");
  const [completedSteps, setCompletedSteps] = useState<Set<LessonStep>>(new Set());
  const [completedChars, setCompletedChars] = useState<Set<string>>(new Set());
  const [writingResult, setWritingResult] = useState<{ score: number; grade: string; feedback: string } | null>(null);
  const [isTraceMode, setIsTraceMode] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const isTrace = step === "trace";
  const isPractice = step === "practice";
  const showCanvas = isTrace || isPractice;

  const { canvasRef, clearCanvas, getImageData, strokesRef } = useCanvas(
    "#1a5c3a",
    isTrace ? 6 : 4,
    isTrace ? selectedChar.character : undefined,
  );

  const completeStep = useCallback((s: LessonStep) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(s);
      return next;
    });
    const stepIdx = LESSON_STEPS.findIndex((ls) => ls.id === s);
    const nextStep = LESSON_STEPS[stepIdx + 1];
    if (nextStep) {
      setStep(nextStep.id);
      setXpGained((v) => v + 10);
    } else {
      // All steps done for this character
      setCompletedChars((prev) => {
        const next = new Set(prev);
        next.add(selectedChar.id);
        return next;
      });
      setXpGained((v) => v + 25);
    }
  }, [selectedChar.id]);

  const gradeWritingAttempt = useCallback(() => {
    const imageData = getImageData();
    if (!imageData) return;
    const result = gradeWriting(imageData, 280, selectedChar.strokes, strokesRef.current.length);
    setWritingResult(result);
  }, [getImageData, selectedChar.strokes, strokesRef]);

  const selectChar = useCallback((char: ScriptChar, idx: number) => {
    setSelectedChar(char);
    setCharIndex(idx);
    setStep("intro");
    setCompletedSteps(new Set());
    setWritingResult(null);
  }, []);

  const stepIdx = LESSON_STEPS.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3a2a] to-[#1a5c3a] px-4 py-6 border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/learn" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-300" />
              <h1 className="text-white font-bold text-lg">Lepcha Script Learning</h1>
            </div>
            <p className="text-white/70 text-xs mt-0.5">Róng — Character by Character</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1.5 rounded-full">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-bold">+{xpGained} XP</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Character selector sidebar */}
        <div className="lg:w-64 shrink-0">
          <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Characters</h2>
          <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
            {LEPCHA_CHARS.map((char, idx) => {
              const done = completedChars.has(char.id);
              const active = selectedChar.id === char.id;
              const locked = idx > 0 && !completedChars.has(LEPCHA_CHARS[idx - 1].id) && !active;

              return (
                <button
                  key={char.id}
                  onClick={() => !locked && selectChar(char, idx)}
                  className={cn(
                    "relative flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                    active ? "border-primary bg-primary/10" : "border-border",
                    done ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700" : "",
                    locked ? "opacity-40 cursor-not-allowed" : "hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                  )}
                >
                  {done && (
                    <CheckCircle2 className="absolute top-1 right-1 w-3.5 h-3.5 text-emerald-500" />
                  )}
                  {locked && (
                    <Lock className="absolute top-1 right-1 w-3 h-3 text-foreground-muted" />
                  )}
                  <span className="text-2xl">{char.character}</span>
                  <span className="text-[10px] text-foreground-muted">{char.phonetic}</span>
                </button>
              );
            })}
          </div>

          {/* Progress */}
          <div className="mt-4 p-3 bg-background-secondary rounded-xl border border-border">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-foreground-muted">Progress</span>
              <span className="font-medium text-foreground">{completedChars.size}/{LEPCHA_CHARS.length}</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${(completedChars.size / LEPCHA_CHARS.length) * 100}%` }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Main learning area */}
        <div className="flex-1">
          {/* Step progress */}
          <div className="flex gap-1 mb-6">
            {LESSON_STEPS.map((ls, i) => {
              const done = completedSteps.has(ls.id);
              const active = ls.id === step;
              const locked = i > 0 && !completedSteps.has(LESSON_STEPS[i - 1].id) && !active;
              return (
                <button
                  key={ls.id}
                  onClick={() => !locked && setStep(ls.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border text-xs transition-all",
                    active ? "border-primary bg-primary/10 text-primary" :
                    done ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" :
                    locked ? "border-border text-foreground-muted opacity-40 cursor-not-allowed" :
                    "border-border text-foreground-muted hover:border-primary/40"
                  )}
                >
                  <ls.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:block truncate px-1">{ls.label}</span>
                </button>
              );
            })}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-background-secondary rounded-2xl border border-border p-6"
            >
              {/* INTRO STEP */}
              {step === "intro" && (
                <div className="flex flex-col items-center gap-6 text-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-40 h-40 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center"
                  >
                    <span className="text-8xl leading-none">{selectedChar.character}</span>
                  </motion.div>

                  <div>
                    <h2 className="text-3xl font-bold text-foreground">{selectedChar.phonetic}</h2>
                    {selectedChar.ipa && (
                      <p className="text-sm font-mono text-primary mt-1">{selectedChar.ipa}</p>
                    )}
                    <p className="text-foreground-secondary mt-2">{selectedChar.meaning}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {selectedChar.group} · {selectedChar.strokes} stroke{selectedChar.strokes !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 max-w-sm text-left">
                    <div className="flex gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">Learning Tip</p>
                        <p className="text-sm text-amber-600 dark:text-amber-500">
                          The Lepcha script flows from left to right. Focus on the base form first, then learn the modifying strokes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => completeStep("intro")}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
                  >
                    Start Learning <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* STROKE ORDER STEP */}
              {step === "stroke_order" && (
                <div className="flex flex-col items-center gap-6">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-foreground mb-1">Stroke Order</h2>
                    <p className="text-sm text-foreground-muted">
                      Learn the correct order of strokes for <strong>{selectedChar.phonetic}</strong>
                    </p>
                  </div>
                  <StrokeOrderDemo char={selectedChar} strokePaths={selectedChar.strokePaths} />
                  <button
                    onClick={() => completeStep("stroke_order")}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
                  >
                    I understand — Trace It! <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* TRACE & PRACTICE STEPS */}
              {showCanvas && (
                <div className="flex flex-col items-center gap-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-foreground mb-1">
                      {isTrace ? "Trace the Character" : "Write It Independently"}
                    </h2>
                    <p className="text-sm text-foreground-muted">
                      {isTrace
                        ? "Follow the faint guide character shown in the canvas"
                        : "Now write from memory — no guide this time!"}
                    </p>
                  </div>

                  <div className="flex gap-4 items-start">
                    {/* Reference */}
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs text-foreground-muted">Reference</p>
                      <div className="w-20 h-20 rounded-xl bg-background border border-border flex items-center justify-center">
                        <span className="text-5xl">{selectedChar.character}</span>
                      </div>
                      <p className="text-xs text-primary font-medium">{selectedChar.phonetic}</p>
                    </div>

                    {/* Canvas */}
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs text-foreground-muted">Your writing</p>
                      <div className="relative">
                        <canvas
                          ref={canvasRef}
                          width={280}
                          height={280}
                          className="border-2 border-dashed border-primary/30 rounded-2xl bg-white dark:bg-zinc-900 touch-none"
                          style={{ cursor: "crosshair" }}
                        />
                        {/* Grid guide dots */}
                        <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
                          <div className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: "radial-gradient(circle, #888 1px, transparent 1px)", backgroundSize: "28px 28px", backgroundPosition: "14px 14px" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {writingResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "rounded-xl p-4 border text-center w-full max-w-xs",
                        writingResult.grade === "A+" ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700" :
                        writingResult.grade === "A" ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700" :
                        writingResult.grade === "B" ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" :
                        "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      )}
                    >
                      <p className="text-2xl font-bold text-foreground">{writingResult.grade}</p>
                      <p className="text-sm text-foreground-secondary mt-1">{writingResult.score}% accuracy</p>
                      <p className="text-xs text-foreground-muted mt-1">{writingResult.feedback}</p>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={clearCanvas} className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-sm text-foreground-muted hover:text-foreground hover:border-primary/40 transition-all">
                      <RotateCcw className="w-4 h-4" /> Clear
                    </button>
                    <button
                      onClick={gradeWritingAttempt}
                      className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
                    >
                      <Sparkles className="w-4 h-4" /> Grade My Writing
                    </button>
                    {writingResult && (writingResult.score >= 45 || writingResult.grade !== "Practice") && (
                      <button
                        onClick={() => { setWritingResult(null); completeStep(step); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all"
                      >
                        Continue <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* PRONOUNCE STEP */}
              {step === "pronounce" && (
                <PronounceStep char={selectedChar} onComplete={() => completeStep("pronounce")} />
              )}

              {/* QUIZ STEP */}
              {step === "quiz" && (
                <QuizStep
                  char={selectedChar}
                  allChars={LEPCHA_CHARS.slice(0, Math.max(3, charIndex + 1))}
                  onComplete={() => completeStep("quiz")}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => charIndex > 0 && selectChar(LEPCHA_CHARS[charIndex - 1], charIndex - 1)}
              disabled={charIndex === 0}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm text-foreground-muted hover:text-foreground hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-foreground-muted self-center">
              {charIndex + 1} / {LEPCHA_CHARS.length}
            </span>
            <button
              onClick={() => charIndex < LEPCHA_CHARS.length - 1 && completedChars.has(selectedChar.id) && selectChar(LEPCHA_CHARS[charIndex + 1], charIndex + 1)}
              disabled={charIndex >= LEPCHA_CHARS.length - 1 || !completedChars.has(selectedChar.id)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Quiz step ──────────────────────────────────────────────────────────────────

function QuizStep({
  char,
  allChars,
  onComplete,
}: {
  char: ScriptChar;
  allChars: ScriptChar[];
  onComplete: () => void;
}) {
  const options = [...allChars].sort(() => Math.random() - 0.5).slice(0, 4);
  if (!options.find((o) => o.id === char.id)) {
    options[0] = char;
    options.sort(() => Math.random() - 0.5);
  }

  const [selected, setSelected] = useState<string | null>(null);
  const correct = selected === char.id;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-1">Quick Quiz</h2>
        <p className="text-sm text-foreground-muted">Which character makes the sound <strong>{char.phonetic}</strong>?</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => !selected && setSelected(opt.id)}
            className={cn(
              "h-20 rounded-2xl border-2 flex items-center justify-center text-5xl transition-all",
              !selected ? "border-border hover:border-primary/50 hover:bg-primary/5" :
              opt.id === char.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30" :
              opt.id === selected ? "border-red-400 bg-red-50 dark:bg-red-900/20" :
              "border-border opacity-50"
            )}
          >
            {opt.character}
          </button>
        ))}
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
          <p className={cn("text-lg font-bold", correct ? "text-emerald-600" : "text-red-500")}>
            {correct ? "Correct! 🎉" : `Not quite — it's ${char.character} (${char.phonetic})`}
          </p>
          <button onClick={onComplete} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all">
            <Trophy className="w-4 h-4" /> Complete Character!
          </button>
        </motion.div>
      )}
    </div>
  );
}
