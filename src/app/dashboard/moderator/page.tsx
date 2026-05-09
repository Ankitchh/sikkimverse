"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Eye, Clock, AlertTriangle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

type ContentType = "all" | "Word" | "Story" | "Song" | "Recording" | "Video";

const QUEUE = [
  { id: 1, title: "Lepcha Wedding Song",          type: "Song",      community: "Lepcha", contributor: "Rinchen N.", submitted: "45 min ago",  preview: "A traditional song sung during Lepcha weddings, performed by the eldest family member…" },
  { id: 2, title: "Bhutia Creation Myth Part II", type: "Story",     community: "Bhutia", contributor: "Sonam T.",   submitted: "2 hr ago",   preview: "Continuing from Part I, the snow lion descended from Khangchendzonga to…" },
  { id: 3, title: "Word: Damphu (drum)",           type: "Word",      community: "Tamang", contributor: "Pema Y.",    submitted: "3 hr ago",   preview: "Damphu — the traditional Tamang frame drum used in ceremonies. Pronunciation: dam-phu" },
  { id: 4, title: "Elder Karma's Oral History",    type: "Recording", community: "Sherpa", contributor: "Jigme W.",   submitted: "5 hr ago",   preview: "Recording of 78-year-old elder Karma Dorjee describing early life in Yuksam…" },
  { id: 5, title: "Limbu New Year Dance Song",     type: "Song",      community: "Limbu",  contributor: "Choden O.",  submitted: "1 day ago",  preview: "Traditional Tamu Lhosar song with original Sirijonga script lyrics…" },
  { id: 6, title: "Rai Shamanic Ritual",           type: "Video",     community: "Rai",    contributor: "Mingma N.",  submitted: "1 day ago",  preview: "15-minute video of the Phedangma performing the Sakela ritual blessing…" },
];

const HISTORY = [
  { title: "Bhutia Monastery Chant", type: "Recording", decision: "approved", time: "Yesterday" },
  { title: "Lepcha Forest Story",    type: "Story",     decision: "approved", time: "Yesterday" },
  { title: "Poor quality recording", type: "Word",      decision: "rejected", time: "2 days ago" },
  { title: "Gurung Harvest Song",    type: "Song",      decision: "approved", time: "2 days ago" },
];

const GUIDELINES = [
  "Content must be authentic and from contributor's community",
  "Audio recordings must be clear — reject if unintelligible",
  "Transcriptions must match spoken content",
  "Sacred/sensitive content: mark as restricted, don't reject",
  "Duplicate content: reject with explanation and link to original",
  "When in doubt — consult the Community President",
];

export default function ModeratorDashboard() {
  const [queue, setQueue] = useState(QUEUE);
  const [typeFilter, setTypeFilter] = useState<ContentType>("all");
  const [previewing, setPreviewing] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [rejReason, setRejReason] = useState("");

  const filtered = typeFilter === "all" ? queue : queue.filter(q => q.type === typeFilter);

  const approve = (id: number) => {
    setQueue(q => q.filter(item => item.id !== id));
    setPreviewing(null);
  };

  const reject = (id: number) => {
    setQueue(q => q.filter(item => item.id !== id));
    setRejecting(null);
    setRejReason("");
  };

  const approved = QUEUE.length - queue.length;
  const pending  = queue.length;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-8 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Moderator Panel</p>
            <h1 className="text-xl font-bold text-white">Content Review Queue</h1>
            <p className="text-slate-400 text-sm mt-0.5">Lepcha & Bhutia Community Moderator</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-amber-400">{pending}</p>
              <p className="text-slate-400 text-xs">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{approved}</p>
              <p className="text-slate-400 text-xs">Reviewed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending",       value: pending,  color: "text-amber-500", icon: Clock },
            { label: "Approved Today",value: 8,        color: "text-green-500", icon: CheckCircle2 },
            { label: "Rejected Today",value: 2,        color: "text-red-500",   icon: XCircle },
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
          {(["all","Word","Story","Song","Recording","Video"] as ContentType[]).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                typeFilter === t ? "bg-primary text-white" : "bg-background-secondary border border-border text-foreground-muted hover:text-foreground"
              )}>
              {t === "all" ? "All Types" : t}
            </button>
          ))}
        </div>

        {/* Queue */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 bg-background-secondary rounded-2xl border border-border">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-foreground">Queue is empty!</p>
              <p className="text-sm text-foreground-muted mt-1">All submissions reviewed</p>
            </div>
          )}

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
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{item.type}</span>
                      <span className="text-xs px-2 py-0.5 bg-background-tertiary border border-border rounded-full text-foreground-muted">{item.community}</span>
                      <span className="text-xs text-foreground-muted">{item.submitted}</span>
                    </div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-foreground-muted mt-0.5">by {item.contributor}</p>
                    {previewing === item.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        className="mt-3 p-3 bg-background-tertiary rounded-xl border border-border">
                        <p className="text-sm text-foreground-secondary leading-relaxed">{item.preview}</p>
                      </motion.div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => setPreviewing(previewing === item.id ? null : item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-border text-foreground-muted hover:text-foreground rounded-lg text-xs font-medium transition-colors">
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button onClick={() => approve(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => setRejecting(rejecting === item.id ? null : item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>

                {rejecting === item.id && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <input value={rejReason} onChange={e => setRejReason(e.target.value)}
                      placeholder="Provide a reason to help the contributor improve…"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-red-400 mb-2"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => reject(item.id)} disabled={!rejReason.trim()}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors">
                        Confirm Rejection
                      </button>
                      <button onClick={() => { setRejecting(null); setRejReason(""); }}
                        className="px-4 py-2 border border-border text-foreground-muted rounded-xl text-xs font-medium hover:text-foreground transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Review History */}
        <div className="bg-background-secondary rounded-2xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-4">Recent Decisions</h2>
          <div className="space-y-3">
            {HISTORY.map((h, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className={cn("p-1.5 rounded-lg", h.decision === "approved" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30")}>
                  {h.decision === "approved"
                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                    : <XCircle className="w-4 h-4 text-red-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{h.title}</p>
                  <p className="text-xs text-foreground-muted">{h.type} · {h.time}</p>
                </div>
                <span className={cn("text-xs font-semibold capitalize", h.decision === "approved" ? "text-green-500" : "text-red-500")}>
                  {h.decision}
                </span>
              </div>
            ))}
          </div>
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
