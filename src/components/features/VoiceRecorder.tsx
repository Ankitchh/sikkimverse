"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Pause, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VoiceRecorderProps {
  onRecordingComplete?: (blob: Blob, durationMs: number) => void;
  maxDurationMs?: number;
  className?: string;
  compact?: boolean;
  label?: string;
}

type RecorderState = "idle" | "recording" | "paused" | "done";

// ─── Waveform visualiser ──────────────────────────────────────────────────────

function Waveform({ active }: { active: boolean }) {
  const bars = 16;
  return (
    <div className="flex items-center gap-0.5 h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className={cn("w-1 rounded-full", active ? "bg-primary" : "bg-border")}
          animate={
            active
              ? { height: ["4px", `${8 + Math.random() * 20}px`, "4px"] }
              : { height: "4px" }
          }
          transition={
            active
              ? { duration: 0.5 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.04 }
              : {}
          }
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VoiceRecorder({
  onRecordingComplete,
  maxDurationMs = 120_000,
  className,
  compact = false,
  label = "Record audio",
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobRef = useRef<Blob | null>(null);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setState("done");
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start(250);
      startTimeRef.current = Date.now();
      setState("recording");

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);
        if (elapsed >= maxDurationMs) stopRecording();
      }, 200);
    } catch {
      // Microphone access denied or unavailable
    }
  }, [maxDurationMs]);

  const stopRecording = useCallback(() => {
    stopTimer();
    mediaRecorderRef.current?.stop();
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      stopTimer();
      setState("paused");
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now() - duration;
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);
        if (elapsed >= maxDurationMs) stopRecording();
      }, 200);
      setState("recording");
    }
  }, [duration, maxDurationMs, stopRecording]);

  const discard = useCallback(() => {
    stopTimer();
    mediaRecorderRef.current?.stop();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);
    setState("idle");
    blobRef.current = null;
  }, [audioUrl]);

  const togglePlayback = useCallback(() => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);

  const submit = useCallback(() => {
    if (blobRef.current) {
      onRecordingComplete?.(blobRef.current, duration);
    }
  }, [duration, onRecordingComplete]);

  const formatMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const maxSec = maxDurationMs / 1000;
  const progress = Math.min((duration / maxDurationMs) * 100, 100);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        {state === "idle" && (
          <button onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            <Mic className="w-4 h-4" /> {label}
          </button>
        )}
        {state === "recording" && (
          <>
            <Waveform active />
            <span className="text-sm font-mono text-foreground">{formatMs(duration)}</span>
            <button onClick={stopRecording} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              <Square className="w-4 h-4" />
            </button>
          </>
        )}
        {state === "done" && (
          <>
            <button onClick={togglePlayback} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <span className="text-sm text-foreground-muted">{formatMs(duration)}</span>
            <button onClick={discard} className="p-2 text-foreground-muted hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            {onRecordingComplete && (
              <button onClick={submit} className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Use
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn("bg-background-secondary rounded-2xl border border-border p-6", className)}>
      <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Mic className="w-4 h-4 text-primary" /> {label}
      </p>

      {/* Waveform / idle state */}
      <div className="flex justify-center mb-4">
        <AnimatePresence mode="wait">
          {state === "idle" ? (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mic className="w-7 h-7 text-primary" />
            </motion.div>
          ) : state === "done" ? (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Waveform active={false} />
            </motion.div>
          ) : (
            <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Waveform active={state === "recording"} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timer + progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-foreground-muted mb-1.5">
          <span>{formatMs(duration)}</span>
          <span>{formatMs(maxDurationMs)}</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.button key="start" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              <Mic className="w-5 h-5" /> Start Recording
            </motion.button>
          )}

          {(state === "recording" || state === "paused") && (
            <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3">
              {state === "recording" ? (
                <button onClick={pauseRecording}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors">
                  <Pause className="w-4 h-4" /> Pause
                </button>
              ) : (
                <button onClick={resumeRecording}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                  <Play className="w-4 h-4" /> Resume
                </button>
              )}
              <button onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">
                <Square className="w-4 h-4" /> Stop
              </button>
              <button onClick={discard}
                className="p-2.5 border border-border text-foreground-muted rounded-xl hover:text-red-500 hover:border-red-300 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {state === "done" && (
            <motion.div key="done-controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3">
              <button onClick={togglePlayback}
                className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border text-foreground rounded-xl text-sm font-medium hover:bg-background-secondary transition-colors">
                {isPlaying ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play</>}
              </button>
              {onRecordingComplete && (
                <button onClick={submit}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                  <Upload className="w-4 h-4" /> Use Recording
                </button>
              )}
              <button onClick={discard}
                className="p-2.5 border border-border text-foreground-muted rounded-xl hover:text-red-500 hover:border-red-300 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {state === "recording" && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs text-red-500 font-medium">Recording</span>
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;
