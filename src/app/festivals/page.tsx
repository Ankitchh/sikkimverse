"use client";

import { motion } from "framer-motion";
import { Calendar, Music, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const FESTIVALS = [
  {
    name: "Losoong",
    community: "Bhutia / Sherpa",
    month: "December",
    monthNum: 12,
    description: "The Sikkimese New Year celebrated by Bhutia and Sherpa communities, marking the end of the harvest season. Monasteries perform elaborate Cham mask dances.",
    significance: "New Year & Harvest",
    color: "#DC2626",
    emoji: "🎭",
    related: ["Bhutia Monastery Chant", "Cham Dance Song"],
    activities: ["Mask dance (Cham)", "Monastery prayers", "Archery contests", "Traditional feasts"],
  },
  {
    name: "Saga Dawa",
    community: "Buddhist communities",
    month: "May",
    monthNum: 5,
    description: "The holiest Buddhist festival commemorating the birth, enlightenment, and death of Buddha. Devotees light butter lamps and circle monasteries.",
    significance: "Buddhist Holy Day",
    color: "#F59E0B",
    emoji: "🪔",
    related: ["Monastery Prayer Chant", "Saga Dawa Hymn"],
    activities: ["Candlelit processions", "Monastery visits", "Release of animals", "Prayer flags hoisting"],
  },
  {
    name: "Tendong Lho Rum Faat",
    community: "Lepcha",
    month: "August",
    monthNum: 8,
    description: "The most sacred Lepcha festival, worshipping Mount Tendong which according to legend saved the Lepchas during the Great Flood by growing upward with them.",
    significance: "Lepcha Sacred Day",
    color: "#16A34A",
    emoji: "⛰️",
    related: ["Lepcha Creation Song", "Tendong Legend"],
    activities: ["Prayers at Mount Tendong", "Traditional Lepcha songs", "Community feasting", "Cultural performances"],
  },
  {
    name: "Pang Lhabsol",
    community: "Bhutia",
    month: "August",
    monthNum: 8,
    description: "Unique to Sikkim, this festival worships Mount Khangchendzonga as the Guardian Deity of Sikkim. Warriors in elaborate costumes perform ritual dances.",
    significance: "Guardian Deity Worship",
    color: "#1E3A5F",
    emoji: "🗻",
    related: ["Pang Lhabsol War Dance", "Khangchendzonga Hymn"],
    activities: ["Snow lion dances", "Warrior dances", "Monastery rituals", "Traditional costume display"],
  },
  {
    name: "Tamu Lhosar",
    community: "Gurung",
    month: "December",
    monthNum: 12,
    description: "Gurung New Year celebrated with traditional songs, Sorathi dances, and ancestral rites. The Bon priests (Pachyu and Klehbri) perform ancient rituals.",
    significance: "Gurung New Year",
    color: "#1B4332",
    emoji: "🦅",
    related: ["Sorathi Dance Song", "Gurung New Year Hymn"],
    activities: ["Pachyu ritual", "Sorathi dance", "Traditional games", "Community feast"],
  },
  {
    name: "Sonam Lhosar",
    community: "Tamang",
    month: "February",
    monthNum: 2,
    description: "Tamang New Year filled with Tamang Selo music, traditional dance, and elaborate community celebrations marking the Lunar New Year.",
    significance: "Tamang New Year",
    color: "#7B3F00",
    emoji: "🐎",
    related: ["Tamang Selo Music", "New Year Blessing Song"],
    activities: ["Tamang Selo dance", "Traditional archery", "Cultural programs", "Community rituals"],
  },
  {
    name: "Udhauli",
    community: "Rai / Limbu / Sunwar",
    month: "November",
    monthNum: 11,
    description: "Kiranti community festival marking the downward migration of birds and animals and the beginning of the harvest. Shamans (Phedangma) perform sacred rituals.",
    significance: "Harvest & Migration",
    color: "#4A0E0E",
    emoji: "🌾",
    related: ["Phedangma Chant", "Udhauli Harvest Song"],
    activities: ["Phedangma ritual", "Sakela dance", "Ancestor worship", "Community feast"],
  },
  {
    name: "Indra Jatra",
    community: "Newar",
    month: "September",
    monthNum: 9,
    description: "Newar festival honoring Indra, the king of gods and lord of rain. Features the raising of the ceremonial Indra pole and traditional Newar masked dances.",
    significance: "Indra Worship",
    color: "#4A235A",
    emoji: "🏛️",
    related: ["Newar Festival Hymn", "Indra Pole Song"],
    activities: ["Indra pole raising", "Kumari procession", "Masked dances", "Traditional Newar music"],
  },
  {
    name: "Sakela",
    community: "Rai",
    month: "April / November",
    monthNum: 4,
    description: "The most important Rai festival celebrating nature, ancestors, and community unity. The Sakela Ubhauli (spring) and Udhauli (autumn) mark seasonal migrations.",
    significance: "Rai Cultural Identity",
    color: "#B45309",
    emoji: "🌺",
    related: ["Sakela Dance Song", "Rai Shaman Chant"],
    activities: ["Sakela dance (Sili)", "Shaman rituals", "Nature worship", "Community bonding"],
  },
  {
    name: "Chasok Tangnam",
    community: "Rai",
    month: "November",
    monthNum: 11,
    description: "Rai harvest festival giving thanks to nature for agricultural abundance. Includes offerings to ancestral spirits and communal celebrations.",
    significance: "Harvest Thanksgiving",
    color: "#92400E",
    emoji: "🌽",
    related: ["Harvest Blessing Song", "Rai Thanksgiving Chant"],
    activities: ["Harvest offerings", "Ancestral prayers", "Community feast", "Traditional songs"],
  },
  {
    name: "Namchi Fair",
    community: "All Sikkim communities",
    month: "October",
    monthNum: 10,
    description: "The largest state-level fair held at Namchi, South Sikkim, celebrating Sikkim's cultural diversity with all indigenous communities participating.",
    significance: "Cultural Unity",
    color: "#0F766E",
    emoji: "🎪",
    related: ["Multi-community Performance", "Sikkim Anthem"],
    activities: ["Cultural performances", "Traditional art exhibitions", "Food festival", "Inter-community sports"],
  },
  {
    name: "Tihar",
    community: "Tamang / Rai / Newar",
    month: "October",
    monthNum: 10,
    description: "The festival of lights celebrated over five days, honoring crows, dogs, cows, and siblings. Deusi-Bhailo singing groups go door to door.",
    significance: "Festival of Lights",
    color: "#D97706",
    emoji: "✨",
    related: ["Deusi Bhailo Song", "Tihar Celebration Hymn"],
    activities: ["Oil lamp lighting", "Deusi-Bhailo singing", "Lakshmi puja", "Rangoli making"],
  },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function FestivalsPage() {
  const upcoming = FESTIVALS.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#7B3F00] via-[#D97706] to-[#DC2626] pt-16 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)" }} />
        <div className="max-w-4xl mx-auto relative text-center">
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-white/70 text-sm font-medium mb-2">
            🎊 Cultural Calendar
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white">
            Celebrate Sikkim&apos;s<br />Living Traditions
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-white/80 mt-4 max-w-xl mx-auto">
            12 major festivals across 10 indigenous communities — each a doorway into living culture
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 space-y-10">
        {/* Featured upcoming */}
        <div className="grid md:grid-cols-3 gap-4">
          {upcoming.map((fest, i) => (
            <motion.div
              key={fest.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5 border border-border shadow-lg text-white relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${fest.color}dd, ${fest.color}99)` }}
            >
              <span className="text-4xl">{fest.emoji}</span>
              <h3 className="text-lg font-bold mt-2">{fest.name}</h3>
              <p className="text-white/80 text-sm">{fest.community}</p>
              <div className="flex items-center gap-1 mt-2 text-white/70 text-xs">
                <Calendar className="w-3 h-3" />
                {fest.month}
              </div>
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                Featured
              </div>
            </motion.div>
          ))}
        </div>

        {/* Month Calendar Dots */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Festival Calendar
          </h2>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-3">
            {MONTHS.map((month, i) => {
              const monthFests = FESTIVALS.filter(f =>
                f.monthNum === i + 1 || (typeof f.monthNum === 'number' && f.monthNum === i + 1)
              );
              return (
                <div key={month} className="text-center">
                  <p className="text-xs text-foreground-muted mb-2">{month}</p>
                  <div className="relative">
                    <div className={cn(
                      "w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold",
                      monthFests.length > 0
                        ? "bg-primary text-white"
                        : "bg-border text-foreground-muted"
                    )}>
                      {monthFests.length || "·"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All festivals grid */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-5">All Festivals</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {FESTIVALS.map((fest, i) => (
              <motion.div
                key={fest.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-background-secondary rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-colors"
              >
                {/* Color band */}
                <div className="h-2" style={{ backgroundColor: fest.color }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{fest.emoji}</span>
                      <div>
                        <h3 className="font-bold text-foreground">{fest.name}</h3>
                        <p className="text-xs text-foreground-muted flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" />
                          {fest.community}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-foreground-muted bg-background-tertiary px-2 py-1 rounded-full shrink-0">
                      <Calendar className="w-3 h-3" />
                      {fest.month}
                    </div>
                  </div>

                  <p className="text-sm text-foreground-secondary leading-relaxed mb-4">
                    {fest.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-foreground-muted mb-1.5">Activities</p>
                      <div className="flex flex-wrap gap-1">
                        {fest.activities.slice(0, 2).map(a => (
                          <span key={a} className="text-xs px-2 py-0.5 bg-background-tertiary rounded-full text-foreground-secondary">
                            {a}
                          </span>
                        ))}
                        {fest.activities.length > 2 && (
                          <span className="text-xs px-2 py-0.5 bg-background-tertiary rounded-full text-foreground-muted">
                            +{fest.activities.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-foreground-muted mb-1">Related Songs</p>
                      <div className="flex items-center gap-1 text-xs text-primary justify-end">
                        <Music className="w-3 h-3" />
                        {fest.related.length} in archive
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground-muted flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {fest.significance}
                    </span>
                    <button className="text-xs text-primary hover:underline font-medium">
                      Explore in Archive →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
