"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  MouseEvent,
  TouchEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Undo2, Send, RotateCcw, Check, Pen, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

type Grade = "A+" | "A" | "B" | "C" | "NeedsPractice" | null;

interface WritingCanvasProps {
  referenceChar: string;
  referenceImage?: string;
  onComplete: (imageData: string, score: number) => void;
  language: string;
  className?: string;
}

const PEN_SIZES = [
  { label: "S", size: 2, strokeWidth: 2 },
  { label: "M", size: 4, strokeWidth: 4 },
  { label: "L", size: 7, strokeWidth: 7 },
];

const COLORS = [
  { label: "Black", value: "#1a1410" },
  { label: "Red",   value: "#DC2626" },
  { label: "Blue",  value: "#2563EB" },
];

const GRADE_CONFIG: Record<
  Exclude<Grade, null>,
  { color: string; bg: string; border: string; feedback: string; score: number }
> = {
  "A+": {
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-300 dark:border-emerald-700",
    feedback: "Outstanding! Your strokes show excellent control and proportion.",
    score: 98,
  },
  A: {
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/40",
    border: "border-green-300 dark:border-green-700",
    feedback: "Great work! The character is well-formed and clear.",
    score: 88,
  },
  B: {
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-300 dark:border-blue-700",
    feedback: "Good effort! A little more practice will perfect this character.",
    score: 75,
  },
  C: {
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-300 dark:border-amber-700",
    feedback: "Keep practicing! Focus on the stroke order and proportions.",
    score: 60,
  },
  NeedsPractice: {
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-300 dark:border-red-700",
    feedback: "This character needs more practice. Study the reference carefully.",
    score: 35,
  },
};

function simulateGrading(paths: Point[][]): Grade {
  if (paths.length === 0) return "NeedsPractice";
  const totalPoints = paths.reduce((acc, p) => acc + p.length, 0);
  if (totalPoints < 10) return "NeedsPractice";
  if (totalPoints < 20) return "C";
  if (totalPoints < 50) return "B";
  if (paths.length >= 2 && totalPoints >= 50) return "A";
  if (paths.length >= 3 && totalPoints >= 80) return "A+";
  return "A";
}

export default function WritingCanvas({
  referenceChar,
  referenceImage,
  onComplete,
  language,
  className,
}: WritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [grade, setGrade] = useState<Grade>(null);
  const [penSize, setPenSize] = useState(1); // index into PEN_SIZES
  const [color, setColor] = useState(COLORS[0].value);
  const [isEraser, setIsEraser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redraw canvas whenever paths change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Guide grid
    ctx.strokeStyle = "#e2d8c820";
    ctx.lineWidth = 1;
    const step = canvas.width / 4;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * step, 0);
      ctx.lineTo(i * step, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * step);
      ctx.lineTo(canvas.width, i * step);
      ctx.stroke();
    }

    // Diagonals
    ctx.strokeStyle = "#e2d8c815";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();

    // Paths
    paths.forEach((path) => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = PEN_SIZES[penSize].strokeWidth;
      ctx.strokeStyle = color;

      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length - 1; i++) {
        const mx = (path[i].x + path[i + 1].x) / 2;
        const my = (path[i].y + path[i + 1].y) / 2;
        ctx.quadraticCurveTo(path[i].x, path[i].y, mx, my);
      }
      const last = path[path.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    });

    // Current path preview
    if (currentPath.length >= 2) {
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = PEN_SIZES[penSize].strokeWidth;
      ctx.strokeStyle = isEraser ? "#f8f6f1" : color;
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length - 1; i++) {
        const mx = (currentPath[i].x + currentPath[i + 1].x) / 2;
        const my = (currentPath[i].y + currentPath[i + 1].y) / 2;
        ctx.quadraticCurveTo(currentPath[i].x, currentPath[i].y, mx, my);
      }
      const last = currentPath[currentPath.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }
  }, [paths, currentPath, penSize, color, isEraser]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Set canvas size on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const size = Math.min(container.clientWidth, 380);
    canvas.width = size;
    canvas.height = size;
    redrawCanvas();
  }, [redrawCanvas]);

  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number): Point => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const startDrawing = useCallback(
    (clientX: number, clientY: number) => {
      if (grade) return;
      setIsDrawing(true);
      const point = getCanvasPoint(clientX, clientY);
      setCurrentPath([point]);
    },
    [grade, getCanvasPoint]
  );

  const continueDrawing = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDrawing || grade) return;
      const point = getCanvasPoint(clientX, clientY);
      setCurrentPath((prev) => [...prev, point]);
    },
    [isDrawing, grade, getCanvasPoint]
  );

  const endDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 1) {
      if (isEraser) {
        // Eraser: remove strokes near erased region (simplified)
        const eraserX = currentPath[currentPath.length - 1].x;
        const eraserY = currentPath[currentPath.length - 1].y;
        const radius = PEN_SIZES[penSize].strokeWidth * 4;
        setPaths((prev) =>
          prev.filter((path) =>
            !path.some(
              (p) =>
                Math.hypot(p.x - eraserX, p.y - eraserY) < radius
            )
          )
        );
      } else {
        setPaths((prev) => [...prev, currentPath]);
      }
    }
    setCurrentPath([]);
  }, [isDrawing, currentPath, isEraser, penSize]);

  // Mouse handlers
  const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    startDrawing(e.clientX, e.clientY);
  };
  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    continueDrawing(e.clientX, e.clientY);
  };
  const onMouseUp = () => endDrawing();
  const onMouseLeave = () => { if (isDrawing) endDrawing(); };

  // Touch handlers
  const onTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    startDrawing(touch.clientX, touch.clientY);
  };
  const onTouchMove = (e: TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    continueDrawing(touch.clientX, touch.clientY);
  };
  const onTouchEnd = (e: TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    endDrawing();
  };

  const handleClear = () => {
    setPaths([]);
    setCurrentPath([]);
    setGrade(null);
  };

  const handleUndo = () => {
    setPaths((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (paths.length === 0) return;
    setIsSubmitting(true);

    // Simulate grading delay
    await new Promise((r) => setTimeout(r, 800));

    const computed = simulateGrading(paths);
    setGrade(computed);
    setIsSubmitting(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL("image/png");
      const score = computed ? GRADE_CONFIG[computed].score : 0;
      onComplete(imageData, score);
    }
  };

  const handleTryAgain = () => {
    setPaths([]);
    setCurrentPath([]);
    setGrade(null);
  };

  const gradeData = grade ? GRADE_CONFIG[grade] : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-background-secondary border border-border p-5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-foreground-muted uppercase tracking-wider font-medium">
            {language} — Write this character
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-4xl font-bold text-foreground">{referenceChar}</span>
            {referenceImage && (
              <img
                src={referenceImage}
                alt={referenceChar}
                className="h-12 w-12 rounded-lg border border-border object-contain"
              />
            )}
          </div>
        </div>
        <span className="text-[10px] font-medium text-foreground-muted px-2 py-1 rounded-lg bg-background-tertiary border border-border">
          Practice Mode
        </span>
      </div>

      {/* Toolbar */}
      {!grade && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Pen / Eraser toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setIsEraser(false)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors",
                !isEraser
                  ? "bg-primary text-white"
                  : "bg-background-secondary text-foreground-muted hover:bg-background-tertiary"
              )}
            >
              <Pen className="h-3 w-3" />
              Pen
            </button>
            <button
              onClick={() => setIsEraser(true)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors border-l border-border",
                isEraser
                  ? "bg-primary text-white"
                  : "bg-background-secondary text-foreground-muted hover:bg-background-tertiary"
              )}
            >
              <Eraser className="h-3 w-3" />
              Eraser
            </button>
          </div>

          {/* Pen size */}
          <div className="flex items-center gap-1 rounded-lg border border-border overflow-hidden">
            {PEN_SIZES.map((ps, i) => (
              <button
                key={ps.label}
                onClick={() => setPenSize(i)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center text-xs font-bold transition-colors",
                  penSize === i
                    ? "bg-primary text-white"
                    : "bg-background-secondary text-foreground-muted hover:bg-background-tertiary",
                  i > 0 && "border-l border-border"
                )}
              >
                {ps.label}
              </button>
            ))}
          </div>

          {/* Color picker */}
          <div className="flex items-center gap-1.5 ml-auto">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => { setColor(c.value); setIsEraser(false); }}
                className={cn(
                  "h-6 w-6 rounded-full border-2 transition-all",
                  color === c.value && !isEraser
                    ? "border-foreground scale-110"
                    : "border-transparent scale-100"
                )}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>
      )}

      {/* Canvas area */}
      <div ref={containerRef} className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={cn(
            "w-full rounded-xl border-2 touch-none select-none",
            grade
              ? "border-border cursor-not-allowed"
              : isEraser
              ? "border-amber-300 cursor-cell"
              : "border-primary/30 cursor-crosshair hover:border-primary/60 transition-colors"
          )}
          style={{
            background: "linear-gradient(135deg, #fefefe 0%, #f8f6f1 100%)",
            aspectRatio: "1",
          }}
        />

        {/* Grade overlay */}
        <AnimatePresence>
          {grade && gradeData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl backdrop-blur-sm"
            >
              <div
                className={cn(
                  "flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border-2 shadow-xl",
                  gradeData.bg,
                  gradeData.border
                )}
              >
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  className={cn("text-6xl font-black tabular-nums", gradeData.color)}
                >
                  {grade}
                </motion.span>
                <p className={cn("text-sm font-medium text-center max-w-[200px]", gradeData.color)}>
                  {gradeData.feedback}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Check className={cn("h-4 w-4", gradeData.color)} />
                  <span className={cn("text-sm font-bold", gradeData.color)}>
                    Score: {gradeData.score}/100
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submitting overlay */}
        <AnimatePresence>
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 rounded-xl backdrop-blur-sm gap-3"
            >
              <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <p className="text-sm font-medium text-foreground-muted">Grading your work...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {!grade ? (
          <>
            <button
              onClick={handleUndo}
              disabled={paths.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background-secondary text-foreground-muted text-xs font-medium hover:bg-background-tertiary disabled:opacity-40 transition-colors"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Undo
            </button>
            <button
              onClick={handleClear}
              disabled={paths.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background-secondary text-foreground-muted text-xs font-medium hover:bg-background-tertiary disabled:opacity-40 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
            <motion.button
              onClick={handleSubmit}
              disabled={paths.length === 0 || isSubmitting}
              whileTap={{ scale: 0.97 }}
              className="ml-auto flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover disabled:opacity-40 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              Submit for Grading
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              onClick={handleTryAgain}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-background-secondary text-foreground text-xs font-semibold hover:bg-background-tertiary transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Try Again
            </motion.button>
            <motion.button
              onClick={() => {
                const canvas = canvasRef.current;
                if (canvas && grade) {
                  onComplete(canvas.toDataURL("image/png"), gradeData?.score ?? 0);
                }
              }}
              whileTap={{ scale: 0.97 }}
              className="ml-auto flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              Next Character
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
