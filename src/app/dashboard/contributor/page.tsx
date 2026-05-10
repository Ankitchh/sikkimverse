"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Upload, FileText, Music, Mic, Video, CheckCircle2, Clock, XCircle, Plus, TrendingUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Submission {
  id: string;
  type: string;
  status: string;
  submittedAt: string;
  rejectionReason: string | null;
  community: { name: string };
}

interface SubmissionsResponse {
  data: Submission[];
  meta: { total: number };
}

const STATUS_STYLE: Record<string, string> = {
  APPROVED: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  PENDING:  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  REJECTED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  APPROVED: CheckCircle2,
  PENDING:  Clock,
  REJECTED: XCircle,
};

const QUICK_UPLOADS = [
  { type: "Word",      icon: Mic,      color: "bg-emerald-500", href: "/contribute" },
  { type: "Story",     icon: FileText, color: "bg-blue-500",    href: "/contribute" },
  { type: "Song",      icon: Music,    color: "bg-purple-500",  href: "/contribute" },
  { type: "Recording", icon: Mic,      color: "bg-orange-500",  href: "/contribute" },
  { type: "Video",     icon: Video,    color: "bg-red-500",     href: "/contribute" },
];

const TYPE_TARGETS: Record<string, { label: string; target: number }> = {
  WORD:      { label: "Words submitted",    target: 50  },
  STORY:     { label: "Stories documented", target: 20  },
  RECORDING: { label: "Audio recordings",   target: 30  },
  SONG:      { label: "Songs archived",     target: 15  },
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-border rounded-xl ${className ?? ""}`} />;
}

export default function ContributorDashboard() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState<"all" | "APPROVED" | "PENDING" | "REJECTED">("all");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/submissions?limit=50")
      .then(async (r) => {
        if (!r.ok) return { data: [] as Submission[], meta: { total: 0 } };
        return r.json() as Promise<SubmissionsResponse>;
      })
      .then((data) => { setSubmissions(data.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const counts = {
    total:    submissions.length,
    approved: submissions.filter((s) => s.status === "APPROVED").length,
    pending:  submissions.filter((s) => s.status === "PENDING").length,
    rejected: submissions.filter((s) => s.status === "REJECTED").length,
  };

  const filtered = filter === "all" ? submissions : submissions.filter((s) => s.status === filter);

  // Build progress by type from real data
  const approvedByType = submissions
    .filter((s) => s.status === "APPROVED")
    .reduce((acc, s) => { acc[s.type] = (acc[s.type] ?? 0) + 1; return acc; }, {} as Record<string, number>);

  const user = session?.user;
  const displayName = user?.name ?? "Contributor";
  const xp = (user as { xp?: number })?.xp ?? 0;
  const community = (user as { communityId?: string })?.communityId ? "Your Community" : "No community";

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a5c3a] to-[#1e4a8c] px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">🎤</div>
            <div>
              <p className="text-white/70 text-xs font-medium">Contributor Dashboard</p>
              <h1 className="text-xl font-bold text-white">{displayName}</h1>
              <p className="text-white/70 text-sm">{community} · {counts.total} contribution{counts.total !== 1 ? "s" : ""}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-white">{xp.toLocaleString()}</p>
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
              {loading ? <Skeleton className="h-8 mb-1" /> : <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>}
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

        {/* Progress by content type */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Contribution Progress
          </h2>
          <div className="space-y-3">
            {Object.entries(TYPE_TARGETS).map(([type, { label, target }], i) => {
              const current = approvedByType[type] ?? 0;
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">{label}</span>
                    <span className="text-foreground-muted">{current}/{target}</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (current / target) * 100)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {counts.approved < 5 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Submit {5 - counts.approved} more approved items to earn the <strong>Heritage Keeper</strong> badge!
              </p>
            </div>
          )}
        </div>

        {/* Submissions Table */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">My Submissions</h2>
            <div className="flex gap-1">
              {(["all", "APPROVED", "PENDING", "REJECTED"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn("px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all",
                    filter === f ? "bg-primary text-white" : "text-foreground-muted hover:text-foreground"
                  )}>
                  {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)
            ) : filtered.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-foreground-muted mx-auto mb-2" />
                <p className="text-sm text-foreground-muted">No submissions yet</p>
                <Link href="/contribute" className="text-sm text-primary font-medium hover:underline mt-1 block">
                  Submit your first content →
                </Link>
              </div>
            ) : (
              filtered.map((s, i) => {
                const Icon = STATUS_ICON[s.status] ?? Clock;
                return (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-background-tertiary border border-border rounded-full text-foreground-muted">{s.type}</span>
                          <span className="text-xs text-foreground-muted">{formatDate(s.submittedAt)}</span>
                          <span className="text-xs text-foreground-muted">· {s.community.name}</span>
                        </div>
                        <p className="font-medium text-foreground text-sm truncate">Submission #{s.id.slice(-6)}</p>
                      </div>
                      <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0", STATUS_STYLE[s.status] ?? "")}>
                        <Icon className="w-3.5 h-3.5" />
                        <span className="capitalize">{s.status.toLowerCase()}</span>
                      </div>
                    </div>
                    {s.rejectionReason && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-foreground-muted">
                          <span className="font-medium text-red-500">Feedback: </span>{s.rejectionReason}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
