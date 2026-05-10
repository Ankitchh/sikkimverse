"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, BookOpen, Music, FileText, Star, TrendingUp, Play,
  Globe, Shield, ArrowLeft, ExternalLink, Volume2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCommunityTheme } from "@/lib/communityThemes";

// ── Static cultural supplements ──────────────────────────────────────────────
// These are fixed cultural facts — not user-generated, not from DB
const CULTURAL_STATIC: Record<string, {
  history: string;
  scripts: string;
  traditionalFood: string[];
  attire: string;
  emoji: string;
  endangermentLabel: string;
}> = {
  lepcha: {
    emoji: "🌿",
    endangermentLabel: "Endangered",
    history: "The Lepchas are believed to have lived in Sikkim since time immemorial. Their oral traditions speak of their origin in 'Mayel Lyang' — the hidden paradise. They share a deep spiritual connection with nature.",
    scripts: "Róng script — written left to right. One of the few surviving indigenous scripts of the Himalayan region.",
    traditionalFood: ["Chang (millet beer)", "Sinki (fermented radish)", "Gundruk soup", "Chaang"],
    attire: "Women wear 'Dumdyam' (colourful woven dress). Men wear 'Thokro Dum' (white robe).",
  },
  bhutia: {
    emoji: "🏔️",
    endangermentLabel: "Vulnerable",
    history: "The Bhutia migrated from Tibet between the 13th–16th centuries and established the Chogyal kingdom of Sikkim in 1642. Their culture is deeply intertwined with Vajrayana Buddhism.",
    scripts: "Tibetan script (Uchen) — used for religious texts, prayers, and the Sikkimese Drenjongke language.",
    traditionalFood: ["Thukpa (noodle soup)", "Momos", "Butter tea (Suja)", "Tsampa (roasted barley)"],
    attire: "Women wear 'Kho' (silk robe) with 'Pangden' (striped apron). Men wear 'Bakhu' with 'Khimkhab' embroidery.",
  },
  limbu: {
    emoji: "🎋",
    endangermentLabel: "Vulnerable",
    history: "The Limbu are part of the ancient Kiranti ethnic group. Their epic oral tradition, the Mundhum, records their history, philosophy, and cosmology through generations of Phedangma shamans.",
    scripts: "Sirijonga script — attributed to the monk Sirijonga in the 9th century. Actively being revived.",
    traditionalFood: ["Tongba (millet beer)", "Dhindo (millet porridge)", "Sel roti", "Aachar (pickle)"],
    attire: "Women wear 'Chamcha' and 'Mekhli' with silver ornaments. Men wear 'Daura Suruwal' with traditional headgear.",
  },
  tamang: {
    emoji: "🥁",
    endangermentLabel: "Vulnerable",
    history: "The Tamang are one of Sikkim's most numerous indigenous groups, known as mountain traders and farmers. Their unique Lhosar New Year and Ghewa rituals mark the rhythm of their community life.",
    scripts: "Tibetan script is used for religious texts. Tamang language has its own proposed script being developed.",
    traditionalFood: ["Dhido (millet paste)", "Gundruk (fermented greens)", "Tongba", "Buckwheat pancakes"],
    attire: "Women wear 'Haku Patasi' (black saree with red border). Men wear 'Daura Suruwal' with Tamang 'Bhangra'.",
  },
  rai: {
    emoji: "🌾",
    endangermentLabel: "Endangered",
    history: "The Rai (Kiranti) are ancient inhabitants of the eastern Himalayan region. The Bantawa dialect is among the most widely spoken Rai languages with a rich oral literature tradition.",
    scripts: "Various Rai scripts exist; Kiranti script is being documented. Most Rai languages currently use Devanagari.",
    traditionalFood: ["Tongba", "Yangben (fern curry)", "Aachar", "Fermented bamboo shoots"],
    attire: "Women wear 'Murmuri' (handwoven shawl) with distinctive Rai patterns. Silver jewellery is central to identity.",
  },
  gurung: {
    emoji: "🏞️",
    endangermentLabel: "Vulnerable",
    history: "The Gurung (Tamu) are known for their martial tradition and are among the famed Gurkha soldiers. Their Ghyabre and Pachyu shamanic priests maintain ancient oral literature.",
    scripts: "Tamu script is being revived. Religious texts use Tibetan script. Devanagari is commonly used.",
    traditionalFood: ["Dhido", "Ghiu (clarified butter)", "Rodi (millet pancake)", "Bukunu"],
    attire: "Women wear 'Gurung Cholo' with distinctive woven patterns. Men wear 'Bhangra' and 'Daura Suruwal'.",
  },
  sherpa: {
    emoji: "⛰️",
    endangermentLabel: "Safe",
    history: "The Sherpa migrated from Tibet about 500 years ago and settled in the high Himalayan areas. World-renowned as mountaineers, they are also custodians of deep Buddhist traditions.",
    scripts: "Tibetan script (Uchen) — used for all religious and ceremonial purposes.",
    traditionalFood: ["Tsampa", "Butter tea", "Yak cheese", "Thukpa noodle soup"],
    attire: "Women wear 'Pangden' (striped apron) over 'Chuba' robe. Men wear 'Bakhu' robe with wool belt.",
  },
  magar: {
    emoji: "🌺",
    endangermentLabel: "Endangered",
    history: "The Magar are one of the oldest indigenous peoples of the Himalayan belt. They have a distinct clan system, and their Dhami and Jhankri shamanic traditions are rich with oral literature.",
    scripts: "Magar script (Akkha) is being developed. Currently Devanagari is most commonly used.",
    traditionalFood: ["Dhido", "Fermented vegetables", "Millet raksi", "Sikkimese pickle"],
    attire: "Women wear colourful woven 'Magar' blouse and skirt. Traditional beadwork and silver jewellery is common.",
  },
  newar: {
    emoji: "🏛️",
    endangermentLabel: "Vulnerable",
    history: "The Newar are the indigenous inhabitants of the Kathmandu Valley, known as master artisans, traders, and scholars. Their Nepal Bhasa language has a rich written tradition.",
    scripts: "Pracalit script (Rañjanā) — a script of great antiquity used in manuscripts and temple inscriptions.",
    traditionalFood: ["Bara (lentil pancake)", "Chatamari", "Yomari (sweet rice cake)", "Kwati (mixed bean soup)"],
    attire: "Women wear 'Haku Patasi' (black saree with red border). Men wear 'Daura Suruwal' with 'Dhaka Topi'.",
  },
  sunwar: {
    emoji: "🎶",
    endangermentLabel: "Critically Endangered",
    history: "The Sunwar (Mukhia) are a Kiranti people of eastern Sikkim and Nepal. Their Koĩts language and Sunuwar script are actively being documented and revived by linguists.",
    scripts: "Sunuwar script (Jenticha) — a unique indigenous script with 35 characters, being actively taught.",
    traditionalFood: ["Dhido", "Selroti", "Tongba", "Wild fern curry"],
    attire: "Women wear traditional 'Murmuri' with beadwork. Colourful woven fabrics mark ceremonial occasions.",
  },
};

const DEFAULT_CULTURAL = {
  emoji: "🏔️",
  endangermentLabel: "Vulnerable",
  history: "This community has a rich oral tradition and deep connection with the Himalayan landscape.",
  scripts: "Traditional script used for cultural and religious purposes.",
  traditionalFood: ["Traditional mountain cuisine"],
  attire: "Traditional attire worn during festivals and ceremonies.",
};

// ── API types ─────────────────────────────────────────────────────────────────
interface CommunityDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  colorPrimary: string;
  colorSecondary: string;
  region: string;
  totalSpeakers: number;
  preservationScore: number;
  languages: Array<{
    id: string; name: string; code: string; scriptType: string | null;
    endangermentLevel: string; speakerCount: number;
  }>;
  recentStories: Array<{
    id: string; title: string; summary: string | null; type: string;
    language: string | null; viewCount: number;
  }>;
  recentSongs: Array<{
    id: string; title: string; occasion: string | null; language: string | null;
    audioUrl: string | null; viewCount: number;
  }>;
  stats: {
    memberCount: number; languageCount: number; courseCount: number;
    storyCount: number; songCount: number; videoCount: number;
    wordCount: number; contributorCount: number;
  };
}

function PreservationBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="h-2 bg-border rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function StatCard({ value, label, icon: Icon }: { value: string | number; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="bg-background-secondary rounded-xl p-4 border border-border text-center">
      <Icon className="w-5 h-5 mx-auto mb-2 text-foreground-muted" />
      <p className="text-xl font-bold text-foreground">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="text-xs text-foreground-muted mt-0.5">{label}</p>
    </div>
  );
}

export default function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const theme = getCommunityTheme(slug);
  const cultural = CULTURAL_STATIC[slug] ?? DEFAULT_CULTURAL;

  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    fetch(`/api/communities/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFoundState(true); return null; }
        if (!r.ok) return null;
        return r.json();
      })
      .then(data => {
        if (data?.data) setCommunity(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (notFoundState) notFound();

  const preservationColor = community
    ? community.preservationScore >= 70 ? "#16A34A"
    : community.preservationScore >= 50 ? "#D97706"
    : community.preservationScore >= 30 ? "#EA580C"
    : "#DC2626"
    : theme.primary;

  const preservationLabel = community
    ? community.preservationScore >= 70 ? "Stable"
    : community.preservationScore >= 50 ? "Moderate"
    : community.preservationScore >= 30 ? "Vulnerable"
    : "At Risk"
    : "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pb-8">
        <div className="h-64 animate-pulse" style={{ background: theme.gradient || `linear-gradient(135deg, ${theme.primary}, #1e4a8c)` }} />
        <div className="max-w-2xl mx-auto px-4 -mt-12 space-y-4">
          {[120, 80, 200, 200].map((h, i) => (
            <div key={i} className="animate-pulse bg-background-secondary rounded-2xl border border-border" style={{ height: h }} />
          ))}
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🏔️</p>
          <p className="text-foreground font-semibold">Community not found</p>
          <Link href="/communities" className="text-primary text-sm hover:underline mt-2 block">← Back to Communities</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Hero */}
      <div
        className="relative pt-16 pb-24 px-4 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${community.colorPrimary}, ${community.colorSecondary ?? "#1e4a8c"})` }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="max-w-2xl mx-auto relative">
          <Link href="/communities" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Communities
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-6xl mb-3">{cultural.emoji}</div>
            <h1 className="text-4xl font-bold text-white mb-2">{community.name}</h1>
            <p className="text-white/80 text-base leading-relaxed mb-4">{community.description}</p>

            <div className="flex flex-wrap gap-3 items-center text-sm">
              <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1 text-white">
                <Globe className="w-3.5 h-3.5" /> {community.region}
              </span>
              <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1 text-white">
                <Users className="w-3.5 h-3.5" /> {community.totalSpeakers.toLocaleString()} speakers
              </span>
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-white font-medium text-xs"
                style={{ backgroundColor: `${preservationColor}40`, border: `1px solid ${preservationColor}60` }}
              >
                <Shield className="w-3 h-3" /> {cultural.endangermentLabel}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-12 space-y-5">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-background-secondary rounded-2xl p-5 shadow-lg border border-border">
          <div className="grid grid-cols-4 gap-3">
            <StatCard value={community.stats.memberCount} label="Members" icon={Users} />
            <StatCard value={community.stats.storyCount} label="Stories" icon={FileText} />
            <StatCard value={community.stats.songCount} label="Songs" icon={Music} />
            <StatCard value={community.stats.wordCount} label="Words" icon={BookOpen} />
          </div>
        </motion.div>

        {/* Preservation Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Cultural Preservation
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: preservationColor }}>
              {preservationLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <PreservationBar score={community.preservationScore} color={preservationColor} />
            </div>
            <span className="text-2xl font-bold text-foreground tabular-nums">{community.preservationScore}%</span>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-6">
            {[
              { label: "Stories Archived", value: community.stats.storyCount },
              { label: "Songs Recorded", value: community.stats.songCount },
              { label: "Active Contributors", value: community.stats.contributorCount },
              { label: "Courses Available", value: community.stats.courseCount },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">{label}</span>
                <span className="text-xs font-semibold text-foreground">{value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Languages */}
        {community.languages.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Languages & Scripts
            </h2>
            <div className="space-y-3">
              {community.languages.map((lang) => (
                <div key={lang.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{lang.name}</p>
                    {lang.scriptType && <p className="text-xs text-foreground-muted mt-0.5">{lang.scriptType}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs px-2 py-0.5 bg-background-tertiary rounded-full text-foreground-muted">
                      {lang.endangermentLevel.replace(/_/g, " ").toLowerCase()}
                    </span>
                    <p className="text-xs text-foreground-muted mt-1">{lang.speakerCount.toLocaleString()} speakers</p>
                  </div>
                </div>
              ))}
              {community.languages.length === 0 && (
                <p className="text-xs text-foreground-muted italic">{cultural.scripts}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-3">📖 Community History</h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">{cultural.history}</p>
        </motion.div>

        {/* Stories */}
        {community.recentStories.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-background-secondary rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Stories & Oral History
              </h2>
              <Link href={`/archive?community=${community.id}`} className="text-xs text-primary hover:underline">View all →</Link>
            </div>
            <div className="space-y-4">
              {community.recentStories.map((story) => (
                <div key={story.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-foreground text-sm">{story.title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full shrink-0 capitalize">
                      {story.type.toLowerCase().replace(/_/g, " ")}
                    </span>
                  </div>
                  {story.summary && (
                    <p className="text-xs text-foreground-muted leading-relaxed line-clamp-2">{story.summary}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Songs */}
        {community.recentSongs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-background-secondary rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" /> Traditional Songs
              </h2>
              <Link href={`/archive?community=${community.id}`} className="text-xs text-primary hover:underline">View all →</Link>
            </div>
            <div className="space-y-3">
              {community.recentSongs.map((song) => (
                <div key={song.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${community.colorPrimary}20` }}>
                      {song.audioUrl
                        ? <Play className="w-3 h-3 ml-0.5" style={{ color: community.colorPrimary }} />
                        : <Volume2 className="w-3 h-3" style={{ color: community.colorPrimary }} />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{song.title}</p>
                      {song.occasion && <p className="text-xs text-foreground-muted">{song.occasion}</p>}
                    </div>
                  </div>
                  {song.language && (
                    <span className="text-xs text-foreground-muted shrink-0">{song.language}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Food & Attire */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4">
          <div className="bg-background-secondary rounded-2xl p-4 border border-border">
            <h3 className="font-semibold text-foreground text-sm mb-3">🍲 Traditional Food</h3>
            <ul className="space-y-1.5">
              {cultural.traditionalFood.map(f => (
                <li key={f} className="text-xs text-foreground-secondary flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-background-secondary rounded-2xl p-4 border border-border">
            <h3 className="font-semibold text-foreground text-sm mb-3">👘 Traditional Attire</h3>
            <p className="text-xs text-foreground-secondary leading-relaxed">{cultural.attire}</p>
          </div>
        </motion.div>

        {/* Courses CTA */}
        {community.stats.courseCount > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
            className="bg-background-secondary rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {community.stats.courseCount} Course{community.stats.courseCount !== 1 ? "s" : ""} Available
                </h3>
                <p className="text-xs text-foreground-muted mt-0.5">Start learning {community.name} language today</p>
              </div>
              <Link
                href={`/learn?community=${community.id}`}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white transition-colors"
                style={{ backgroundColor: community.colorPrimary }}
              >
                Start Learning <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Contribute CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl p-5 text-white text-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${community.colorPrimary}, #1e4a8c)` }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <Users className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <h3 className="font-bold text-lg">Become a {community.name} Contributor</h3>
          <p className="text-white/80 text-sm mt-1 mb-4">Help preserve your community&apos;s language and culture for future generations</p>
          <Link
            href="/contribute"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl font-semibold text-sm transition-colors"
          >
            <Star className="w-4 h-4" /> Start Contributing
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
