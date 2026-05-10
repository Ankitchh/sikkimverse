'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  User,
  Filter,
  SlidersHorizontal,
  BookOpen,
  Music,
  Mic,
  Video,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ContentType = 'all' | 'story' | 'song' | 'recording' | 'video'
type SortOption = 'newest' | 'oldest' | 'most-listened'

interface ArchiveItem {
  id: string
  type: 'story' | 'song' | 'recording' | 'video'
  community: string
  title: string
  excerpt: string
  duration: string
  dateAdded: string
  contributor: string
  views: number
  featured: boolean
  color: string
  audioUrl: string | null
}

// Gradient palettes per type, cycled by index
const TYPE_GRADIENTS: Record<string, string[]> = {
  story: ['from-blue-500 to-indigo-600', 'from-violet-500 to-purple-600', 'from-sky-500 to-blue-600'],
  song: ['from-emerald-500 to-teal-600', 'from-green-500 to-emerald-600', 'from-teal-500 to-cyan-600'],
  recording: ['from-orange-500 to-red-600', 'from-amber-500 to-yellow-600', 'from-red-500 to-orange-600'],
  video: ['from-purple-500 to-violet-600', 'from-pink-500 to-rose-600', 'from-indigo-500 to-blue-600'],
}

const TYPE_FILTERS: { value: ContentType; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Star size={14} /> },
  { value: 'story', label: 'Stories', icon: <BookOpen size={14} /> },
  { value: 'song', label: 'Songs', icon: <Music size={14} /> },
  { value: 'recording', label: 'Recordings', icon: <Mic size={14} /> },
  { value: 'video', label: 'Videos', icon: <Video size={14} /> },
]

const TYPE_COLORS: Record<string, string> = {
  story: 'bg-blue-100 text-blue-700 border-blue-200',
  song: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  recording: 'bg-orange-100 text-orange-700 border-orange-200',
  video: 'bg-purple-100 text-purple-700 border-purple-200',
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  story: <BookOpen size={12} />,
  song: <Music size={12} />,
  recording: <Mic size={12} />,
  video: <Video size={12} />,
}

function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function WaveformAnimation({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-8">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          animate={
            isActive
              ? {
                  scaleY: [0.3, 1, 0.4, 0.9, 0.2, 0.8, 0.3],
                  transition: {
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.06,
                    ease: 'easeInOut',
                  },
                }
              : { scaleY: 0.3 }
          }
          className="w-1 bg-white/60 rounded-full origin-center"
          style={{ height: '100%' }}
        />
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="break-inside-avoid bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-16 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-3 w-4/5 bg-gray-200 rounded" />
        <div className="h-3 w-3/5 bg-gray-200 rounded" />
        <div className="h-9 w-full bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}

export default function ArchivePage() {
  const [items, setItems] = useState<ArchiveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<ContentType>('all')
  const [selectedCommunity, setSelectedCommunity] = useState('All Communities')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [playerItem, setPlayerItem] = useState<ArchiveItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const ITEMS_PER_PAGE = 9

  // Fetch all archive content in parallel on mount
  useEffect(() => {
    async function load() {
      try {
        const [storiesRes, songsRes, recordingsRes, videosRes] = await Promise.all([
          fetch('/api/stories?limit=50&status=APPROVED'),
          fetch('/api/songs?limit=50'),
          fetch('/api/recordings?limit=50'),
          fetch('/api/videos?limit=50'),
        ])

        const [storiesData, songsData, recordingsData, videosData] = await Promise.all([
          storiesRes.ok ? storiesRes.json() : { stories: [] },
          songsRes.ok ? songsRes.json() : { songs: [] },
          recordingsRes.ok ? recordingsRes.json() : { recordings: [] },
          videosRes.ok ? videosRes.json() : { videos: [] },
        ])

        const normalized: ArchiveItem[] = []

        ;(storiesData.stories ?? []).forEach((s: Record<string, unknown>, i: number) => {
          const content = String(s.content ?? '')
          const readMins = Math.max(1, Math.ceil(content.split(/\s+/).length / 200))
          normalized.push({
            id: `story-${s.id}`,
            type: 'story',
            community: (s.community as Record<string, string>)?.name ?? 'Community',
            title: String(s.title ?? ''),
            excerpt: String(s.summary ?? content.slice(0, 200) ?? ''),
            duration: `${readMins} min read`,
            dateAdded: String(s.createdAt ?? ''),
            contributor: (s.contributor as Record<string, string>)?.name ?? 'Contributor',
            views: Number(s.viewCount ?? 0),
            featured: false,
            color: TYPE_GRADIENTS.story[i % TYPE_GRADIENTS.story.length],
            audioUrl: s.audioUrl ? String(s.audioUrl) : null,
          })
        })

        ;(songsData.songs ?? []).forEach((s: Record<string, unknown>, i: number) => {
          normalized.push({
            id: `song-${s.id}`,
            type: 'song',
            community: (s.community as Record<string, string>)?.name ?? 'Community',
            title: String(s.title ?? ''),
            excerpt: String(s.occasion ? `${s.occasion} — ${s.lyrics ?? ''}` : s.lyrics ?? '').slice(0, 200),
            duration: '—',
            dateAdded: String(s.createdAt ?? ''),
            contributor: (s.contributor as Record<string, string>)?.name ?? 'Contributor',
            views: Number(s.viewCount ?? 0),
            featured: false,
            color: TYPE_GRADIENTS.song[i % TYPE_GRADIENTS.song.length],
            audioUrl: s.audioUrl ? String(s.audioUrl) : null,
          })
        })

        ;(recordingsData.recordings ?? []).forEach((r: Record<string, unknown>, i: number) => {
          normalized.push({
            id: `recording-${r.id}`,
            type: 'recording',
            community: (r.community as Record<string, string>)?.name ?? 'Community',
            title: String(r.title ?? ''),
            excerpt: String(r.description ?? r.transcription ?? '').slice(0, 200),
            duration: r.duration ? formatSeconds(Number(r.duration)) : '—',
            dateAdded: String(r.createdAt ?? ''),
            contributor: (r.contributor as Record<string, string>)?.name ?? 'Contributor',
            views: 0,
            featured: false,
            color: TYPE_GRADIENTS.recording[i % TYPE_GRADIENTS.recording.length],
            audioUrl: r.audioUrl ? String(r.audioUrl) : null,
          })
        })

        ;(videosData.videos ?? []).forEach((v: Record<string, unknown>, i: number) => {
          normalized.push({
            id: `video-${v.id}`,
            type: 'video',
            community: (v.community as Record<string, string>)?.name ?? 'Community',
            title: String(v.title ?? ''),
            excerpt: String(v.description ?? '').slice(0, 200),
            duration: v.duration ? formatSeconds(Number(v.duration)) : '—',
            dateAdded: String(v.createdAt ?? ''),
            contributor: (v.contributor as Record<string, string>)?.name ?? 'Contributor',
            views: Number(v.viewCount ?? 0),
            featured: false,
            color: TYPE_GRADIENTS.video[i % TYPE_GRADIENTS.video.length],
            audioUrl: null,
          })
        })

        // Mark top 3 by views as featured
        const sorted = [...normalized].sort((a, b) => b.views - a.views)
        const featuredIds = new Set(sorted.slice(0, 3).map((x) => x.id))
        normalized.forEach((item) => {
          item.featured = featuredIds.has(item.id)
        })

        setItems(normalized)
      } catch (err) {
        console.error('[ArchivePage] Failed to load archive:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Real audio player
  useEffect(() => {
    if (!playerItem?.audioUrl) return
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
    const audio = audioRef.current
    if (audio.src !== playerItem.audioUrl) {
      audio.src = playerItem.audioUrl
      audio.load()
    }
    audio.volume = isMuted ? 0 : volume / 100

    const onTimeUpdate = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
    }
    const onEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)

    if (isPlaying) audio.play().catch(() => setIsPlaying(false))
    else audio.pause()

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }, [playerItem, isPlaying, volume, isMuted])

  // Sync volume without reloading audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  const communities = useMemo(() => {
    const names = Array.from(new Set(items.map((i) => i.community))).sort()
    return ['All Communities', ...names]
  }, [items])

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch =
          q === '' ||
          item.title.toLowerCase().includes(q) ||
          item.community.toLowerCase().includes(q) ||
          item.contributor.toLowerCase().includes(q)
        const matchesType = activeFilter === 'all' || item.type === activeFilter
        const matchesCommunity =
          selectedCommunity === 'All Communities' || item.community === selectedCommunity
        return matchesSearch && matchesType && matchesCommunity
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        if (sortBy === 'oldest') return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
        return b.views - a.views
      })
  }, [items, searchQuery, activeFilter, selectedCommunity, sortBy])

  const featuredItems = useMemo(() => items.filter((i) => i.featured), [items])

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)

  const playItem = useCallback((item: ArchiveItem) => {
    if (item.type === 'story' && !item.audioUrl) return
    setPlayerItem(item)
    setIsPlaying(true)
    setProgress(0)
  }, [])

  const handlePrev = () => {
    if (!playerItem) return
    const playable = filteredItems.filter((i) => i.audioUrl)
    const idx = playable.findIndex((i) => i.id === playerItem.id)
    const prev = playable[idx - 1]
    if (prev) playItem(prev)
  }

  const handleNext = () => {
    if (!playerItem) return
    const playable = filteredItems.filter((i) => i.audioUrl)
    const idx = playable.findIndex((i) => i.id === playerItem.id)
    const next = playable[idx + 1]
    if (next) playItem(next)
  }

  const totalViews = useMemo(() => items.reduce((sum, i) => sum + i.views, 0), [items])

  return (
    <div className={cn('min-h-screen bg-stone-50', playerItem ? 'pb-28' : '')}>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 40px)',
            }}
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-medium tracking-widest uppercase mb-4">
              <span>🏔️</span>
              <span>Cultural Heritage Archive</span>
              <span>🏔️</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
              The Living Archive
              <br />
              <span className="text-amber-400">of Sikkim</span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-300 max-w-2xl mx-auto">
              A sacred repository of voices, songs, stories, and rituals — preserved
              by the indigenous communities of Sikkim for generations to come.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-stone-400">
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} />
                {loading ? '—' : `${items.length} items archived`}
              </span>
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {loading ? '—' : `${new Set(items.map((i) => i.contributor)).size} contributors`}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={14} />
                {loading ? '—' : `${totalViews.toLocaleString()} views`}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Search & Filters */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search stories, songs, communities, contributors..."
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-all',
                showFilters
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
              )}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Type Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setActiveFilter(f.value)
                  setCurrentPage(1)
                }}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border',
                  activeFilter === f.value
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                )}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
          </div>

          {/* Extended Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white border border-gray-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Community
                    </label>
                    <select
                      value={selectedCommunity}
                      onChange={(e) => {
                        setSelectedCommunity(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                    >
                      {communities.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="most-listened">Most Viewed</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Featured Archive Items */}
        {(loading || featuredItems.length > 0) && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Star size={18} className="text-amber-500" fill="currentColor" />
              <h2 className="text-xl font-bold text-gray-900">Featured Heritage</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-44 rounded-2xl bg-gray-200 animate-pulse" />
                  ))
                : featuredItems.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        'relative rounded-2xl overflow-hidden bg-gradient-to-br text-white p-5 cursor-pointer group shadow-lg hover:shadow-xl transition-shadow',
                        item.color,
                      )}
                      onClick={() => playItem(item)}
                    >
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
                          ⭐ Featured
                        </span>
                      </div>
                      <div className="mt-8 mb-3">
                        <WaveformAnimation isActive={playerItem?.id === item.id && isPlaying} />
                      </div>
                      <h3 className="font-bold text-base leading-snug mb-1">{item.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
                        <span>{item.community}</span>
                        <span>•</span>
                        <span>{item.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 flex items-center gap-1">
                          <Eye size={11} />
                          {item.views.toLocaleString()}
                        </span>
                        {item.audioUrl && (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                          >
                            {playerItem?.id === item.id && isPlaying ? (
                              <Pause size={16} />
                            ) : (
                              <Play size={16} className="translate-x-0.5" />
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
            </div>
          </section>
        )}

        {/* Archive Grid */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              All Archive
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredItems.length} items)
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Filter size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No items found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {paginatedItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="break-inside-avoid bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  {/* Card Header */}
                  <div className={cn('h-16 bg-gradient-to-br flex items-end px-4 pb-3', item.color)}>
                    <WaveformAnimation isActive={playerItem?.id === item.id && isPlaying} />
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border capitalize',
                          TYPE_COLORS[item.type],
                        )}
                      >
                        {TYPE_ICONS[item.type]}
                        {item.type}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {item.community}
                      </span>
                    </div>

                    {/* Title & Excerpt */}
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                        {item.excerpt || 'No description available.'}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {item.duration}
                        </span>
                        {item.views > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye size={10} />
                            {item.views.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span>
                        {item.dateAdded
                          ? new Date(item.dateAdded).toLocaleDateString('en-IN', {
                              month: 'short',
                              year: 'numeric',
                            })
                          : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <User size={10} />
                      {item.contributor}
                    </div>

                    {/* Play / Read Button */}
                    <button
                      onClick={() => playItem(item)}
                      disabled={item.type === 'story' && !item.audioUrl}
                      className={cn(
                        'w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all',
                        item.audioUrl
                          ? 'bg-gray-900 hover:bg-gray-700 text-white'
                          : item.type === 'story'
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : 'bg-gray-100 text-gray-400 cursor-default',
                      )}
                    >
                      {item.type === 'story' && !item.audioUrl ? (
                        <>
                          <BookOpen size={14} />
                          Read Story
                        </>
                      ) : playerItem?.id === item.id && isPlaying ? (
                        <>
                          <Pause size={14} />
                          Playing...
                        </>
                      ) : item.audioUrl ? (
                        <>
                          <Play size={14} className="translate-x-0.5" />
                          Play
                        </>
                      ) : (
                        <>
                          <Video size={14} />
                          Watch
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                    currentPage === i + 1
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'border border-gray-200 hover:bg-gray-50 text-gray-600',
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Floating Audio Player */}
      <AnimatePresence>
        {playerItem && playerItem.audioUrl && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white border-t border-gray-700 shadow-2xl z-50"
          >
            {/* Progress Bar */}
            <div
              className="h-1 bg-gray-700 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const pct = ((e.clientX - rect.left) / rect.width) * 100
                setProgress(pct)
                if (audioRef.current?.duration) {
                  audioRef.current.currentTime = (pct / 100) * audioRef.current.duration
                }
              }}
            >
              <motion.div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
              {/* Info */}
              <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-br shrink-0', playerItem.color)} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{playerItem.title}</p>
                <p className="text-xs text-gray-400 truncate">{playerItem.community}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <SkipBack size={18} />
                </button>
                <button
                  onClick={() => setIsPlaying((v) => !v)}
                  className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center transition-colors shadow-lg"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <SkipForward size={18} />
                </button>
              </div>

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setIsMuted((v) => !v)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value))
                    setIsMuted(false)
                  }}
                  className="w-20 accent-amber-400"
                />
              </div>

              {/* Close */}
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause()
                    audioRef.current.src = ''
                  }
                  setPlayerItem(null)
                  setIsPlaying(false)
                  setProgress(0)
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
