/**
 * useStore.ts  — store do aluno
 *
 * Disciplinas vêm sempre do Cloudflare KV via useKVContent(),
 * guardadas em kvDisciplines (não persistidas — recarregadas a cada visita).
 *
 * O progresso do aluno (isCompleted, score, examDate) é guardado aqui em separado
 * e sobreposto no momento da leitura via getDisciplines().
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Discipline, StudySession, DailyStats } from '@/types'
import { mockUser, mockDailyStats } from '@/lib/mockData'
import { syncCurrentStudentStats } from '@/store/useStudentAuthStore'

// ── Tipos de progresso guardados pelo aluno ──────────────────────────────────

interface LessonProgress {
  isCompleted: boolean
  score?: number
  completedAt?: string   // ISO string
}

interface StudentProgress {
  /** lessonId → progresso */
  lessons: Record<string, LessonProgress>
  /** disciplineId → examDate ISO */
  examDates: Record<string, string>
}

export interface Exam {
  id: string
  subject: string   // display name, e.g. "História"
  date: string      // ISO date string
  studyNote: string
}

export interface Book {
  id: string
  titulo: string
  autor: string
  capa?: string        // URL or base64
  dataInicio: string   // ISO
  dataFim?: string     // ISO
  status: 'lendo' | 'lido'
  resumo?: string
  partilhado: boolean
}

interface AppState {
  user: User
  sessions: StudySession[]
  dailyStats: DailyStats[]
  progress: StudentProgress
  /** Exames guardados por studentId — nunca apagados ao trocar de aluno */
  examsByStudent: Record<string, Exam[]>
  /** Livros guardados por studentId — nunca apagados ao trocar de aluno */
  booksByStudent: Record<string, Book[]>
  lastStudentId: string | null

  /** Disciplinas vindas do KV (não persistidas — recarregadas a cada visita) */
  kvDisciplines: Discipline[]

  /** Computed: disciplinas com progresso do aluno aplicado */
  getDisciplines: () => Discipline[]
  /** Exames do aluno atual */
  getExams: () => Exam[]
  /** Livros do aluno atual */
  getBooks: () => Book[]

  completeLesson: (lessonId: string, score: number, durationMinutes: number) => void
  setExamDate: (disciplineId: string, date: Date) => void
  setDisciplinesFromKV: (disciplines: Discipline[]) => void
  resetForStudent: (studentId: string) => void

  addExam: (subject: string, date: string) => void
  updateExam: (id: string, subject: string, date: string) => void
  deleteExam: (id: string) => void
  setExamStudyNote: (id: string, note: string) => void

  addBook: (data: Pick<Book, 'titulo' | 'autor' | 'capa'>) => void
  updateBook: (id: string, data: Partial<Pick<Book, 'titulo' | 'autor' | 'capa'>>) => void
  deleteBook: (id: string) => void
  markBookRead: (id: string, resumo: string | undefined, partilhado: boolean) => void
}

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: mockUser,
      sessions: [],
      dailyStats: mockDailyStats,
      progress: { lessons: {}, examDates: {} },
      examsByStudent: {},
      booksByStudent: {},
      lastStudentId: null,
      kvDisciplines: [],

      // ── Computed ──────────────────────────────────────────────────────────

      getExams: () => {
        const id = get().lastStudentId
        if (!id) return []
        return get().examsByStudent[id] ?? []
      },

      getBooks: () => {
        const id = get().lastStudentId
        if (!id) return []
        return get().booksByStudent[id] ?? []
      },

      getDisciplines: () => {
        const merged = get().kvDisciplines
        const { progress } = get()

        // Aplica progresso do aluno sobre o conteúdo
        return merged.map((d) => {
          const examDate = progress.examDates[d.id]
            ? new Date(progress.examDates[d.id])
            : d.examDate

          const topics = d.topics.map((t) => ({
            ...t,
            lessons: t.lessons.map((l) => {
              const p = progress.lessons[l.id]
              if (!p) return l
              return { ...l, isCompleted: p.isCompleted, score: p.score, completedAt: p.completedAt ? new Date(p.completedAt) : undefined }
            }),
          }))

          const completedLessons = topics.flatMap((t) => t.lessons).filter((l) => l.isCompleted).length

          return { ...d, topics, examDate, completedLessons }
        })
      },

      // ── Actions ───────────────────────────────────────────────────────────

      completeLesson: (lessonId, score, durationMinutes) => {
        const { user, dailyStats, sessions, progress, getDisciplines } = get()
        const disciplines = getDisciplines()

        // Descobre qual a lição e a disciplina
        let xpEarned = 0
        let disciplineId = ''
        for (const d of disciplines) {
          for (const t of d.topics) {
            const lesson = t.lessons.find((l) => l.id === lessonId)
            if (lesson && !lesson.isCompleted) {
              xpEarned = Math.round(lesson.xpReward * Math.max(0.5, score / 100))
              disciplineId = d.id
              break
            }
          }
          if (disciplineId) break
        }

        // Actualiza progresso
        const newProgress: StudentProgress = {
          ...progress,
          lessons: {
            ...progress.lessons,
            [lessonId]: { isCompleted: true, score, completedAt: new Date().toISOString() },
          },
        }

        // Actualiza stats diárias
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
          updatedStats.push({
            date: today,
            minutesStudied: durationMinutes,
            lessonsCompleted: 1,
            xpEarned,
            disciplines: [disciplineId],
          })
        }

        // Streak
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
          progress: newProgress,
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

        setTimeout(syncCurrentStudentStats, 100)
      },

      setExamDate: (disciplineId, date) =>
        set({
          progress: {
            ...get().progress,
            examDates: {
              ...get().progress.examDates,
              [disciplineId]: date.toISOString(),
            },
          },
        }),

      setDisciplinesFromKV: (disciplines) => set({ kvDisciplines: disciplines }),

      resetForStudent: (studentId) => {
        if (get().lastStudentId === studentId) return
        // Só reseta progresso/stats — exames nunca são apagados aqui
        set({
          user: { ...mockUser },
          sessions: [],
          dailyStats: [],
          progress: { lessons: {}, examDates: {} },
          lastStudentId: studentId,
        })
      },

      addExam: (subject, date) => {
        const id = get().lastStudentId ?? 'anon'
        const prev = get().examsByStudent[id] ?? []
        set({ examsByStudent: { ...get().examsByStudent, [id]: [...prev, { id: crypto.randomUUID(), subject, date, studyNote: '' }] } })
      },

      updateExam: (examId, subject, date) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().examsByStudent[sid] ?? []
        set({ examsByStudent: { ...get().examsByStudent, [sid]: prev.map((e) => e.id === examId ? { ...e, subject, date } : e) } })
      },

      deleteExam: (examId) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().examsByStudent[sid] ?? []
        set({ examsByStudent: { ...get().examsByStudent, [sid]: prev.filter((e) => e.id !== examId) } })
      },

      setExamStudyNote: (examId, note) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().examsByStudent[sid] ?? []
        set({ examsByStudent: { ...get().examsByStudent, [sid]: prev.map((e) => e.id === examId ? { ...e, studyNote: note } : e) } })
      },

      addBook: (data) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().booksByStudent[sid] ?? []
        const book: Book = {
          ...data,
          id: crypto.randomUUID(),
          dataInicio: new Date().toISOString().split('T')[0],
          status: 'lendo',
          partilhado: false,
        }
        set({ booksByStudent: { ...get().booksByStudent, [sid]: [...prev, book] } })
      },

      updateBook: (bookId, data) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().booksByStudent[sid] ?? []
        set({ booksByStudent: { ...get().booksByStudent, [sid]: prev.map((b) => b.id === bookId ? { ...b, ...data } : b) } })
      },

      deleteBook: (bookId) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().booksByStudent[sid] ?? []
        set({ booksByStudent: { ...get().booksByStudent, [sid]: prev.filter((b) => b.id !== bookId) } })
      },

      markBookRead: (bookId, resumo, partilhado) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().booksByStudent[sid] ?? []
        set({
          booksByStudent: {
            ...get().booksByStudent,
            [sid]: prev.map((b) =>
              b.id === bookId
                ? { ...b, status: 'lido', dataFim: new Date().toISOString().split('T')[0], resumo, partilhado }
                : b
            ),
          },
        })
      },
    }),
    {
      name: 'estudar-pt-v6',   // v6: exams per-student, never reset on login
      partialize: (state) => ({
        user: state.user,
        sessions: state.sessions,
        dailyStats: state.dailyStats,
        progress: state.progress,
        examsByStudent: state.examsByStudent,
        booksByStudent: state.booksByStudent,
        lastStudentId: state.lastStudentId,
        // NÃO persiste disciplines — vêm sempre do KV via useKVContent()
      }),
    }
  )
)
