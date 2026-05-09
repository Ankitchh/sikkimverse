import type {
  UserRole,
  EndangermentLevel,
  CourseLevel,
  LessonType,
  QuizType,
  StoryType,
  ContentStatus,
  VideoType,
  RecordingType,
  SubmissionType,
  HandwritingGrade,
} from '@/generated/prisma'

// ─── Re-export Prisma Enums ────────────────────────────────────────────────────

export type {
  UserRole,
  EndangermentLevel,
  CourseLevel,
  LessonType,
  QuizType,
  StoryType,
  ContentStatus,
  VideoType,
  RecordingType,
  SubmissionType,
  HandwritingGrade,
}

// ─── Entity Interfaces ────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
  communityId: string | null
  xp: number
  streak: number
  streakLastActivity: Date | null
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
  // relations (optional, populated when included)
  community?: Community | null
  achievements?: UserAchievement[]
  progress?: UserProgress[]
}

export interface Community {
  id: string
  name: string
  slug: string
  description: string
  coverImage: string | null
  logoImage: string | null
  colorPrimary: string
  colorSecondary: string
  region: string
  totalSpeakers: number
  preservationScore: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // relations (optional)
  languages?: Language[]
  users?: User[]
  courses?: Course[]
  stories?: Story[]
  songs?: Song[]
  videos?: Video[]
  recordings?: Recording[]
  words?: Word[]
  festivals?: Festival[]
  tags?: Tag[]
}

export interface Language {
  id: string
  name: string
  code: string
  communityId: string
  scriptType: string | null
  description: string | null
  speakerCount: number
  endangermentLevel: EndangermentLevel
  createdAt: Date
  // relations (optional)
  community?: Community
  dialects?: Dialect[]
}

export interface Dialect {
  id: string
  name: string
  languageId: string
  region: string | null
  description: string | null
  speakerCount: number
  // relations (optional)
  language?: Language
}

export interface Course {
  id: string
  title: string
  description: string
  communityId: string
  languageId: string
  level: CourseLevel
  coverImage: string | null
  totalLessons: number
  isPublished: boolean
  createdAt: Date
  // relations (optional)
  community?: Community
  language?: Language
  lessons?: Lesson[]
  _count?: {
    lessons: number
    progress: number
  }
}

export interface Lesson {
  id: string
  title: string
  description: string | null
  courseId: string
  order: number
  type: LessonType
  xpReward: number
  estimatedMinutes: number
  content: LessonContent
  isPublished: boolean
  createdAt: Date
  // relations (optional)
  course?: Course
  progress?: UserProgress[]
  quizzes?: Quiz[]
}

export interface LessonContent {
  sections: LessonSection[]
  vocabulary?: VocabularyItem[]
  grammarRules?: GrammarRule[]
  culturalNotes?: string
  scriptExercises?: ScriptExercise[]
}

export interface LessonSection {
  id: string
  type: 'text' | 'image' | 'audio' | 'video' | 'interactive'
  content: string
  mediaUrl?: string
  caption?: string
}

export interface VocabularyItem {
  word: string
  meaning: string
  pronunciation?: string
  audioUrl?: string
  imageUrl?: string
  exampleSentence?: string
}

export interface GrammarRule {
  title: string
  explanation: string
  examples: Array<{ source: string; translation: string }>
}

export interface ScriptExercise {
  character: string
  strokes: number
  audioUrl?: string
  referenceImageUrl?: string
}

export interface UserProgress {
  id: string
  userId: string
  lessonId: string
  courseId: string
  completed: boolean
  score: number
  completedAt: Date | null
  createdAt: Date
  // relations (optional)
  lesson?: Lesson
  course?: Course
}

export interface Quiz {
  id: string
  lessonId: string
  courseId: string
  question: string
  type: QuizType
  options: QuizOption[] | null
  correctAnswer: string
  audioUrl: string | null
  imageUrl: string | null
  createdAt: Date
}

export interface QuizOption {
  id: string
  text: string
  imageUrl?: string
  audioUrl?: string
}

export interface QuizAttempt {
  id: string
  userId: string
  quizId: string
  answer: string
  isCorrect: boolean
  score: number
  createdAt: Date
  // relations (optional)
  quiz?: Quiz
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpRequired: number
  badgeImage: string | null
  type: string
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  earnedAt: Date
  // relations (optional)
  achievement?: Achievement
}

export interface Story {
  id: string
  title: string
  content: string
  summary: string | null
  communityId: string
  contributorId: string
  status: ContentStatus
  language: string
  audioUrl: string | null
  imageUrl: string | null
  type: StoryType
  tags: string[] | null
  viewCount: number
  createdAt: Date
  // relations (optional)
  community?: Community
  contributor?: User
}

export interface Song {
  id: string
  title: string
  lyrics: string | null
  communityId: string
  contributorId: string
  status: ContentStatus
  audioUrl: string | null
  videoUrl: string | null
  imageUrl: string | null
  occasion: string | null
  language: string
  tags: string[] | null
  viewCount: number
  createdAt: Date
  // relations (optional)
  community?: Community
  contributor?: User
}

export interface Video {
  id: string
  title: string
  description: string | null
  communityId: string
  contributorId: string
  status: ContentStatus
  videoUrl: string
  thumbnailUrl: string | null
  duration: number
  type: VideoType
  viewCount: number
  createdAt: Date
  // relations (optional)
  community?: Community
  contributor?: User
}

export interface Recording {
  id: string
  title: string
  description: string | null
  communityId: string
  contributorId: string
  status: ContentStatus
  audioUrl: string
  duration: number
  type: RecordingType
  transcription: string | null
  translation: string | null
  createdAt: Date
  // relations (optional)
  community?: Community
  contributor?: User
}

export interface Word {
  id: string
  word: string
  meaning: string
  communityId: string
  languageId: string
  dialectId: string | null
  pronunciation: string | null
  audioUrl: string | null
  imageUrl: string | null
  partOfSpeech: string | null
  status: ContentStatus
  contributorId: string
  exampleSentence: string | null
  createdAt: Date
  // relations (optional)
  community?: Community
  language?: Language
  dialect?: Dialect | null
  contributor?: User
}

export interface PronunciationAttempt {
  id: string
  userId: string
  wordId: string
  recordingUrl: string
  score: number
  feedback: string | null
  createdAt: Date
  // relations (optional)
  word?: Word
  user?: User
}

export interface HandwritingAttempt {
  id: string
  userId: string
  characterId: string
  imageData: string
  score: number
  grade: HandwritingGrade
  feedback: string | null
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  link: string | null
  createdAt: Date
}

export interface Submission {
  id: string
  type: SubmissionType
  communityId: string
  contributorId: string
  moderatorId: string | null
  status: ContentStatus
  rejectionReason: string | null
  submittedAt: Date
  reviewedAt: Date | null
  // relations (optional)
  community?: Community
  contributor?: User
  moderator?: User | null
}

export interface CommunityEarning {
  id: string
  communityId: string
  amount: number
  source: string
  period: string
  createdAt: Date
  // relations (optional)
  community?: Community
}

export interface Festival {
  id: string
  name: string
  communityId: string
  description: string
  month: number
  imageUrl: string | null
  significance: string | null
  createdAt: Date
  // relations (optional)
  community?: Community
}

export interface Tag {
  id: string
  name: string
  slug: string
  communityId: string | null
  // relations (optional)
  community?: Community | null
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ApiError {
  message: string
  code?: string
  field?: string
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface SignInFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  communityId?: string
  agreeToTerms: boolean
}

export interface WordSubmissionFormData {
  word: string
  meaning: string
  communityId: string
  languageId: string
  dialectId?: string
  pronunciation?: string
  partOfSpeech?: string
  exampleSentence?: string
  audioUrl?: string
  imageUrl?: string
}

export interface StorySubmissionFormData {
  title: string
  content: string
  summary?: string
  communityId: string
  type: StoryType
  language: string
  audioUrl?: string
  imageUrl?: string
  tags?: string[]
}

export interface SongSubmissionFormData {
  title: string
  lyrics?: string
  communityId: string
  language: string
  occasion?: string
  audioUrl?: string
  videoUrl?: string
  imageUrl?: string
  tags?: string[]
}

export interface RecordingSubmissionFormData {
  title: string
  description?: string
  communityId: string
  type: RecordingType
  audioUrl: string
  duration?: number
  transcription?: string
  translation?: string
}

export interface VideoSubmissionFormData {
  title: string
  description?: string
  communityId: string
  type: VideoType
  videoUrl: string
  thumbnailUrl?: string
  duration?: number
}

export interface ModerationFormData {
  submissionId: string
  status: 'APPROVED' | 'REJECTED'
  rejectionReason?: string
}

export interface ProfileUpdateFormData {
  name?: string
  image?: string
  communityId?: string
}

export interface CourseCreateFormData {
  title: string
  description: string
  communityId: string
  languageId: string
  level: CourseLevel
  coverImage?: string
}

export interface LessonCreateFormData {
  title: string
  description?: string
  courseId: string
  order: number
  type: LessonType
  xpReward?: number
  estimatedMinutes?: number
  content: LessonContent
}

// ─── Dashboard / Analytics Types ─────────────────────────────────────────────

export interface CommunityStats {
  communityId: string
  totalWords: number
  totalStories: number
  totalSongs: number
  totalVideos: number
  totalRecordings: number
  totalContributors: number
  totalLearners: number
  pendingSubmissions: number
  approvedThisMonth: number
}

export interface UserStats {
  userId: string
  totalXp: number
  currentLevel: number
  currentStreak: number
  longestStreak: number
  totalLessonsCompleted: number
  totalCoursesCompleted: number
  totalWordsLearned: number
  totalContributions: number
  achievementsEarned: number
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string | null
  image: string | null
  communityName: string | null
  xp: number
  level: number
  streak: number
}

export interface ProgressSummary {
  courseId: string
  courseTitle: string
  communityName: string
  level: CourseLevel
  totalLessons: number
  completedLessons: number
  progressPercent: number
  lastActivityAt: Date | null
}

// ─── Session Extension ────────────────────────────────────────────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
      communityId: string | null
      xp: number
      streak: number
    }
  }

  interface User {
    role?: UserRole
    communityId?: string | null
    xp?: number
    streak?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: UserRole
    communityId?: string | null
    xp?: number
    streak?: number
  }
}
