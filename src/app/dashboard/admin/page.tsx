"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, BookOpen, FileText, Music, TrendingUp, Shield,
  Activity, Globe, AlertTriangle, CheckCircle2, Clock, Server,
  Keyboard
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────
interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsersLast7Days: number;
    newUsersThisMonth: number;
    pendingSubmissions: number;
  };
  usersByRole: Array<{ role: string; count: number }>;
  content: {
    totalStories: number;
    totalSongs: number;
    totalVideos: number;
    totalRecordings: number;
    totalWords: number;
    totalCourses: number;
    total: number;
  };
  submissions: {
    byStatus: { pending: number; approved: number; rejected: number };
    recent: Array<{
      id: string;
      type: string;
      status: string;
      submittedAt: string;
      contributor: { name: string | null; image: string | null };
      community: { name: string; colorPrimary: string };
    }>;
  };
  communities: Array<{
    id: string;
    name: string;
    slug: string;
    colorPrimary: string;
    preservationScore: number;
    memberCount: number;
    totalApprovedContent: number;
    pendingSubmissions: number;
    approvedStories: number;
    approvedSongs: number;
    approvedWords: number;
  }>;
  xpDistribution: Array<{ bucket: string; count: number }>;
}

const ROLE_COLORS: Record<string, string> = {
  PUBLIC_USER: "#16A34A",
  CONTRIBUTOR: "#D97706",
  MODERATOR: "#1E4A8C",
  COMMUNITY_PRESIDENT: "#7C3AED",
  GOVERNMENT_OFFICER: "#DC2626",
  ADMIN: "#0891B2",
  SUPER_ADMIN: "#374151",
};

const ROLE_LABELS: Record<string, string> = {
  PUBLIC_USER: "Learners",
  CONTRIBUTOR: "Contributors",
  MODERATOR: "Moderators",
  COMMUNITY_PRESIDENT: "Presidents",
  GOVERNMENT_OFFICER: "Government",
  ADMIN: "Admins",
  SUPER_ADMIN: "Super Admins",
};

const PRESERVATION_STATUS = (score: number) =>
  score >= 70 ? { label: "Stable", cls: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" } :
  score >= 50 ? { label: "Moderate", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" } :
  score >= 30 ? { label: "Vulnerable", cls: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" } :
  { label: "At Risk", cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" };

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub: string;
  icon: React.ComponentType<{ className?: string }>; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background-secondary rounded-2xl p-5 border border-border"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-foreground-muted">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          <p className="text-xs text-foreground-muted mt-1">{sub}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-border rounded-xl ${className ?? ""}`} />;
}

interface HealthStatus {
  db:   { ok: boolean; latencyMs?: number; error?: string };
  auth: { ok: boolean; error?: string };
  ai:   { ok: boolean; error?: string };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json() as Promise<DashboardStats>;
      }),
      fetch("/api/health").then((r) => r.json() as Promise<{ services: HealthStatus }>),
    ])
      .then(([data, healthData]) => {
        setStats(data);
        setHealth(healthData.services ?? null);
        setLoading(false);
      })
      .catch((err) => { setError(String(err)); setLoading(false); });
  }, []);

  // Build pie data from real role counts
  const rolePie = stats?.usersByRole.map((r) => ({
    name: ROLE_LABELS[r.role] ?? r.role,
    value: r.count,
    color: ROLE_COLORS[r.role] ?? "#888",
  })) ?? [];

  // Build community bar data
  const communityContent = stats?.communities.map((c) => ({
    name: c.name.length > 8 ? c.name.slice(0, 8) + "…" : c.name,
    stories: c.approvedStories,
    songs: c.approvedSongs,
    words: c.approvedWords,
  })) ?? [];

  const formatTimeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Shield className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
              </div>
              <p className="text-slate-400 text-sm">Full platform control — SIKKIMVERSE</p>
            </div>
            <Link
              href="/dashboard/admin/keyboards"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-all"
            >
              <Keyboard className="w-4 h-4" /> Keyboard Builder
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">
            Failed to load stats: {error}
          </div>
        )}

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Users"
              value={(stats?.overview.totalUsers ?? 0).toLocaleString()}
              sub={`+${stats?.overview.newUsersThisMonth ?? 0} this month`}
              icon={Users} color="bg-primary"
            />
            <StatCard
              label="Content Items"
              value={(stats?.content.total ?? 0).toLocaleString()}
              sub={`${stats?.submissions.byStatus.pending ?? 0} pending review`}
              icon={FileText} color="bg-amber-500"
            />
            <StatCard
              label="Active (7 days)"
              value={(stats?.overview.activeUsersLast7Days ?? 0).toLocaleString()}
              sub={stats?.overview.totalUsers
                ? `${Math.round((stats.overview.activeUsersLast7Days / stats.overview.totalUsers) * 100)}% of all users`
                : "Loading…"}
              icon={Activity} color="bg-blue-600"
            />
            <StatCard
              label="Communities"
              value={String(stats?.communities.length ?? 0)}
              sub="All active"
              icon={Globe} color="bg-purple-600"
            />
          </div>
        )}

        {/* System Health */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "API",
              status: "Running",
              icon: Server,
              ok: true,
            },
            {
              label: "Database",
              status: health ? (health.db.ok ? `${health.db.latencyMs ?? 0}ms` : "Error") : "…",
              icon: Activity,
              ok: health?.db.ok ?? true,
              tooltip: health?.db.error,
            },
            {
              label: "Auth",
              status: health ? (health.auth.ok ? "Configured" : "Missing key") : "…",
              icon: Shield,
              ok: health?.auth.ok ?? true,
              tooltip: health?.auth.error,
            },
            {
              label: "Queue",
              status: stats ? `${stats.submissions.byStatus.pending} pending` : "…",
              icon: Clock,
              ok: (stats?.submissions.byStatus.pending ?? 0) === 0,
            },
          ].map((s) => (
            <div key={s.label} className="bg-background-secondary border border-border rounded-xl p-3 flex items-center gap-3" title={s.tooltip}>
              <div className={`p-2 rounded-lg ${s.ok ? "bg-green-500/10" : "bg-amber-500/10"}`}>
                <s.icon className={`w-4 h-4 ${s.ok ? "text-green-500" : "text-amber-500"}`} />
              </div>
              <div>
                <p className="text-xs text-foreground-muted">{s.label}</p>
                <p className={`text-xs font-semibold ${s.ok ? "text-green-500" : "text-amber-500"}`}>{s.status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Users by Role Pie */}
          <div className="bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Users by Role
            </h2>
            {loading ? <Skeleton className="h-52" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={rolePie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" nameKey="name">
                    {rolePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Submission Status */}
          <div className="bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Content Breakdown
            </h2>
            {loading ? <Skeleton className="h-52" /> : (
              <div className="space-y-3">
                {[
                  { label: "Words", value: stats?.content.totalWords ?? 0, color: "bg-primary" },
                  { label: "Stories", value: stats?.content.totalStories ?? 0, color: "bg-blue-500" },
                  { label: "Songs", value: stats?.content.totalSongs ?? 0, color: "bg-amber-500" },
                  { label: "Recordings", value: stats?.content.totalRecordings ?? 0, color: "bg-purple-500" },
                  { label: "Videos", value: stats?.content.totalVideos ?? 0, color: "bg-red-500" },
                ].map(({ label, value, color }) => {
                  const pct = stats?.content.total ? Math.round((value / stats.content.total) * 100) : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground">{label}</span>
                        <span className="text-foreground-muted">{value.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }}
                          className={`h-full rounded-full ${color}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Content by Community */}
        {communityContent.length > 0 && (
          <div className="bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Content by Community
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={communityContent}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
                <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend />
                <Bar dataKey="stories" fill="#16A34A" name="Stories" radius={[4, 4, 0, 0]} />
                <Bar dataKey="songs"   fill="#D97706" name="Songs"   radius={[4, 4, 0, 0]} />
                <Bar dataKey="words"   fill="#1E4A8C" name="Words"   radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Submissions */}
          <div className="bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Recent Submissions
            </h2>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : (
              <div className="space-y-3">
                {(stats?.submissions.recent ?? []).slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: s.community.colorPrimary }}
                    >
                      {s.community.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.contributor.name ?? "Unknown"}</p>
                      <p className="text-xs text-foreground-muted">{s.community.name} · {s.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.status === "APPROVED" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                        s.status === "PENDING"  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                        "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      }`}>{s.status.toLowerCase()}</span>
                      <p className="text-[10px] text-foreground-muted mt-1">{formatTimeAgo(s.submittedAt)}</p>
                    </div>
                  </div>
                ))}
                {(stats?.submissions.recent ?? []).length === 0 && (
                  <p className="text-sm text-foreground-muted text-center py-4">No recent submissions</p>
                )}
              </div>
            )}
          </div>

          {/* Pending Moderation count */}
          <div className="bg-background-secondary rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Moderation
              </h2>
              {!loading && (
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                  {stats?.submissions.byStatus.pending ?? 0} pending
                </span>
              )}
            </div>
            {loading ? <Skeleton className="h-40" /> : (
              <div className="space-y-3">
                {[
                  { label: "Pending", value: stats?.submissions.byStatus.pending ?? 0, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
                  { label: "Approved", value: stats?.submissions.byStatus.approved ?? 0, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
                  { label: "Rejected", value: stats?.submissions.byStatus.rejected ?? 0, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`flex items-center justify-between p-3 rounded-xl ${bg}`}>
                    <span className="text-sm text-foreground">{label}</span>
                    <span className={`text-2xl font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Community Overview Table */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Community Overview</h2>
          </div>
          {loading ? <Skeleton className="h-48" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    {["Community", "Members", "Content", "Pending", "Preservation", "Status"].map((h) => (
                      <th key={h} className="pb-2 pr-4 text-xs font-medium text-foreground-muted whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(stats?.communities ?? []).map((c) => {
                    const { label, cls } = PRESERVATION_STATUS(c.preservationScore);
                    return (
                      <tr key={c.id} className="border-b border-border last:border-0 hover:bg-background-tertiary transition-colors">
                        <td className="py-3 pr-4 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.colorPrimary }} />
                            {c.name}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-foreground-secondary">{c.memberCount.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-foreground-secondary">{c.totalApprovedContent}</td>
                        <td className="py-3 pr-4">
                          {c.pendingSubmissions > 0 ? (
                            <span className="text-amber-500 font-semibold">{c.pendingSubmissions}</span>
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${c.preservationScore}%`,
                                  backgroundColor: c.preservationScore >= 70 ? "#16A34A" : c.preservationScore >= 50 ? "#D97706" : "#DC2626",
                                }}
                              />
                            </div>
                            <span className="text-xs text-foreground-muted w-8 shrink-0">{c.preservationScore}%</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
