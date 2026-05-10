"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Eye, Clock, AlertTriangle, Filter, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type ContentType = "all" | "WORD" | "STORY" | "SONG" | "RECORDING" | "VIDEO";

interface SubmissionItem {
  id: string;
  type: 'WORD' | 'STORY' | 'SONG' | 'RECORDING' | 'VIDEO';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  community: { id: string; name: string; slug: string; colorPrimary: string } | null;
  contributor: { id: string; name: string | null; image: string | null; email: string } | null;
}

const GUIDELINES = [
  "Content must be authentic and from contributor's community",
  "Audio recordings must be clear — reject if unintelligible",
  "Transcriptions must match spoken content",
  "Sacred/sensitive content: mark as restricted, don't reject",
  "Duplicate content: reject with explanation and link to original",
  "When in doubt — consult the Community President",
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? 's' : ''} ago`;
}

export default function ModeratorDashboard() {
  const [queue, setQueue] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<ContentType>("all");
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejReason, setRejReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewedCount, setReviewedCount] = useState(0);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/submissions?status=PENDING&limit=30');
      if (!res.ok) return;
      const data = await res.json();
      setQueue(data.data ?? []);
    } catch (err) {
      console.error('[ModeratorDashboard] Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  const approve = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/submissions/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      if (res.ok) {
        setQueue(q => q.filter(item => item.id !== id));
        setReviewedCount(c => c + 1);
        setPreviewing(null);
      }
    } catch {
    } finally {
      setActionLoading(null);
    }
  };

  const reject = async (id: string) => {
    if (!rejReason.trim()) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/submissions/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', rejectionReason: rejReason.trim() }),
      });
      if (res.ok) {
        setQueue(q => q.filter(item => item.id !== id));
        setReviewedCount(c => c + 1);
        setRejecting(null);
        setRejReason("");
      }
    } catch {
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = typeFilter === "all"
    ? queue
    : queue.filter(q => q.type === typeFilter);

  const pending = queue.length;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-8 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Moderator Panel</p>
            <h1 className="text-xl font-bold text-white">Content Review Queue</h1>
            <p className="text-slate-400 text-sm mt-0.5">Review and approve community submissions</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-amber-400">{pending}</p>
                <p className="text-slate-400 text-xs">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{reviewedCount}</p>
                <p className="text-slate-400 text-xs">Reviewed</p>
              </div>
            </div>
            <button
              onClick={loadQueue}
              disabled={loading}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending",        value: pending,        color: "text-amber-500", icon: Clock },
            { label: "Reviewed Today", value: reviewedCount,  color: "text-green-500", icon: CheckCircle2 },
            { label: "Total in Queue", value: queue.length,   color: "text-blue-500",  icon: Filter },
          ].map((s, i) => (
            <div key={i} className="bg-background-secondary rounded-xl p-4 border border-border flex items-center gap-3">
              <s.icon className={cn("w-5 h-5 shrink-0", s.color)} />
              <div>
                <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                <p className="text-xs text-foreground-muted">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-foreground-muted shrink-0 mt-1" />
          {(["all","WORD","STORY","SONG","RECORDING","VIDEO"] as ContentType[]).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                typeFilter === t ? "bg-primary text-white" : "bg-background-secondary border border-border text-foreground-muted hover:text-foreground"
              )}>
              {t === "all" ? "All Types" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Queue */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-background-secondary rounded-2xl border border-border p-5 animate-pulse">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-gray-200 rounded-full" />
                      <div className="h-5 w-20 bg-gray-200 rounded-full" />
                    </div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-1/3 bg-gray-200 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 w-20 bg-gray-200 rounded-lg" />
                    <div className="h-8 w-20 bg-gray-200 rounded-lg" />
                    <div className="h-8 w-20 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-background-secondary rounded-2xl border border-border">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-foreground">Queue is empty!</p>
              <p className="text-sm text-foreground-muted mt-1">
                {typeFilter !== 'all' ? 'No pending submissions of this type' : 'All submissions reviewed'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50, height: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-background-secondary rounded-2xl border border-border p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium capitalize">
                          {item.type.charAt(0) + item.type.slice(1).toLowerCase()}
                        </span>
                        {item.community && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                            style={{ backgroundColor: item.community.colorPrimary + 'cc' }}
                          >
                            {item.community.name}
                          </span>
                        )}
                        <span className="text-xs text-foreground-muted">{timeAgo(item.submittedAt)}</span>
                      </div>
                      <h3 className="font-semibold text-foreground">
                        {item.type.charAt(0) + item.type.slice(1).toLowerCase()} submission
                        {item.community ? ` — ${item.community.name}` : ''}
                      </h3>
                      <p className="text-xs text-foreground-muted mt-0.5">
                        by {item.contributor?.name ?? item.contributor?.email ?? 'Unknown'}
                      </p>
                      {previewing === item.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          className="mt-3 p-3 bg-background-tertiary rounded-xl border border-border">
                          <p className="text-xs text-foreground-muted">Submission ID: {item.id}</p>
                          <p className="text-xs text-foreground-muted mt-1">
                            Submitted {new Date(item.submittedAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-foreground-muted mt-1">
                            Contributor: {item.contributor?.email ?? 'Unknown'}
                          </p>
                        </motion.div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => setPreviewing(previewing === item.id ? null : item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-border text-foreground-muted hover:text-foreground rounded-lg text-xs font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                      <button
                        onClick={() => approve(item.id)}
                        disabled={actionLoading === item.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {actionLoading === item.id ? '…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => setRejecting(rejecting === item.id ? null : item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>

                  {rejecting === item.id && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <input
                        value={rejReason}
                        onChange={e => setRejReason(e.target.value)}
                        placeholder="Provide a reason to help the contributor improve… (min 10 chars)"
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-red-400 mb-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => reject(item.id)}
                          disabled={rejReason.trim().length < 10 || actionLoading === item.id}
                          className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors"
                        >
                          {actionLoading === item.id ? 'Rejecting…' : 'Confirm Rejection'}
                        </button>
                        <button
                          onClick={() => { setRejecting(null); setRejReason(""); }}
                          className="px-4 py-2 border border-border text-foreground-muted rounded-xl text-xs font-medium hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Guidelines */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
          <h2 className="font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Moderation Guidelines
          </h2>
          <ul className="space-y-1.5">
            {GUIDELINES.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
