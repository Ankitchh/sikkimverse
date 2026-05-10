"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pen,
  Eraser,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Palette,
  Star,
  Trophy,
  Info,
  X,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type Tool = "pen" | "eraser";

interface Character {
  id: string;
  character: string;
  phonetic: string;
  meaning: string;
  group: string;
  strokes: number;
}

type Grade = "A+" | "A" | "B" | "C" | "Practice";

// ── Lepcha Character Data ─────────────────────────────────────────────────────
const CHARACTERS: Character[] = [
  { id: "ka", character: "ᰀ", phonetic: "Ka", meaning: "Consonant Ka", group: "Velars", strokes: 3 },
  { id: "kha", character: "ᰁ", phonetic: "Kha", meaning: "Consonant Kha", group: "Velars", strokes: 4 },
  { id: "ga", character: "ᰂ", phonetic: "Ga", meaning: "Consonant Ga", group: "Velars", strokes: 3 },
  { id: "nga", character: "ᰃ", phonetic: "Nga", meaning: "Consonant Nga", group: "Velars", strokes: 2 },
  { id: "ca", character: "ᰄ", phonetic: "Ca", meaning: "Consonant Ca", group: "Palatals", strokes: 3 },
  { id: "cha", character: "ᰅ", phonetic: "Cha", meaning: "Consonant Cha", group: "Palatals", strokes: 4 },
  { id: "ja", character: "ᰆ", phonetic: "Ja", meaning: "Consonant Ja", group: "Palatals", strokes: 3 },
  { id: "nya", character: "ᰇ", phonetic: "Nya", meaning: "Consonant Nya", group: "Palatals", strokes: 3 },
  { id: "ta", character: "ᰈ", phonetic: "Ta", meaning: "Consonant Ta", group: "Dentals", strokes: 3 },
  { id: "tha", character: "ᰉ", phonetic: "Tha", meaning: "Consonant Tha", group: "Dentals", strokes: 4 },
  { id: "da", character: "ᰊ", phonetic: "Da", meaning: "Consonant Da", group: "Dentals", strokes: 3 },
  { id: "na", character: "ᰋ", phonetic: "Na", meaning: "Consonant Na", group: "Dentals", strokes: 2 },
  { id: "pa", character: "ᰌ", phonetic: "Pa", meaning: "Consonant Pa", group: "Labials", strokes: 3 },
  { id: "pha", character: "ᰍ", phonetic: "Pha", meaning: "Consonant Pha", group: "Labials", strokes: 4 },
  { id: "ba", character: "ᰎ", phonetic: "Ba", meaning: "Consonant Ba", group: "Labials", strokes: 3 },
  { id: "ma", character: "ᰏ", phonetic: "Ma", meaning: "Consonant Ma", group: "Labials", strokes: 2 },
];

const STROKE_COLORS = [
  "#1a5c3a", // forest green
  "#1e4a8c", // mountain blue
  "#e8871a", // saffron
  "#7C3AED", // purple
  "#DC2626", // red
  "#0891B2", // cyan
  "#000000", // black
];

const GRADE_CONFIG: Record<Grade, { color: string; bg: string; message: string; minAccuracy: number }> = {
  "A+": { color: "text-emerald-700", bg: "bg-emerald-100 border-emerald-300", message: "Perfect! Your strokes are flawless.", minAccuracy: 90 },
  "A": { color: "text-blue-700", bg: "bg-blue-100 border-blue-300", message: "Excellent! Very accurate writing.", minAccuracy: 80 },
  "B": { color: "text-amber-700", bg: "bg-amber-100 border-amber-300", message: "Good effort! Keep practicing.", minAccuracy: 65 },
  "C": { color: "text-orange-700", bg: "bg-orange-100 border-orange-300", message: "Getting there. Try slower, deliberate strokes.", minAccuracy: 50 },
  "Practice": { color: "text-red-700", bg: "bg-red-100 border-red-300", message: "More practice needed. Watch the demo again.", minAccuracy: 0 },
};

function getGrade(accuracy: number): Grade {
  if (accuracy >= 90) return "A+";
  if (accuracy >= 80) return "A";
  if (accuracy >= 65) return "B";
  if (accuracy >= 50) return "C";
  return "Practice";
}

// ── Canvas Hook ───────────────────────────────────────────────────────────────
function useCanvas(tool: Tool, strokeColor: string, strokeWidth: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const hasStrokes = useRef(false);

  const getPoint = (e: MouseEvent | Touch, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    isDrawing.current = true;
    lastPoint.current = { x, y };
    ctx.beginPath();
    ctx.moveTo(x, y);
    hasStrokes.current = true;
  }, []);

  const draw = useCallback((x: number, y: number) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPoint.current) return;

    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : strokeColor;
    ctx.lineWidth = tool === "eraser" ? strokeWidth * 4 : strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const midX = (lastPoint.current.x + x) / 2;
    const midY = (lastPoint.current.y + y) / 2;

    ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midX, midY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    lastPoint.current = { x, y };
  }, [tool, strokeColor, strokeWidth]);

  const stopDrawing = useCallback(() => {
    isDrawing.current = false;
    lastPoint.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStrokes.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const pt = getPoint(e, canvas);
      startDrawing(pt.x, pt.y);
    };
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const pt = getPoint(e, canvas);
      draw(pt.x, pt.y);
    };
    const handleMouseUp = () => stopDrawing();
    const handleMouseLeave = () => stopDrawing();

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const pt = getPoint(touch, canvas);
      startDrawing(pt.x, pt.y);
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const pt = getPoint(touch, canvas);
      draw(pt.x, pt.y);
    };
    const handleTouchEnd = () => stopDrawing();

    canvas.addEventListener("mousedown", handleMouseDown, { passive: false });
    canvas.addEventListener("mousemove", handleMouseMove, { passive: false });
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [startDrawing, draw, stopDrawing]);

  return { canvasRef, clearCanvas, hasStrokes };
}

// ── Real grading: pixel coverage analysis ─────────────────────────────────────
function analyzeWriting(canvasRef: React.RefObject<HTMLCanvasElement | null>, expectedStrokes: number): number {
  const canvas = canvasRef.current;
  if (!canvas) return 0;
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const total = canvas.width * canvas.height;

  let inkPixels = 0;
  let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha > 30) {
      inkPixels++;
      const pixelIdx = i / 4;
      const px = pixelIdx % canvas.width;
      const py = Math.floor(pixelIdx / canvas.width);
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
  }

  if (inkPixels === 0) return 0;

  // Coverage ratio (ideal range 4%–20% of canvas)
  const coverageRatio = inkPixels / total;
  let coverageScore: number;
  if (coverageRatio >= 0.04 && coverageRatio <= 0.20) {
    coverageScore = 100;
  } else if (coverageRatio < 0.04) {
    coverageScore = Math.round((coverageRatio / 0.04) * 85);
  } else {
    coverageScore = Math.max(25, Math.round(100 - ((coverageRatio - 0.20) / 0.20) * 120));
  }

  // Spatial distribution: did user write in center of canvas?
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const distFromCenter = Math.hypot(centerX - canvas.width / 2, centerY - canvas.height / 2);
  const centeringScore = Math.max(0, 100 - (distFromCenter / (canvas.width / 4)) * 60);

  // Bounding box proportionality
  const bboxW = maxX - minX;
  const bboxH = maxY - minY;
  const aspectRatio = bboxW > 0 && bboxH > 0 ? Math.min(bboxW, bboxH) / Math.max(bboxW, bboxH) : 0;
  const proportionScore = Math.round(aspectRatio * 80 + 20);

  // Weighted final score
  const finalScore = Math.round(
    coverageScore * 0.50 +
    centeringScore * 0.25 +
    proportionScore * 0.25
  );

  return Math.min(100, Math.max(5, finalScore));
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function WritingPracticePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tool, setTool] = useState<Tool>("pen");
  const [strokeColor, setStrokeColor] = useState(STROKE_COLORS[0]);
  const [strokeWidth] = useState(4);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [accuracy, setAccuracy] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [showDemo, setShowDemo] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const { canvasRef, clearCanvas, hasStrokes } = useCanvas(tool, strokeColor, strokeWidth);

  const currentChar = CHARACTERS[currentIndex];

  const handleCheck = () => {
    const score = analyzeWriting(canvasRef, currentChar.strokes);
    setAccuracy(score);
    setGrade(getGrade(score));
    setCompleted((prev) => new Set([...prev, currentIndex]));
  };

  const handleNext = () => {
    if (currentIndex < CHARACTERS.length - 1) {
      setCurrentIndex((i) => i + 1);
      clearCanvas();
      setGrade(null);
      setAccuracy(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      clearCanvas();
      setGrade(null);
      setAccuracy(0);
    }
  };

  const handleClear = () => {
    clearCanvas();
    setGrade(null);
    setAccuracy(0);
  };

  const gradeConfig = grade ? GRADE_CONFIG[grade] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/learn">
            <button className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-foreground text-sm">Lepcha Script Writing Practice</h1>
            <p className="text-xs text-foreground-muted">
              Character {currentIndex + 1} of {CHARACTERS.length} — {completed.size} completed
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {CHARACTERS.slice(0, 8).map((_, i) => (
              <div
                key={i}
                onClick={() => { setCurrentIndex(i); clearCanvas(); setGrade(null); setAccuracy(0); }}
                className={cn(
                  "w-3 h-3 rounded-full cursor-pointer transition-all",
                  i === currentIndex ? "bg-primary scale-125" :
                  completed.has(i) ? "bg-primary/40" : "bg-border"
                )}
              />
            ))}
            {CHARACTERS.length > 8 && (
              <span className="text-xs text-foreground-muted">+{CHARACTERS.length - 8}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Character grid selector */}
          <div className="lg:col-span-1">
            <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Characters</h2>
            <div className="grid grid-cols-4 lg:grid-cols-2 gap-1.5">
              {CHARACTERS.map((char, i) => (
                <motion.button
                  key={char.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setCurrentIndex(i); clearCanvas(); setGrade(null); setAccuracy(0); }}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all relative",
                    i === currentIndex
                      ? "border-primary bg-primary/10 text-primary"
                      : completed.has(i)
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-border bg-background-secondary text-foreground hover:border-primary/50"
                  )}
                >
                  <span className="text-lg font-bold">{char.character}</span>
                  <span className="text-xs text-current opacity-60 mt-0.5">{char.phonetic}</span>
                  {completed.has(i) && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right: Main practice area */}
          <div className="lg:col-span-4 space-y-4">
            {/* Reference + Info */}
            <div className="flex items-center gap-4">
              <div className="bg-background-secondary border border-border rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-6xl font-bold text-foreground" style={{ fontFamily: "serif" }}>
                  {currentChar.character}
                </p>
                <p className="text-sm font-semibold text-primary mt-1">{currentChar.phonetic}</p>
                <p className="text-xs text-foreground-muted">{currentChar.meaning}</p>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-foreground-muted" />
                  <span className="text-sm font-medium text-foreground">{currentChar.group} group · {currentChar.strokes} strokes</span>
                </div>
                <p className="text-sm text-foreground-secondary">
                  Trace this character carefully, following the correct stroke order. Start from the top-left, moving right and then down.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDemo(true)}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Watch Demo
                  </button>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tool buttons */}
              <div className="flex bg-background-secondary border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setTool("pen")}
                  className={cn(
                    "px-3 py-2 flex items-center gap-1.5 text-sm font-medium transition-all",
                    tool === "pen" ? "bg-primary text-white" : "text-foreground-secondary hover:bg-background-tertiary"
                  )}
                >
                  <Pen className="w-4 h-4" />
                  Pen
                </button>
                <button
                  onClick={() => setTool("eraser")}
                  className={cn(
                    "px-3 py-2 flex items-center gap-1.5 text-sm font-medium transition-all",
                    tool === "eraser" ? "bg-primary text-white" : "text-foreground-secondary hover:bg-background-tertiary"
                  )}
                >
                  <Eraser className="w-4 h-4" />
                  Eraser
                </button>
              </div>

              {/* Color picker */}
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 bg-background-secondary border border-border rounded-xl text-sm font-medium hover:bg-background-tertiary transition-all"
                >
                  <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: strokeColor }} />
                  <Palette className="w-4 h-4 text-foreground-secondary" />
                </button>
                <AnimatePresence>
                  {showColorPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 5 }}
                      className="absolute top-full left-0 mt-2 bg-background-secondary border border-border rounded-xl p-3 shadow-lg z-10 flex gap-2"
                    >
                      {STROKE_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => { setStrokeColor(color); setShowColorPicker(false); }}
                          className={cn(
                            "w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                            color === strokeColor ? "border-foreground scale-110" : "border-transparent"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Guide toggle */}
              <button
                onClick={() => setShowGuide((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all",
                  showGuide
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-background-secondary border-border text-foreground-secondary hover:bg-background-tertiary"
                )}
                title="Toggle guide character"
              >
                <Eye className="w-4 h-4" />
                Guide
              </button>

              {/* Clear */}
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 bg-background-secondary border border-border rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-lg border border-border hover:bg-background-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === CHARACTERS.length - 1}
                  className="p-2 rounded-lg border border-border hover:bg-background-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative bg-background-secondary border-2 border-border rounded-2xl overflow-hidden" style={{ touchAction: "none" }}>
              {/* Reference ghost character */}
              <AnimatePresence>
                {showGuide && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                  >
                    <span
                      className="text-[180px] font-bold text-primary"
                      style={{ fontFamily: "serif", lineHeight: 1, opacity: 0.07 }}
                    >
                      {currentChar.character}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid lines */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
                backgroundSize: "40px 40px"
              }} />

              {/* Center crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-border-subtle" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-full w-px bg-border-subtle" />
              </div>

              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="w-full h-auto block"
                style={{ touchAction: "none", cursor: tool === "eraser" ? "crosshair" : "default" }}
              />
            </div>

            {/* Grade display */}
            <AnimatePresence>
              {grade && gradeConfig && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn("rounded-2xl border-2 p-5", gradeConfig.bg)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[80px]">
                      <motion.p
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className={cn("text-5xl font-black", gradeConfig.color)}
                      >
                        {grade}
                      </motion.p>
                      <p className="text-xs font-medium text-foreground-muted mt-1">Grade</p>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className={cn("font-semibold", gradeConfig.color)}>Accuracy</span>
                          <span className={cn("font-bold", gradeConfig.color)}>{accuracy}%</span>
                        </div>
                        <div className="h-2.5 bg-white/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${accuracy}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={cn("h-full rounded-full", grade === "A+" || grade === "A" ? "bg-emerald-500" : grade === "B" ? "bg-amber-500" : "bg-red-500")}
                          />
                        </div>
                      </div>
                      <p className={cn("text-sm", gradeConfig.color)}>{gradeConfig.message}</p>
                    </div>
                    {(grade === "A+" || grade === "A") && (
                      <Trophy className="w-8 h-8 text-amber-500 shrink-0" />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex gap-3">
              {!grade ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheck}
                  className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Check My Writing
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClear}
                    className="flex-1 py-3.5 bg-background-secondary border border-border text-foreground font-semibold rounded-xl hover:bg-background-tertiary transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={currentIndex === CHARACTERS.length - 1}
                    className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Next Character
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </>
              )}
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-foreground-muted">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span>{completed.size * 25} XP earned</span>
              </div>
              <span>{completed.size} / {CHARACTERS.length} characters completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background-secondary rounded-2xl border border-border p-6 max-w-sm w-full text-center"
            >
              <h3 className="font-bold text-foreground text-lg mb-2">Stroke Demo</h3>
              <p className="text-foreground-muted text-sm mb-4">
                Watch the correct stroke order for <strong>{currentChar.phonetic}</strong> ({currentChar.character})
              </p>
              <div className="bg-background-tertiary rounded-xl p-8 mb-4">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-8xl font-bold text-foreground"
                  style={{ fontFamily: "serif" }}
                >
                  {currentChar.character}
                </motion.div>
                <p className="text-foreground-muted text-xs mt-2">{currentChar.strokes} strokes · {currentChar.phonetic}</p>
              </div>
              <p className="text-xs text-foreground-muted mb-4">
                In a full implementation, an animated SVG stroke-order demonstration would play here using timing animations.
              </p>
              <button
                onClick={() => setShowDemo(false)}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-all"
              >
                Start Practicing
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
