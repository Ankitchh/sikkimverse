"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Flame, Trophy, BookOpen, Star, Lock, CheckCircle2,
  TrendingUp, Clock, Target, Award, Settings, ChevronRight, Globe
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ACHIEVEMENTS = [
  { id: 1, name: "First Word", icon: "📖", description: "Learned your first word", earned: true },
  { id: 2, name: "Story Collector", icon: "📜", description: "Read 5 cultural stories", earned: true },
  { id: 3, name: "Voice Master", icon: "🎤", description: "Scored 90%+ on pronunciation", earned: true },
  { id: 4, name: "Script Scholar", icon: "✍️", description: "Practiced 10 script characters", earned: false },
  { id: 5, name: "Streak Champion", icon: "🔥", description: "Maintain a 30-day streak", earned: false },
  { id: 6, name: "Cultural Guide", icon: "🏔️", description: "Explored 5 communities", earned: false },
];

const STATS = [
  { label: "Lessons Completed", value: "24", icon: BookOpen, color: "text-emerald-500" },
  { label: "Words Learned", value: "142", icon: Star, color: "text-amber-500" },
  { label: "Hours Spent", value: "18.5", icon: Clock, color: "text-blue-500" },
  { label: "Avg Accuracy", value: "78%", icon: Target, color: "text-purple-500" },
];

const RECENT_ACTIVITY = [
  { action: "Completed Lepcha Lesson 3", time: "2 hours ago", xp: 50 },
  { action: "Earned 'Voice Master' badge", time: "Yesterday", xp: 100 },
  { action: "Scored 85% on pronunciation quiz", time: "2 days ago", xp: 30 },
  { action: "Read 'Lepcha Creation Story'", time: "3 days ago", xp: 20 },
  { action: "Practiced Róng script characters", time: "4 days ago", xp: 40 },
];

const XP_PER_LEVEL = 1000;
const LEVEL_NAMES = ['Novice','Seeker','Explorer','Apprentice','Scholar','Keeper','Guardian','Elder','Sage','Heritage Master'];

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const totalXP = user?.xp ?? 0;
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const currentXP = totalXP % XP_PER_LEVEL;
  const levelXP = XP_PER_LEVEL;
  const levelTitle = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
  const streak = user?.streak ?? 0;
  const xpPercent = Math.round((currentXP / levelXP) * 100);
  const userName = user?.name ?? 'Learner';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a5c3a] via-[#2d7a52] to-[#1e4a8c] pt-16 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-2xl mx-auto relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold text-white border border-white/30 shadow-xl">
                {user?.image
                  ? <img src={user.image} alt={userName} className="w-full h-full rounded-2xl object-cover" />
                  : userInitial
                }
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{userName}</h1>
                <p className="text-white/70 text-sm mt-0.5">{user?.email ?? ''}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white font-medium capitalize">
                    {(user?.role ?? 'PUBLIC_USER').replace('_', ' ').toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
            <Link href="/settings" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <Settings className="w-5 h-5 text-white" />
            </Link>
          </div>

          {/* XP Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-white/80 mb-2">
              <span className="flex items-center gap-1.5 font-semibold">
                <Trophy className="w-4 h-4 text-amber-300" />
                Level {level} — {levelTitle}
              </span>
              <span>{currentXP.toLocaleString()} / {levelXP.toLocaleString()} XP</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full"
              />
            </div>
            <p className="text-white/60 text-xs mt-1">{levelXP - currentXP} XP to Level {level + 1}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-12 space-y-6">
        {/* Streak + Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-secondary rounded-2xl p-5 shadow-lg border border-border"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{streak} days</p>
                <p className="text-sm text-foreground-muted">Current streak 🔥</p>
              </div>
            </div>
            <div className="flex gap-1">
              {["M","T","W","T","F","S","S"].map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] text-foreground-muted">{d}</span>
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs",
                    i < 5 ? "bg-orange-500 text-white" : "bg-border text-foreground-muted"
                  )}>
                    {i < 5 ? "✓" : "·"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-background-secondary rounded-xl p-4 border border-border">
              <stat.icon className={cn("w-5 h-5 mb-2", stat.color)} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-foreground-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Languages Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border"
        >
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Languages Learning
          </h2>
          {[
            { lang: "Lepcha (Róng)", community: "Lepcha", progress: 42, color: "#16A34A" },
            { lang: "Sikkimese (Drenjongke)", community: "Bhutia", progress: 18, color: "#DC2626" },
          ].map((l) => (
            <div key={l.lang} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground">{l.lang}</span>
                <span className="text-xs text-foreground-muted">{l.progress}%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${l.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: l.color }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Achievements
            </h2>
            <span className="text-xs text-foreground-muted">{ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length} earned</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center",
                  a.earned
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                    : "bg-background-tertiary border-border opacity-50"
                )}
              >
                <span className={cn("text-2xl", !a.earned && "grayscale")}>{a.icon}</span>
                <p className="text-xs font-medium text-foreground leading-tight">{a.name}</p>
                {a.earned
                  ? <CheckCircle2 className="w-3 h-3 text-amber-500" />
                  : <Lock className="w-3 h-3 text-foreground-muted" />
                }
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border"
        >
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-foreground">{item.action}</p>
                  <p className="text-xs text-foreground-muted mt-0.5">{item.time}</p>
                </div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                  +{item.xp} XP
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Settings Link */}
        <motion.a
          href="/settings"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between bg-background-secondary rounded-2xl p-5 border border-border hover:border-primary/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Account Settings</p>
              <p className="text-xs text-foreground-muted">Privacy, notifications, appearance</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-foreground-muted" />
        </motion.a>
      </div>
    </div>
  );
}
