import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Discipline, StudySession, DailyStats } from '@/types'
import { mockUser, mockDisciplines, mockDailyStats } from '@/lib/mockData'

interface AppState {
  user: User
  disciplines: Discipline[]
  sessions: StudySession[]
  dailyStats: DailyStats[]

  completeLesson: (lessonId: string, score: number, durationMinutes: number) => void
  setExamDate: (disciplineId: string, date: Date) => void
}

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: mockUser,
      disciplines: mockDisciplines,
      sessions: [],
      dailyStats: mockDailyStats,

      completeLesson: (lessonId, score, durationMinutes) => {
        const { disciplines, user, dailyStats, sessions } = get()
        let xpEarned = 0
        let disciplineId = ''

        const updatedDisciplines = disciplines.map((d) => {
          let found = false
          const updatedTopics = d.topics.map((t) => ({
            ...t,
            lessons: t.lessons.map((l) => {
              if (l.id === lessonId && !l.isCompleted) {
                xpEarned = Math.round(l.xpReward * Math.max(0.5, score / 100))
                disciplineId = d.id
                found = true
                return { ...l, isCompleted: true, completedAt: new Date(), score }
              }
              return l
            }),
          }))
          if (!found) return d
          const completedLessons = updatedTopics.flatMap((t) => t.lessons).filter((l) => l.isCompleted).length
          return { ...d, topics: updatedTopics, completedLessons }
        })

        // Update today's stats
        const today = todayKey()
        const existingIdx = dailyStats.findIndex((s) => s.date === today)
        let updatedStats = [...dailyStats]
        if (existingIdx >= 0) {
          updatedStats[existingIdx] = {
            ...updatedStats[existingIdx],
            minutesStudied: updatedStats[existingIdx].minutesStudied + durationMinutes,
            lessonsCompleted: updatedStats[existingIdx].lessonsCompleted + 1,
            xpEarned: updatedStats[existingIdx].xpEarned + xpEarned,
          }
        } else {
          updatedStats.push({ date: today, minutesStudied: durationMinutes, lessonsCompleted: 1, xpEarned, disciplines: [disciplineId] })
        }

        // Check streak
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const studiedYesterday = dailyStats.some((s) => s.date === yesterday && s.minutesStudied > 0)
        const studiedToday = dailyStats.some((s) => s.date === today && s.minutesStudied > 0)
        const newStreak = studiedToday ? user.streak : studiedYesterday ? user.streak + 1 : 1

        const newSession: StudySession = {
          id: crypto.randomUUID(),
          disciplineId,
          lessonId,
          startedAt: new Date(Date.now() - durationMinutes * 60000),
          endedAt: new Date(),
          durationMinutes,
          xpEarned,
          score,
        }

        set({
          disciplines: updatedDisciplines,
          dailyStats: updatedStats,
          sessions: [...sessions, newSession],
          user: {
            ...user,
            xp: user.xp + xpEarned,
            totalStudyMinutes: user.totalStudyMinutes + durationMinutes,
            streak: newStreak,
            longestStreak: Math.max(user.longestStreak, newStreak),
          },
        })
      },

      setExamDate: (disciplineId, date) =>
        set({
          disciplines: get().disciplines.map((d) =>
            d.id === disciplineId ? { ...d, examDate: date } : d
          ),
        }),
    }),
    { name: 'estudar-pt-v2' }
  )
)
