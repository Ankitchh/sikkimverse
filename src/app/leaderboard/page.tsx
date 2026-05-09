"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Flame, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "weekly" | "monthly" | "alltime";

const USERS = [
  { rank: 1,  name: "Karma Wangchuk",   community: "Bhutia",  xp: 4820, streak: 42, avatar: "🧑" },
  { rank: 2,  name: "Tashi Doma",       community: "Lepcha",  xp: 4210, streak: 38, avatar: "👩" },
  { rank: 3,  name: "Nima Sherpa",      community: "Sherpa",  xp: 3890, streak: 30, avatar: "🧑" },
  { rank: 4,  name: "Dawa Lhamu",       community: "Tamang",  xp: 3540, streak: 25, avatar: "👩" },
  { rank: 5,  name: "Pema Yangchen",    community: "Bhutia",  xp: 3210, streak: 22, avatar: "👩" },
  { rank: 6,  name: "Rinchen Namgyal",  community: "Lepcha",  xp: 2980, streak: 19, avatar: "🧑" },
  { rank: 7,  name: "Sonam Tobgay",     community: "Rai",     xp: 2750, streak: 15, avatar: "🧑" },
  { rank: 8,  name: "Choden Ongmu",     community: "Limbu",   xp: 2490, streak: 12, avatar: "👩" },
  { rank: 9,  name: "Mingma Norbu",     community: "Sherpa",  xp: 2210, streak: 10, avatar: "🧑" },
  { rank: 10, name: "Jigme Wangdi",     community: "Gurung",  xp: 1980, streak: 8,  avatar: "🧑" },
  { rank: 47, name: "You",              community: "Bhutia",  xp: 1250, streak: 12, avatar: "🧑", isMe: true },
];

const COMMUNITY_RANKINGS = [
  { rank: 1, name: "Lepcha",  totalXP: 128400, learners: 1240, color: "#16A34A" },
  { rank: 2, name: "Bhutia",  totalXP: 115200, learners: 1820, color: "#DC2626" },
  { rank: 3, name: "Limbu",   totalXP: 98700,  learners: 2100, color: "#92400E" },
  { rank: 4, name: "Sherpa",  totalXP: 87300,  learners: 890,  color: "#1E40AF" },
  { rank: 5, name: "Tamang",  totalXP: 76100,  learners: 2450, color: "#7C3AED" },
];

const RANK_COLORS = ["text-amber-400", "text-slate-400", "text-amber-700"];
const PODIUM_BG = [
  "bg-gradient-to-b from-amber-400/20 to-amber-400/5 border-amber-400/30",
  "bg-gradient-to-b from-slate-400/20 to-slate-400/5 border-slate-400/30",
  "bg-gradient-to-b from-amber-700/20 to-amber-700/5 border-amber-700/30",
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("weekly");
  const [tab, setTab] = useState<"users" | "communities">("users");

  const topThree = USERS.slice(0, 3);
  const rest = USERS.slice(3);
  const me = USERS.find(u => (u as {isMe?: boolean}).isMe);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-500 to-orange-500 pt-16 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Trophy className="w-12 h-12 text-white mx-auto mb-3 opacity-90" />
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-white/80 mt-2">Top learners preserving Sikkim&apos;s heritage</p>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 space-y-6">
        {/* Tab: Users / Communities */}
        <div className="flex bg-background-secondary rounded-xl border border-border p-1 gap-1">
          {(["users", "communities"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                tab === t
                  ? "bg-primary text-white shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              {t === "users" ? "👤 Learners" : "🏘️ Communities"}
            </button>
          ))}
        </div>

        {tab === "users" && (
          <>
            {/* Period selector */}
            <div className="flex gap-2">
              {(["weekly","monthly","alltime"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    period === p
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground-muted hover:border-primary/30"
                  )}
                >
                  {p === "weekly" ? "This Week" : p === "monthly" ? "This Month" : "All Time"}
                </button>
              ))}
            </div>

            {/* Podium */}
            <div className="flex items-end justify-center gap-3 pt-4">
              {[topThree[1], topThree[0], topThree[2]].map((user, podiumPos) => {
                const actualRank = podiumPos === 0 ? 2 : podiumPos === 1 ? 1 : 3;
                const heights = ["h-24", "h-32", "h-20"];
                return (
                  <motion.div
                    key={user.rank}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: podiumPos * 0.1 }}
                    className="flex-1 flex flex-col items-center"
                  >
                    {actualRank === 1 && <Crown className="w-6 h-6 text-amber-400 mb-1" />}
                    <div className="text-2xl mb-1">{user.avatar}</div>
                    <p className="text-xs font-semibold text-foreground text-center leading-tight mb-2">
                      {user.name.split(" ")[0]}
                    </p>
                    <div className={cn(
                      "w-full rounded-t-xl border flex flex-col items-center justify-end pb-3",
                      heights[podiumPos],
                      PODIUM_BG[actualRank - 1]
                    )}>
                      <span className={cn("text-xl font-black", RANK_COLORS[actualRank - 1])}>
                        #{actualRank}
                      </span>
                      <span className="text-xs text-foreground-muted mt-0.5">
                        {(user.xp / 1000).toFixed(1)}K XP
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Ranked list */}
            <div className="space-y-2">
              {rest.map((user, i) => (
                <motion.div
                  key={user.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                    (user as {isMe?: boolean}).isMe
                      ? "bg-primary/10 border-primary/30"
                      : "bg-background-secondary border-border"
                  )}
                >
                  <span className="w-7 text-center text-sm font-bold text-foreground-muted">
                    #{user.rank}
                  </span>
                  <div className="text-xl">{user.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold truncate", (user as {isMe?: boolean}).isMe && "text-primary")}>
                      {user.name}
                    </p>
                    <p className="text-xs text-foreground-muted">{user.community}</p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div className="flex items-center gap-1 text-orange-500">
                      <Flame className="w-3 h-3" />
                      <span className="text-xs font-medium">{user.streak}d</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{user.xp.toLocaleString()}</p>
                      <p className="text-[10px] text-foreground-muted">XP</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {me && (
              <p className="text-center text-sm text-foreground-muted py-2">
                You&apos;re ranked <span className="font-bold text-primary">#{me.rank}</span> globally · Keep learning! 🌟
              </p>
            )}
          </>
        )}

        {tab === "communities" && (
          <div className="space-y-3">
            {COMMUNITY_RANKINGS.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-background-secondary border border-border rounded-2xl p-4 flex items-center gap-4"
              >
                <span className={cn("text-2xl font-black w-8 text-center", RANK_COLORS[i] ?? "text-foreground-muted")}>
                  #{c.rank}
                </span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-foreground-muted">{c.learners.toLocaleString()} active learners</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground flex items-center gap-1 justify-end">
                    <Star className="w-3 h-3 text-amber-400" />
                    {(c.totalXP / 1000).toFixed(0)}K
                  </p>
                  <p className="text-[10px] text-foreground-muted">Total XP</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
