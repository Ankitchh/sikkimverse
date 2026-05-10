'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Search, Users, BookOpen, Mic, ChevronRight, Globe, Shield,
  ArrowUpDown, MapPin, Filter, X, Star, ArrowLeft, Loader2
} from 'lucide-react'

// ─── API community type ────────────────────────────────────────────────────────

interface ApiCommunity {
  id: string
  name: string
  slug: string
  description: string
  colorPrimary: string
  colorSecondary: string
  region: string
  totalSpeakers: number
  preservationScore: number
  speakerCount: number
  languageCount: number
  lessonCount: number
  storyCount: number
  songCount: number
}

// ─── Static cultural metadata (icons + language names are known facts) ─────────

const COMMUNITY_ICONS: Record<string, string> = {
  lepcha: '🌿', bhutia: '🏔️', limbu: '🎋', tamang: '🐎',
  rai: '🏺', gurung: '🎵', sherpa: '⛰️', mangar: '🦅',
  newar: '🏛️', sunwar: '🌄',
}

const COMMUNITY_LANGUAGES: Record<string, string[]> = {
  lepcha: ['Róng / Lepcha'],
  bhutia: ['Drenjongke', 'Sikkimese'],
  limbu: ['Yakthung Pan', 'Sirijonga'],
  tamang: ['Tamang', 'Taman Kyeke'],
  rai: ['Bantawa', 'Chamling', 'Kulung'],
  gurung: ['Tamu Kyui'],
  sherpa: ['Sherpali'],
  mangar: ['Magar'],
  newar: ['Nepal Bhasa'],
  sunwar: ['Koĩts-Sunwar'],
}

const COMMUNITY_LANGUAGE_FAMILY: Record<string, string> = {
  lepcha: 'tibeto-burman', bhutia: 'tibeto-burman', limbu: 'kiratic',
  tamang: 'tibeto-burman', rai: 'kiratic', gurung: 'tibeto-burman',
  sherpa: 'tibeto-burman', mangar: 'tibeto-burman', newar: 'newari', sunwar: 'tibeto-burman',
}

function getEndangermentLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Safe', color: '#16A34A' }
  if (score >= 60) return { label: 'Vulnerable', color: '#D97706' }
  if (score >= 40) return { label: 'Threatened', color: '#EA580C' }
  return { label: 'Endangered', color: '#DC2626' }
}

// ─── Sort / Filter options ─────────────────────────────────────────────────────

type SortKey = 'name' | 'speakers' | 'preservationScore'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Alphabetical' },
  { key: 'preservationScore', label: 'Preservation Score' },
  { key: 'speakers', label: 'Speaker Count' },
]

const LANGUAGE_FAMILIES = [
  { value: '', label: 'All Language Families' },
  { value: 'tibeto-burman', label: 'Tibeto-Burman' },
  { value: 'kiratic', label: 'Kiratic' },
  { value: 'newari', label: 'Newari' },
]

const PRESERVATION_LEVELS = [
  { value: '', label: 'All Preservation Levels' },
  { value: 'high', label: 'High (60%+)' },
  { value: 'medium', label: 'Medium (40–60%)' },
  { value: 'low', label: 'Low (<40%)' },
]

// ─── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden animate-pulse" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="h-1 w-full bg-white/10" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-3 w-32 bg-white/10 rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/10 rounded" />
          <div className="h-3 w-3/4 bg-white/10 rounded" />
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-white/10 rounded-xl" />)}
        </div>
      </div>
    </div>
  )
}

// ─── Community Card ────────────────────────────────────────────────────────────

function CommunityCard({ community, index }: { community: ApiCommunity; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const icon = COMMUNITY_ICONS[community.slug] ?? '🌐'
  const languages = COMMUNITY_LANGUAGES[community.slug] ?? []
  const endangerment = getEndangermentLabel(community.preservationScore)
  const speakerStr = community.totalSpeakers >= 1_000_000
    ? `${(community.totalSpeakers / 1_000_000).toFixed(1)}M`
    : community.totalSpeakers >= 1000
      ? `${Math.round(community.totalSpeakers / 1000)}K`
      : community.totalSpeakers.toString()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 6) * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/communities/${community.slug}`}>
        <motion.div
          whileHover={{ scale: 1.02, y: -6 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative rounded-3xl overflow-hidden cursor-pointer group"
          style={{
            background: `linear-gradient(145deg, ${community.colorPrimary}18, ${community.colorSecondary}30)`,
            border: `1px solid ${community.colorPrimary}28`,
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `radial-gradient(circle at 50% 0%, ${community.colorPrimary}18, transparent 65%)` }} />
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${community.colorPrimary}, ${community.colorSecondary})` }} />

          <div className="relative z-10 p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: `${community.colorPrimary}20` }}>
                  {icon}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{community.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-white/40 mt-0.5">
                    <MapPin size={10} />{community.region}
                  </div>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: `${community.colorPrimary}20`, color: community.colorPrimary, border: `1px solid ${community.colorPrimary}30` }}>
                {endangerment.label}
              </span>
            </div>

            <p className="text-sm text-white/50 leading-relaxed mb-5 line-clamp-2">{community.description}</p>

            {languages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {languages.map(lang => (
                  <span key={lang} className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}>
                    {lang}
                  </span>
                ))}
              </div>
            )}

            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-white/40 flex items-center gap-1"><Shield size={10} />Preservation Score</span>
                <span className="text-sm font-black" style={{ color: community.colorPrimary }}>{community.preservationScore}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${community.preservationScore}%` } : {}}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${community.colorPrimary}, ${community.colorSecondary})` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { icon: Users, value: speakerStr, label: 'Speakers' },
                { icon: BookOpen, value: community.lessonCount.toString(), label: 'Lessons' },
                { icon: Mic, value: community.storyCount.toString(), label: 'Stories' },
              ].map(stat => (
                <div key={stat.label} className="text-center p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="flex justify-center mb-1"><stat.icon size={12} style={{ color: community.colorPrimary }} /></div>
                  <div className="text-sm font-black text-white">{stat.value}</div>
                  <div className="text-[10px] text-white/35">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={10}
                    fill={j < Math.round(community.preservationScore / 20) ? community.colorPrimary : 'transparent'}
                    style={{ color: j < Math.round(community.preservationScore / 20) ? community.colorPrimary : 'rgba(255,255,255,0.15)' }} />
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" style={{ color: community.colorPrimary }}>
                Explore community<ChevronRight size={14} />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

// ─── Communities Page ─────────────────────────────────────────────────────────

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<ApiCommunity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [regionFilter, setRegionFilter] = useState('')
  const [preservationFilter, setPreservationFilter] = useState('')
  const [languageFamilyFilter, setLanguageFamilyFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetch('/api/communities?limit=50')
      .then(r => r.ok ? r.json() as Promise<{ data: ApiCommunity[] }> : Promise.resolve({ data: [] }))
      .then(({ data }) => { setCommunities(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const regions = useMemo(() => [...new Set(communities.map(c => c.region))].sort(), [communities])

  const filtered = useMemo(() => {
    let list = [...communities]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
      )
    }
    if (regionFilter) list = list.filter(c => c.region === regionFilter)
    if (preservationFilter === 'high') list = list.filter(c => c.preservationScore >= 60)
    else if (preservationFilter === 'medium') list = list.filter(c => c.preservationScore >= 40 && c.preservationScore < 60)
    else if (preservationFilter === 'low') list = list.filter(c => c.preservationScore < 40)
    if (languageFamilyFilter) list = list.filter(c => COMMUNITY_LANGUAGE_FAMILY[c.slug] === languageFamilyFilter)
    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'speakers') cmp = a.totalSpeakers - b.totalSpeakers
      else if (sortKey === 'preservationScore') cmp = a.preservationScore - b.preservationScore
      return sortAsc ? cmp : -cmp
    })
    return list
  }, [communities, searchQuery, sortKey, sortAsc, regionFilter, preservationFilter, languageFamilyFilter])

  const activeFilterCount = [regionFilter, preservationFilter, languageFamilyFilter].filter(Boolean).length
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p)
    else { setSortKey(key); setSortAsc(true) }
  }

  return (
    <main className="min-h-screen bg-[#0a0f0d] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(10,15,13,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #16A34A, #1E3A5F)' }}>🏔️</div>
          <span className="font-bold text-lg tracking-tight">SIKKIMVERSE</span>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
          <ArrowLeft size={14} />Home
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1f15 0%, #0d1a2e 100%)' }}>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-15"
          style={{ background: 'radial-gradient(circle, #16A34A, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #1E3A5F, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', color: '#4ADE80' }}>
            <Globe size={12} />
            {loading ? '…' : `${communities.length} Communities · 15+ Languages`}
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
            Discover the Communities
            <br />
            <span style={{ background: 'linear-gradient(135deg, #4ADE80, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              of Sikkim
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            Each community carries centuries of wisdom, ritual, and language. Explore, learn, and contribute to their preservation.
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-40 px-6 py-4" style={{ background: 'rgba(10,15,13,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]" style={{ maxWidth: 340 }}>
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search communities…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }} />
            </div>

            {/* Sort */}
            <div className="flex gap-1">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => toggleSort(opt.key)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: sortKey === opt.key ? 'rgba(22,163,74,0.2)' : 'rgba(255,255,255,0.04)',
                    color: sortKey === opt.key ? '#4ADE80' : 'rgba(255,255,255,0.45)',
                    border: `1px solid ${sortKey === opt.key ? 'rgba(22,163,74,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                  <ArrowUpDown size={11} />{opt.label}
                </button>
              ))}
            </div>

            {/* Filter toggle */}
            <button onClick={() => setShowFilters(p => !p)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all relative"
              style={{
                background: showFilters || activeFilterCount > 0 ? 'rgba(22,163,74,0.2)' : 'rgba(255,255,255,0.04)',
                color: showFilters || activeFilterCount > 0 ? '#4ADE80' : 'rgba(255,255,255,0.45)',
                border: `1px solid ${showFilters || activeFilterCount > 0 ? 'rgba(22,163,74,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <Filter size={11} />Filters{activeFilterCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: '#16A34A', color: '#fff' }}>{activeFilterCount}</span>}
            </button>

            {activeFilterCount > 0 && (
              <button onClick={() => { setRegionFilter(''); setPreservationFilter(''); setLanguageFamilyFilter('') }}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
                <X size={12} />Clear
              </button>
            )}

            <span className="ml-auto text-xs text-white/30">{loading ? '…' : `${filtered.length} communities`}</span>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3 flex gap-3 flex-wrap">
                {[
                  { label: 'Region', value: regionFilter, setValue: setRegionFilter, options: [{ value: '', label: 'All Regions' }, ...regions.map(r => ({ value: r, label: r }))] },
                  { label: 'Preservation', value: preservationFilter, setValue: setPreservationFilter, options: PRESERVATION_LEVELS },
                  { label: 'Language Family', value: languageFamilyFilter, setValue: setLanguageFamilyFilter, options: LANGUAGE_FAMILIES },
                ].map(sel => (
                  <select key={sel.label} value={sel.value} onChange={e => sel.setValue(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                    {sel.options.map(o => <option key={o.value} value={o.value} style={{ background: '#1a2620' }}>{o.label}</option>)}
                  </select>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-white/40 text-lg">No communities match your search</p>
              <button onClick={() => { setSearchQuery(''); setRegionFilter(''); setPreservationFilter(''); setLanguageFamilyFilter('') }}
                className="mt-4 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">Clear all filters</button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((c, i) => <CommunityCard key={c.id} community={c} index={i} />)}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  )
}
