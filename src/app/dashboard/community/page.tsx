"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, FileText, Clock, TrendingUp, CheckCircle2, XCircle,
  Music, BookOpen, Mic, AlertTriangle, DollarSign
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { cn } from "@/lib/utils";

const LEARNER_GROWTH = [
  { month: "Dec", learners: 320 },
  { month: "Jan", learners: 480 },
  { month: "Feb", learners: 620 },
  { month: "Mar", learners: 890 },
  { month: "Apr", learners: 1100 },
  { month: "May", learners: 1247 },
];

const CONTENT_BREAKDOWN = [
  { name: "Words",      value: 315, color: "#16A34A" },
  { name: "Stories",    value: 42,  color: "#1E4A8C" },
  { name: "Songs",      value: 28,  color: "#D97706" },
  { name: "Recordings", value: 67,  color: "#7C3AED" },
  { name: "Videos",     value: 18,  color: "#DC2626" },
];

const QUEUE = [
  { id: 1, title: "Lepcha Wedding Song",   type: "Song",      contributor: "Rinchen N.", submitted: "2 hr ago",  status: "pending" },
  { id: 2, title: "Creation Myth Part II", type: "Story",     contributor: "Karma T.",   submitted: "5 hr ago",  status: "pending" },
  { id: 3, title: "Word: Rum (spirit)",    type: "Word",      contributor: "Nima D.",    submitted: "1 day ago", status: "pending" },
  { id: 4, title: "Elder Lhendup Chant",   type: "Recording", contributor: "Dawa L.",    submitted: "2 day ago", status: "pending" },
];

const TOP_CONTRIBUTORS = [
  { name: "Rinchen Namgyal", role: "Elder",     items: 34, approved: 30, xp: 3200 },
  { name: "Karma Tshering",  role: "Linguist",  items: 28, approved: 25, xp: 2750 },
  { name: "Dawa Lhamu",      role: "Researcher",items: 19, approved: 17, xp: 1900 },
  { name: "Nima Dawa",       role: "Teacher",   items: 15, approved: 14, xp: 1500 },
];

const EARNINGS = [
  { period: "Jan", amount: 32000 },
  { period: "Feb", amount: 38000 },
  { period: "Mar", amount: 42000 },
  { period: "Apr", amount: 39000 },
  { period: "May", amount: 45000 },
];

export default function CommunityDashboard() {
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [rejReason, setRejReason] = useState("");
  const [queue, setQueue] = useState(QUEUE);

  const approve = (id: number) => setQueue(q => q.filter(item => item.id !== id));
  const reject  = (id: number) => { setQueue(q => q.filter(item => item.id !== id)); setReviewing(null); setRejReason(""); };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="px-4 py-6 border-b border-border bg-background-secondary">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#16A34A] flex items-center justify-center text-2xl">🌿</div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Lepcha Community Dashboard</h1>
            <p className="text-sm text-foreground-muted">Community President · Preservation Score: 35%</p>
          </div>
          <div className="ml-auto px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> At Risk
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Learners",    value: "1,247",  sub: "+156 this month", icon: Users,      color: "bg-primary" },
            { label: "Content Items",      value: "470",    sub: "342 published",   icon: FileText,   color: "bg-blue-600" },
            { label: "Pending Review",     value: queue.length.toString(), sub: "Needs attention", icon: Clock, color: "bg-amber-500" },
            { label: "Monthly Earnings",   value: "₹45K",   sub: "+18% vs last mo", icon: DollarSign, color: "bg-purple-600" },
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

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Learner Growth
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={LEARNER_GROWTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
                <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="learners" stroke="#16A34A" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-4">Content Breakdown</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={CONTENT_BREAKDOWN} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" nameKey="name">
                  {CONTENT_BREAKDOWN.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {CONTENT_BREAKDOWN.map(c => (
                <div key={c.name} className="flex items-center gap-1 text-xs text-foreground-muted">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  {c.name} ({c.value})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Moderation Queue */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Moderation Queue
            </h2>
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
              {queue.length} pending
            </span>
          </div>

          {queue.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-foreground font-medium">All caught up!</p>
              <p className="text-sm text-foreground-muted">No pending submissions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map(item => (
                <div key={item.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{item.type}</span>
                        <span className="text-xs text-foreground-muted">{item.submitted}</span>
                      </div>
                      <p className="font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-foreground-muted mt-0.5">by {item.contributor}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => approve(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={() => setReviewing(reviewing === item.id ? null : item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                  {reviewing === item.id && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <input
                        value={rejReason}
                        onChange={e => setRejReason(e.target.value)}
                        placeholder="Reason for rejection…"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-red-400 mb-2"
                      />
                      <button onClick={() => reject(item.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors">
                        Confirm Rejection
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Earnings */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" /> Community Earnings (₹)
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={EARNINGS}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }}
                formatter={(v) => [`₹${Number(v ?? 0).toLocaleString()}`, "Earnings"] as [string, string]}
              />
              <Bar dataKey="amount" fill="#16A34A" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Contributors */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Top Contributors
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Name","Role","Submitted","Approved","XP Earned"].map(h => (
                    <th key={h} className="pb-2 pr-4 text-xs font-medium text-foreground-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_CONTRIBUTORS.map((c, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-medium text-foreground">{c.name}</td>
                    <td className="py-3 pr-4 text-foreground-secondary">{c.role}</td>
                    <td className="py-3 pr-4 text-foreground-secondary">{c.items}</td>
                    <td className="py-3 pr-4 text-green-600">{c.approved}</td>
                    <td className="py-3 font-semibold text-amber-600">{c.xp.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Language Health */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-4">Language Health Metrics</h2>
          {[
            { aspect: "Active Speakers",   score: 35 },
            { aspect: "Oral Traditions",   score: 45 },
            { aspect: "Script Literacy",   score: 25 },
            { aspect: "Cultural Songs",    score: 55 },
            { aspect: "Ritual Knowledge",  score: 40 },
            { aspect: "Youth Engagement",  score: 30 },
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
