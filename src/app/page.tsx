"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Users,
  Archive,
  Mic,
  Play,
  Star,
  ChevronRight,
  Globe,
  Heart,
  ArrowRight,
  Volume2,
  Trophy,
  Zap,
  Calendar,
  MapPin,
  Check,
  Sparkles,
} from "lucide-react";
import { SikkimMapSection } from "@/components/features/SikkimMap";

// Static cultural metadata — icons and languages are known facts, not DB fields
const COMMUNITY_ICONS: Record<string, string> = {
  lepcha: "🌿",
  bhutia: "🏔️",
  limbu: "🌄",
  tamang: "🥁",
  rai: "🌾",
  gurung: "🏞️",
  sherpa: "⛰️",
  magar: "🌺",
  newar: "🏛️",
  sunwar: "🎶",
  subba: "🌊",
};
const COMMUNITY_LANGUAGES: Record<string, string[]> = {
  lepcha: ["Lepcha (Róng)", "Róng script"],
  bhutia: ["Drenjongke", "Tibetan script"],
  limbu: ["Yakthung Pan", "Sirijonga script"],
  tamang: ["Tamang", "Tibetan script"],
  rai: ["Bantawa", "Chamling"],
  gurung: ["Tamu Kyui", "Tamu Pye"],
  sherpa: ["Sherpali", "Tibetan script"],
  magar: ["Eastern Magar", "Western Magar"],
  newar: ["Nepal Bhasa", "Pracalit script"],
  sunwar: ["Koĩts", "Sunuwar script"],
  subba: ["Limbu", "Sirijonga script"],
};

interface HomepageCommunity {
  id: string;
  slug: string;
  name: string;
  description: string;
  colorPrimary: string;
  colorSecondary: string;
  totalSpeakers: number;
  preservationScore: number;
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({
  end,
  suffix = "",
  duration = 2,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function FadeInSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Live Activity Feed ───────────────────────────────────────────────────────

const ACTIVITY_ITEMS = [
  { icon: "🎓", text: "Karma just completed Lepcha Lesson 3", time: "2m ago" },
  {
    icon: "🎵",
    text: "New folk song uploaded by Bhutia community",
    time: "5m ago",
  },
  { icon: "⚡", text: "250 XP earned today by 42 learners", time: "8m ago" },
  { icon: "🌿", text: "Pema contributed 3 Lepcha proverbs", time: "12m ago" },
  {
    icon: "📖",
    text: 'New oral story: "The Bear King of Dzongu"',
    time: "15m ago",
  },
  {
    icon: "🏆",
    text: "Tashi earned the Heritage Guardian badge",
    time: "18m ago",
  },
  {
    icon: "🎙️",
    text: "15 Limbu pronunciations recorded today",
    time: "21m ago",
  },
  { icon: "🤝", text: "Elder Dichen joined as contributor", time: "25m ago" },
];

// ─── Festivals Data ───────────────────────────────────────────────────────────

const FESTIVALS = [
  {
    name: "Losoong",
    month: "December",
    community: "Bhutia & Lepcha",
    description:
      "Sikkimese New Year celebrated with masked Cham dances, archery contests, and feasting. One of the most vibrant festivals of the Himalayan calendar.",
    emoji: "🎭",
    color: "#DC2626",
  },
  {
    name: "Saga Dawa",
    month: "May / June",
    community: "Buddhist communities",
    description:
      "Sacred month commemorating the birth, enlightenment, and passing of Buddha. Marked by butter lamp offerings, circumambulations, and mass prayers.",
    emoji: "🕯️",
    color: "#1E3A8A",
  },
  {
    name: "Tendong Lho Rum Faat",
    month: "August",
    community: "Lepcha",
    description:
      "Ancient Lepcha festival worshipping Mount Tendong, believed to have sheltered the Lepcha from a great flood. Rich with oral recitations and nature rituals.",
    emoji: "🌿",
    color: "#16A34A",
  },
  {
    name: "Namchi Fair",
    month: "October",
    community: "All communities",
    description:
      "Grand multi-community cultural fair at Namchi celebrating Sikkim's diverse heritage through dance, craft, cuisine, and folk performances.",
    emoji: "🎪",
    color: "#7C3AED",
  },
];

// ─── Elders Data ─────────────────────────────────────────────────────────────

const ELDERS = [
  {
    name: "Dichen Wangmo",
    age: 78,
    community: "Bhutia",
    contribution: "Oral stories",
    initials: "DW",
    color: "#DC2626",
  },
  {
    name: "Tek Bahadur Rai",
    age: 82,
    community: "Rai",
    contribution: "Mundhum chants",
    initials: "TB",
    color: "#0891B2",
  },
  {
    name: "Sange Lepcha",
    age: 75,
    community: "Lepcha",
    contribution: "Róng script",
    initials: "SL",
    color: "#16A34A",
  },
  {
    name: "Maya Gurung",
    age: 69,
    community: "Gurung",
    contribution: "Ghyabre rituals",
    initials: "MG",
    color: "#BE185D",
  },
];

// ─── Featured Stories ─────────────────────────────────────────────────────────

const FEATURED_STORIES = [
  {
    type: "Folk Tale",
    title: "The Lepcha Creation Myth of Mayel Lyang",
    excerpt:
      "In the time before memory, the creator Itbu-Rum shaped the first Lepcha from the snows of Mount Kanchenjunga...",
    community: "Lepcha",
    color: "#16A34A",
    hasAudio: true,
    emoji: "🌿",
  },
  {
    type: "Legend",
    title: "Guru Tashi and the Golden Throne",
    excerpt:
      "The first Chogyal of Sikkim received his throne not from conquest but from divine vision at Yuksom's sacred grove...",
    community: "Bhutia",
    color: "#DC2626",
    hasAudio: true,
    emoji: "🏔️",
  },
  {
    type: "Oral History",
    title: "Mundhum: The Limbu Book of Genesis",
    excerpt:
      "Before the sky and the earth separated, Yuma Sammang breathed the first word into the void — and the world trembled into being...",
    community: "Limbu",
    color: "#D97706",
    hasAudio: false,
    emoji: "🌄",
  },
  {
    type: "Myth",
    title: "Tamang Ancestors and the Tiger Path",
    excerpt:
      "The seven clans of Tamang descended from the celestial realm through a pass guarded by a white tiger who spoke in riddles...",
    community: "Tamang",
    color: "#7C3AED",
    hasAudio: true,
    emoji: "🥁",
  },
  {
    type: "History",
    title: "The Newar Craftsmen Who Built Sikkim",
    excerpt:
      "When the monasteries of Pemayangtse needed golden rooftops, it was Newar artisans who crossed the passes with their ancestral tools...",
    community: "Newar",
    color: "#EA580C",
    hasAudio: false,
    emoji: "🏛️",
  },
  {
    type: "Folk Tale",
    title: "The Sherpa Who Named the Stars",
    excerpt:
      "Old Pasang could not read books, but he knew every star by name and the story each one carried from the high glaciers...",
    community: "Sherpa",
    color: "#2563EB",
    hasAudio: true,
    emoji: "⛰️",
  },
];

// ─── Learning Steps ───────────────────────────────────────────────────────────

const LEARNING_STEPS = [
  {
    icon: BookOpen,
    label: "Vocabulary",
    desc: "Master words & meanings",
    color: "#2563EB",
    step: 1,
  },
  {
    icon: Zap,
    label: "Grammar",
    desc: "Build sentence structures",
    color: "#7C3AED",
    step: 2,
  },
  {
    icon: Mic,
    label: "Pronunciation",
    desc: "Speak with confidence",
    color: "#16A34A",
    step: 3,
  },
  {
    icon: Globe,
    label: "Script",
    desc: "Read & write ancestral scripts",
    color: "#D97706",
    step: 4,
  },
  {
    icon: Heart,
    label: "Culture",
    desc: "Live the traditions",
    color: "#DC2626",
    step: 5,
  },
];

// ─── Homepage Component ───────────────────────────────────────────────────────

interface LiveActivity {
  icon: string;
  text: string;
  time: string;
}

const TYPE_ICONS: Record<string, string> = {
  word_added: "📝",
  story_archived: "📖",
  song_recorded: "🎵",
  learner_joined: "🎓",
  achievement_earned: "🏆",
  moderation_approved: "✅",
};

interface HomepageFestival {
  id: string;
  name: string;
  month: number;
  description: string;
  emoji?: string;
  significance?: string;
  community: { name: string; slug: string } | null;
}

interface HomepageStory {
  id: string;
  title: string;
  summary: string | null;
  type: string;
  language: string | null;
  audioUrl: string | null;
  community: { name: string; slug: string; colorPrimary: string } | null;
  contributor: { name: string | null } | null;
}

const COMMUNITY_EMOJI: Record<string, string> = {
  lepcha: "🌿",
  bhutia: "🏔️",
  limbu: "🎋",
  tamang: "🥁",
  rai: "🌾",
  gurung: "🏞️",
  sherpa: "⛰️",
  magar: "🌺",
  newar: "🏛️",
  sunwar: "🎶",
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function HomePage() {
  const [communities, setCommunities] = useState<HomepageCommunity[]>([]);
  const [festivals, setFestivals] = useState<HomepageFestival[]>([]);
  const [featuredStories, setFeaturedStories] = useState<HomepageStory[]>([]);
  const [activities, setActivities] = useState<LiveActivity[]>(
    ACTIVITY_ITEMS.map((a) => ({ icon: a.icon, text: a.text, time: a.time })),
  );
  const [activeActivity, setActiveActivity] = useState(0);

  useEffect(() => {
    fetch("/api/communities?limit=11")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.data)) setCommunities(data.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/festivals")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.festivals)) setFestivals(data.festivals);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/stories?limit=6&sortBy=viewCount")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.stories)) setFeaturedStories(data.stories);
      })
      .catch(() => {});
  }, []);

  // Connect SSE for live activity
  useEffect(() => {
    const es = new EventSource("/api/realtime/activity");
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const icon = TYPE_ICONS[data.type] ?? "⚡";
        const item: LiveActivity = {
          icon,
          text: `${data.actor} (${data.community}) ${data.detail}`,
          time: "just now",
        };
        setActivities((prev) => [item, ...prev.slice(0, 7)]);
        setActiveActivity(0);
      } catch {
        /* ignore parse errors */
      }
    };
    return () => es.close();
  }, []);

  // Carousel rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveActivity((prev) => (prev + 1) % activities.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [activities.length]);

  return (
    <main className="min-h-screen bg-[#0a0f0d] text-white overflow-x-hidden">
      {/* ── Nav ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(10,15,13,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, #16A34A, #1E3A5F)" }}
          >
            🏔️
          </div>
          <span className="font-bold text-lg tracking-tight">SIKKIMVERSE</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Learn", href: "/learn" },
            { label: "Communities", href: "/communities" },
            { label: "Archive", href: "/archive" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-white/70 hover:text-white transition-colors font-medium"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="text-sm text-white/70 hover:text-white font-medium px-4 py-2 rounded-xl transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/auth"
            className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #16A34A, #15803D)" }}
          >
            Start Learning
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #0a1f15 0%, #0d1a2e 50%, #1a0a05 100%)",
          }}
        />

        {/* Animated orbs */}
        {[
          {
            size: 600,
            x: "-10%",
            y: "-20%",
            color: "rgba(22,163,74,0.12)",
            dur: 6,
          },
          {
            size: 500,
            x: "60%",
            y: "10%",
            color: "rgba(30,58,95,0.18)",
            dur: 8,
          },
          {
            size: 400,
            x: "20%",
            y: "60%",
            color: "rgba(232,135,26,0.08)",
            dur: 7,
          },
          {
            size: 300,
            x: "80%",
            y: "70%",
            color: "rgba(124,58,237,0.10)",
            dur: 9,
          },
        ].map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              filter: "blur(40px)",
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: orb.dur,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Floating cultural elements */}
        {[
          { emoji: "🏔️", x: "5%", y: "22%", size: 40 },
          { emoji: "🌿", x: "90%", y: "18%", size: 36 },
          { emoji: "🎵", x: "8%", y: "68%", size: 32 },
          { emoji: "🙏", x: "88%", y: "65%", size: 38 },
          { emoji: "⛰️", x: "50%", y: "10%", size: 28 },
          { emoji: "🌺", x: "75%", y: "78%", size: 34 },
        ].map((el, i) => (
          <motion.div
            key={i}
            className="absolute select-none pointer-events-none"
            style={{ left: el.x, top: el.y, fontSize: el.size }}
            animate={{ y: [-8, 8, -8], rotate: [-3, 3, -3] }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            {el.emoji}
          </motion.div>
        ))}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{
              background: "rgba(22,163,74,0.15)",
              border: "1px solid rgba(22,163,74,0.3)",
              color: "#4ADE80",
            }}
          >
            <Sparkles size={14} />
            AI-Powered Indigenous Language Preservation
            <Sparkles size={14} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6"
          >
            <span className="block">Preserve.</span>
            <span
              className="block"
              style={{
                background:
                  "linear-gradient(135deg, #4ADE80 0%, #60A5FA 50%, #FBBF24 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Learn.
            </span>
            <span className="block">Celebrate.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-4 font-light leading-relaxed"
          >
            {"Sikkim's Living Heritage"}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="text-base md:text-lg text-white/40 max-w-xl mx-auto mb-12 leading-relaxed"
          >
            Journey through 11+ indigenous communities — from the forest wisdom
            of the Lepcha to the Buddhist heritage of the Bhutia. Every word
            learned is a thread woven back into the living tapestry of{" "}
            {"Sikkim's"} cultural soul.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/auth"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-105 hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #16A34A, #15803D)",
                boxShadow: "0 0 40px rgba(22,163,74,0.3)",
              }}
            >
              <BookOpen size={18} />
              Start Learning Free
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/communities"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <Users size={18} />
              Explore Communities
            </Link>
          </motion.div>

          {/* Hero stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="mt-16 flex items-center justify-center gap-8 flex-wrap"
          >
            {[
              { value: "11", label: "Communities" },
              { value: "50K+", label: "Learners" },
              { value: "10K+", label: "Cultural Assets" },
              { value: "500+", label: "Contributors" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-white/40 mt-1 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center pt-2">
            <div className="w-1 h-3 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════ */}
      <section
        className="relative py-16 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f1f14 0%, #0a1525 100%)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                end: 11,
                suffix: "",
                label: "Indigenous Communities",
                icon: Users,
                color: "#4ADE80",
              },
              {
                end: 50000,
                suffix: "+",
                label: "Active Learners",
                icon: BookOpen,
                color: "#60A5FA",
              },
              {
                end: 10000,
                suffix: "+",
                label: "Cultural Assets",
                icon: Archive,
                color: "#FBBF24",
              },
              {
                end: 500,
                suffix: "+",
                label: "Contributors",
                icon: Heart,
                color: "#F472B6",
              },
            ].map((stat, i) => (
              <FadeInSection key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div
                      className="p-3 rounded-2xl"
                      style={{
                        background: `${stat.color}15`,
                        border: `1px solid ${stat.color}30`,
                      }}
                    >
                      <stat.icon size={22} style={{ color: stat.color }} />
                    </div>
                  </div>
                  <div
                    className="text-4xl font-black mb-1"
                    style={{ color: stat.color }}
                  >
                    <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-white/50">{stat.label}</div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          INTERACTIVE SIKKIM MAP
      ═══════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#080c0a" }}>
        <div className="max-w-7xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-12">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
                style={{
                  background: "rgba(22,163,74,0.1)",
                  border: "1px solid rgba(22,163,74,0.2)",
                  color: "#4ADE80",
                }}
              >
                <MapPin size={12} /> Interactive Map
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Sikkim's Living Heritage Map
              </h2>
              <p className="text-white/50 text-lg max-w-2xl mx-auto">
                Explore the geographic distribution of indigenous communities
                across Sikkim's four districts.
              </p>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.2}>
            <div
              className="rounded-3xl overflow-hidden p-6 md:p-10"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <SikkimMapSection />
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COMMUNITY EXPLORER
      ═══════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#0a0f0d" }}>
        <div className="max-w-7xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
                style={{
                  background: "rgba(22,163,74,0.1)",
                  border: "1px solid rgba(22,163,74,0.2)",
                  color: "#4ADE80",
                }}
              >
                <Globe size={12} />
                Community Explorer
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                11 Communities,{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #4ADE80, #60A5FA)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  One Sikkim
                </span>
              </h2>
              <p className="text-white/50 text-lg max-w-2xl mx-auto">
                Each community carries millennia of wisdom, unique languages,
                and living traditions. Choose a community to begin your journey.
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {communities.map((community, i) => {
              const icon = COMMUNITY_ICONS[community.slug] ?? "🏔️";
              const langs = COMMUNITY_LANGUAGES[community.slug] ?? [];
              return (
                <FadeInSection key={community.slug} delay={i * 0.06}>
                  <Link href={`/communities/${community.slug}`}>
                    <motion.div
                      whileHover={{ scale: 1.04, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="relative rounded-3xl overflow-hidden cursor-pointer h-65 group"
                      style={{
                        background: `linear-gradient(145deg, ${community.colorPrimary}22, ${community.colorSecondary}44)`,
                        border: `1px solid ${community.colorPrimary}30`,
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
                        style={{
                          background: `radial-gradient(circle at 50% 0%, ${community.colorPrimary}20, transparent 70%)`,
                        }}
                      />
                      <div className="relative z-10 p-5 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-4xl">{icon}</div>
                          <div
                            className="text-xs px-2 py-1 rounded-full font-semibold"
                            style={{
                              background: `${community.colorPrimary}30`,
                              color: community.colorPrimary,
                            }}
                          >
                            {community.totalSpeakers >= 1000000
                              ? `${(community.totalSpeakers / 1000000).toFixed(1)}M`
                              : community.totalSpeakers >= 1000
                                ? `${Math.round(community.totalSpeakers / 1000)}K`
                                : community.totalSpeakers}{" "}
                            spkrs
                          </div>
                        </div>
                        <h3 className="text-lg font-black text-white mb-1">
                          {community.name}
                        </h3>
                        <p className="text-xs text-white/50 leading-relaxed flex-1 overflow-hidden">
                          {community.description.substring(0, 90)}...
                        </p>
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs text-white/40">
                              Preservation
                            </span>
                            <span
                              className="text-xs font-bold"
                              style={{ color: community.colorPrimary }}
                            >
                              {community.preservationScore}%
                            </span>
                          </div>
                          <div
                            className="h-1.5 rounded-full"
                            style={{ background: "rgba(255,255,255,0.08)" }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{
                                width: `${community.preservationScore}%`,
                              }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 1,
                                delay: 0.3 + i * 0.05,
                                ease: "easeOut",
                              }}
                              className="h-full rounded-full"
                              style={{
                                background: `linear-gradient(90deg, ${community.colorPrimary}, ${community.colorSecondary})`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {langs.slice(0, 2).map((lang) => (
                            <span
                              key={lang}
                              className="text-[10px] px-1.5 py-0.5 rounded-md"
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                color: "rgba(255,255,255,0.5)",
                              }}
                            >
                              {lang.length > 15
                                ? lang.substring(0, 14) + "…"
                                : lang}
                            </span>
                          ))}
                        </div>
                        <div
                          className="mt-3 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: community.colorPrimary }}
                        >
                          Explore <ChevronRight size={12} />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </FadeInSection>
              );
            })}
          </div>

          <FadeInSection delay={0.3}>
            <div className="text-center mt-12">
              <Link
                href="/communities"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                View All Communities
                <ArrowRight size={16} />
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED STORIES
      ═══════════════════════════════════════════ */}
      <section
        className="py-24"
        style={{
          background: "linear-gradient(180deg, #0a0f0d 0%, #0d1525 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <FadeInSection>
            <div className="flex items-end justify-between mb-12">
              <div>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{
                    background: "rgba(96,165,250,0.1)",
                    border: "1px solid rgba(96,165,250,0.2)",
                    color: "#60A5FA",
                  }}
                >
                  <BookOpen size={12} />
                  Featured Stories
                </div>
                <h2 className="text-4xl font-black text-white">
                  Stories That Shaped Sikkim
                </h2>
              </div>
              <Link
                href="/archive"
                className="hidden md:flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
              >
                View all stories <ArrowRight size={14} />
              </Link>
            </div>
          </FadeInSection>

          <div
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {(featuredStories.length > 0
              ? featuredStories
              : FEATURED_STORIES
            ).map((story, i) => {
              const isApiStory =
                typeof story === "object" &&
                story !== null &&
                "summary" in story &&
                "type" in story;
              const apiStory = story as HomepageStory;
              const staticStory = story as (typeof FEATURED_STORIES)[0];
              const communityObj =
                isApiStory &&
                apiStory.community &&
                typeof apiStory.community === "object"
                  ? apiStory.community
                  : null;
              const color =
                communityObj &&
                typeof (communityObj as { colorPrimary?: unknown })
                  .colorPrimary === "string"
                  ? (communityObj as { colorPrimary: string }).colorPrimary
                  : isApiStory
                    ? "#16A34A"
                    : staticStory.color;
              const communityName =
                communityObj?.name ??
                (isApiStory ? "Sikkim" : staticStory.community);
              const storyType = isApiStory
                ? apiStory.type.replace(/_/g, " ")
                : staticStory.type;
              const title = isApiStory ? apiStory.title : staticStory.title;
              const excerpt = isApiStory
                ? (apiStory.summary ?? "")
                : staticStory.excerpt;
              const hasAudio = isApiStory
                ? !!apiStory.audioUrl
                : staticStory.hasAudio;
              const emoji = communityObj
                ? (COMMUNITY_EMOJI[communityObj.slug ?? ""] ?? "🏔️")
                : staticStory.emoji;
              const storyKey = isApiStory ? apiStory.id : title;
              return (
                <motion.div
                  key={storyKey}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="flex-none w-72 snap-start rounded-3xl p-6 cursor-pointer relative overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
                    style={{ background: color }}
                  />
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                      style={{ background: `${color}20`, color }}
                    >
                      {storyType.toLowerCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      {hasAudio && (
                        <div className="flex items-center gap-1 text-xs">
                          <Volume2 size={12} style={{ color }} />
                          <span style={{ color }}>Audio</span>
                        </div>
                      )}
                      <span className="text-lg">{emoji}</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-3 leading-snug">
                    {title}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed mb-4 line-clamp-3">
                    {excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-white/30">
                      {communityName} Community
                    </span>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: `${color}25` }}
                    >
                      <Play size={12} style={{ color }} />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LEARNING JOURNEY
      ═══════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#0a0f0d" }}>
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
                style={{
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.2)",
                  color: "#FBBF24",
                }}
              >
                <Trophy size={12} />
                Your Learning Path
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                From First Word to{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #FBBF24, #F97316)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Cultural Fluency
                </span>
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto">
                A structured journey designed with linguists and community
                elders.
              </p>
            </div>
          </FadeInSection>

          <div className="relative">
            <div
              className="absolute top-16 left-[10%] right-[10%] h-0.5 hidden md:block"
              style={{
                background:
                  "linear-gradient(90deg, #4ADE80, #60A5FA, #FBBF24, #F97316, #DC2626)",
              }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
              {LEARNING_STEPS.map((step, i) => (
                <FadeInSection key={step.label} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -6 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative text-center p-6 rounded-3xl cursor-pointer"
                    style={{
                      background: `${step.color}10`,
                      border: `1px solid ${step.color}25`,
                    }}
                  >
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                      style={{ background: step.color, color: "#000" }}
                    >
                      {step.step}
                    </div>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2"
                      style={{ background: `${step.color}20` }}
                    >
                      <step.icon size={26} style={{ color: step.color }} />
                    </div>
                    <h3 className="text-lg font-black text-white mb-2">
                      {step.label}
                    </h3>
                    <p className="text-xs text-white/40 leading-relaxed">
                      {step.desc}
                    </p>
                  </motion.div>
                </FadeInSection>
              ))}
            </div>
          </div>

          <FadeInSection delay={0.4}>
            <div className="text-center mt-14">
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #FBBF24, #F97316)",
                  boxShadow: "0 0 30px rgba(251,191,36,0.25)",
                }}
              >
                <BookOpen size={18} />
                Begin Your Journey
                <ArrowRight size={16} />
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LIVE ACTIVITY FEED
      ═══════════════════════════════════════════ */}
      <section
        className="py-16 overflow-hidden"
        style={{
          background:
            "linear-gradient(90deg, #0f1f14 0%, #0a1525 50%, #0f1f14 100%)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-none">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold text-green-400 uppercase tracking-widest">
                Live
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeActivity}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xl">
                    {activities[activeActivity].icon}
                  </span>
                  <span className="text-white/70 text-sm">
                    {activities[activeActivity].text}
                  </span>
                  <span className="text-white/30 text-xs ml-auto flex-none">
                    {activities[activeActivity].time}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CULTURAL FESTIVALS
      ═══════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#0d0f12" }}>
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
                style={{
                  background: "rgba(244,114,182,0.1)",
                  border: "1px solid rgba(244,114,182,0.2)",
                  color: "#F472B6",
                }}
              >
                <Calendar size={12} />
                Cultural Festivals
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Celebrate the{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #F472B6, #FBBF24)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Living Calendar
                </span>
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto">
                {"Sikkim's"} festivals are not just celebrations — they are
                living archives of history, ritual, and identity.
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(festivals.length > 0 ? festivals : FESTIVALS).map(
              (festival, i) => {
                const isReal =
                  "month" in festival && typeof festival.month === "number";
                const color = isReal
                  ? "#16A34A"
                  : (festival as (typeof FESTIVALS)[0]).color;
                const monthLabel = isReal
                  ? (MONTHS[(festival as HomepageFestival).month - 1] ?? "")
                  : (festival as (typeof FESTIVALS)[0]).month;
                const community = isReal
                  ? ((festival as HomepageFestival).community?.name ?? "Sikkim")
                  : (festival as (typeof FESTIVALS)[0]).community;
                const emoji = isReal
                  ? "🎭"
                  : (festival as (typeof FESTIVALS)[0]).emoji;
                return (
                  <FadeInSection key={festival.name} delay={i * 0.1}>
                    <motion.div
                      whileHover={{ scale: 1.03, y: -4 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="rounded-3xl p-6 cursor-pointer"
                      style={{
                        background: `linear-gradient(145deg, ${color}15, ${color}08)`,
                        border: `1px solid ${color}25`,
                      }}
                    >
                      <div className="text-4xl mb-4">{emoji}</div>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar size={12} style={{ color }} />
                        <span
                          className="text-xs font-semibold"
                          style={{ color }}
                        >
                          {monthLabel}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white mb-2">
                        {festival.name}
                      </h3>
                      <p className="text-xs text-white/40 leading-relaxed mb-4 line-clamp-3">
                        {festival.description}
                      </p>
                      <div className="text-xs text-white/30 flex items-center gap-1">
                        <MapPin size={10} />
                        {community}
                      </div>
                    </motion.div>
                  </FadeInSection>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ELDER STORIES
      ═══════════════════════════════════════════ */}
      <section
        className="py-24 px-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f1f14 0%, #1a0a05 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-150 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #FBBF24, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInSection>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
                style={{
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.2)",
                  color: "#FBBF24",
                }}
              >
                <Heart size={12} />
                Elder Wisdom
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Preserve Wisdom <span style={{ color: "#FBBF24" }}>Before</span>{" "}
                {"It's"} Lost
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-6">
                Every elder who leaves us takes with them a living library —
                proverbs, rituals, songs, and stories that no book has ever
                recorded. Our platform gives elders a way to pass their
                knowledge directly to the next generation.
              </p>
              <p className="text-white/40 text-base leading-relaxed mb-8">
                Simple voice recording. Guided story templates. Community
                verification. Your words will outlive you.
              </p>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #FBBF24, #F97316)",
                  color: "#1a0a05",
                }}
              >
                <Mic size={16} />
                Contribute as an Elder
              </Link>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {ELDERS.map((elder, i) => (
                  <motion.div
                    key={elder.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.04 }}
                    className="p-5 rounded-3xl"
                    style={{
                      background: `linear-gradient(145deg, ${elder.color}15, ${elder.color}08)`,
                      border: `1px solid ${elder.color}25`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black mb-3"
                      style={{
                        background: `${elder.color}25`,
                        color: elder.color,
                      }}
                    >
                      {elder.initials}
                    </div>
                    <div className="text-sm font-bold text-white mb-0.5">
                      {elder.name}
                    </div>
                    <div className="text-xs text-white/40 mb-2">
                      Age {elder.age} · {elder.community}
                    </div>
                    <div
                      className="text-xs px-2 py-1 rounded-lg inline-block"
                      style={{
                        background: `${elder.color}20`,
                        color: elder.color,
                      }}
                    >
                      {elder.contribution}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div
                className="mt-4 p-4 rounded-2xl text-center"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="text-2xl font-black text-white mb-1">248</div>
                <div className="text-xs text-white/40">
                  Elders have contributed to SIKKIMVERSE
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════ */}
      <section
        className="py-32 px-6 relative overflow-hidden"
        style={{ background: "#0a0f0d" }}
      >
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(22,163,74,0.12) 0%, transparent 60%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeInSection>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-6xl mb-6 inline-block"
            >
              🏔️
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              Every Language Lost is a{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #4ADE80, #60A5FA)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                World Extinguished
              </span>
            </h2>
            <p className="text-white/50 text-xl mb-12 leading-relaxed">
              Join 50,000+ learners and 248 elders keeping {"Sikkim's"} living
              heritage alive. Start your journey today — {"it's"} free forever.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth"
                className="flex items-center gap-2 px-10 py-5 rounded-2xl text-lg font-black text-white transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #16A34A, #15803D)",
                  boxShadow: "0 0 60px rgba(22,163,74,0.35)",
                }}
              >
                <Star size={20} />
                Join SIKKIMVERSE Free
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/30 flex-wrap">
              {[
                "No credit card required",
                "Free forever",
                "10K+ cultural assets",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <Check size={14} className="text-green-500" />
                  {item}
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-base"
                style={{
                  background: "linear-gradient(135deg, #16A34A, #1E3A5F)",
                }}
              >
                🏔️
              </div>
              <span className="font-bold text-white">SIKKIMVERSE</span>
            </div>
            <p className="text-sm text-white/30 text-center">
              Preserving Indigenous Voices, One Story at a Time · Built with
              love for Sikkim
            </p>
            <div className="flex items-center gap-6">
              {[
                { label: "Learn", href: "/learn" },
                { label: "Communities", href: "/communities" },
                { label: "Archive", href: "/archive" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/30 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
