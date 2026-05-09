'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  MicOff,
  Send,
  ChevronDown,
  Sparkles,
  Globe,
  Volume2,
  BookOpen,
  Music,
  Star,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Community = 'lepcha' | 'bhutia' | 'limbu' | 'sherpa' | 'tamang' | 'rai' | 'gurung'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

const COMMUNITY_OPTIONS: { value: Community; label: string; color: string }[] = [
  { value: 'lepcha', label: 'Lepcha', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'bhutia', label: 'Bhutia', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'limbu', label: 'Limbu', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'sherpa', label: 'Sherpa', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'tamang', label: 'Tamang', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  { value: 'rai', label: 'Rai', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'gurung', label: 'Gurung', color: 'bg-teal-100 text-teal-800 border-teal-300' },
]

const PRESET_PROMPTS = [
  { icon: <Globe size={16} />, text: 'Teach me a word in Lepcha' },
  { icon: <BookOpen size={16} />, text: 'Tell me a Bhutia folk story' },
  { icon: <Volume2 size={16} />, text: 'How do I say hello in Limbu?' },
  { icon: <Star size={16} />, text: 'What is Losoong festival?' },
  { icon: <Music size={16} />, text: 'Explain the Lepcha script' },
]

const CONVERSATION_STARTERS = [
  {
    icon: '🏔️',
    title: 'Explore Languages',
    description: 'Learn words and phrases from Sikkim\'s indigenous languages',
  },
  {
    icon: '📖',
    title: 'Hear Folk Stories',
    description: 'Discover ancient tales passed down through generations',
  },
  {
    icon: '🎵',
    title: 'Cultural Music',
    description: 'Understand traditional songs and their meanings',
  },
  {
    icon: '🎋',
    title: 'Festivals & Rituals',
    description: 'Learn about Sikkim\'s rich festival traditions',
  },
]

const SIMULATED_RESPONSES: Record<string, string> = {
  'teach me a word in lepcha':
    'Of course! Here\'s a beautiful Lepcha word for you:\n\n**ᰮᰦᰶ (Múng)** — meaning "sky" or "heaven"\n\nPronunciation: /muŋ/ (rhymes with "lung")\n\nIn Lepcha cosmology, the sky is considered sacred — it\'s where the creator deity Itbu-mu resides. The Lepcha people, who call themselves Róng, have a deep spiritual connection to the natural world around them.\n\n🗣️ Try saying: "Múng takpú" — meaning "the sky is beautiful"\n\nWould you like to learn another word, or shall I tell you more about the Lepcha language?',

  'tell me a bhutia folk story':
    'Let me share the legend of **Kanchendzonga** — the guardian spirit of Sikkim:\n\n*Long ago, before the first human set foot in Sikkim, the great mountain Kanchendzonga stood watching over the valley. The Bhutia people believe that within this sacred peak lives a powerful deity — part warrior, part protector — riding a snow lion, his body adorned with the colors of the five elements.*\n\n*When the first Lepcha and Bhutia settlers arrived, Kanchendzonga welcomed them by blessing the land with fertile soil and clean rivers. In return, he asked only that the mountains be respected — never defiled, never conquered with arrogance.*\n\n*To this day, Sikkimese mountaineers stop a few meters below the summit as a gesture of respect.*\n\nThe annual **Kagyed Dance** performed at monasteries re-enacts the victory of good over evil, with masked monks embodying these ancient spirit-guardians.\n\nShall I tell you more about Bhutia traditions? 🏔️',

  'how do i say hello in limbu':
    'Great question! In Limbu, there are a few ways to greet someone:\n\n**Formal greeting:**\n🗣️ **"Nwasim!"** (नवासिम) — Hello / Greetings\nPronunciation: /nwa-sim/\n\n**Casual greeting:**\n🗣️ **"Kheyba?"** — How are you?\nResponse: **"Kheyba!"** — I\'m fine / Good!\n\n**Morning greeting:**\n🗣️ **"Yalamber Chongna!"** — Good morning\n(Yalamber was the legendary first Limbu king)\n\nThe Limbu script, called **Sirijonga**, was created by a prince named Sirijonga in the 9th century. It\'s a beautiful abugida script still taught in Limbu schools today.\n\n💡 Cultural tip: When greeting elders, slightly bow your head — it\'s a sign of deep respect in Limbu culture.\n\nWould you like to learn more Limbu phrases? 🎋',

  'what is losoong festival':
    '**Losoong** is the Sikkimese New Year festival — one of the most joyous celebrations in the state! 🎉\n\n**When:** December (on the 10th month of the Tibetan lunar calendar)\n\n**Who celebrates it:**\n• Bhutia and Lepcha communities primarily\n• Now celebrated statewide as a cultural festival\n\n**What happens:**\n\n🏹 **Archery competitions** — Traditional bows and arrows, dating back to ancient warrior traditions\n\n🎭 **Cham Dance** — Masked monastic dances at monasteries like Rumtek and Phodong\n\n🔥 **Bon Fires** — Lit to ward off evil spirits and welcome prosperity\n\n🎵 **Folk Songs & Dances** — Communities gather to sing traditional songs like "Tashi Delek"\n\n🙏 **Monastery visits** — Prayers for a prosperous new year\n\nThe festival marks the end of the harvest season and the beginning of a new agricultural cycle. The Bhutia word for it comes from **"Lo"** (year) + **"Soong"** (new/blessed).\n\nWould you like to know about other Sikkimese festivals? 🌸',

  'explain the lepcha script':
    'The **Lepcha script** (also called Róng script) is one of the most unique writing systems in the world! 📜\n\n**Origins:**\nCreated in the early 18th century by the Lepcha scholar **Thikúng Men Salóng**, commissioned by the Chogyal (King) of Sikkim. Some believe it evolved from the Tibetan script, others say it\'s entirely original.\n\n**Structure:**\nThe script is an **abugida** (consonant-alphabet hybrid):\n• 30 consonants\n• 10 vowel signs\n• Written left to right, unlike Tibetan which also goes left to right\n• Has unique stacking letters unlike any other South Asian script\n\n**A sample:**\n```\nᰏᰦ = Ró (the "R" sound with "o" vowel)\nᰚᰦ = Só (meaning "flower")\nᰣᰦᰶ = Múng (sky)\n```\n\n**Current Status:**\n⚠️ UNESCO classifies it as **endangered** — only ~50,000 Lepcha speakers remain, and even fewer can read/write the script.\n\n🌱 SIKKIMVERSE is working to preserve it through digital archiving and interactive learning modules.\n\nWould you like to practice writing some Lepcha letters? ✍️',
}

function getSimulatedResponse(input: string): string {
  const lower = input.toLowerCase().trim()
  for (const [key, response] of Object.entries(SIMULATED_RESPONSES)) {
    if (lower.includes(key.split(' ')[0]) || lower === key) {
      return response
    }
  }
  // Default response
  const community = lower.includes('lepcha')
    ? 'Lepcha'
    : lower.includes('bhutia')
    ? 'Bhutia'
    : lower.includes('limbu')
    ? 'Limbu'
    : lower.includes('sherpa')
    ? 'Sherpa'
    : lower.includes('tamang')
    ? 'Tamang'
    : 'Sikkimese'

  return `That's a wonderful question about ${community} culture! 🌿\n\nSikkim is home to some of the world's most remarkable indigenous cultures, each with unique languages, traditions, and oral histories stretching back thousands of years.\n\nI'd love to explore this topic with you in more depth. Could you be more specific about what you'd like to learn? For example:\n\n• A specific word or phrase in ${community}\n• A folk story or legend\n• A festival or ritual\n• Historical background\n\nI'm here to be your guide through Sikkim's rich living heritage! 🏔️`
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={i} className="font-bold text-gray-900">
              {line.slice(2, -2)}
            </p>
          )
        }
        if (line.startsWith('```') || line.endsWith('```')) {
          return null
        }
        // Bold inline
        const boldParts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i} className={cn(line === '' ? 'h-2' : '')}>
            {boldParts.map((part, j) =>
              j % 2 === 1 ? (
                <strong key={j} className="font-semibold text-gray-900">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        )
      })}
    </div>
  )
}

export default function AiTutorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<Community>('lepcha')
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText, scrollToBottom])

  const simulateStreaming = useCallback((text: string, msgId: string) => {
    const words = text.split(' ')
    let currentIndex = 0
    setStreamingText('')

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        currentIndex += Math.floor(Math.random() * 3) + 1
        setStreamingText(words.slice(0, Math.min(currentIndex, words.length)).join(' '))
      } else {
        clearInterval(interval)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, content: text, isStreaming: false } : m
          )
        )
        setStreamingText('')
        setIsStreaming(false)
      }
    }, 60)

    return () => clearInterval(interval)
  }, [])

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isStreaming) return
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      }
      const assistantMsgId = `a-${Date.now()}`
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      }
      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setInputValue('')
      setIsStreaming(true)

      setTimeout(() => {
        const response = getSimulatedResponse(text)
        simulateStreaming(response, assistantMsgId)
      }, 600)
    },
    [isStreaming, simulateStreaming]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handlePreset = (text: string) => {
    sendMessage(text)
  }

  const communityOption =
    COMMUNITY_OPTIONS.find((c) => c.value === selectedCommunity) ?? COMMUNITY_OPTIONS[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Animated Avatar */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30"
              >
                <span className="text-2xl">🙏</span>
              </motion.div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                Meet Aama
                <Sparkles size={18} className="text-amber-400" />
              </h1>
              <p className="text-sm text-slate-400">Your Cultural Learning Guide</p>
            </div>
          </div>

          {/* Community Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCommunityDropdown((v) => !v)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all',
                communityOption.color
              )}
            >
              <Globe size={14} />
              <span className="hidden sm:inline">{communityOption.label}</span>
              <ChevronDown size={14} />
            </button>
            <AnimatePresence>
              {showCommunityDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 min-w-[160px]"
                >
                  {COMMUNITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedCommunity(opt.value)
                        setShowCommunityDropdown(false)
                      }}
                      className={cn(
                        'w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 flex items-center gap-2',
                        selectedCommunity === opt.value
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-700'
                      )}
                    >
                      {opt.label}
                      {selectedCommunity === opt.value && (
                        <span className="ml-auto text-indigo-500">✓</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Conversation Starters */}
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 py-4">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="text-6xl"
                  >
                    🏔️
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white">
                    Namaste! I&apos;m Aama
                  </h2>
                  <p className="text-slate-400 max-w-md mx-auto">
                    I&apos;m your guide to the indigenous cultures, languages, and traditions of Sikkim.
                    Ask me anything!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CONVERSATION_STARTERS.map((starter, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handlePreset(starter.description)}
                      className="flex items-start gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all group"
                    >
                      <span className="text-2xl">{starter.icon}</span>
                      <div>
                        <p className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                          {starter.title}
                        </p>
                        <p className="text-sm text-slate-400 mt-0.5">{starter.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          {messages.map((msg, index) => {
            const isLast = index === messages.length - 1
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                {/* Avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-orange-500/20">
                    <span className="text-base">🙏</span>
                  </div>
                )}

                <div className={cn('max-w-[80%] space-y-1', msg.role === 'user' ? 'items-end' : 'items-start', 'flex flex-col')}>
                  <div
                    className={cn(
                      'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                        : 'bg-white/10 text-slate-100 rounded-tl-sm border border-white/10 backdrop-blur-sm'
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      msg.isStreaming && isLast ? (
                        <div>
                          <MarkdownText text={streamingText} />
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="inline-block w-1 h-4 bg-amber-400 ml-1 align-middle"
                          />
                        </div>
                      ) : (
                        <MarkdownText text={msg.content} />
                      )
                    ) : (
                      msg.content
                    )}
                  </div>
                  <span className="text-xs text-slate-500 px-1">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-sm font-bold text-white">U</span>
                  </div>
                )}
              </motion.div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Preset Prompts */}
      <div className="border-t border-white/10 bg-black/10 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {PRESET_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handlePreset(prompt.text)}
                disabled={isStreaming}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs text-slate-300 whitespace-nowrap transition-all shrink-0',
                  isStreaming && 'opacity-50 cursor-not-allowed'
                )}
              >
                {prompt.icon}
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-black/20 border-t border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsVoiceActive((v) => !v)}
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0',
                isVoiceActive
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white'
              )}
            >
              {isVoiceActive ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  isVoiceActive
                    ? 'Listening...'
                    : `Ask Aama about ${communityOption.label} culture...`
                }
                disabled={isStreaming}
                className={cn(
                  'w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all',
                  isStreaming && 'opacity-60 cursor-not-allowed'
                )}
              />
              {isVoiceActive && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-400 rounded-full"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isStreaming}
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0',
                inputValue.trim() && !isStreaming
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white/5 text-slate-600 cursor-not-allowed'
              )}
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-center text-xs text-slate-600 mt-2">
            Aama uses simulated responses — connect to SIKKIMVERSE API for live AI
          </p>
        </div>
      </div>
    </div>
  )
}
