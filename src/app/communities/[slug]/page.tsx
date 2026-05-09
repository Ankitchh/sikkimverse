"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { Users, BookOpen, Music, FileText, Mic, Star, TrendingUp, ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const COMMUNITY_DATA: Record<string, {
  name: string; emoji: string; description: string; colorPrimary: string; colorSecondary: string;
  region: string; totalSpeakers: number; preservationScore: number; languages: string[];
  endangermentLevel: string; history: string; scripts: string; festivals: string[];
  traditionalFood: string[]; attire: string; stories: { title: string; type: string; excerpt: string }[];
  songs: { title: string; occasion: string; duration: string }[];
  preservation: { aspect: string; score: number }[];
}> = {
  lepcha: {
    name: "Lepcha",
    emoji: "🌿",
    colorPrimary: "#16A34A",
    colorSecondary: "#15803D",
    region: "North & West Sikkim",
    totalSpeakers: 50000,
    preservationScore: 35,
    endangermentLevel: "Endangered",
    description: "The Lepcha (Róng) are the earliest known inhabitants of Sikkim, known as the 'Children of Nature'. Their unique Róng script is one of the few indigenous writing systems of the Himalayan region.",
    languages: ["Lepcha (Róng)", "Róng script"],
    history: "The Lepchas are believed to have lived in Sikkim since time immemorial. Their oral traditions speak of their origin from the union of two divine beings — the man Fodong Thinong and the woman Nazongnyu. They held a deep spiritual connection with nature, calling their homeland 'Mayel Lyang' — the hidden paradise.",
    scripts: "Róng script — written from left to right. One of the few surviving indigenous scripts of the Himalayan region.",
    festivals: ["Tendong Lho Rum Faat (August)", "Nambun Festival", "Lepcha New Year"],
    traditionalFood: ["Chang (millet beer)", "Sinki (fermented radish)", "Gundruk soup", "Chaang"],
    attire: "Women wear 'Dumdyam' (colourful woven dress) with intricate patterns. Men wear 'Thokro Dum' (white robe-like garment).",
    stories: [
      { title: "The Legend of Mayel Lyang", type: "Myth", excerpt: "In the beginning, when the world was still young, the divine parents Itbu-mo and Nazongnyu created the first Lepcha man and woman from the snows of Khangchendzonga..." },
      { title: "Mount Tendong and the Great Flood", type: "Legend", excerpt: "When the great flood came and threatened to swallow all of creation, Mount Tendong grew upward carrying the Lepcha people to safety on its summit..." },
      { title: "The Forest Spirit of Dzongu", type: "Folktale", excerpt: "Deep in the sacred forests of Dzongu, there lived a spirit who protected the trees and animals. Every Lepcha child knew to ask permission before taking anything from the forest..." },
    ],
    songs: [
      { title: "Lepcha Creation Song", occasion: "Ceremonial", duration: "3:42" },
      { title: "Harvest Blessing Chant", occasion: "Harvest Festival", duration: "5:15" },
      { title: "Wedding Joy Song (Renyong)", occasion: "Wedding", duration: "2:58" },
    ],
    preservation: [
      { aspect: "Oral Traditions", score: 45 },
      { aspect: "Script Usage", score: 25 },
      { aspect: "Songs & Music", score: 55 },
      { aspect: "Rituals", score: 40 },
      { aspect: "Language Speakers", score: 35 },
    ],
  },
  bhutia: {
    name: "Bhutia",
    emoji: "🏔️",
    colorPrimary: "#DC2626",
    colorSecondary: "#B91C1C",
    region: "East & North Sikkim",
    totalSpeakers: 70000,
    preservationScore: 48,
    endangermentLevel: "Vulnerable",
    description: "The Bhutia (Lhopos) are Tibetan-origin people who brought with them Tibetan Buddhism, the Tibetan script, and a rich tradition of monastery arts and ritual Cham dance.",
    languages: ["Sikkimese (Drenjongke)", "Tibetan script"],
    history: "The Bhutia people migrated to Sikkim between the 13th and 16th centuries from Tibet and Bhutan. They established the Chogyal kingdom of Sikkim in 1642. Their culture is deeply intertwined with Vajrayana Buddhism, and they have built numerous monasteries across the state.",
    scripts: "Tibetan script (Uchen) — used for religious texts, prayers, and the Sikkimese Bhutia (Drenjongke) language.",
    festivals: ["Losoong (December)", "Pang Lhabsol (August)", "Saga Dawa (May)", "Bumchu Festival"],
    traditionalFood: ["Thukpa (noodle soup)", "Momos", "Butter tea (Suja)", "Tsampa (roasted barley)"],
    attire: "Women wear 'Kho' (silk robe) with 'Pangden' (striped apron). Men wear 'Bakhu' (robe) with 'Khimkhab' embroidery.",
    stories: [
      { title: "Tashiding Monastery Stories", type: "History", excerpt: "The sacred monastery of Tashiding was founded by Ngadak Sempa Chembo, one of the three great lamas who established the Sikkimese Chogyal dynasty..." },
      { title: "The Snow Lion and the Dragon", type: "Myth", excerpt: "Long before the mountains had names, a mighty Snow Lion and a Dragon competed to see who would guard the valleys of Sikkim..." },
      { title: "Khangchendzonga — The Five Treasures", type: "Legend", excerpt: "The great peak of Khangchendzonga holds five treasures: gold, silver, jewels, grain, and holy scripture. These will be revealed when humanity needs them most..." },
    ],
    songs: [
      { title: "Monastery Morning Chant", occasion: "Daily Prayer", duration: "8:30" },
      { title: "Losoong Celebration Song", occasion: "New Year", duration: "4:15" },
      { title: "Cham Dance Drumbeat", occasion: "Pang Lhabsol", duration: "6:00" },
    ],
    preservation: [
      { aspect: "Oral Traditions", score: 60 },
      { aspect: "Script Usage", score: 55 },
      { aspect: "Songs & Music", score: 65 },
      { aspect: "Rituals", score: 70 },
      { aspect: "Language Speakers", score: 48 },
    ],
  },
  limbu: {
    name: "Limbu",
    emoji: "🎋",
    colorPrimary: "#92400E",
    colorSecondary: "#78350F",
    region: "East Sikkim",
    totalSpeakers: 120000,
    preservationScore: 75,
    endangermentLevel: "Vulnerable",
    description: "The Limbu are an ancient indigenous community with their own Sirijonga script and a rich warrior tradition. Their Mundhum oral scripture is a foundation of Kiranti civilization.",
    languages: ["Limbu (Yakthung Paan)", "Sirijonga script"],
    history: "The Limbu people are part of the Kiranti ethnic group, among the oldest inhabitants of the eastern Himalayan region. Their epic oral tradition, the Mundhum, records their history, philosophy, and cosmology. The Limbu had their own chieftaincy system (Limbu Raja) before Sikkim's unification.",
    scripts: "Sirijonga script — an ancient script attributed to the monk Sirijonga in the 9th century. Being revived actively.",
    festivals: ["Sakela (April/November)", "Chasok Tangnam (November)", "Udhauli/Ubhauli"],
    traditionalFood: ["Tongba (millet beer)", "Dhindo (millet porridge)", "Sel roti", "Aachar (pickle)"],
    attire: "Women wear 'Chamcha' and 'Mekhli' with silver ornaments. Men wear 'Daura Suruwal' with traditional headgear during festivals.",
    stories: [
      { title: "The Mundhum Creation", type: "Oral History", excerpt: "In the Kiranti cosmology, the world was created by Tagera Ningwaphuma, the supreme goddess, who shaped the earth from the cosmic ocean..." },
      { title: "Limbu Warrior Ballads", type: "History", excerpt: "The Limbu warriors were renowned across the Himalayan region. Their bravery is recorded in the Pallo Kirat oral traditions sung by the Phedangma shamans..." },
      { title: "Sakela — Dance of the Ancestors", type: "Myth", excerpt: "Every spring and autumn, the Limbu people perform the Sakela dance to honor their ancestors and the spirits of nature..." },
    ],
    songs: [
      { title: "Limbu Warrior Ballad", occasion: "Festival", duration: "4:20" },
      { title: "Phedangma Ritual Chant", occasion: "Shamanic Ritual", duration: "12:00" },
      { title: "Sakela Dance Song", occasion: "Sakela Festival", duration: "5:30" },
    ],
    preservation: [
      { aspect: "Oral Traditions", score: 80 },
      { aspect: "Script Usage", score: 65 },
      { aspect: "Songs & Music", score: 78 },
      { aspect: "Rituals", score: 75 },
      { aspect: "Language Speakers", score: 75 },
    ],
  },
};

// Generate default data for communities without detailed entries
function getDefaultData(slug: string) {
  const defaults: Record<string, { name: string; emoji: string; color: string; speakers: number; score: number }> = {
    tamang: { name: "Tamang", emoji: "🐎", color: "#7B3F00", speakers: 150000, score: 62 },
    rai:    { name: "Rai",    emoji: "🌾", color: "#4A0E0E", speakers: 200000, score: 58 },
    gurung: { name: "Gurung", emoji: "🦅", color: "#1B4332", speakers: 80000,  score: 65 },
    sherpa: { name: "Sherpa", emoji: "⛰️", color: "#2C3E50", speakers: 25000,  score: 80 },
    mangar: { name: "Mangar", emoji: "🌺", color: "#6D213C", speakers: 40000,  score: 55 },
    newar:  { name: "Newar",  emoji: "🏛️", color: "#4A235A", speakers: 35000,  score: 70 },
    sunwar: { name: "Sunwar", emoji: "☀️", color: "#7D3C00", speakers: 15000,  score: 60 },
  };
  return defaults[slug] ?? null;
}

export default function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const data = COMMUNITY_DATA[slug];
  const fallback = getDefaultData(slug);

  if (!data && !fallback) notFound();

  // Use detailed data if available, otherwise use fallback
  if (!data) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pb-8">
        <div
          className="pt-16 pb-24 px-4 text-center"
          style={{ background: `linear-gradient(135deg, ${fallback!.color}dd, ${fallback!.color}88)` }}
        >
          <span className="text-6xl">{fallback!.emoji}</span>
          <h1 className="text-4xl font-bold text-white mt-4">{fallback!.name} Community</h1>
          <p className="text-white/80 mt-2">{fallback!.speakers.toLocaleString()} speakers</p>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-foreground-muted">Detailed content for this community is being added by our contributors.</p>
          <Link href="/contribute" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-hover transition-colors">
            Contribute Content <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const tabs = ["Overview", "Language", "Stories", "Songs", "Learn"];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Hero */}
      <div
        className="relative pt-16 pb-24 px-4 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${data.colorPrimary}ee, ${data.colorSecondary}cc, #1e4a8c88)` }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

        <div className="max-w-3xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <span className="text-6xl">{data.emoji}</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-3">{data.name}</h1>
            <p className="text-white/80 mt-3 max-w-xl mx-auto text-sm leading-relaxed">{data.description}</p>

            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{(data.totalSpeakers / 1000).toFixed(0)}K</p>
                <p className="text-white/70 text-xs">Speakers</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{data.preservationScore}%</p>
                <p className="text-white/70 text-xs">Preservation</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{data.languages.length}</p>
                <p className="text-white/70 text-xs">Languages</p>
              </div>
            </div>

            <span className={cn(
              "mt-4 inline-block px-3 py-1 rounded-full text-xs font-semibold",
              data.preservationScore >= 70 ? "bg-green-500/30 text-green-200" :
              data.preservationScore >= 50 ? "bg-amber-500/30 text-amber-200" :
              "bg-red-500/30 text-red-200"
            )}>
              ⚠️ {data.endangermentLevel}
            </span>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 space-y-6">
        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <Link href="/learn" className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors shadow-md">
            <BookOpen className="w-4 h-4" /> Start Learning
          </Link>
          <Link href="/contribute" className="flex-1 flex items-center justify-center gap-2 py-3 border border-primary text-primary rounded-xl font-semibold text-sm hover:bg-primary/5 transition-colors">
            <Mic className="w-4 h-4" /> Contribute
          </Link>
        </motion.div>

        {/* Preservation Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border"
        >
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Language Health
          </h2>
          {data.preservation.map((p, i) => (
            <div key={p.aspect} className="mb-3 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{p.aspect}</span>
                <span className="text-xs font-semibold text-foreground-muted">{p.score}%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.score}%` }}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: p.score >= 70 ? "#16A34A" : p.score >= 50 ? "#D97706" : "#DC2626" }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border"
        >
          <h2 className="font-semibold text-foreground mb-3">History & Origins</h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">{data.history}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-background-tertiary rounded-xl p-3">
              <p className="text-xs text-foreground-muted mb-1">Script</p>
              <p className="text-sm font-medium text-foreground">{data.scripts.split("—")[0].trim()}</p>
            </div>
            <div className="bg-background-tertiary rounded-xl p-3">
              <p className="text-xs text-foreground-muted mb-1">Region</p>
              <p className="text-sm font-medium text-foreground">{data.region}</p>
            </div>
          </div>
        </motion.div>

        {/* Festivals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border"
        >
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            🎊 Festivals & Celebrations
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.festivals.map(f => (
              <Link key={f} href="/festivals"
                className="px-3 py-1.5 bg-background-tertiary border border-border rounded-full text-sm text-foreground hover:border-primary/40 transition-colors">
                {f}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Stories & Oral History
            </h2>
            <Link href="/archive" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="space-y-4">
            {data.stories.map((story) => (
              <div key={story.title} className="border-b border-border last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-medium text-foreground text-sm">{story.title}</h3>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full shrink-0">{story.type}</span>
                </div>
                <p className="text-xs text-foreground-muted leading-relaxed line-clamp-2">{story.excerpt}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Songs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Music className="w-4 h-4 text-primary" /> Traditional Songs
            </h2>
            <Link href="/archive" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {data.songs.map((song) => (
              <div key={song.title} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <Play className="w-3 h-3 text-primary ml-0.5" />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-foreground">{song.title}</p>
                    <p className="text-xs text-foreground-muted">{song.occasion}</p>
                  </div>
                </div>
                <span className="text-xs text-foreground-muted">{song.duration}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Food & Attire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-background-secondary rounded-2xl p-4 border border-border">
            <h3 className="font-semibold text-foreground text-sm mb-3">🍲 Traditional Food</h3>
            <ul className="space-y-1">
              {data.traditionalFood.map(f => (
                <li key={f} className="text-xs text-foreground-secondary flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-background-secondary rounded-2xl p-4 border border-border">
            <h3 className="font-semibold text-foreground text-sm mb-3">👘 Traditional Attire</h3>
            <p className="text-xs text-foreground-secondary leading-relaxed">{data.attire}</p>
          </div>
        </motion.div>

        {/* Contributors CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-5 text-white text-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${data.colorPrimary}, #1e4a8c)` }}
        >
          <Users className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <h3 className="font-bold text-lg">Become a {data.name} Contributor</h3>
          <p className="text-white/80 text-sm mt-1 mb-4">Help preserve your community&apos;s language and culture for future generations</p>
          <Link href="/contribute" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl font-semibold text-sm transition-colors">
            <Star className="w-4 h-4" /> Start Contributing
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
