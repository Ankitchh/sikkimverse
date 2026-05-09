'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ContentType = 'all' | 'story' | 'song' | 'recording' | 'video' | 'ritual' | 'oral'
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
}

const ARCHIVE_ITEMS: ArchiveItem[] = [
  {
    id: '1',
    type: 'story',
    community: 'Bhutia',
    title: 'Tashiding Monastery Stories',
    excerpt:
      'Ancient tales of the sacred Tashiding monastery, perched above the Rathong Chu river — stories passed down by monks over centuries, speaking of miracles, divine encounters, and the founding of Sikkim.',
    duration: '5 min read',
    dateAdded: '2025-11-12',
    contributor: 'Lama Tenzin Norbu',
    views: 3847,
    featured: true,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: '2',
    type: 'song',
    community: 'Lepcha',
    title: 'Lepcha Creation Song',
    excerpt:
      'The primordial song of the Róng people — sung at dawn rituals, telling the story of how the creator Itbu-mu shaped the mountains, rivers, and the first Lepcha ancestors from the snows of Kanchendzonga.',
    duration: '3:42',
    dateAdded: '2025-10-28',
    contributor: 'Ama Choden Rongbül',
    views: 5102,
    featured: true,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: '3',
    type: 'recording',
    community: 'Sherpa',
    title: "Elder Karma's Himalayan Tales",
    excerpt:
      'A riveting oral history session with 84-year-old Elder Karma Wangchuk, sharing stories of the high mountain passes, trade routes to Tibet, and the old ways of the Sherpa people before the world changed.',
    duration: '12:15',
    dateAdded: '2025-10-05',
    contributor: 'Elder Karma Wangchuk',
    views: 7293,
    featured: true,
    color: 'from-orange-500 to-red-600',
  },
  {
    id: '4',
    type: 'song',
    community: 'Limbu',
    title: 'Limbu Warrior Ballad',
    excerpt:
      'A traditional Limbu ballad commemorating the bravery of the Kiphat kingdom — sung by warrior descendants, preserving the memory of Limbu sovereignty and the founding of the Kirati nation.',
    duration: '4:20',
    dateAdded: '2025-09-14',
    contributor: 'Subash Limbu',
    views: 2164,
    featured: false,
    color: 'from-purple-500 to-violet-600',
  },
  {
    id: '5',
    type: 'video',
    community: 'Tamang',
    title: 'Tamang New Year Ceremony',
    excerpt:
      'A rare video documentation of the Tamang Lhosar ceremony, featuring traditional Tamang dress, Damphu drum performances, and the sacred lighting of butter lamps at sunrise.',
    duration: '8:30',
    dateAdded: '2025-08-22',
    contributor: 'Pasang Tamang',
    views: 4511,
    featured: false,
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: '6',
    type: 'recording',
    community: 'Rai',
    title: 'Rai Shamanic Ritual Chant',
    excerpt:
      'A sacred recording of a Rai Bijuwa (shaman) performing the Sakela Sili ceremony — invoking ancestral spirits to bless the community, heal the sick, and usher in the harvest season.',
    duration: '6:45',
    dateAdded: '2025-07-30',
    contributor: 'Bijuwa Dhansing Rai',
    views: 3208,
    featured: false,
    color: 'from-amber-500 to-yellow-600',
  },
  {
    id: '7',
    type: 'song',
    community: 'Gurung',
    title: 'Gurung Tamu Lhosar Song',
    excerpt:
      'A festive Gurung New Year song performed during Tamu Lhosar, celebrating the Gurung calendar and the clan\'s ancestral connection to the mountains of Nepal and Sikkim.',
    duration: '3:15',
    dateAdded: '2025-07-01',
    contributor: 'Ganga Maya Gurung',
    views: 1893,
    featured: false,
    color: 'from-teal-500 to-cyan-600',
  },
  {
    id: '8',
    type: 'story',
    community: 'Mangar',
    title: 'Mangar Origin Story',
    excerpt:
      'The founding mythology of the Mangar (Magar) people — a rich cosmological narrative about the first ancestors who descended from the heavens to settle in the hills, and how they learned from the earth and sky.',
    duration: '8 min read',
    dateAdded: '2025-06-15',
    contributor: 'Teacher Hari Magar',
    views: 1420,
    featured: false,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: '9',
    type: 'song',
    community: 'Newar',
    title: 'Newar Festival Hymn',
    excerpt:
      'A devotional hymn sung during the Indra Jatra festival by the Newar community of Sikkim, praising the rain deity and celebrating the harvest. Features traditional Newar instruments and call-and-response singing.',
    duration: '5:10',
    dateAdded: '2025-05-20',
    contributor: 'Shyam Sunder Newar',
    views: 2677,
    featured: false,
    color: 'from-red-500 to-orange-600',
  },
  {
    id: '10',
    type: 'story',
    community: 'Sunwar',
    title: 'Sunwar Creation Myth',
    excerpt:
      'The Sunwar (Surel) people\'s ancient creation narrative — how the universe was woven from cosmic light, how the mountains were raised by the gods, and how the Sunwar people were chosen to be their guardians.',
    duration: '10 min read',
    dateAdded: '2025-04-08',
    contributor: 'Elder Dil Kumar Sunwar',
    views: 987,
    featured: false,
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: '11',
    type: 'video',
    community: 'Lepcha',
    title: 'Lepcha Script Tutorial',
    excerpt:
      'An instructional video by a Lepcha language scholar demonstrating the Sirijonga script — covering the 30 consonants, vowel signs, and how to write common Lepcha words. Essential resource for language revival efforts.',
    duration: '15:20',
    dateAdded: '2025-03-14',
    contributor: 'Dr. Norden Lepcha',
    views: 8940,
    featured: false,
    color: 'from-emerald-600 to-green-700',
  },
  {
    id: '12',
    type: 'recording',
    community: 'Bhutia',
    title: 'Bhutia Monastery Chant',
    excerpt:
      'Deep throat chanting recorded at dawn in a Bhutia monastery in East Sikkim — the ancient tones of monks reciting the Kanjur texts, accompanied by ceremonial horns and drums that echo across the mountain valleys.',
    duration: '8:00',
    dateAdded: '2025-02-28',
    contributor: 'Monastery of Ralang',
    views: 6132,
    featured: false,
    color: 'from-blue-600 to-cyan-700',
  },
]

const TYPE_FILTERS: { value: ContentType; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Star size={14} /> },
  { value: 'story', label: 'Stories', icon: <BookOpen size={14} /> },
  { value: 'song', label: 'Songs', icon: <Music size={14} /> },
  { value: 'recording', label: 'Recordings', icon: <Mic size={14} /> },
  { value: 'video', label: 'Videos', icon: <Video size={14} /> },
]

const COMMUNITIES = [
  'All Communities',
  'Lepcha',
  'Bhutia',
  'Limbu',
  'Sherpa',
  'Tamang',
  'Rai',
  'Gurung',
  'Mangar',
  'Newar',
  'Sunwar',
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

export default function ArchivePage() {
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
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const ITEMS_PER_PAGE = 9

  const filteredItems = ARCHIVE_ITEMS.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.community.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contributor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = activeFilter === 'all' || item.type === activeFilter
    const matchesCommunity =
      selectedCommunity === 'All Communities' || item.community === selectedCommunity
    return matchesSearch && matchesType && matchesCommunity
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    if (sortBy === 'oldest') return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
    return b.views - a.views
  })

  const featuredItems = ARCHIVE_ITEMS.filter((i) => i.featured)
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)

  const playItem = useCallback((item: ArchiveItem) => {
    if (item.type === 'story') return
    setPlayerItem(item)
    setIsPlaying(true)
    setProgress(0)
  }, [])

  useEffect(() => {
    if (isPlaying && playerItem) {
      progressRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(progressRef.current!)
            setIsPlaying(false)
            return 0
          }
          return p + 0.5
        })
      }, 200)
    } else {
      if (progressRef.current) clearInterval(progressRef.current)
    }
    return () => {
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [isPlaying, playerItem])

  const handlePrev = () => {
    if (!playerItem) return
    const idx = ARCHIVE_ITEMS.findIndex((i) => i.id === playerItem.id)
    const prevItem = ARCHIVE_ITEMS.slice(0, idx).reverse().find((i) => i.type !== 'story')
    if (prevItem) playItem(prevItem)
  }

  const handleNext = () => {
    if (!playerItem) return
    const idx = ARCHIVE_ITEMS.findIndex((i) => i.id === playerItem.id)
    const nextItem = ARCHIVE_ITEMS.slice(idx + 1).find((i) => i.type !== 'story')
    if (nextItem) playItem(nextItem)
  }

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
                342 items archived
              </span>
              <span className="flex items-center gap-1.5">
                <User size={14} />
                127 contributors
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={14} />
                48,173 views
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
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
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
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
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
                      {COMMUNITIES.map((c) => (
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
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Star size={18} className="text-amber-500" fill="currentColor" />
            <h2 className="text-xl font-bold text-gray-900">Featured Heritage</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'relative rounded-2xl overflow-hidden bg-gradient-to-br text-white p-5 cursor-pointer group shadow-lg hover:shadow-xl transition-shadow',
                  item.color
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
                  {item.type !== 'story' && (
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

          {paginatedItems.length === 0 ? (
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
                          TYPE_COLORS[item.type]
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
                        {item.excerpt}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {item.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={10} />
                          {item.views.toLocaleString()}
                        </span>
                      </div>
                      <span>{new Date(item.dateAdded).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <User size={10} />
                      {item.contributor}
                    </div>

                    {/* Play Button */}
                    <button
                      onClick={() => playItem(item)}
                      disabled={item.type === 'story'}
                      className={cn(
                        'w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all',
                        item.type !== 'story'
                          ? 'bg-gray-900 hover:bg-gray-700 text-white'
                          : 'bg-gray-100 text-gray-400 cursor-default'
                      )}
                    >
                      {item.type === 'story' ? (
                        <>
                          <BookOpen size={14} />
                          Read Story
                        </>
                      ) : playerItem?.id === item.id && isPlaying ? (
                        <>
                          <Pause size={14} />
                          Playing...
                        </>
                      ) : (
                        <>
                          <Play size={14} className="translate-x-0.5" />
                          Play
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
                      : 'border border-gray-200 hover:bg-gray-50 text-gray-600'
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
        {playerItem && (
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
                setProgress(((e.clientX - rect.left) / rect.width) * 100)
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
