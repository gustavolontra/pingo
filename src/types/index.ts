export type ContentType = 'text' | 'audio' | 'video' | 'quiz' | 'exercise' | 'flashcard'
export type DifficultyLevel = 'basico' | 'intermedio' | 'avancado'
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
  rarity: BadgeRarity
}

export interface User {
  id: string
  name: string
  avatar?: string
  level: number
  xp: number
  xpForNextLevel: number
  streak: number
  longestStreak: number
  totalStudyMinutes: number
  badges: Badge[]
  joinedAt: Date
}

export interface Discipline {
  id: string
  name: string
  subject: string
  year: number
  color: string
  icon: string
  topics: Topic[]
  examDate?: Date
  totalLessons: number
  completedLessons: number
}

export interface Topic {
  id: string
  disciplineId: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
  isUnlocked: boolean
  completedAt?: Date
}

export interface Lesson {
  id: string
  topicId: string
  title: string
  type: ContentType
  difficulty: DifficultyLevel
  estimatedMinutes: number
  content: LessonContent
  xpReward: number
  isCompleted: boolean
  completedAt?: Date
  score?: number
}

export type LessonContent = TextContent | AudioContent | QuizContent | FlashcardContent

export interface TextContent {
  type: 'text'
  body: string
  keyPoints: string[]
}

export interface AudioContent {
  type: 'audio'
  audioUrl: string
  transcript: string
  duration: number
  keyPoints: string[]
}

export interface QuizContent {
  type: 'quiz'
  questions: Question[]
}

export interface FlashcardContent {
  type: 'flashcard'
  cards: Flashcard[]
}

export interface Question {
  id: string
  text: string
  type: 'multiple-choice' | 'true-false' | 'fill-blank'
  options?: string[]
  correctAnswer: string | number
  explanation: string
  hint?: string
}

export interface Flashcard {
  id: string
  front: string
  back: string
  example?: string
}

export interface StudyPlan {
  disciplineId: string
  examDate: Date
  createdAt: Date
  dailySessions: DailySession[]
}

export interface DailySession {
  date: Date
  lessons: string[]
  estimatedMinutes: number
  isCompleted: boolean
  completedAt?: Date
}

export interface StudySession {
  id: string
  disciplineId: string
  lessonId: string
  startedAt: Date
  endedAt: Date
  durationMinutes: number
  xpEarned: number
  score?: number
}

export interface DailyStats {
  date: string
  minutesStudied: number
  lessonsCompleted: number
  xpEarned: number
  disciplines: string[]
}

export interface LeaderboardEntry {
  userId: string
  name: string
  avatar?: string
  xp: number
  level: number
  weeklyXp: number
  rank: number
}
