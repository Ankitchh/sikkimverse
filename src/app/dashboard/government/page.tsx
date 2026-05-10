"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, TrendingUp, AlertTriangle, Download, BookOpen, Users, FileText, Activity, RefreshCw } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from "recharts";

const RADAR_DATA = [
  { metric: "Speakers",    Lepcha: 35, Bhutia: 48, Limbu: 75, Sherpa: 80, Tamang: 62 },
  { metric: "Oral Hist.",  Lepcha: 45, Bhutia: 60, Limbu: 80, Sherpa: 70, Tamang: 55 },
  { metric: "Script",      Lepcha: 25, Bhutia: 55, Limbu: 65, Sherpa: 40, Tamang: 30 },
  { metric: "Songs",       Lepcha: 55, Bhutia: 65, Limbu: 78, Sherpa: 72, Tamang: 60 },
  { metric: "Rituals",     Lepcha: 40, Bhutia: 70, Limbu: 75, Sherpa: 75, Tamang: 65 },
  { metric: "Youth Eng.",  Lepcha: 30, Bhutia: 45, Limbu: 68, Sherpa: 55, Tamang: 50 },
];

const MONTHLY_UPLOADS = [
  { month: "Dec", Lepcha: 28, Bhutia: 35, Limbu: 45, Tamang: 22 },
  { month: "Jan", Lepcha: 34, Bhutia: 42, Limbu: 52, Tamang: 28 },
  { month: "Feb", Lepcha: 38, Bhutia: 48, Limbu: 58, Tamang: 31 },
  { month: "Mar", Lepcha: 42, Bhutia: 55, Limbu: 64, Tamang: 38 },
  { month: "Apr", Lepcha: 50, Bhutia: 60, Limbu: 72, Tamang: 44 },
  { month: "May", Lepcha: 56, Bhutia: 68, Limbu: 80, Tamang: 52 },
];

const PLATFORM_GROWTH = [
  { month: "Dec", users: 820,  content: 1200 },
  { month: "Jan", users: 1100, content: 1560 },
  { month: "Feb", users: 1450, content: 2000 },
  { month: "Mar", users: 1900, content: 2450 },
  { month: "Apr", users: 2600, content: 2780 },
  { month: "May", users: 3427, content: 2814 },
];

interface CommunityRow {
  id: string; name: string; region: string; slug: string; colorPrimary: string;
  totalSpeakers: number; memberCount: number; totalApprovedContent: number;
  preservationScore: number; pendingSubmissions: number;
}

const LEVEL_STYLE: Record<string, string> = {
  Safe:        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  Vulnerable:  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  Endangered:  "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

const RADAR_COLORS = ["#16A34A","#DC2626","#92400E","#2C3E50","#7B3F00"];

function endangermentLevel(score: number): string {
  if (score >= 70) return 'Safe';
  if (score >= 50) return 'Vulnerable';
  return 'Endangered';
}

interface DashStats {
  overview: { totalUsers: number; activeUsersLast7Days: number; newUsersThisMonth: number; pendingSubmissions: number };
  content: { total: number; totalStories: number; totalSongs: number; totalWords: number; totalVideos: number; totalRecordings: number };
  communities: CommunityRow[];
  submissions: { byStatus: { pending: number; approved: number; rejected: number } };
}

export default function GovernmentDashboard() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) setStats(await res.json());
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { loadStats(); }, []);

  const communities: CommunityRow[] = stats?.communities ?? [];
  const atRisk = communities.filter(c => c.preservationScore < 50).length;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-4 py-8 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Government Dashboard</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Sikkim Heritage Preservation</h1>
              <p className="text-slate-400 text-sm mt-1">State Cultural Affairs · Language Preservation Index</p>
            </div>
            <button
              onClick={loadStats}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Statewide KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: loading ? '—' : (stats?.overview.totalUsers ?? 0).toLocaleString(),
              sub: loading ? '' : `+${stats?.overview.newUsersThisMonth ?? 0} this month`,
              icon: Users, color: "bg-blue-600"
            },
            {
              label: "Content Archived",
              value: loading ? '—' : (stats?.content.total ?? 0).toLocaleString(),
              sub: "Across all communities",
              icon: FileText, color: "bg-primary"
            },
            {
              label: "Communities",
              value: loading ? '—' : communities.length.toString(),
              sub: "All active",
              icon: Globe, color: "bg-purple-600"
            },
            {
              label: "At-Risk Languages",
              value: loading ? '—' : atRisk.toString(),
              sub: "Score below 50%",
              icon: AlertTriangle, color: "bg-red-600"
            },
          ].map((kpi, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-background-secondary rounded-2xl p-5 border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-foreground-muted">{kpi.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{kpi.value}</p>
                  <p className="text-xs text-foreground-muted mt-1">{kpi.sub}</p>
                </div>
                <div className={`p-3 rounded-xl ${kpi.color}`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* At-Risk Alert */}
        {atRisk > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">{atRisk} languages require urgent attention</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Lepcha (35%) and Sunwar (60%) have critically low preservation scores. Recommend immediate government intervention, funding allocation, and community education programs.
              </p>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Radar — Community Comparison */}
          <div className="bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Community Comparison (Top 5)
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "var(--foreground-muted)" }} />
                {["Lepcha","Bhutia","Limbu","Sherpa","Tamang"].map((key, i) => (
                  <Radar key={key} name={key} dataKey={key}
                    stroke={RADAR_COLORS[i]} fill={RADAR_COLORS[i]} fillOpacity={0.1} />
                ))}
                <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Growth */}
          <div className="bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Platform Growth
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={PLATFORM_GROWTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
                <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="users"   stroke="#1E4A8C" strokeWidth={2} dot={false} name="Learners" />
                <Line type="monotone" dataKey="content" stroke="#16A34A" strokeWidth={2} dot={false} name="Content Items" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Uploads by Community */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-4">Content Uploaded per Community (Monthly)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_UPLOADS}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
              <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Legend />
              <Bar dataKey="Lepcha" fill="#16A34A" radius={[3,3,0,0]} />
              <Bar dataKey="Bhutia" fill="#DC2626" radius={[3,3,0,0]} />
              <Bar dataKey="Limbu"  fill="#92400E" radius={[3,3,0,0]} />
              <Bar dataKey="Tamang" fill="#7B3F00" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Full Community Table */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">All Communities — Preservation Index</h2>
            <button className="flex items-center gap-1.5 text-xs text-primary border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Community","Region","Speakers","Learners","Content","Score","Status"].map(h => (
                    <th key={h} className="pb-3 pr-4 text-xs font-medium text-foreground-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={7} className="py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : communities.map((row) => {
                  const level = endangermentLevel(row.preservationScore);
                  return (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-background-tertiary transition-colors">
                    <td className="py-3 pr-4 font-semibold text-foreground">{row.name}</td>
                    <td className="py-3 pr-4 text-foreground-secondary text-xs">{row.region}</td>
                    <td className="py-3 pr-4 text-foreground-secondary">{row.totalSpeakers.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-foreground-secondary">{row.memberCount.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-foreground-secondary">{row.totalApprovedContent}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{
                              width: `${row.preservationScore}%`,
                              backgroundColor: row.preservationScore >= 70 ? "#16A34A" : row.preservationScore >= 50 ? "#D97706" : "#DC2626"
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground-muted">{row.preservationScore}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_STYLE[level] ?? ""}`}>
                        {level}
                      </span>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Education Integration */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Education Integration
          </h2>
          <p className="text-sm text-foreground-secondary mb-4">
            SIKKIMVERSE content can be integrated into the Sikkim state school curriculum. Below are recommendations for priority communities.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { title: "Primary School Modules",  desc: "Basic vocabulary and cultural stories for Grades 1-5",  status: "Ready" },
              { title: "Middle School Courses",   desc: "Grammar and script literacy for Grades 6-8",            status: "In Progress" },
              { title: "Teacher Training Pack",   desc: "Certified cultural educator resources",                  status: "Planned" },
              { title: "Curriculum Alignment",    desc: "Mapped to National Education Policy 2020",             status: "In Progress" },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-background-tertiary rounded-xl border border-border">
                <div className="flex items-start justify-between">
                  <p className="font-medium text-foreground text-sm">{item.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
                    item.status === "Ready" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                    item.status === "In Progress" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                    "bg-border text-foreground-muted"
                  }`}>{item.status}</span>
                </div>
                <p className="text-xs text-foreground-muted mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
