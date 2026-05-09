'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Search, Users, BookOpen, Mic, ChevronRight, Globe, Shield,
  ArrowUpDown, MapPin, Filter, X, Star, TrendingUp, ArrowLeft
} from 'lucide-react'
import { COMMUNITIES, ENDANGERMENT_LEVELS, SIKKIM_REGIONS } from '@/lib/constants'

// ─── Sort options ─────────────────────────────────────────────────────────────

type SortKey = 'name' | 'speakers' | 'preservationScore'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Alphabetical' },
  { key: 'preservationScore', label: 'Preservation Score' },
  { key: 'speakers', label: 'Speaker Count' },
]

// ─── Filter options ───────────────────────────────────────────────────────────

const LANGUAGE_FAMILIES = [
  { value: '', label: 'All Language Families' },
  { value: 'tibeto-burman', label: 'Tibeto-Burman' },
  { value: 'kiratic', label: 'Kiratic' },
  { value: 'newari', label: 'Newari' },
]

const PRESERVATION_LEVELS = [
  { value: '', label: 'All Preservation Levels' },
  { value: 'high', label: 'High (60%+)' },
  { value: 'medium', label: 'Medium (40-60%)' },
  { value: 'low', label: 'Low (<40%)' },
]

// Map communities to language families (rough categorisation)
const COMMUNITY_LANGUAGE_FAMILY: Record<string, string> = {
  lepcha: 'tibeto-burman',
  bhutia: 'tibeto-burman',
  limbu: 'kiratic',
  tamang: 'tibeto-burman',
  rai: 'kiratic',
  gurung: 'tibeto-burman',
  sherpa: 'tibeto-burman',
  mangar: 'tibeto-burman',
  newar: 'newari',
  sunwar: 'tibeto-burman',
}

// Simulated per-community lesson counts and contributor counts
const COMMUNITY_META: Record<string, { lessons: number; contributors: number; stories: number }> = {
  lepcha: { lessons: 42, contributors: 38, stories: 26 },
  bhutia: { lessons: 56, contributors: 52, stories: 34 },
  limbu: { lessons: 38, contributors: 29, stories: 19 },
  tamang: { lessons: 61, contributors: 74, stories: 41 },
  rai: { lessons: 29, contributors: 22, stories: 17 },
  gurung: { lessons: 33, contributors: 19, stories: 15 },
  sherpa: { lessons: 44, contributors: 31, stories: 22 },
  mangar: { lessons: 21, contributors: 16, stories: 11 },
  newar: { lessons: 67, contributors: 88, stories: 53 },
  sunwar: { lessons: 14, contributors: 9, stories: 7 },
}

// ─── Community Card (full) ────────────────────────────────────────────────────

function CommunityCard({ community, index }: { community: typeof COMMUNITIES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const meta = COMMUNITY_META[community.slug]
  const endangerment = ENDANGERMENT_LEVELS[community.endangermentLevel]

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
          {/* Hover glow */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${community.colorPrimary}18, transparent 65%)`,
            }}
          />

          {/* Top accent bar */}
          <div
            className="h-1 w-full"
            style={{
              background: `linear-gradient(90deg, ${community.colorPrimary}, ${community.colorSecondary})`,
            }}
          />

          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: `${community.colorPrimary}20` }}
                >
                  {community.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{community.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-white/40 mt-0.5">
                    <MapPin size={10} />
                    {community.region}
                  </div>
                </div>
              </div>

              {/* Endangerment badge */}
              <span
                className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{
                  background: `${community.colorPrimary}20`,
                  color: community.colorPrimary,
                  border: `1px solid ${community.colorPrimary}30`,
                }}
              >
                {endangerment.label}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-white/50 leading-relaxed mb-5 line-clamp-2">
              {community.description}
            </p>

            {/* Languages */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {community.languages.map(lang => (
                <span
                  key={lang}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.55)',
                  }}
                >
                  {lang}
                </span>
              ))}
            </div>

            {/* Preservation score */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-white/40 flex items-center gap-1">
                  <Shield size={10} />
                  Preservation Score
                </span>
                <span className="text-sm font-black" style={{ color: community.colorPrimary }}>
                  {community.preservationScore}%
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${community.preservationScore}%` } : {}}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${community.colorPrimary}, ${community.colorSecondary})`,
                  }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                {
                  icon: Users,
                  value:
                    community.totalSpeakers >= 1000000
                      ? `${(community.totalSpeakers / 1000000).toFixed(1)}M`
                      : community.totalSpeakers >= 1000
                        ? `${Math.round(community.totalSpeakers / 1000)}K`
                        : community.totalSpeakers.toString(),
                  label: 'Speakers',
                },
                { icon: BookOpen, value: meta.lessons.toString(), label: 'Lessons' },
                { icon: Mic, value: meta.contributors.toString(), label: 'Contributors' },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="text-center p-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="flex justify-center mb-1">
                    <stat.icon size={12} style={{ color: community.colorPrimary }} />
                  </div>
                  <div className="text-sm font-black text-white">{stat.value}</div>
                  <div className="text-[10px] text-white/35">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div
              className="flex items-center justify-between pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    size={10}
                    fill={
                      j < Math.round(community.preservationScore / 20)
                        ? community.colorPrimary
                        : 'transparent'
                    }
                    style={{
                      color:
                        j < Math.round(community.preservationScore / 20)
                          ? community.colorPrimary
                          : 'rgba(255,255,255,0.15)',
                    }}
                  />
                ))}
              </div>
              <div
                className="flex items-center gap-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
                style={{ color: community.colorPrimary }}
              >
                Explore community
                <ChevronRight size={14} />
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
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [regionFilter, setRegionFilter] = useState('')
  const [preservationFilter, setPreservationFilter] = useState('')
  const [languageFamilyFilter, setLanguageFamilyFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let list = [...COMMUNITIES]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.languages.some(l => l.toLowerCase().includes(q)) ||
          c.region.toLowerCase().includes(q),
      )
    }

    // Region filter
    if (regionFilter) {
      list = list.filter(c => c.region === regionFilter)
    }

    // Preservation filter
    if (preservationFilter === 'high') {
      list = list.filter(c => c.preservationScore >= 60)
    } else if (preservationFilter === 'medium') {
      list = list.filter(c => c.preservationScore >= 40 && c.preservationScore < 60)
    } else if (preservationFilter === 'low') {
      list = list.filter(c => c.preservationScore < 40)
    }

    // Language family filter
    if (languageFamilyFilter) {
      list = list.filter(c => COMMUNITY_LANGUAGE_FAMILY[c.slug] === languageFamilyFilter)
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'speakers') cmp = a.totalSpeakers - b.totalSpeakers
      else if (sortKey === 'preservationScore') cmp = a.preservationScore - b.preservationScore
      return sortAsc ? cmp : -cmp
    })

    return list
  }, [searchQuery, sortKey, sortAsc, regionFilter, preservationFilter, languageFamilyFilter])

  const activeFilterCount = [regionFilter, preservationFilter, languageFamilyFilter].filter(Boolean).length

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p)
    else { setSortKey(key); setSortAsc(true) }
  }

  return (
    <main className="min-h-screen bg-[#0a0f0d] text-white">

      {/* ── Nav ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: 'rgba(10,15,13,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #16A34A, #1E3A5F)' }}
          >
            🏔️
          </div>
          <span className="font-bold text-lg tracking-tight">SIKKIMVERSE</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Home
        </Link>
      </nav>

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section
        className="relative pt-36 pb-20 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1f15 0%, #0d1a2e 100%)' }}
      >
        {/* Orbs */}
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-15"
          style={{
            background: 'radial-gradient(circle, #16A34A, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none opacity-10"
          style={{
            background: 'radial-gradient(circle, #1E3A5F, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            style={{
              background: 'rgba(22,163,74,0.15)',
              border: '1px solid rgba(22,163,74,0.3)',
              color: '#4ADE80',
            }}
          >
            <Globe size={12} />
            10 Communities · 15+ Languages
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-6xl font-black text-white mb-5 leading-tight"
          >
            Discover the Communities
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #4ADE80, #60A5FA)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              of Sikkim
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            From the ancient Lepcha forest guardians to the brilliant Newar civilisation,
            each community holds a distinct world of language, ritual, and living heritage.
            Explore, learn, and help preserve.
          </motion.p>

          {/* Summary chips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {[
              { icon: Users, label: '10 Communities', color: '#4ADE80' },
              { icon: TrendingUp, label: 'Preservation Tracking', color: '#60A5FA' },
              { icon: BookOpen, label: '400+ Lessons', color: '#FBBF24' },
              { icon: Mic, label: '400+ Contributors', color: '#F472B6' },
            ].map(chip => (
              <div
                key={chip.label}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: `${chip.color}12`,
                  border: `1px solid ${chip.color}25`,
                  color: chip.color,
                }}
              >
                <chip.icon size={12} />
                {chip.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SEARCH + FILTER BAR
      ═══════════════════════════════════════════ */}
      <section
        className="sticky top-16 z-40 px-6 py-4"
        style={{
          background: 'rgba(10,15,13,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="text"
                placeholder="Search communities, languages, regions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort buttons */}
            <div className="flex items-center gap-1">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => toggleSort(opt.key)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background:
                      sortKey === opt.key
                        ? 'rgba(22,163,74,0.2)'
                        : 'rgba(255,255,255,0.04)',
                    border:
                      sortKey === opt.key
                        ? '1px solid rgba(22,163,74,0.3)'
                        : '1px solid rgba(255,255,255,0.08)',
                    color: sortKey === opt.key ? '#4ADE80' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {opt.label}
                  {sortKey === opt.key && (
                    <ArrowUpDown
                      size={11}
                      style={{ transform: sortAsc ? 'scaleY(1)' : 'scaleY(-1)' }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(p => !p)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: showFilters ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.04)',
                border: showFilters
                  ? '1px solid rgba(96,165,250,0.3)'
                  : '1px solid rgba(255,255,255,0.08)',
                color: showFilters ? '#60A5FA' : 'rgba(255,255,255,0.5)',
              }}
            >
              <Filter size={12} />
              Filters
              {activeFilterCount > 0 && (
                <span
                  className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black"
                  style={{ background: '#60A5FA', color: '#000' }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-3 flex flex-wrap gap-3">
                  {/* Region */}
                  <select
                    value={regionFilter}
                    onChange={e => setRegionFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs text-white/70 outline-none appearance-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <option value="">All Regions</option>
                    {SIKKIM_REGIONS.map(r => (
                      <option key={r} value={r} style={{ background: '#0a0f0d' }}>
                        {r}
                      </option>
                    ))}
                  </select>

                  {/* Preservation level */}
                  <select
                    value={preservationFilter}
                    onChange={e => setPreservationFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs text-white/70 outline-none appearance-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {PRESERVATION_LEVELS.map(opt => (
                      <option key={opt.value} value={opt.value} style={{ background: '#0a0f0d' }}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Language family */}
                  <select
                    value={languageFamilyFilter}
                    onChange={e => setLanguageFamilyFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs text-white/70 outline-none appearance-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {LANGUAGE_FAMILIES.map(opt => (
                      <option key={opt.value} value={opt.value} style={{ background: '#0a0f0d' }}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setRegionFilter('')
                        setPreservationFilter('')
                        setLanguageFamilyFilter('')
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 transition-all hover:bg-red-400/10"
                      style={{ border: '1px solid rgba(248,113,113,0.2)' }}
                    >
                      <X size={12} />
                      Clear filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COMMUNITY GRID
      ═══════════════════════════════════════════ */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Result count */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-white/40">
              {filtered.length === COMMUNITIES.length
                ? `Showing all ${filtered.length} communities`
                : `${filtered.length} of ${COMMUNITIES.length} communities`}
            </p>
            {searchQuery && (
              <p className="text-sm text-white/40">
                Results for{' '}
                <span className="text-white/70 font-semibold">"{searchQuery}"</span>
              </p>
            )}
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filtered.map((community, i) => (
                  <CommunityCard key={community.slug} community={community} index={i} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">No communities found</h3>
              <p className="text-white/40 mb-6">
                Try adjusting your search or clearing the filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setRegionFilter('')
                  setPreservationFilter('')
                  setLanguageFamilyFilter('')
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.3)' }}
              >
                Reset all
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── Footer CTA ── */}
      <section
        className="py-20 px-6 mt-8"
        style={{
          background: 'linear-gradient(135deg, #0f1f14 0%, #0a1525 100%)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            {"Don't"} just explore — contribute
          </h2>
          <p className="text-white/50 mb-8">
            Join as a contributor and help communities document their languages, stories, and songs.
            Every contribution counts.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #16A34A, #15803D)',
              boxShadow: '0 0 30px rgba(22,163,74,0.25)',
            }}
          >
            Become a Contributor
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  )
}
