"use client";

import { motion } from "framer-motion";
import {
  Users, BookOpen, FileText, Music, TrendingUp, Shield,
  Activity, Globe, AlertTriangle, CheckCircle2, Clock, Server
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const GROWTH_DATA = [
  { month: "Dec", users: 820,  content: 210 },
  { month: "Jan", users: 1100, content: 340 },
  { month: "Feb", users: 1450, content: 510 },
  { month: "Mar", users: 1900, content: 720 },
  { month: "Apr", users: 2600, content: 980 },
  { month: "May", users: 3400, content: 1340 },
];

const COMMUNITY_CONTENT = [
  { name: "Lepcha",  stories: 42, songs: 28, words: 315, videos: 18 },
  { name: "Bhutia",  stories: 38, songs: 45, words: 280, videos: 22 },
  { name: "Limbu",   stories: 55, songs: 32, words: 420, videos: 15 },
  { name: "Tamang",  stories: 29, songs: 38, words: 195, videos: 10 },
  { name: "Rai",     stories: 34, songs: 21, words: 260, videos: 8  },
  { name: "Others",  stories: 48, songs: 56, words: 380, videos: 27 },
];

const ROLE_PIE = [
  { name: "Learners",     value: 3120, color: "#16A34A" },
  { name: "Contributors", value: 248,  color: "#D97706" },
  { name: "Moderators",   value: 42,   color: "#1E4A8C" },
  { name: "Presidents",   value: 11,   color: "#7C3AED" },
  { name: "Government",   value: 6,    color: "#DC2626" },
];

const RECENT_USERS = [
  { name: "Karma Tshering", email: "karma@example.com", role: "Contributor", community: "Bhutia",  joined: "2 min ago" },
  { name: "Nima Sherpa",    email: "nima@example.com",  role: "Learner",     community: "Sherpa",  joined: "14 min ago" },
  { name: "Dawa Lhamu",     email: "dawa@example.com",  role: "Contributor", community: "Tamang",  joined: "1 hr ago" },
  { name: "Tashi Doma",     email: "tashi@example.com", role: "Moderator",   community: "Lepcha",  joined: "3 hr ago" },
];

const MODERATION_QUEUE = [
  { title: "Lepcha Wedding Song",       type: "Song",       community: "Lepcha", submittedBy: "Rinchen N.", time: "45 min ago" },
  { title: "Bhutia Creation Myth",      type: "Story",      community: "Bhutia", submittedBy: "Sonam T.",   time: "2 hr ago"  },
  { title: "Tamang Word: Damphu",       type: "Word",       community: "Tamang", submittedBy: "Pema Y.",    time: "3 hr ago"  },
  { title: "Limbu Elder Recording",     type: "Recording",  community: "Limbu",  submittedBy: "Jigme W.",   time: "5 hr ago"  },
];

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

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
          </div>
          <p className="text-slate-400 text-sm">Full platform control — SIKKIMVERSE</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users"      value="3,427"  sub="+124 this week"     icon={Users}    color="bg-primary"      />
          <StatCard label="Content Items"    value="2,814"  sub="342 pending review"  icon={FileText} color="bg-amber-500"    />
          <StatCard label="Active Today"     value="847"    sub="24.7% of all users"  icon={Activity} color="bg-blue-600"     />
          <StatCard label="Communities"      value="10"     sub="All active"          icon={Globe}    color="bg-purple-600"   />
        </div>

        {/* System Health */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "API", status: "Healthy", icon: Server,        ok: true  },
            { label: "DB",  status: "Healthy", icon: Activity,      ok: true  },
            { label: "Auth",status: "Healthy", icon: Shield,        ok: true  },
            { label: "Jobs",status: "1 queued",icon: Clock,         ok: false },
          ].map(s => (
            <div key={s.label} className="bg-background-secondary border border-border rounded-xl p-3 flex items-center gap-3">
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
          {/* User Growth */}
          <div className="bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> User & Content Growth
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={GROWTH_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
                <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="users"   stroke="#16A34A" strokeWidth={2} dot={false} name="Users" />
                <Line type="monotone" dataKey="content" stroke="#D97706" strokeWidth={2} dot={false} name="Content" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Roles Pie */}
          <div className="bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Users by Role
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={ROLE_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" nameKey="name">
                  {ROLE_PIE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content by Community */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Content by Community
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={COMMUNITY_CONTENT}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
              <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Legend />
              <Bar dataKey="stories" fill="#16A34A" name="Stories" radius={[4,4,0,0]} />
              <Bar dataKey="songs"   fill="#D97706" name="Songs"   radius={[4,4,0,0]} />
              <Bar dataKey="words"   fill="#1E4A8C" name="Words"   radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-background-secondary rounded-2xl p-5 border border-border">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Recent Registrations
            </h2>
            <div className="space-y-3">
              {RECENT_USERS.map((u, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {u.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                    <p className="text-xs text-foreground-muted">{u.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{u.role}</span>
                    <p className="text-[10px] text-foreground-muted mt-1">{u.joined}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Moderation Queue Summary */}
          <div className="bg-background-secondary rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Pending Moderation
              </h2>
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                {MODERATION_QUEUE.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {MODERATION_QUEUE.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-foreground-muted">{item.community} · by {item.submittedBy} · {item.time}</p>
                  </div>
                  <span className="ml-3 shrink-0 text-xs px-2 py-0.5 bg-background-tertiary border border-border rounded-full text-foreground-muted">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full py-2 text-xs text-primary font-medium border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors">
              View Full Queue →
            </button>
          </div>
        </div>

        {/* Community Management Table */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Community Overview</h2>
            <button className="text-xs text-primary hover:underline">Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Community","Learners","Content","Contributors","Preservation","Status"].map(h => (
                    <th key={h} className="pb-2 pr-4 text-xs font-medium text-foreground-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Lepcha",  learners: 1240, content: 385, contributors: 42, score: 35, status: "At Risk" },
                  { name: "Bhutia",  learners: 1820, content: 385, contributors: 58, score: 48, status: "Vulnerable" },
                  { name: "Limbu",   learners: 2100, content: 507, contributors: 71, score: 75, status: "Stable" },
                  { name: "Tamang",  learners: 2450, content: 272, contributors: 39, score: 62, status: "Moderate" },
                  { name: "Rai",     learners: 1890, content: 323, contributors: 47, score: 58, status: "Moderate" },
                  { name: "Sherpa",  learners: 890,  content: 198, contributors: 28, score: 80, status: "Stable" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-background-tertiary transition-colors">
                    <td className="py-3 pr-4 font-medium text-foreground">{row.name}</td>
                    <td className="py-3 pr-4 text-foreground-secondary">{row.learners.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-foreground-secondary">{row.content}</td>
                    <td className="py-3 pr-4 text-foreground-secondary">{row.contributors}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${row.score}%`,
                              backgroundColor: row.score >= 70 ? "#16A34A" : row.score >= 50 ? "#D97706" : "#DC2626"
                            }}
                          />
                        </div>
                        <span className="text-xs text-foreground-muted w-8 shrink-0">{row.score}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        row.status === "Stable"     ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                        row.status === "Moderate"   ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                        row.status === "Vulnerable" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" :
                        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
