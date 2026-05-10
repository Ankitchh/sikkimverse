"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  MouseEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src?: string;
  title?: string;
  subtitle?: string;
  variant?: "compact" | "full";
  accentColor?: string;
  className?: string;
  autoPlay?: boolean;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const BAR_COUNT = 20;

export default function AudioPlayer({
  src,
  title,
  subtitle,
  variant = "full",
  accentColor = "#1a5c3a",
  className,
  autoPlay = false,
}: AudioPlayerProps) {
  // No src — show a "not available" placeholder instead of a broken player
  if (!src) {
    if (variant === "compact") {
      return (
        <div className={cn("flex items-center gap-3 px-3 py-2 rounded-xl bg-background-secondary border border-border opacity-60", className)}>
          <div className="h-8 w-8 rounded-full bg-border flex items-center justify-center flex-shrink-0">
            <Play className="h-3.5 w-3.5 text-foreground-muted translate-x-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            {title && <p className="text-sm font-medium text-foreground-muted truncate">{title}</p>}
            <p className="text-xs text-foreground-muted">Audio not available</p>
          </div>
        </div>
      );
    }
    return (
      <div className={cn("rounded-2xl bg-background-secondary border border-dashed border-border p-6 flex flex-col items-center gap-2 text-center", className)}>
        <div className="h-10 w-10 rounded-full bg-border/50 flex items-center justify-center">
          <Play className="h-5 w-5 text-foreground-muted translate-x-0.5" />
        </div>
        {title && <p className="text-sm font-medium text-foreground">{title}</p>}
        <p className="text-xs text-foreground-muted">Audio recording not yet available</p>
      </div>
    );
  }
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [barHeights, setBarHeights] = useState<number[]>(
    Array.from({ length: BAR_COUNT }, () => 0.2)
  );

  // Waveform animation when playing
  useEffect(() => {
    if (!isPlaying) {
      setBarHeights(Array.from({ length: BAR_COUNT }, () => 0.15));
      return;
    }

    const interval = setInterval(() => {
      setBarHeights(
        Array.from({ length: BAR_COUNT }, () => 0.15 + Math.random() * 0.85)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => { setIsLoading(false); setHasError(false); };
    const onError = () => { setIsLoading(false); setHasError(true); setIsPlaying(false); };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    if (!autoPlay || !audioRef.current) return;
    audioRef.current.play().catch(() => {});
  }, [autoPlay]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying]);

  const handleProgressClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current;
      const audio = audioRef.current;
      if (!bar || !audio || !duration) return;
      const rect = bar.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      audio.currentTime = ratio * duration;
    },
    [duration]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const vol = parseFloat(e.target.value);
      setVolume(vol);
      if (audioRef.current) {
        audioRef.current.volume = vol;
        setIsMuted(vol === 0);
      }
    },
    []
  );

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const VolumeIcon =
    isMuted || volume === 0
      ? VolumeX
      : volume < 0.5
      ? Volume1
      : Volume2;

  if (variant === "compact") {
    if (hasError) {
      return (
        <div className={cn("flex items-center gap-3 px-3 py-2 rounded-xl bg-background-secondary border border-border opacity-60", className)}>
          <div className="h-8 w-8 rounded-full bg-border flex items-center justify-center flex-shrink-0">
            <Play className="h-3.5 w-3.5 text-foreground-muted translate-x-0.5" />
          </div>
          {title && <p className="text-sm font-medium text-foreground-muted truncate flex-1">{title}</p>}
          <span className="text-xs text-foreground-muted">Unavailable</span>
        </div>
      );
    }
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl bg-background-secondary border border-border",
          className
        )}
      >
        <audio ref={audioRef} src={src} preload="metadata" />

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="h-8 w-8 rounded-full text-white flex items-center justify-center flex-shrink-0 transition-opacity"
          style={{ backgroundColor: accentColor }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5 fill-current" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current translate-x-0.5" />
          )}
        </motion.button>

        {/* Mini waveform */}
        <div className="flex items-center gap-px h-6 flex-shrink-0">
          {barHeights.slice(0, 10).map((h, i) => (
            <motion.div
              key={i}
              className="w-0.5 rounded-full"
              style={{ backgroundColor: accentColor }}
              animate={{ height: `${Math.round(h * 20)}px` }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </div>

        {title && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{title}</p>
          </div>
        )}

        <span className="text-xs text-foreground-muted tabular-nums flex-shrink-0">
          {formatTime(currentTime)}
        </span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={cn("rounded-2xl bg-background-secondary border border-dashed border-border p-6 flex flex-col items-center gap-2 text-center", className)}>
        <div className="h-10 w-10 rounded-full bg-border/50 flex items-center justify-center">
          <Play className="h-5 w-5 text-foreground-muted translate-x-0.5" />
        </div>
        {title && <p className="text-sm font-medium text-foreground">{title}</p>}
        <p className="text-xs text-foreground-muted">Audio could not be loaded</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-background-secondary border border-border p-4 flex flex-col gap-4",
        className
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Title row */}
      {(title || subtitle) && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <p className="text-sm font-semibold text-foreground truncate">{title}</p>
            )}
            {subtitle && (
              <p className="text-xs text-foreground-muted truncate">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Waveform visualizer */}
      <div className="flex items-center justify-center gap-px h-12">
        {barHeights.map((h, i) => {
          const isBeforeProgress = (i / BAR_COUNT) * 100 < progressPercent;
          return (
            <motion.div
              key={i}
              className="w-1.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: isBeforeProgress
                  ? accentColor
                  : `${accentColor}40`,
              }}
              animate={{ height: `${Math.max(4, Math.round(h * 44))}px` }}
              transition={{ duration: 0.1 }}
            />
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div
          ref={progressRef}
          className="relative h-2 bg-border rounded-full cursor-pointer group"
          onClick={handleProgressClick}
          role="slider"
          aria-label="Audio progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressPercent)}
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full transition-all"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: accentColor,
            }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow border-2 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              left: `${progressPercent}%`,
              transform: `translate(-50%, -50%)`,
              borderColor: accentColor,
            }}
          />
        </div>

        {/* Time */}
        <div className="flex items-center justify-between text-xs text-foreground-muted tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-4">
        {/* Play/Pause */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={togglePlay}
          className="h-11 w-11 rounded-full text-white flex items-center justify-center flex-shrink-0 shadow-md transition-shadow hover:shadow-lg"
          style={{ backgroundColor: accentColor }}
          aria-label={isPlaying ? "Pause" : "Play"}
          disabled={isLoading}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isLoading ? (
              <motion.div
                key="loading"
                className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            ) : isPlaying ? (
              <motion.div
                key="pause"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Pause className="h-5 w-5 fill-current" />
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Play className="h-5 w-5 fill-current translate-x-0.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Volume control */}
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={toggleMute}
            className="text-foreground-muted hover:text-foreground transition-colors flex-shrink-0"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            <VolumeIcon className="h-4 w-4" />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${
                (isMuted ? 0 : volume) * 100
              }%, var(--border) ${(isMuted ? 0 : volume) * 100}%, var(--border) 100%)`,
            }}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
