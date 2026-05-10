"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, BookOpen, Music, Video, Camera, Radio, Upload, CheckCircle2, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ContribType = "word" | "story" | "song" | "video" | "photo" | "oral";

const TYPES: { id: ContribType; icon: React.ComponentType<{className?: string}>; label: string; desc: string; color: string }[] = [
  { id: "word",  icon: Mic,     label: "Teach a Word",    desc: "Record pronunciation + meaning",     color: "bg-emerald-500" },
  { id: "story", icon: BookOpen, label: "Share a Story",  desc: "Folk tales, legends, history",       color: "bg-blue-500" },
  { id: "song",  icon: Music,   label: "Upload a Song",   desc: "Traditional songs with lyrics",      color: "bg-purple-500" },
  { id: "video", icon: Video,   label: "Record a Video",  desc: "Cultural practices, rituals",        color: "bg-red-500" },
  { id: "photo", icon: Camera,  label: "Share a Photo",   desc: "Cultural attire, festivals, art",    color: "bg-amber-500" },
  { id: "oral",  icon: Radio,   label: "Oral History",    desc: "Elder stories, community memories",  color: "bg-teal-500" },
];

const LANGUAGES = ["Lepcha (Róng)","Sikkimese (Drenjongke)","Limbu (Sirijonga)","Tamang","Rai (various)","Gurung","Sherpa","Mangar","Newari","Sunwar"];

export default function ContributePage() {
  const [selected, setSelected] = useState<ContribType | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/communities?limit=50')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data?.data)) {
          setCommunities(data.data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a5c3a] via-[#1e4a8c] to-[#4A235A] pt-16 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 70%, white 1px, transparent 1px), radial-gradient(circle at 70% 30%, white 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <p className="text-white/70 text-sm font-medium mb-2">🌿 Community Contribution</p>
          <h1 className="text-4xl font-bold text-white">Share Your Heritage<br />With the World</h1>
          <p className="text-white/80 mt-3 max-w-lg mx-auto text-sm leading-relaxed">
            Every word, story, and song you contribute is preserved forever.<br />
            Help keep Sikkim&apos;s living languages alive for future generations.
          </p>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 space-y-8">
        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-secondary rounded-2xl p-5 border border-border"
        >
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            How It Works
          </h2>
          <div className="flex items-start gap-0">
            {[
              { step: "1", label: "You Submit",    desc: "Upload your content — words, stories, songs, or recordings" },
              { step: "2", label: "We Review",     desc: "Community moderators and linguists review within 48h" },
              { step: "3", label: "Goes Live",     desc: "Approved content is published to the archive and lessons" },
            ].map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center text-center px-2">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {s.step}
                </div>
                {i < 2 && <div className="absolute" />}
                <p className="font-medium text-foreground text-sm mt-2">{s.label}</p>
                <p className="text-xs text-foreground-muted mt-1 leading-tight">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Success state */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground">Submission Received!</h3>
              <p className="text-sm text-foreground-muted mt-1 mb-4">
                Thank you! Your contribution will be reviewed within 48 hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setSelected(null); }}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
              >
                Submit Another
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!submitted && (
          <>
            {/* Type selection */}
            <div>
              <h2 className="font-semibold text-foreground mb-4">What would you like to contribute?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TYPES.map((t) => (
                  <motion.button
                    key={t.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelected(t.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                      selected === t.id
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border bg-background-secondary hover:border-primary/30"
                    )}
                  >
                    <div className={cn("p-2.5 rounded-xl text-white", t.color)}>
                      <t.icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{t.label}</p>
                    <p className="text-xs text-foreground-muted text-center leading-tight">{t.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Form */}
            <AnimatePresence>
              {selected && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmit}
                  className="bg-background-secondary rounded-2xl border border-border p-5 space-y-4 overflow-hidden"
                >
                  <h3 className="font-semibold text-foreground capitalize">
                    {TYPES.find(t => t.id === selected)?.label}
                  </h3>

                  {/* Community + Language */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-foreground-muted block mb-1.5">Community</label>
                      <select required className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary">
                        <option value="">Select…</option>
                        {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground-muted block mb-1.5">Language</label>
                      <select required className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary">
                        <option value="">Select…</option>
                        {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-xs font-medium text-foreground-muted block mb-1.5">
                      {selected === "word" ? "Word / Phrase" : "Title"}
                    </label>
                    <input
                      required
                      type="text"
                      placeholder={selected === "word" ? "e.g. Rum (Spirit of Nature)" : "Enter a descriptive title"}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Content area */}
                  {(selected === "story" || selected === "oral") && (
                    <div>
                      <label className="text-xs font-medium text-foreground-muted block mb-1.5">Content / Transcription</label>
                      <textarea
                        rows={5}
                        placeholder="Write the story or transcription here…"
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground resize-none focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}

                  {selected === "song" && (
                    <div>
                      <label className="text-xs font-medium text-foreground-muted block mb-1.5">Lyrics</label>
                      <textarea
                        rows={4}
                        placeholder="Traditional lyrics (in original script or transliteration)…"
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground resize-none focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}

                  {selected === "word" && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-foreground-muted block mb-1.5">Meaning / Definition</label>
                        <input type="text" placeholder="What does it mean?" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground-muted block mb-1.5">Example Sentence</label>
                        <input type="text" placeholder="Use the word in a sentence" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary" />
                      </div>
                    </>
                  )}

                  {/* File upload */}
                  {(selected !== "story") && (
                    <div>
                      <label className="text-xs font-medium text-foreground-muted block mb-1.5">
                        {selected === "word" || selected === "song" || selected === "oral" ? "Audio File" : selected === "video" ? "Video File" : "Image File"}
                      </label>
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
                        className={cn(
                          "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer",
                          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        )}
                      >
                        <Upload className="w-6 h-6 text-foreground-muted mx-auto mb-2" />
                        <p className="text-sm text-foreground-muted">
                          Drag & drop or <span className="text-primary font-medium">browse</span>
                        </p>
                        <p className="text-xs text-foreground-muted mt-1">
                          {selected === "video" ? "MP4, WebM · max 500MB" : selected === "photo" ? "JPG, PNG, WebP · max 10MB" : "MP3, WAV, OGG · max 50MB"}
                        </p>
                        <input type="file" className="hidden" />
                      </div>
                    </div>
                  )}

                  {/* Consent */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" required className="mt-0.5 accent-primary" />
                    <span className="text-xs text-foreground-muted leading-relaxed">
                      I confirm this content belongs to my community&apos;s cultural heritage and I give SIKKIMVERSE permission to preserve and share it for educational purposes.
                    </span>
                  </label>

                  <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors flex items-center justify-center gap-2">
                    Submit for Review
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Guidelines */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-3">Contributor Guidelines</h3>
          <ul className="space-y-1.5 text-sm text-amber-700 dark:text-amber-400">
            {[
              "Contributions must be from your own community's traditions",
              "Audio recordings should be clear and free from background noise",
              "All content goes through moderation before publishing (24-48h)",
              "Sensitive sacred content will be marked appropriately",
              "You retain cultural ownership — we only preserve and share",
            ].map((g, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">•</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
