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
import { useAdminStore } from '@/store/useAdminStore'
import { api } from '@/lib/api'

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

export interface ExamMaterial {
  id: string
  nome: string
  tipo: 'texto' | 'ficheiro'
  conteudo: string
}

export interface DiaPlano {
  dia: number
  data: string
  tema: string
  resumo: string
  flashcards: { frente: string; verso: string }[]
  quiz: { pergunta: string; opcoes: string[]; correta: number; explicacao: string }[]
  resumoActivo?: {
    pergunta: string
    respostaEsperada: string
  }
  lacunas?: { frase: string; resposta: string; opcoes: string[]; explicacao: string }[]
  classificacao?: { instrucao: string; colunas: string[]; itens: { palavra: string; coluna: string }[]; explicacao: string }[]
  transformacao?: { instrucao: string; frase_original: string; resposta: string; dica: string; explicacao: string }[]
  identificacao?: { instrucao: string; frase: string; constituintes: { texto: string; funcao: string }[]; explicacao: string }[]
}

export interface PlanoEstudo {
  geradoEm: string
  resumo: string
  tempoEstimadoPorDia?: number
  avancado?: boolean
  regras?: Record<string, number>
  dias: DiaPlano[]
  diasEstudados: number[]
}

export interface Exam {
  id: string
  subject: string
  date: string
  studyNote: string
  materiais?: ExamMaterial[]
  planoEstudo?: PlanoEstudo
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
  /** Amigos por studentId: array de studentIds */
  friendsByStudent: Record<string, string[]>
  /** Sugestões ignoradas por studentId */
  ignoredSuggestionsByStudent: Record<string, string[]>
  lastStudentId: string | null
  /** Timestamp da última vez que o aluno viu o feed */
  lastSeenFeedAt: string | null
  /** Meta semanal de páginas por aluno (clube de leitura). `weekStart` = Monday ISO. */
  weeklyReadingByStudent: Record<string, { goal: number; weekStart: string; pages: number }>

  /** Disciplinas vindas do KV (não persistidas — recarregadas a cada visita) */
  kvDisciplines: Discipline[]

  /** Computed: disciplinas com progresso do aluno aplicado */
  getDisciplines: () => Discipline[]
  /** Exames do aluno atual */
  getExams: () => Exam[]
  /** Livros do aluno atual */
  getBooks: () => Book[]
  /** Amigos do aluno atual (lista de studentIds) */
  getFriends: () => string[]
  /** Sugestões ignoradas pelo aluno atual */
  getIgnoredSuggestions: () => string[]

  completeLesson: (lessonId: string, score: number, durationMinutes: number) => void
  setExamDate: (disciplineId: string, date: Date) => void
  setDisciplinesFromKV: (disciplines: Discipline[]) => void
  resetForStudent: (studentId: string) => void

  addExam: (subject: string, date: string) => Promise<void> | void
  updateExam: (id: string, subject: string, date: string) => void
  deleteExam: (id: string) => void
  setExamStudyNote: (id: string, note: string) => void
  addExamMaterial: (examId: string, material: Omit<ExamMaterial, 'id'>) => void
  removeExamMaterial: (examId: string, materialId: string) => void
  setExamPlano: (examId: string, plano: PlanoEstudo) => void
  markDiaEstudado: (examId: string, dia: number) => void
  awardStudyPlanXP: (xp: number, minutes?: number) => void

  addFriend: (friendId: string) => void
  removeFriend: (friendId: string) => void
  ignoreSuggestion: (friendId: string) => void

  /** Meta semanal de páginas (clube de leitura) */
  getWeeklyReading: () => { goal: number; weekStart: string; pages: number }
  setWeeklyReadingGoal: (goal: number) => void
  addPagesRead: (pages: number) => void

  addBook: (data: Pick<Book, 'titulo' | 'autor' | 'capa'>) => void
  updateBook: (id: string, data: Partial<Pick<Book, 'titulo' | 'autor' | 'capa' | 'resumo' | 'partilhado'>>) => void
  deleteBook: (id: string) => void
  markBookRead: (id: string, resumo: string | undefined, partilhado: boolean) => void

  /** Fetch per-student data from server */
  fetchServerData: (studentId: string) => Promise<void>
  /** Marca o feed como visto agora */
  markFeedSeen: () => void
}

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function mondayOfWeek(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const offset = (d.getDay() + 6) % 7  // Mon=0
  d.setDate(d.getDate() - offset)
  return d.toISOString().split('T')[0]
}

/**
 * Mantém o snapshot de `allBooks` e `sharedBooks` no student (KV) alinhado
 * com a lista viva em `booksByStudent`. Os colegas só conseguem ver o que
 * vem deste snapshot, portanto tem de estar sempre fresco — caso contrário
 * o Club Dashboard dum aluno mostra livros apagados.
 */
function syncStudentBooksSnapshot(studentId: string, books: Book[]) {
  const allBooks = books.map((b) => ({ titulo: b.titulo, autor: b.autor, status: b.status }))
  const shared = books
    .filter((b) => b.partilhado && b.status === 'lido')
    .map((b) => ({
      bookId: b.id,
      titulo: b.titulo,
      autor: b.autor,
      resumo: b.resumo ?? '',
      dataFim: b.dataFim ?? '',
    }))
  // Escreve directamente o snapshot localmente e no KV sem tocar noutros campos.
  useAdminStore.setState((s) => ({
    students: s.students.map((st) =>
      st.id === studentId ? { ...st, allBooks, sharedBooks: shared } : st,
    ),
  }))
  api.updateStudent(studentId, { allBooks, sharedBooks: shared })
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
      friendsByStudent: {},
      ignoredSuggestionsByStudent: {},
      lastStudentId: null,
      lastSeenFeedAt: null,
      weeklyReadingByStudent: {},
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

      getFriends: () => {
        const id = get().lastStudentId
        if (!id) return []
        return get().friendsByStudent[id] ?? []
      },

      getIgnoredSuggestions: () => {
        const id = get().lastStudentId
        if (!id) return []
        return get().ignoredSuggestionsByStudent[id] ?? []
      },

      getWeeklyReading: () => {
        const id = get().lastStudentId
        const ws = mondayOfWeek()
        const fallback = { goal: 0, weekStart: ws, pages: 0 }
        if (!id) return fallback
        const entry = get().weeklyReadingByStudent[id]
        // Se mudou a semana, reinicia as páginas mas preserva a meta.
        if (!entry || entry.weekStart !== ws) {
          return { goal: entry?.goal ?? 0, weekStart: ws, pages: 0 }
        }
        return entry
      },

      setWeeklyReadingGoal: (goal) => {
        const id = get().lastStudentId
        if (!id) return
        const ws = mondayOfWeek()
        const prev = get().weeklyReadingByStudent[id]
        const pages = prev && prev.weekStart === ws ? prev.pages : 0
        set({
          weeklyReadingByStudent: {
            ...get().weeklyReadingByStudent,
            [id]: { goal: Math.max(0, Math.round(goal)), weekStart: ws, pages },
          },
        })
      },

      addPagesRead: (pages) => {
        const id = get().lastStudentId
        if (!id) return
        const ws = mondayOfWeek()
        const prev = get().weeklyReadingByStudent[id]
        const currentPages = prev && prev.weekStart === ws ? prev.pages : 0
        const goal = prev?.goal ?? 0
        set({
          weeklyReadingByStudent: {
            ...get().weeklyReadingByStudent,
            [id]: { goal, weekStart: ws, pages: Math.max(0, currentPages + pages) },
          },
        })
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
        // Save to server
        const sid = get().lastStudentId
        if (sid) {
          api.saveProgress(sid, { lessonId, score, completedAt: new Date().toISOString() })
          api.saveUserData(sid, { user: get().user, sessions: get().sessions, dailyStats: get().dailyStats })
        }
      },

      setExamDate: (disciplineId, date) => {
        set({
          progress: {
            ...get().progress,
            examDates: {
              ...get().progress.examDates,
              [disciplineId]: date.toISOString(),
            },
          },
        })
        const sid = get().lastStudentId
        if (sid) api.saveProgress(sid, { disciplineId, examDate: date.toISOString() })
      },

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

      addExam: async (subject, date) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().examsByStudent[sid] ?? []
        // Use a temp ID for instant UI, then replace with server ID
        const tempId = crypto.randomUUID()
        const tempExam = { id: tempId, subject, date, studyNote: '' }
        set({ examsByStudent: { ...get().examsByStudent, [sid]: [...prev, tempExam] } })
        try {
          const serverExam = await api.addExam(sid, subject, date)
          if (serverExam?.id) {
            set({ examsByStudent: { ...get().examsByStudent, [sid]: get().examsByStudent[sid].map((e) =>
              e.id === tempId ? { ...e, id: serverExam.id } : e
            ) } })
          }
        } catch { /* offline — keep temp id */ }
      },

      updateExam: (examId, subject, date) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().examsByStudent[sid] ?? []
        set({ examsByStudent: { ...get().examsByStudent, [sid]: prev.map((e) => e.id === examId ? { ...e, subject, date } : e) } })
        api.updateExam(sid, examId, { subject, date })
      },

      deleteExam: (examId) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().examsByStudent[sid] ?? []
        set({ examsByStudent: { ...get().examsByStudent, [sid]: prev.filter((e) => e.id !== examId) } })
        api.deleteExam(sid, examId)
      },

      setExamStudyNote: (examId, note) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().examsByStudent[sid] ?? []
        set({ examsByStudent: { ...get().examsByStudent, [sid]: prev.map((e) => e.id === examId ? { ...e, studyNote: note } : e) } })
        api.updateExam(sid, examId, { studyNote: note })
      },

      addExamMaterial: (examId, material) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().examsByStudent[sid] ?? []
        const mat = { ...material, id: crypto.randomUUID() }
        set({ examsByStudent: { ...get().examsByStudent, [sid]: prev.map((e) =>
          e.id === examId ? { ...e, materiais: [...(e.materiais ?? []), mat] } : e
        ) } })
        api.updateExam(sid, examId, { materiais: prev.find((e) => e.id === examId)?.materiais ? [...(prev.find((e) => e.id === examId)!.materiais ?? []), mat] : [mat] })
      },

      removeExamMaterial: (examId, materialId) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().examsByStudent[sid] ?? []
        const exam = prev.find((e) => e.id === examId)
        const updated = (exam?.materiais ?? []).filter((m) => m.id !== materialId)
        set({ examsByStudent: { ...get().examsByStudent, [sid]: prev.map((e) =>
          e.id === examId ? { ...e, materiais: updated } : e
        ) } })
        api.updateExam(sid, examId, { materiais: updated })
      },

      setExamPlano: (examId, plano) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().examsByStudent[sid] ?? []
        set({ examsByStudent: { ...get().examsByStudent, [sid]: prev.map((e) =>
          e.id === examId ? { ...e, planoEstudo: plano } : e
        ) } })
        api.updateExam(sid, examId, { planoEstudo: plano })
      },

      markDiaEstudado: (examId, dia) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().examsByStudent[sid] ?? []
        const exam = prev.find((e) => e.id === examId)
        const diasEstudados = [...new Set([...(exam?.planoEstudo?.diasEstudados ?? []), dia])]
        set({ examsByStudent: { ...get().examsByStudent, [sid]: prev.map((e) =>
          e.id === examId && e.planoEstudo ? { ...e, planoEstudo: { ...e.planoEstudo, diasEstudados } } : e
        ) } })
        if (exam?.planoEstudo) api.updateExam(sid, examId, { planoEstudo: { ...exam.planoEstudo, diasEstudados } })
      },

      awardStudyPlanXP: (xp, minutes = 0) => {
        const user = get().user
        const today = new Date().toISOString().split('T')[0]
        const dailyStats = [...get().dailyStats]
        const idx = dailyStats.findIndex((s) => s.date === today)

        // Update daily stats
        if (idx >= 0) {
          dailyStats[idx] = {
            ...dailyStats[idx],
            minutesStudied: dailyStats[idx].minutesStudied + minutes,
            xpEarned: dailyStats[idx].xpEarned + xp,
          }
        } else {
          dailyStats.push({ date: today, minutesStudied: minutes, lessonsCompleted: 0, xpEarned: xp, disciplines: [] })
        }

        // Update streak
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const studiedYesterday = dailyStats.some((s) => s.date === yesterday && s.minutesStudied > 0)
        const alreadyStudiedToday = get().dailyStats.some((s) => s.date === today && s.minutesStudied > 0)
        const newStreak = alreadyStudiedToday ? user.streak : studiedYesterday ? user.streak + 1 : 1

        set({
          user: {
            ...user,
            xp: user.xp + xp,
            totalStudyMinutes: user.totalStudyMinutes + minutes,
            streak: newStreak,
            longestStreak: Math.max(user.longestStreak, newStreak),
          },
          dailyStats,
        })

        setTimeout(syncCurrentStudentStats, 100)
        const sid = get().lastStudentId
        if (sid) api.saveUserData(sid, { user: get().user, dailyStats: get().dailyStats })
      },

      addFriend: (friendId) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().friendsByStudent[sid] ?? []
        if (prev.includes(friendId)) return
        set({ friendsByStudent: { ...get().friendsByStudent, [sid]: [...prev, friendId] } })
        api.addFriend(sid, friendId)
      },

      removeFriend: (friendId) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().friendsByStudent[sid] ?? []
        set({ friendsByStudent: { ...get().friendsByStudent, [sid]: prev.filter((id) => id !== friendId) } })
        api.removeFriend(sid, friendId)
      },

      ignoreSuggestion: (friendId) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().ignoredSuggestionsByStudent[sid] ?? []
        if (prev.includes(friendId)) return
        set({ ignoredSuggestionsByStudent: { ...get().ignoredSuggestionsByStudent, [sid]: [...prev, friendId] } })
        api.ignoreSuggestion(sid, friendId)
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
        const next = [...prev, book]
        set({ booksByStudent: { ...get().booksByStudent, [sid]: next } })
        api.addBook(sid, data)
        syncStudentBooksSnapshot(sid, next)
      },

      updateBook: (bookId, data) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().booksByStudent[sid] ?? []
        const next = prev.map((b) => b.id === bookId ? { ...b, ...data } : b)
        set({ booksByStudent: { ...get().booksByStudent, [sid]: next } })
        api.updateBook(sid, bookId, data)
        syncStudentBooksSnapshot(sid, next)
      },

      deleteBook: (bookId) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().booksByStudent[sid] ?? []
        const bookToDelete = prev.find((b) => b.id === bookId)
        const next = prev.filter((b) => b.id !== bookId)
        set({ booksByStudent: { ...get().booksByStudent, [sid]: next } })
        api.deleteBook(sid, bookId)
        syncStudentBooksSnapshot(sid, next)

        // Remove posts do feed associados a este livro (bookId direto ou
        // fallback por título para posts antigos antes do campo existir).
        const adminState = useAdminStore.getState()
        const feedItems = adminState.feedItems
        const toDelete = feedItems.filter((f) => {
          if (f.autorId !== sid) return false
          if (f.bookId === bookId) return true
          if (bookToDelete && (f.tipo === 'resumo' || f.tipo === 'lista')) {
            return f.conteudo.includes(`"${bookToDelete.titulo}"`)
          }
          return false
        })
        for (const f of toDelete) adminState.deleteFeedItem(f.id)
      },

      markBookRead: (bookId, resumo, partilhado) => {
        const sid = get().lastStudentId ?? 'anon'
        const prev = get().booksByStudent[sid] ?? []
        const next = prev.map((b) =>
          b.id === bookId
            ? { ...b, status: 'lido' as const, dataFim: new Date().toISOString().split('T')[0], resumo, partilhado }
            : b,
        )
        set({ booksByStudent: { ...get().booksByStudent, [sid]: next } })
        api.updateBook(sid, bookId, { status: 'lido', dataFim: new Date().toISOString().split('T')[0], resumo, partilhado })
        syncStudentBooksSnapshot(sid, next)
      },

      fetchServerData: async (studentId) => {
        const [friends, ignored, books, exams, progress, userData] = await Promise.all([
          api.getFriends(studentId),
          api.getIgnoredSuggestions(studentId),
          api.getBooks(studentId),
          api.getExams(studentId),
          api.getProgress(studentId),
          api.getUserData(studentId),
        ])
        const updates: Partial<AppState> = {
          friendsByStudent: { ...get().friendsByStudent, [studentId]: friends },
          ignoredSuggestionsByStudent: { ...get().ignoredSuggestionsByStudent, [studentId]: ignored },
          booksByStudent: { ...get().booksByStudent, [studentId]: books },
          examsByStudent: { ...get().examsByStudent, [studentId]: exams },
          progress,
        }
        // Load user stats from server if available
        if (userData?.user) updates.user = { ...get().user, ...userData.user }
        if (userData?.sessions) updates.sessions = userData.sessions
        if (userData?.dailyStats) updates.dailyStats = userData.dailyStats
        set(updates)
      },

      markFeedSeen: () => set({ lastSeenFeedAt: new Date().toISOString() }),
    }),
    {
      name: 'estudar-pt-v7',   // v7: all data on server, localStorage only for session
      partialize: (state) => ({
        lastStudentId: state.lastStudentId,
        lastSeenFeedAt: state.lastSeenFeedAt,
        // Tudo o resto vem do servidor via fetchServerData()
      }),
    }
  )
)
