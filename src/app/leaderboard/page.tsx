"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Crown, Flame, Trophy, Star, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "all" | "monthly" | "weekly";

interface LeaderUser {
  id: string;
  rank: number;
  name: string | null;
  xp: number;
  streak: number;
  community: { name: string; colorPrimary?: string } | null;
  isCurrentUser?: boolean;
}

interface CommunityRank {
  id: string;
  name: string;
  colorPrimary: string;
  memberCount: number;
  totalXP: number;
}

const RANK_COLORS = ["text-amber-400", "text-slate-400", "text-amber-700"];
const PODIUM_BG = [
  "bg-gradient-to-b from-amber-400/20 to-amber-400/5 border-amber-400/30",
  "bg-gradient-to-b from-slate-400/20 to-slate-400/5 border-slate-400/30",
  "bg-gradient-to-b from-amber-700/20 to-amber-700/5 border-amber-700/30",
];

function initials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background-secondary animate-pulse">
      <div className="w-7 h-4 bg-gray-200 rounded" />
      <div className="w-10 h-10 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-32 bg-gray-200 rounded" />
        <div className="h-2.5 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-14 bg-gray-200 rounded" />
    </div>
  );
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<Period>("all");
  const [tab, setTab] = useState<"users" | "communities">("users");
  const [users, setUsers] = useState<LeaderUser[]>([]);
  const [communityRankings, setCommunityRankings] = useState<CommunityRank[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number; xp: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?limit=15&period=${period}`);
      if (!res.ok) return;
      const data = await res.json();
      const currentUserId = session?.user?.id;
      const ranked: LeaderUser[] = (data.leaderboard ?? []).map(
        (u: LeaderUser) => ({ ...u, isCurrentUser: u.id === currentUserId })
      );
      setUsers(ranked);
      setMyRank(data.myRank ?? null);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [period, session?.user?.id]);

  // Fetch community rankings from communities API
  useEffect(() => {
    fetch('/api/communities?limit=10')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!Array.isArray(data?.data)) return;
        const ranked: CommunityRank[] = (data.data as Array<{
          id: string; name: string; colorPrimary: string;
          speakerCount: number; storyCount: number; songCount: number;
        }>).map(c => ({
          id: c.id,
          name: c.name,
          colorPrimary: c.colorPrimary,
          memberCount: c.speakerCount,
          totalXP: (c.storyCount + c.songCount) * 50, // approximate
        })).sort((a, b) => b.totalXP - a.totalXP);
        setCommunityRankings(ranked);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { loadLeaderboard(); }, [loadLeaderboard]);

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);

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
            {/* Period selector + refresh */}
            <div className="flex gap-2">
              {(["weekly","monthly","all"] as Period[]).map((p) => (
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
              <button
                onClick={loadLeaderboard}
                disabled={loading}
                className="p-1.5 border border-border rounded-lg text-foreground-muted hover:text-foreground transition-colors"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              </button>
            </div>

            {/* Podium */}
            {loading ? (
              <div className="flex items-end justify-center gap-3 pt-4">
                {[0,1,2].map(i => (
                  <div key={i} className={cn("flex-1 flex flex-col items-center animate-pulse")}>
                    <div className="w-10 h-10 rounded-full bg-gray-200 mb-2" />
                    <div className={cn("w-full rounded-t-xl bg-gray-200", i === 1 ? "h-32" : i === 0 ? "h-24" : "h-20")} />
                  </div>
                ))}
              </div>
            ) : topThree.length >= 3 && (
              <div className="flex items-end justify-center gap-3 pt-4">
                {[topThree[1], topThree[0], topThree[2]].map((user, podiumPos) => {
                  const actualRank = podiumPos === 0 ? 2 : podiumPos === 1 ? 1 : 3;
                  const heights = ["h-24", "h-32", "h-20"];
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: podiumPos * 0.1 }}
                      className="flex-1 flex flex-col items-center"
                    >
                      {actualRank === 1 && <Crown className="w-6 h-6 text-amber-400 mb-1" />}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold mb-1">
                        {initials(user.name)}
                      </div>
                      <p className="text-xs font-semibold text-foreground text-center leading-tight mb-2">
                        {user.name ? user.name.split(" ")[0] : 'User'}
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
            )}

            {/* Ranked list */}
            <div className="space-y-2">
              {loading
                ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                : rest.map((user, i) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                        user.isCurrentUser
                          ? "bg-primary/10 border-primary/30"
                          : "bg-background-secondary border-border"
                      )}
                    >
                      <span className="w-7 text-center text-sm font-bold text-foreground-muted">
                        #{user.rank}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials(user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold truncate", user.isCurrentUser && "text-primary")}>
                          {user.name ?? 'Learner'} {user.isCurrentUser && "(You)"}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {user.community?.name ?? '—'}
                        </p>
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
                  ))
              }
            </div>

            {myRank && (
              <p className="text-center text-sm text-foreground-muted py-2">
                You&apos;re ranked <span className="font-bold text-primary">#{myRank.rank}</span> globally
                · {myRank.xp.toLocaleString()} XP · Keep learning! 🌟
              </p>
            )}
          </>
        )}

        {tab === "communities" && (
          <div className="space-y-3">
            {communityRankings.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-background-secondary border border-border rounded-2xl p-4 flex items-center gap-4"
              >
                <span className={cn("text-2xl font-black w-8 text-center", RANK_COLORS[i] ?? "text-foreground-muted")}>
                  #{i + 1}
                </span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
                  style={{ backgroundColor: c.colorPrimary }}
                >
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-foreground-muted">{c.memberCount.toLocaleString()} members</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground flex items-center gap-1 justify-end">
                    <Star className="w-3 h-3 text-amber-400" />
                    {c.totalXP >= 1000 ? `${(c.totalXP / 1000).toFixed(0)}K` : c.totalXP}
                  </p>
                  <p className="text-[10px] text-foreground-muted">Activity Score</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
