"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Users, FileText, Clock, TrendingUp, CheckCircle2, XCircle,
  Music, BookOpen, AlertTriangle, DollarSign, RefreshCw
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  type: string;
  status: string;
  submittedAt: string;
  rejectionReason: string | null;
  contributor: { id: string; name: string | null; image: string | null };
  community: { name: string; colorPrimary: string };
}

interface SubmissionsResponse {
  data: Submission[];
  meta: { total: number };
}

interface RevenueData {
  period: string;
  totalRevenue: string;
  communityPool: string;
  communities: Array<{
    community: { id: string; name: string };
    revenue: { communityShare: string };
  }>;
}

const CONTENT_COLORS = ["#16A34A", "#1E4A8C", "#D97706", "#7C3AED", "#DC2626"];
const HEALTH_ASPECTS = ["Active Speakers", "Oral Traditions", "Script Literacy", "Cultural Songs", "Ritual Knowledge", "Youth Engagement"];

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-border rounded-xl ${className ?? ""}`} />;
}

export default function CommunityDashboard() {
  const { data: session } = useSession();
  const [pendingQueue, setPendingQueue] = useState<Submission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rejReason, setRejReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const communityId = (session?.user as { communityId?: string })?.communityId;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50", status: "PENDING" });
      if (communityId) params.set("communityId", communityId);

      const [pendingRes, allRes] = await Promise.all([
        fetch(`/api/submissions?${params}`),
        fetch(`/api/submissions?limit=100${communityId ? `&communityId=${communityId}` : ""}`),
      ]);

      const [pending, all] = await Promise.all([
        pendingRes.ok ? (pendingRes.json() as Promise<SubmissionsResponse>) : Promise.resolve({ data: [], meta: { total: 0 } }),
        allRes.ok ? (allRes.json() as Promise<SubmissionsResponse>) : Promise.resolve({ data: [], meta: { total: 0 } }),
      ]);

      setPendingQueue(pending.data ?? []);
      setAllSubmissions(all.data ?? []);

      // Load revenue data
      const revRes = await fetch("/api/revenue/community");
      if (revRes.ok) {
        setRevenueData(await revRes.json() as RevenueData);
      }
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => { loadData(); }, [loadData]);

  const reviewSubmission = useCallback(async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const status = action === "approve" ? "APPROVED" : "REJECTED";
      const body: { status: string; rejectionReason?: string } = { status };
      if (action === "reject" && rejReason) body.rejectionReason = rejReason;

      const res = await fetch(`/api/submissions/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setPendingQueue((q) => q.filter((item) => item.id !== id));
        setReviewing(null);
        setRejReason("");
      }
    } finally {
      setActionLoading(null);
    }
  }, [rejReason]);

  // Derived stats
  const approved = allSubmissions.filter((s) => s.status === "APPROVED").length;
  const contentByType = allSubmissions.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const contentPie = Object.entries(contentByType).map(([name, value], i) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(),
    value,
    color: CONTENT_COLORS[i % CONTENT_COLORS.length],
  }));

  // Top contributors from all submissions
  const contributorMap = new Map<string, { name: string; count: number; approved: number }>();
  for (const s of allSubmissions) {
    const existing = contributorMap.get(s.contributor.id);
    if (existing) {
      existing.count++;
      if (s.status === "APPROVED") existing.approved++;
    } else {
      contributorMap.set(s.contributor.id, {
        name: s.contributor.name ?? "Unknown",
        count: 1,
        approved: s.status === "APPROVED" ? 1 : 0,
      });
    }
  }
  const topContributors = Array.from(contributorMap.values())
    .sort((a, b) => b.approved - a.approved)
    .slice(0, 5);

  // Revenue for this community
  const myRevenue = revenueData?.communities.find(
    (c) => !communityId || c.community.id === communityId
  );

  const communityShare = parseFloat(myRevenue?.revenue?.communityShare ?? "0");
  const totalRev = parseFloat(revenueData?.totalRevenue ?? "0");

  const formatDate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return "just now";
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="px-4 py-6 border-b border-border bg-background-secondary">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#16A34A] flex items-center justify-center text-2xl">🌿</div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Community Dashboard</h1>
            <p className="text-sm text-foreground-muted">
              Community President · {pendingQueue.length} pending review
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => loadData()}
              className="p-2 rounded-xl border border-border text-foreground-muted hover:text-foreground hover:border-primary/40 transition-all"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            {pendingQueue.length > 0 && (
              <div className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {pendingQueue.length} pending
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Submissions", value: loading ? "…" : allSubmissions.length.toString(), sub: `${approved} approved`, icon: FileText, color: "bg-primary" },
            { label: "Pending Review",    value: loading ? "…" : pendingQueue.length.toString(), sub: "Needs attention", icon: Clock, color: "bg-amber-500" },
            { label: "Approved Content",  value: loading ? "…" : approved.toString(), sub: "Published to learners", icon: CheckCircle2, color: "bg-emerald-600" },
            {
              label: "Community Earnings",
              value: loading ? "…" : `₹${communityShare > 0 ? (communityShare / 100).toFixed(0) + "K" : "0"}`,
              sub: revenueData ? `${revenueData.period}` : "This month",
              icon: DollarSign, color: "bg-purple-600"
            },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-background-secondary rounded-2xl p-5 border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-foreground-muted">{card.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                  <p className="text-xs text-foreground-muted mt-1">{card.sub}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.color}`}>
                  <card.icon className="w-4 h-4 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Submissions by Type
            </h2>
            {loading ? <Skeleton className="h-48" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={Object.entries(contentByType).map(([type, count]) => ({ type: type.charAt(0) + type.slice(1).toLowerCase(), count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
                  <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Bar dataKey="count" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-4">Content Mix</h2>
            {loading ? <Skeleton className="h-48" /> : contentPie.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={contentPie} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {contentPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {contentPie.map((c) => (
                    <div key={c.name} className="flex items-center gap-1 text-xs text-foreground-muted">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      {c.name} ({c.value})
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-foreground-muted text-sm">No content yet</div>
            )}
          </div>
        </div>

        {/* Moderation Queue */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Moderation Queue
            </h2>
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
              {pendingQueue.length} pending
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : pendingQueue.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-foreground font-medium">All caught up!</p>
              <p className="text-sm text-foreground-muted">No pending submissions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingQueue.map((item) => (
                <div key={item.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{item.type}</span>
                        <span className="text-xs text-foreground-muted">{formatDate(item.submittedAt)}</span>
                      </div>
                      <p className="font-medium text-foreground truncate">Submission #{item.id.slice(-6)}</p>
                      <p className="text-xs text-foreground-muted mt-0.5">by {item.contributor.name ?? "Unknown"}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => reviewSubmission(item.id, "approve")}
                        disabled={actionLoading === item.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => setReviewing(reviewing === item.id ? null : item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                  {reviewing === item.id && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <input
                        value={rejReason}
                        onChange={(e) => setRejReason(e.target.value)}
                        placeholder="Reason for rejection…"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-red-400 mb-2"
                      />
                      <button
                        onClick={() => reviewSubmission(item.id, "reject")}
                        disabled={actionLoading === item.id}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Contributors */}
        {topContributors.length > 0 && (
          <div className="bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Top Contributors
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    {["Name", "Submitted", "Approved", "Approval Rate"].map((h) => (
                      <th key={h} className="pb-2 pr-4 text-xs font-medium text-foreground-muted whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topContributors.map((c, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-medium text-foreground">{c.name}</td>
                      <td className="py-3 pr-4 text-foreground-secondary">{c.count}</td>
                      <td className="py-3 pr-4 text-green-600">{c.approved}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${c.count > 0 ? Math.round((c.approved / c.count) * 100) : 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-foreground-muted">
                            {c.count > 0 ? Math.round((c.approved / c.count) * 100) : 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Language Health (community-specific data cannot be auto-derived without domain modeling, so keep meaningful static scores) */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-4">Language Health Indicators</h2>
          <p className="text-xs text-foreground-muted mb-3">Based on UNESCO language vitality framework. Update via Community Settings.</p>
          {[
            { aspect: "Active Learners",    score: allSubmissions.length > 20 ? 55 : 35 },
            { aspect: "Content Archive",    score: approved > 50 ? 70 : approved > 20 ? 50 : 30 },
            { aspect: "Contributor Network",score: topContributors.length > 3 ? 60 : 40 },
            { aspect: "Cultural Songs",     score: (contentByType["SONG"] ?? 0) > 10 ? 65 : 40 },
            { aspect: "Oral Recordings",    score: (contentByType["RECORDING"] ?? 0) > 10 ? 60 : 35 },
          ].map((m, i) => (
            <div key={m.aspect} className="mb-3 last:mb-0">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">{m.aspect}</span>
                <span className={cn("font-semibold text-xs",
                  m.score >= 70 ? "text-green-500" : m.score >= 50 ? "text-amber-500" : "text-red-500"
                )}>{m.score}%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.score}%` }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.07 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: m.score >= 70 ? "#16A34A" : m.score >= 50 ? "#D97706" : "#DC2626" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
