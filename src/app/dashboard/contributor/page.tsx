"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Music, Mic, Video, CheckCircle2, Clock, XCircle, Plus, TrendingUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const SUBMISSIONS = [
  { id: 1, title: "Lepcha Wedding Song",   type: "Song",      status: "approved",  submittedAt: "May 3", feedback: null },
  { id: 2, title: "Elder Creation Story",  type: "Story",     status: "pending",   submittedAt: "May 7", feedback: null },
  { id: 3, title: "Word: Rum (spirit)",    type: "Word",      status: "pending",   submittedAt: "May 8", feedback: null },
  { id: 4, title: "Harvest Chant",         type: "Recording", status: "rejected",  submittedAt: "Apr 28", feedback: "Audio quality too low — please re-record with less background noise." },
  { id: 5, title: "Lepcha Alphabet Video", type: "Video",     status: "approved",  submittedAt: "Apr 20", feedback: null },
  { id: 6, title: "Forest Song",           type: "Song",      status: "approved",  submittedAt: "Apr 15", feedback: null },
];

const STATUS_STYLE: Record<string, string> = {
  approved: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  pending:  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  rejected: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  approved: CheckCircle2,
  pending:  Clock,
  rejected: XCircle,
};

const QUICK_UPLOADS = [
  { type: "Word",      icon: Mic,      color: "bg-emerald-500", href: "/contribute" },
  { type: "Story",     icon: FileText, color: "bg-blue-500",    href: "/contribute" },
  { type: "Song",      icon: Music,    color: "bg-purple-500",  href: "/contribute" },
  { type: "Recording", icon: Mic,      color: "bg-orange-500",  href: "/contribute" },
  { type: "Video",     icon: Video,    color: "bg-red-500",     href: "/contribute" },
];

export default function ContributorDashboard() {
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");

  const counts = {
    total:    SUBMISSIONS.length,
    approved: SUBMISSIONS.filter(s => s.status === "approved").length,
    pending:  SUBMISSIONS.filter(s => s.status === "pending").length,
    rejected: SUBMISSIONS.filter(s => s.status === "rejected").length,
  };

  const filtered = filter === "all" ? SUBMISSIONS : SUBMISSIONS.filter(s => s.status === filter);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a5c3a] to-[#1e4a8c] px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">🎤</div>
            <div>
              <p className="text-white/70 text-xs font-medium">Contributor Dashboard</p>
              <h1 className="text-xl font-bold text-white">Karma Tshering</h1>
              <p className="text-white/70 text-sm">Lepcha Community · 6 contributions</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-white">2,750</p>
              <p className="text-white/70 text-xs">XP Earned</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total",    value: counts.total,    color: "text-foreground" },
            { label: "Approved", value: counts.approved, color: "text-green-500" },
            { label: "Pending",  value: counts.pending,  color: "text-amber-500" },
            { label: "Rejected", value: counts.rejected, color: "text-red-500" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-background-secondary rounded-xl p-3 border border-border text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-foreground-muted mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Upload */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Quick Upload
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {QUICK_UPLOADS.map((u) => (
              <Link key={u.type} href={u.href}
                className="flex flex-col items-center gap-2 min-w-[72px] p-3 rounded-xl border border-border hover:border-primary/40 bg-background-tertiary hover:bg-background transition-colors">
                <div className={`p-2.5 rounded-xl ${u.color}`}>
                  <u.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-foreground">{u.type}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Contribution Progress
          </h2>
          <div className="space-y-3">
            {[
              { label: "Words submitted",       current: 12,  target: 50  },
              { label: "Stories documented",    current: 3,   target: 20  },
              { label: "Audio recordings",      current: 5,   target: 30  },
              { label: "Songs archived",        current: 3,   target: 15  },
            ].map((p, i) => (
              <div key={p.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground">{p.label}</span>
                  <span className="text-foreground-muted">{p.current}/{p.target}</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.current / p.target) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Submit 38 more words to earn the <strong>Heritage Keeper</strong> badge!
            </p>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">My Submissions</h2>
            <div className="flex gap-1">
              {(["all","approved","pending","rejected"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn("px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all",
                    filter === f ? "bg-primary text-white" : "text-foreground-muted hover:text-foreground"
                  )}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((s, i) => {
              const Icon = STATUS_ICON[s.status];
              return (
                <motion.div key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-background-tertiary border border-border rounded-full text-foreground-muted">{s.type}</span>
                        <span className="text-xs text-foreground-muted">{s.submittedAt}</span>
                      </div>
                      <p className="font-medium text-foreground truncate">{s.title}</p>
                    </div>
                    <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0", STATUS_STYLE[s.status])}>
                      <Icon className="w-3.5 h-3.5" />
                      <span className="capitalize">{s.status}</span>
                    </div>
                  </div>
                  {s.feedback && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-foreground-muted"><span className="font-medium text-red-500">Moderator feedback:</span> {s.feedback}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
