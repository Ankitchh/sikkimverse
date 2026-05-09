'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Send,
  Phone,
  HelpCircle,
  ChevronLeft,
  Music,
  BookOpen,
  Clock,
  CheckCircle2,
  Users,
  Heart,
  Volume2,
  Star,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ActionType = 'story' | 'song' | 'word' | null
type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing' | 'sent'

interface Contribution {
  id: string
  type: 'story' | 'song' | 'word'
  title: string
  duration: string
  date: string
  status: 'pending' | 'approved'
}

const ELDER_NAME = 'दादी माँ'

const recentContributions: Contribution[] = [
  {
    id: '1',
    type: 'story',
    title: 'पहाड़ की कहानी',
    duration: '3:45',
    date: '2 दिन पहले',
    status: 'approved',
  },
  {
    id: '2',
    type: 'song',
    title: 'लोसूंग गीत',
    duration: '2:12',
    date: '5 दिन पहले',
    status: 'approved',
  },
  {
    id: '3',
    type: 'word',
    title: '"आकाश" — लेपचा भाषा में',
    duration: '0:30',
    date: '1 हफ्ते पहले',
    status: 'pending',
  },
]

const actionConfig = {
  story: {
    label: 'कहानी सुनाएं',
    sublabel: 'Record a Story',
    color: 'bg-red-600 hover:bg-red-700 active:bg-red-800',
    ringColor: 'ring-red-400',
    icon: <BookOpen size={56} strokeWidth={1.5} />,
    prompt: 'अपनी पसंदीदा पहाड़ी कहानी सुनाएं।\nTell your favorite mountain story.',
  },
  song: {
    label: 'गाना गाएं',
    sublabel: 'Record a Song',
    color: 'bg-green-700 hover:bg-green-800 active:bg-green-900',
    ringColor: 'ring-green-400',
    icon: <Music size={56} strokeWidth={1.5} />,
    prompt: 'कोई लोकगीत या संस्कृतिक गाना गाएं।\nSing a folk or cultural song.',
  },
  word: {
    label: 'शब्द सिखाएं',
    sublabel: 'Teach a Word',
    color: 'bg-blue-700 hover:bg-blue-800 active:bg-blue-900',
    ringColor: 'ring-blue-400',
    icon: <Volume2 size={56} strokeWidth={1.5} />,
    prompt: 'अपनी भाषा का एक शब्द और उसका अर्थ बताएं।\nShare a word from your language and its meaning.',
  },
}

export default function ElderModePage() {
  const [selectedAction, setSelectedAction] = useState<ActionType>(null)
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordingTime, setRecordingTime] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [familyMode, setFamilyMode] = useState(false)
  const [showFamilyBanner, setShowFamilyBanner] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopTimer()
  }, [stopTimer])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleStartRecording = () => {
    setRecordingState('recording')
    setRecordingTime(0)
    startTimer()
  }

  const handleStopRecording = () => {
    setRecordingState('recorded')
    stopTimer()
  }

  const handlePlay = () => {
    setRecordingState('playing')
    setTimeout(() => setRecordingState('recorded'), recordingTime * 1000 + 500)
  }

  const handleSend = () => {
    setRecordingState('sent')
    setTimeout(() => {
      setSelectedAction(null)
      setRecordingState('idle')
      setRecordingTime(0)
    }, 3000)
  }

  const handleBack = () => {
    setSelectedAction(null)
    setRecordingState('idle')
    setRecordingTime(0)
    stopTimer()
  }

  const handleFamilyToggle = () => {
    setFamilyMode((prev) => {
      const next = !prev
      setShowFamilyBanner(next)
      if (next) setTimeout(() => setShowFamilyBanner(false), 4000)
      return next
    })
  }

  const typeIcon = {
    story: <BookOpen size={20} />,
    song: <Music size={20} />,
    word: <Volume2 size={20} />,
  }

  return (
    <div className={cn(
      'min-h-screen flex flex-col',
      familyMode ? 'bg-amber-50' : 'bg-gradient-to-b from-orange-50 to-amber-50'
    )}>
      {/* Family Mode Banner */}
      <AnimatePresence>
        {showFamilyBanner && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="bg-amber-500 text-white text-center py-3 px-4 text-xl font-bold"
          >
            परिवार सहायक मोड चालू है • Family Assistant Mode ON
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white shadow-md px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">स</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SIKKIMVERSE</h1>
            <p className="text-lg text-gray-500">सांस्कृतिक संरक्षण • Cultural Preservation</p>
          </div>
        </div>
        <button
          onClick={handleFamilyToggle}
          className={cn(
            'flex items-center gap-2 px-5 py-3 rounded-2xl text-lg font-semibold border-2 transition-all',
            familyMode
              ? 'bg-amber-100 border-amber-500 text-amber-800'
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
          )}
        >
          <Users size={24} />
          <span className="hidden sm:inline">{familyMode ? 'परिवार मोड: चालू' : 'परिवार मोड'}</span>
        </button>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-8">
        {/* Greeting Section */}
        <AnimatePresence mode="wait">
          {!selectedAction && (
            <motion.section
              key="greeting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🙏</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                नमस्ते! आपका स्वागत है
              </h2>
              <p className="text-3xl text-orange-700 font-semibold mb-1">{ELDER_NAME}</p>
              <p className="text-2xl text-gray-600">
                Namaste! Welcome, {ELDER_NAME}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-800 px-5 py-2 rounded-full text-xl">
                <Star size={20} className="text-green-600" fill="currentColor" />
                आपने अब तक 3 योगदान दिए हैं • 3 contributions made
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Main Action Buttons */}
        <AnimatePresence mode="wait">
          {!selectedAction ? (
            <motion.section
              key="actions"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-center text-2xl text-gray-700 mb-6 font-medium">
                आप क्या साझा करना चाहते हैं? • What would you like to share?
              </p>
              <div className="flex flex-col gap-5">
                {(['story', 'song', 'word'] as ActionType[]).filter(Boolean).map((action) => {
                  const cfg = actionConfig[action as keyof typeof actionConfig]
                  return (
                    <motion.button
                      key={action}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedAction(action)}
                      className={cn(
                        'w-full flex items-center gap-6 py-8 px-8 rounded-3xl text-white shadow-xl transition-all duration-200',
                        cfg.color
                      )}
                    >
                      <div className="shrink-0">{cfg.icon}</div>
                      <div className="text-left">
                        <div className="text-4xl font-bold">{cfg.label}</div>
                        <div className="text-2xl opacity-90 mt-1">{cfg.sublabel}</div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="recording"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              className="flex flex-col gap-6"
            >
              {/* Back Button */}
              {recordingState !== 'sent' && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-2xl text-gray-600 hover:text-gray-900 font-medium self-start"
                >
                  <ArrowLeft size={28} />
                  वापस जाएं • Go Back
                </button>
              )}

              {/* Recording Header */}
              <div className={cn(
                'rounded-3xl p-6 text-white text-center shadow-xl',
                actionConfig[selectedAction].color.split(' ')[0]
              )}>
                <div className="text-5xl font-bold mb-2">
                  {actionConfig[selectedAction].label}
                </div>
                <p className="text-2xl opacity-90 whitespace-pre-line">
                  {actionConfig[selectedAction].prompt}
                </p>
              </div>

              {/* Sent State */}
              <AnimatePresence>
                {recordingState === 'sent' && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                      className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle2 size={72} className="text-green-600" />
                    </motion.div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-3">
                      भेज दिया गया! 🎉
                    </h3>
                    <p className="text-2xl text-gray-600">
                      Sent successfully! Thank you for your contribution.
                    </p>
                    <p className="text-xl text-gray-500 mt-2">
                      आपका योगदान हमारे लिए बहुत कीमती है।
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recording Interface */}
              {recordingState !== 'sent' && (
                <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-8">
                  {/* Giant Mic */}
                  <div className="relative">
                    {recordingState === 'recording' && (
                      <>
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute inset-0 -m-6 bg-red-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                          className="absolute inset-0 -m-12 bg-red-300 rounded-full"
                        />
                      </>
                    )}
                    <motion.div
                      animate={
                        recordingState === 'recording'
                          ? { scale: [1, 1.05, 1] }
                          : {}
                      }
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className={cn(
                        'w-40 h-40 rounded-full flex items-center justify-center shadow-2xl relative z-10',
                        recordingState === 'recording'
                          ? 'bg-red-600'
                          : recordingState === 'recorded' || recordingState === 'playing'
                          ? 'bg-green-600'
                          : 'bg-gray-200'
                      )}
                    >
                      {recordingState === 'playing' ? (
                        <Volume2 size={80} className="text-white" strokeWidth={1.5} />
                      ) : recordingState === 'recorded' ? (
                        <CheckCircle2 size={80} className="text-white" strokeWidth={1.5} />
                      ) : (
                        <Mic size={80} className={cn(
                          recordingState === 'recording' ? 'text-white' : 'text-gray-500'
                        )} strokeWidth={1.5} />
                      )}
                    </motion.div>
                  </div>

                  {/* Timer */}
                  {(recordingState === 'recording' || recordingState === 'recorded') && (
                    <div className="text-5xl font-mono font-bold text-gray-800">
                      {formatTime(recordingTime)}
                    </div>
                  )}

                  {/* Status Text */}
                  <p className="text-3xl font-semibold text-center text-gray-700">
                    {recordingState === 'idle' && 'शुरू करने के लिए दबाएं\nPress to Start'}
                    {recordingState === 'recording' && 'रिकॉर्डिंग हो रही है...\nRecording... Press to Stop'}
                    {recordingState === 'recorded' && 'रिकॉर्डिंग तैयार है!\nRecording Ready!'}
                    {recordingState === 'playing' && 'सुन रहे हैं... Playing...'}
                  </p>

                  {/* Primary Action Button */}
                  {recordingState === 'idle' && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleStartRecording}
                      className="w-full py-8 bg-red-600 hover:bg-red-700 text-white text-4xl font-bold rounded-3xl shadow-xl transition-all"
                    >
                      🎤 शुरू करें • Press to Start
                    </motion.button>
                  )}

                  {recordingState === 'recording' && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleStopRecording}
                      className="w-full py-8 bg-gray-800 hover:bg-gray-900 text-white text-4xl font-bold rounded-3xl shadow-xl transition-all"
                    >
                      ⏹ रोकें • Press to Stop
                    </motion.button>
                  )}

                  {(recordingState === 'recorded') && (
                    <div className="w-full flex flex-col gap-4">
                      <button
                        onClick={handlePlay}
                        className="w-full py-7 bg-blue-600 hover:bg-blue-700 text-white text-3xl font-bold rounded-3xl shadow-lg flex items-center justify-center gap-4 transition-all"
                      >
                        <Play size={40} />
                        सुनें • Playback
                      </button>
                      <button
                        onClick={handleSend}
                        className="w-full py-7 bg-green-600 hover:bg-green-700 text-white text-3xl font-bold rounded-3xl shadow-lg flex items-center justify-center gap-4 transition-all"
                      >
                        <Send size={40} />
                        भेजें • Send
                      </button>
                    </div>
                  )}

                  {recordingState === 'playing' && (
                    <div className="w-full flex flex-col gap-4">
                      <button
                        onClick={() => setRecordingState('recorded')}
                        className="w-full py-7 bg-orange-500 hover:bg-orange-600 text-white text-3xl font-bold rounded-3xl shadow-lg flex items-center justify-center gap-4"
                      >
                        <Pause size={40} />
                        रोकें • Pause
                      </button>
                    </div>
                  )}

                  {/* Help Button */}
                  <button
                    onClick={() => setShowHelp(true)}
                    className="w-full py-6 bg-amber-100 hover:bg-amber-200 text-amber-900 text-2xl font-semibold rounded-2xl border-2 border-amber-300 flex items-center justify-center gap-3 transition-all"
                  >
                    <HelpCircle size={32} />
                    मदद चाहिए? • Ask for Help
                  </button>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Recent Contributions */}
        {!selectedAction && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-lg p-6"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-5 flex items-center gap-3">
              <Clock size={32} className="text-orange-500" />
              आपके हाल के योगदान • Your Recent Contributions
            </h3>
            <div className="flex flex-col gap-4">
              {recentContributions.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100"
                >
                  <div className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0',
                    c.type === 'story' ? 'bg-red-100 text-red-600' :
                    c.type === 'song' ? 'bg-green-100 text-green-600' :
                    'bg-blue-100 text-blue-600'
                  )}>
                    {typeIcon[c.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-semibold text-gray-900 truncate">{c.title}</p>
                    <p className="text-xl text-gray-500">{c.date} • {c.duration}</p>
                  </div>
                  <div className={cn(
                    'shrink-0 px-3 py-1 rounded-full text-lg font-semibold',
                    c.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  )}>
                    {c.status === 'approved' ? '✓ स्वीकृत' : '⏳ प्रतीक्षा'}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* How It Helps */}
        {!selectedAction && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-xl p-8 text-white text-center"
          >
            <Heart size={48} className="mx-auto mb-4" fill="white" />
            <h3 className="text-3xl font-bold mb-3">आपका योगदान क्यों ज़रूरी है?</h3>
            <p className="text-2xl leading-relaxed opacity-95">
              आपकी आवाज़, आपकी कहानियाँ, और आपके गीत — ये हमारी अगली पीढ़ी के लिए
              एक अनमोल विरासत हैं। SIKKIMVERSE पर आपके द्वारा साझा की गई हर चीज़
              हमारी संस्कृति को जीवित रखती है।
            </p>
            <p className="text-xl mt-4 opacity-80">
              Your voice, stories, and songs are an invaluable heritage for the next generation.
              Everything you share on SIKKIMVERSE keeps our culture alive.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              {[
                { num: '1,247', label: 'बच्चे सीख रहे हैं\nChildren Learning' },
                { num: '342', label: 'सामग्री संग्रहित\nItems Archived' },
                { num: '12', label: 'भाषाएं सुरक्षित\nLanguages Preserved' },
              ].map((stat) => (
                <div key={stat.num} className="bg-white/20 rounded-2xl p-3">
                  <div className="text-3xl font-bold">{stat.num}</div>
                  <div className="text-lg opacity-90 whitespace-pre-line leading-tight mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Support */}
        {!selectedAction && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-lg p-6 border-2 border-blue-200"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Phone size={32} className="text-blue-600" />
              सहायता चाहिए? • Need Support?
            </h3>
            <div className="bg-blue-50 rounded-2xl p-5 text-center">
              <p className="text-2xl text-gray-700 mb-2">हमारी सहायता टीम को कॉल करें</p>
              <p className="text-4xl font-bold text-blue-700">📞 1800-XXX-XXXX</p>
              <p className="text-xl text-gray-500 mt-2">सोमवार–शनिवार • 9 AM – 6 PM • निःशुल्क</p>
              <p className="text-xl text-gray-500">Monday–Saturday • Free of Charge</p>
            </div>
          </motion.section>
        )}
      </main>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="text-center mb-6">
                <Phone size={56} className="text-blue-600 mx-auto mb-3" />
                <h3 className="text-4xl font-bold text-gray-900">मदद के लिए कॉल करें</h3>
                <p className="text-2xl text-gray-600 mt-2">Call for Help</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-6 text-center mb-6">
                <p className="text-3xl font-bold text-blue-800">📞 1800-XXX-XXXX</p>
                <p className="text-2xl text-gray-600 mt-2">निःशुल्क • Free Call</p>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="w-full py-6 bg-gray-800 text-white text-3xl font-bold rounded-2xl"
              >
                बंद करें • Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t py-5 px-6 text-center">
        <p className="text-xl text-gray-500">SIKKIMVERSE • सिक्किम की संस्कृति, हमेशा के लिए</p>
        <p className="text-lg text-gray-400">Preserving Sikkim's heritage, forever</p>
      </footer>
    </div>
  )
}
