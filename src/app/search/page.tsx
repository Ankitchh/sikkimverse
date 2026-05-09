"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, TrendingUp, BookOpen, Users, FileText, Music, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ResultType = "all" | "communities" | "courses" | "stories" | "songs" | "words";

const RECENT = ["Lepcha script", "Bhutia folk songs", "Losoong festival", "Tamang language"];

const ALL_RESULTS = [
  { type: "community", title: "Lepcha Community", subtitle: "30,000 speakers · North & West Sikkim", href: "/communities/lepcha", icon: "🌿" },
  { type: "community", title: "Bhutia Community", subtitle: "45,000 speakers · East & North Sikkim", href: "/communities/bhutia", icon: "🏔️" },
  { type: "course",    title: "Lepcha Beginners",  subtitle: "20 lessons · Beginner · 500 enrolled", href: "/learn/lepcha-beginners", icon: "📚" },
  { type: "course",    title: "Bhutia Essentials", subtitle: "15 lessons · Beginner · 320 enrolled", href: "/learn/bhutia-essentials", icon: "📚" },
  { type: "story",     title: "The Legend of Mayel Lyang", subtitle: "Lepcha · Folk tale · 8 min read", href: "/archive", icon: "📜" },
  { type: "story",     title: "Tashiding Monastery Stories", subtitle: "Bhutia · History · 5 min read", href: "/archive", icon: "📜" },
  { type: "song",      title: "Lepcha Creation Song", subtitle: "Lepcha · Traditional · 3:42", href: "/archive", icon: "🎵" },
  { type: "song",      title: "Limbu Warrior Ballad", subtitle: "Limbu · Folk · 4:20", href: "/archive", icon: "🎵" },
  { type: "word",      title: "Rum (Nature/God)",  subtitle: "Lepcha · Noun · Listen pronunciation", href: "/practice/voice", icon: "🔤" },
  { type: "word",      title: "Tashi Delek",       subtitle: "Bhutia · Greeting · Auspicious wishes", href: "/practice/voice", icon: "🔤" },
];

const TYPE_ICONS: Record<string, React.ComponentType<{className?: string}>> = {
  community: Globe, course: BookOpen, story: FileText, song: Music, word: TrendingUp
};

const TABS: { id: ResultType; label: string }[] = [
  { id: "all",         label: "All" },
  { id: "communities", label: "Communities" },
  { id: "courses",     label: "Courses" },
  { id: "stories",     label: "Stories" },
  { id: "songs",       label: "Songs" },
  { id: "words",       label: "Words" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<ResultType>("all");
  const [results, setResults] = useState<typeof ALL_RESULTS>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    setTimeout(() => {
      const filtered = ALL_RESULTS.filter(r =>
        r.title.toLowerCase().includes(q.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(q.toLowerCase())
      );
      setResults(filtered);
      setLoading(false);
    }, 350);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const filtered = tab === "all" ? results : results.filter(r => {
    const map: Record<ResultType, string> = { all: "", communities: "community", courses: "course", stories: "story", songs: "song", words: "word" };
    return r.type === map[tab];
  });

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search communities, courses, stories, songs…"
            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-border bg-background-secondary text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary text-base shadow-sm"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-border">
              <X className="w-4 h-4 text-foreground-muted" />
            </button>
          )}
        </div>

        {/* Empty state — show recents */}
        {!query && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Recent Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {RECENT.map((r) => (
                  <button
                    key={r}
                    onClick={() => setQuery(r)}
                    className="px-3 py-1.5 bg-background-secondary border border-border rounded-full text-sm text-foreground hover:border-primary/40 transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" /> Trending
              </p>
              <div className="space-y-1">
                {ALL_RESULTS.slice(0, 5).map((r) => {
                  const Icon = TYPE_ICONS[r.type] ?? Globe;
                  return (
                    <Link
                      key={r.title}
                      href={r.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-background-secondary transition-colors group"
                    >
                      <span className="text-xl">{r.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">{r.title}</p>
                        <p className="text-xs text-foreground-muted truncate">{r.subtitle}</p>
                      </div>
                      <Icon className="w-4 h-4 text-foreground-muted shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {query && (
          <AnimatePresence mode="wait">
            <motion.div
              key={query + tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                      tab === t.id
                        ? "bg-primary text-white"
                        : "bg-background-secondary text-foreground-muted hover:text-foreground border border-border"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-16 rounded-xl bg-background-secondary animate-pulse border border-border" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-foreground font-medium">No results for &quot;{query}&quot;</p>
                  <p className="text-sm text-foreground-muted mt-1">Try searching for a community, language, or story</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filtered.map((r, i) => {
                    const Icon = TYPE_ICONS[r.type] ?? Globe;
                    return (
                      <motion.div
                        key={r.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link
                          href={r.href}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-background-secondary transition-colors group border border-transparent hover:border-border"
                        >
                          <span className="text-2xl">{r.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary truncate">{r.title}</p>
                            <p className="text-xs text-foreground-muted truncate">{r.subtitle}</p>
                          </div>
                          <div className="flex items-center gap-1 text-foreground-muted text-xs shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                            <span className="capitalize">{r.type}</span>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
