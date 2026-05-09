"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Community pins ───────────────────────────────────────────────────────────

interface CommunityPin {
  slug: string;
  name: string;
  emoji: string;
  color: string;
  x: number; // percent of SVG viewBox width
  y: number; // percent of SVG viewBox height
  speakers: number;
  score: number;
  district: string;
}

const PINS: CommunityPin[] = [
  { slug: "lepcha",  name: "Lepcha",  emoji: "🌿", color: "#16A34A", x: 28,  y: 30,  speakers: 50000,  score: 35, district: "North & West" },
  { slug: "bhutia",  name: "Bhutia",  emoji: "🏔️", color: "#DC2626", x: 58,  y: 22,  speakers: 70000,  score: 48, district: "East & North" },
  { slug: "limbu",   name: "Limbu",   emoji: "🎋", color: "#92400E", x: 72,  y: 65,  speakers: 120000, score: 75, district: "East" },
  { slug: "tamang",  name: "Tamang",  emoji: "🐎", color: "#7B3F00", x: 38,  y: 72,  speakers: 150000, score: 62, district: "West & South" },
  { slug: "rai",     name: "Rai",     emoji: "🌾", color: "#4A0E0E", x: 64,  y: 78,  speakers: 200000, score: 58, district: "East & South" },
  { slug: "gurung",  name: "Gurung",  emoji: "🦅", color: "#1B4332", x: 22,  y: 60,  speakers: 80000,  score: 65, district: "West" },
  { slug: "sherpa",  name: "Sherpa",  emoji: "⛰️", color: "#1E3A5F", x: 48,  y: 15,  speakers: 25000,  score: 80, district: "North" },
  { slug: "mangar",  name: "Mangar",  emoji: "🌺", color: "#6D213C", x: 34,  y: 82,  speakers: 40000,  score: 55, district: "South & West" },
  { slug: "newar",   name: "Newar",   emoji: "🏛️", color: "#4A235A", x: 55,  y: 55,  speakers: 35000,  score: 70, district: "Urban centres" },
  { slug: "sunwar",  name: "Sunwar",  emoji: "☀️", color: "#7D3C00", x: 18,  y: 46,  speakers: 15000,  score: 60, district: "South" },
];

// ─── Sikkim SVG paths (4 districts stylized) ──────────────────────────────────
// Approximate district outlines in a 200×260 viewBox

const DISTRICTS = [
  {
    id: "north",
    name: "North Sikkim",
    d: "M 60,5 L 140,5 L 155,15 L 150,60 L 120,75 L 95,80 L 70,65 L 45,60 L 40,35 Z",
    color: "#1E3A5F",
  },
  {
    id: "east",
    name: "East Sikkim",
    d: "M 95,80 L 120,75 L 150,60 L 165,90 L 175,130 L 155,155 L 130,160 L 110,145 L 95,120 L 90,100 Z",
    color: "#92400E",
  },
  {
    id: "west",
    name: "West Sikkim",
    d: "M 40,35 L 70,65 L 95,80 L 90,100 L 75,120 L 55,140 L 35,130 L 20,105 L 18,70 L 30,50 Z",
    color: "#1B4332",
  },
  {
    id: "south",
    name: "South Sikkim",
    d: "M 55,140 L 75,120 L 90,100 L 95,120 L 110,145 L 130,160 L 125,180 L 100,195 L 75,190 L 55,175 L 45,155 Z",
    color: "#7B3F00",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface SikkimMapProps {
  className?: string;
  onCommunitySelect?: (slug: string) => void;
}

export function SikkimMap({ className, onCommunitySelect }: SikkimMapProps) {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);

  const activePin = hoveredPin ? PINS.find((p) => p.slug === hoveredPin) : null;

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 200 210"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.3))" }}
        aria-label="Interactive map of Sikkim communities"
      >
        <defs>
          <radialGradient id="mapBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a2a1a" />
            <stop offset="100%" stopColor="#0a1a0a" />
          </radialGradient>
          {DISTRICTS.map((d) => (
            <radialGradient key={`grad-${d.id}`} id={`grad-${d.id}`} cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor={d.color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={d.color} stopOpacity="0.15" />
            </radialGradient>
          ))}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="200" height="210" fill="url(#mapBg)" rx="8" />

        {/* Grid lines */}
        {[40, 80, 120, 160].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="200" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        ))}
        {[50, 100, 150].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="210" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        ))}

        {/* District fills */}
        {DISTRICTS.map((district) => (
          <path
            key={district.id}
            d={district.d}
            fill={
              hoveredDistrict === district.id
                ? district.color + "55"
                : `url(#grad-${district.id})`
            }
            stroke={district.color}
            strokeWidth={hoveredDistrict === district.id ? "1.5" : "0.8"}
            strokeOpacity="0.6"
            className="transition-all duration-300 cursor-pointer"
            onMouseEnter={() => setHoveredDistrict(district.id)}
            onMouseLeave={() => setHoveredDistrict(null)}
          />
        ))}

        {/* District labels */}
        {[
          { id: "north", x: 95,  y: 40,  label: "NORTH" },
          { id: "east",  x: 135, y: 115, label: "EAST" },
          { id: "west",  x: 52,  y: 90,  label: "WEST" },
          { id: "south", x: 88,  y: 165, label: "SOUTH" },
        ].map((l) => (
          <text
            key={l.id}
            x={l.x} y={l.y}
            textAnchor="middle"
            fill="rgba(255,255,255,0.2)"
            fontSize="6"
            fontWeight="bold"
            letterSpacing="1"
          >
            {l.label}
          </text>
        ))}

        {/* Community pins */}
        {PINS.map((pin) => {
          const px = (pin.x / 100) * 200;
          const py = (pin.y / 100) * 210;
          const isHovered = hoveredPin === pin.slug;
          const isSelected = selectedPin === pin.slug;

          return (
            <g
              key={pin.slug}
              transform={`translate(${px}, ${py})`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPin(pin.slug)}
              onMouseLeave={() => setHoveredPin(null)}
              onClick={() => {
                setSelectedPin(isSelected ? null : pin.slug);
                onCommunitySelect?.(pin.slug);
              }}
            >
              {/* Pulse ring */}
              {(isHovered || isSelected) && (
                <>
                  <circle r="10" fill={pin.color} fillOpacity="0.15" />
                  <circle r="7" fill={pin.color} fillOpacity="0.2" stroke={pin.color} strokeWidth="0.5" />
                </>
              )}
              {/* Pin dot */}
              <circle
                r={isHovered || isSelected ? "5" : "4"}
                fill={pin.color}
                filter="url(#glow)"
                className="transition-all duration-200"
              />
              <circle r="2" fill="white" fillOpacity="0.9" />

              {/* Emoji label */}
              <text
                y={isHovered || isSelected ? -10 : -8}
                textAnchor="middle"
                fontSize={isHovered ? "8" : "7"}
                className="select-none transition-all"
              >
                {pin.emoji}
              </text>
            </g>
          );
        })}

        {/* Khangchendzonga label */}
        <text x="90" y="8" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="5" fontStyle="italic">
          Khangchendzonga ▲
        </text>
      </svg>

      {/* Hover tooltip */}
      <AnimatePresence>
        {activePin && (
          <motion.div
            key={activePin.slug}
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-4 left-4 right-4 bg-background-secondary border border-border rounded-xl p-3 shadow-xl pointer-events-none"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: activePin.color + "33" }}
              >
                {activePin.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{activePin.name} Community</p>
                <p className="text-xs text-foreground-muted">{activePin.district} · {activePin.speakers.toLocaleString()} speakers</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold" style={{ color: activePin.score >= 70 ? "#16A34A" : activePin.score >= 50 ? "#D97706" : "#DC2626" }}>
                  {activePin.score}%
                </p>
                <p className="text-[10px] text-foreground-muted">preserved</p>
              </div>
            </div>
            <div className="mt-2 h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${activePin.score}%`,
                  backgroundColor: activePin.score >= 70 ? "#16A34A" : activePin.score >= 50 ? "#D97706" : "#DC2626",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2">
        <p className="text-[9px] text-foreground-muted font-semibold mb-1 uppercase tracking-wide">Districts</p>
        {DISTRICTS.map((d) => (
          <div key={d.id} className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-[9px] text-foreground-muted capitalize">{d.name.replace(" Sikkim", "")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Full map section for homepage ───────────────────────────────────────────

export function SikkimMapSection() {
  const [activeCommunity, setActiveCommunity] = useState<string | null>(null);
  const activePin = activeCommunity ? PINS.find((p) => p.slug === activeCommunity) : null;

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-3">
          Explore Sikkim's Living Heritage
        </h2>
        <p className="text-foreground-secondary mb-6 leading-relaxed">
          Each dot on this map represents a living culture — a language, a people, centuries of stories.
          Tap any community to begin your journey.
        </p>

        {/* Community list */}
        <div className="grid grid-cols-2 gap-2">
          {PINS.map((pin) => (
            <Link
              key={pin.slug}
              href={`/communities/${pin.slug}`}
              className={cn(
                "flex items-center gap-2.5 p-3 rounded-xl border transition-all",
                activeCommunity === pin.slug
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:border-border-strong bg-background-secondary hover:bg-background-tertiary"
              )}
              onMouseEnter={() => setActiveCommunity(pin.slug)}
              onMouseLeave={() => setActiveCommunity(null)}
            >
              <span className="text-lg">{pin.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{pin.name}</p>
                <p className="text-[10px] text-foreground-muted">{pin.speakers.toLocaleString()} speakers</p>
              </div>
              <div
                className="ml-auto w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                style={{ backgroundColor: pin.score >= 70 ? "#16A34A" : pin.score >= 50 ? "#D97706" : "#DC2626" }}
              >
                {pin.score}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="relative h-[420px] lg:h-[500px]">
        <SikkimMap onCommunitySelect={setActiveCommunity} className="h-full" />
        {activePin && (
          <Link
            href={`/communities/${activePin.slug}`}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg transition-all hover:scale-105"
            style={{ backgroundColor: activePin.color }}
          >
            Explore {activePin.name} →
          </Link>
        )}
      </div>
    </div>
  );
}

export default SikkimMap;
