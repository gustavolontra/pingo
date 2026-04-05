import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hashPassword } from '@/lib/crypto'
import { api } from '@/lib/api'
import { getDisciplineOption } from '@/lib/contentBridge'

function syncDisciplines(disciplines: ManagedDiscipline[]) {
  api.putDisciplines(disciplines.map(({ id, name, subject, year, color, icon }) => ({
    id, name, subject, year, color, icon,
  }))).catch(() => {/* silent – offline ok */})
}

export interface AdminUser {
  id: string
  email: string
  passwordHash: string
  role: 'master' | 'admin'
  name: string
}

export interface Student {
  id: string
  login: string
  name: string
  email: string
  school: string
  grade: string
  passwordHash: string
  createdAt: string
  isActive: boolean
  xp: number
  level: number
  streak: number
  lessonsCompleted: number
  totalStudyMinutes: number
  lastActiveAt?: string
  sharedBooks?: { bookId: string; titulo: string; autor: string; resumo: string; dataFim: string }[]
  listaPartilhada?: boolean
  allBooks?: { titulo: string; autor: string; status: 'lendo' | 'lido' }[]
}

export interface FeedItem {
  id: string
  autorId: string
  autorNome: string
  autorAt: string
  tipo: 'resumo' | 'lista' | 'badge' | 'desafio'
  conteudo: string
  data: string
  reacoes: Record<string, string[]>  // tipo → [studentId, ...]
}

// ─── Content types ────────────────────────────────────────────────────────────

export interface AdminTextContent {
  type: 'text'
  body: string
  keyPoints: string[]
}

export interface AdminQuestion {
  id: string
  text: string
  type: 'multiple-choice' | 'true-false'
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface AdminQuizContent {
  type: 'quiz'
  questions: AdminQuestion[]
}

export interface AdminFlashcard {
  id: string
  front: string
  back: string
}

export interface AdminFlashcardContent {
  type: 'flashcard'
  cards: AdminFlashcard[]
}

export type AdminLessonContent = AdminTextContent | AdminQuizContent | AdminFlashcardContent

export interface AdminLesson {
  id: string
  topicId: string
  title: string
  type: 'text' | 'quiz' | 'flashcard'
  estimatedMinutes: number
  xpReward: number
  order: number
  content: AdminLessonContent
}

export interface AdminTopic {
  id: string
  disciplineId: string
  title: string
  description: string
  order: number
  lessons: AdminLesson[]
}

export interface ManagedDiscipline {
  id: string
  name: string
  subject: string
  year: number
  color: string
  icon: string
  createdAt: string
  topics: AdminTopic[]
}

// ─── Content drafts ───────────────────────────────────────────────────────────

export interface DraftFlashcard {
  frente: string
  verso: string
  exemplo: string
}

export interface DraftQuestion {
  pergunta: string
  tipo: 'multiple-choice' | 'true-false'
  opcoes: string[]
  correta: number
  explicacao: string
}

export interface ContentDraft {
  id: string
  titulo: string
  materia: string
  disciplineId: string
  ano: number
  topico: string
  palavrasChave: string[]
  resumo: string
  flashcards: DraftFlashcard[]
  quiz: DraftQuestion[]
  rawContent: string
  createdAt: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

// SHA-256 of "1234"
const MASTER_PASSWORD_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'

const INITIAL_ADMIN: AdminUser = {
  id: 'master-1',
  email: 'gustavolontra@gmail.com',
  passwordHash: MASTER_PASSWORD_HASH,
  role: 'master',
  name: 'Gustavo Lontra',
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface AdminState {
  isAuthenticated: boolean
  currentAdmin: AdminUser | null
  admins: AdminUser[]
  students: Student[]
  disciplines: ManagedDiscipline[]
  hiddenStaticIds: string[]
  contentDrafts: ContentDraft[]
  feedItems: FeedItem[]

  // Auth
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void

  // Students
  createStudent: (data: { login: string; name: string; school: string; grade: string; password: string }) => Promise<void>
  updateStudent: (id: string, data: Partial<Pick<Student, 'name' | 'email' | 'school' | 'grade' | 'isActive'>>) => void
  syncStudentStats: (id: string, stats: Pick<Student, 'xp' | 'level' | 'streak' | 'lessonsCompleted' | 'totalStudyMinutes'>) => void
  updateStudentSharedBooks: (id: string, books: NonNullable<Student['sharedBooks']>) => void
  toggleStudentListShare: (id: string, shared: boolean, allBooks: NonNullable<Student['allBooks']>) => void
  deleteStudent: (id: string) => void

  // Feed
  addFeedItem: (item: Omit<FeedItem, 'id' | 'data' | 'reacoes'>) => void
  deleteFeedItem: (itemId: string) => void
  reactToFeedItem: (itemId: string, tipo: string, studentId: string) => void

  // Disciplines
  createDiscipline: (data: Omit<ManagedDiscipline, 'id' | 'createdAt' | 'topics'>) => void
  deleteDiscipline: (id: string) => void
  hideStaticDiscipline: (id: string) => void

  // Content drafts
  saveDraft: (draft: Omit<ContentDraft, 'id' | 'createdAt'>) => ContentDraft
  updateDraft: (id: string, data: Partial<Omit<ContentDraft, 'id' | 'createdAt'>>) => void
  deleteDraft: (id: string) => void

  // Publish learning (creates discipline + topic + lessons in one shot)
  publishLearning: (data: Omit<ContentDraft, 'id' | 'createdAt'>) => void

  // Topics
  addTopic: (disciplineId: string, data: Pick<AdminTopic, 'title' | 'description'>) => void
  updateTopic: (disciplineId: string, topicId: string, data: Partial<Pick<AdminTopic, 'title' | 'description'>>) => void
  deleteTopic: (disciplineId: string, topicId: string) => void

  // Lessons
  addLesson: (disciplineId: string, topicId: string, data: Pick<AdminLesson, 'title' | 'type'>) => void
  updateLesson: (disciplineId: string, topicId: string, lessonId: string, data: Partial<AdminLesson>) => void
  deleteLesson: (disciplineId: string, topicId: string, lessonId: string) => void
}

function updateDiscipline(
  disciplines: ManagedDiscipline[],
  disciplineId: string,
  fn: (d: ManagedDiscipline) => ManagedDiscipline
): ManagedDiscipline[] {
  return disciplines.map((d) => (d.id === disciplineId ? fn(d) : d))
}

function updateTopic(
  topics: AdminTopic[],
  topicId: string,
  fn: (t: AdminTopic) => AdminTopic
): AdminTopic[] {
  return topics.map((t) => (t.id === topicId ? fn(t) : t))
}

function disciplineDefaults(materia: string): { color: string; icon: string } {
  const m = materia.toLowerCase()
  if (m.includes('hist')) return { color: '#e05252', icon: '🏛️' }
  if (m.includes('geo')) return { color: '#10b981', icon: '🌍' }
  if (m.includes('mat')) return { color: '#6270f5', icon: '📐' }
  if (m.includes('port')) return { color: '#f59e0b', icon: '📖' }
  if (m.includes('ciên') || m.includes('cien')) return { color: '#0ea5e9', icon: '🔬' }
  if (m.includes('fís') || m.includes('fis')) return { color: '#8b5cf6', icon: '⚡' }
  if (m.includes('quím') || m.includes('quim')) return { color: '#ec4899', icon: '🧪' }
  if (m.includes('bio')) return { color: '#22c55e', icon: '🌿' }
  return { color: '#6270f5', icon: '📚' }
}

function defaultContent(type: AdminLesson['type']): AdminLessonContent {
  if (type === 'quiz') return { type: 'quiz', questions: [] }
  if (type === 'flashcard') return { type: 'flashcard', cards: [] }
  return { type: 'text', body: '', keyPoints: [] }
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentAdmin: null,
      admins: [INITIAL_ADMIN],
      students: [],
      disciplines: [],
      hiddenStaticIds: [],
      contentDrafts: [],
      feedItems: [],

      // ── Auth ────────────────────────────────────────────────────────────────

      login: async (email, password) => {
        const hash = await hashPassword(password)
        const admin = get().admins.find((a) => a.email === email && a.passwordHash === hash)
        if (admin) {
          set({ isAuthenticated: true, currentAdmin: admin })
          return true
        }
        return false
      },

      logout: () => set({ isAuthenticated: false, currentAdmin: null }),

      // ── Students ────────────────────────────────────────────────────────────

      createStudent: async ({ login, name, school, grade, password }) => {
        const passwordHash = await hashPassword(password)
        const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).trim()
        const student: Student = {
          id: crypto.randomUUID(),
          login: login.toLowerCase().trim(),
          name: titleCase(name),
          email: login.toLowerCase().trim(),
          school: titleCase(school),
          grade, passwordHash,
          createdAt: new Date().toISOString(),
          isActive: true,
          xp: 0, level: 1, streak: 0, lessonsCompleted: 0, totalStudyMinutes: 0,
        }
        set({ students: [...get().students, student] })
      },

      updateStudent: (id, data) =>
        set({ students: get().students.map((s) => (s.id === id ? { ...s, ...data } : s)) }),

      syncStudentStats: (id, stats) =>
        set({
          students: get().students.map((s) =>
            s.id === id ? { ...s, ...stats, lastActiveAt: new Date().toISOString() } : s
          ),
        }),

      updateStudentSharedBooks: (id: string, books: NonNullable<Student['sharedBooks']>) =>
        set({
          students: get().students.map((s) =>
            s.id === id ? { ...s, sharedBooks: books } : s
          ),
        }),

      toggleStudentListShare: (id, shared, allBooks) =>
        set({
          students: get().students.map((s) =>
            s.id === id ? { ...s, listaPartilhada: shared, allBooks } : s
          ),
        }),

      deleteStudent: (id) =>
        set({ students: get().students.filter((s) => s.id !== id) }),

      // ── Feed ────────────────────────────────────────────────────────────────

      addFeedItem: (item) =>
        set({
          feedItems: [
            { ...item, id: crypto.randomUUID(), data: new Date().toISOString(), reacoes: {} },
            ...get().feedItems,
          ],
        }),

      deleteFeedItem: (itemId) =>
        set({ feedItems: get().feedItems.filter((f) => f.id !== itemId) }),

      reactToFeedItem: (itemId, tipo, studentId) =>
        set({
          feedItems: get().feedItems.map((f) => {
            if (f.id !== itemId) return f
            const prev = f.reacoes[tipo] ?? []
            const already = prev.includes(studentId)
            return {
              ...f,
              reacoes: {
                ...f.reacoes,
                [tipo]: already ? prev.filter((id) => id !== studentId) : [...prev, studentId],
              },
            }
          }),
        }),

      // ── Disciplines ─────────────────────────────────────────────────────────

      createDiscipline: (data) => {
        const discipline: ManagedDiscipline = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          topics: [],
        }
        const updated = [...get().disciplines, discipline]
        set({ disciplines: updated })
        syncDisciplines(updated)
      },

      deleteDiscipline: (id) => {
        const updated = get().disciplines.filter((d) => d.id !== id)
        set({ disciplines: updated })
        syncDisciplines(updated)
      },

      hideStaticDiscipline: (id) =>
        set({ hiddenStaticIds: [...get().hiddenStaticIds.filter((x) => x !== id), id] }),

      saveDraft: (data) => {
        const draft: ContentDraft = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
        set({ contentDrafts: [...get().contentDrafts, draft] })
        return draft
      },

      updateDraft: (id, data) =>
        set({ contentDrafts: get().contentDrafts.map((d) => d.id === id ? { ...d, ...data } : d) }),

      deleteDraft: (id) =>
        set({ contentDrafts: get().contentDrafts.filter((d) => d.id !== id) }),

      publishLearning: (data) => {
        let disciplines = [...get().disciplines]

        // Find or create discipline
        let disc = disciplines.find((d) => d.id === data.disciplineId)
        if (!disc) {
          const opt = getDisciplineOption(data.disciplineId)
          // opt.name !== opt.id means it was found in DISCIPLINE_OPTIONS (not a fallback)
          const knownOpt = opt.name !== opt.id
          const defaults = disciplineDefaults(data.materia)
          disc = {
            id: data.disciplineId,
            name: knownOpt ? opt.name : data.materia,
            subject: knownOpt ? opt.subject : data.materia,
            year: data.ano,
            color: knownOpt ? opt.color : defaults.color,
            icon: knownOpt ? opt.icon : defaults.icon,
            createdAt: new Date().toISOString(),
            topics: [],
          }
          disciplines = [...disciplines, disc]
        }

        // Find or create topic
        const existingTopic = disc.topics.find(
          (t) => t.title.toLowerCase() === data.topico.toLowerCase()
        )
        const topicId = existingTopic?.id ?? crypto.randomUUID()
        const baseOrder = existingTopic ? existingTopic.lessons.length : 0

        // Build lessons
        const newLessons: AdminLesson[] = [
          {
            id: crypto.randomUUID(),
            topicId,
            title: data.titulo,
            type: 'text',
            estimatedMinutes: 10,
            xpReward: 50,
            order: baseOrder + 1,
            content: { type: 'text', body: data.resumo, keyPoints: data.palavrasChave },
          },
          ...(data.flashcards.length > 0 ? [{
            id: crypto.randomUUID(),
            topicId,
            title: `Flashcards — ${data.titulo}`,
            type: 'flashcard' as const,
            estimatedMinutes: 5,
            xpReward: 30,
            order: baseOrder + 2,
            content: {
              type: 'flashcard' as const,
              cards: data.flashcards.map((f) => ({
                id: crypto.randomUUID(),
                front: f.frente,
                back: f.verso,
              })),
            },
          }] : []),
          ...(data.quiz.length > 0 ? [{
            id: crypto.randomUUID(),
            topicId,
            title: `Quiz — ${data.titulo}`,
            type: 'quiz' as const,
            estimatedMinutes: 8,
            xpReward: 40,
            order: baseOrder + 3,
            content: {
              type: 'quiz' as const,
              questions: data.quiz.map((q) => ({
                id: crypto.randomUUID(),
                text: q.pergunta,
                type: q.tipo,
                options: q.opcoes,
                correctAnswer: q.correta,
                explanation: q.explicacao,
              })),
            },
          }] : []),
        ]

        // Merge topic into discipline
        const updatedTopics = existingTopic
          ? disc.topics.map((t) =>
              t.id === topicId ? { ...t, lessons: [...t.lessons, ...newLessons] } : t
            )
          : [
              ...disc.topics,
              {
                id: topicId,
                disciplineId: data.disciplineId,
                title: data.topico,
                description: '',
                order: disc.topics.length + 1,
                lessons: newLessons,
              },
            ]

        const updatedDisc = { ...disc, topics: updatedTopics }
        const updated = disciplines.map((d) => (d.id === data.disciplineId ? updatedDisc : d))
        set({ disciplines: updated })
        syncDisciplines(updated)
      },

      // ── Topics ──────────────────────────────────────────────────────────────

      addTopic: (disciplineId, { title, description }) => {
        const disc = get().disciplines.find((d) => d.id === disciplineId)
        if (!disc) return
        const existingTopics = disc.topics ?? []
        const topic: AdminTopic = {
          id: crypto.randomUUID(),
          disciplineId,
          title,
          description,
          order: existingTopics.length + 1,
          lessons: [],
        }
        set({
          disciplines: updateDiscipline(get().disciplines, disciplineId, (d) => ({
            ...d, topics: [...(d.topics ?? []), topic],
          })),
        })
      },

      updateTopic: (disciplineId, topicId, data) =>
        set({
          disciplines: updateDiscipline(get().disciplines, disciplineId, (d) => ({
            ...d,
            topics: updateTopic(d.topics, topicId, (t) => ({ ...t, ...data })),
          })),
        }),

      deleteTopic: (disciplineId, topicId) =>
        set({
          disciplines: updateDiscipline(get().disciplines, disciplineId, (d) => ({
            ...d, topics: d.topics.filter((t) => t.id !== topicId),
          })),
        }),

      // ── Lessons ─────────────────────────────────────────────────────────────

      addLesson: (disciplineId, topicId, { title, type }) => {
        const disc = get().disciplines.find((d) => d.id === disciplineId)
        const topic = (disc?.topics ?? []).find((t) => t.id === topicId)
        if (!topic) return
        const lesson: AdminLesson = {
          id: crypto.randomUUID(),
          topicId,
          title,
          type,
          estimatedMinutes: 10,
          xpReward: 50,
          order: topic.lessons.length + 1,
          content: defaultContent(type),
        }
        set({
          disciplines: updateDiscipline(get().disciplines, disciplineId, (d) => ({
            ...d,
            topics: updateTopic(d.topics, topicId, (t) => ({
              ...t, lessons: [...t.lessons, lesson],
            })),
          })),
        })
      },

      updateLesson: (disciplineId, topicId, lessonId, data) =>
        set({
          disciplines: updateDiscipline(get().disciplines, disciplineId, (d) => ({
            ...d,
            topics: updateTopic(d.topics, topicId, (t) => ({
              ...t,
              lessons: t.lessons.map((l) => (l.id === lessonId ? { ...l, ...data } : l)),
            })),
          })),
        }),

      deleteLesson: (disciplineId, topicId, lessonId) =>
        set({
          disciplines: updateDiscipline(get().disciplines, disciplineId, (d) => ({
            ...d,
            topics: updateTopic(d.topics, topicId, (t) => ({
              ...t, lessons: t.lessons.filter((l) => l.id !== lessonId),
            })),
          })),
        }),
    }),
    {
      name: 'pingo-admin-v1',
      version: 2,
      migrate: (state: unknown) => {
        // v2: zerar stats de alunos que tinham XP do mockUser fictício
        const s = state as { students?: Student[] } & Record<string, unknown>
        return {
          ...s,
          students: (s.students ?? []).map((st) => ({
            ...st,
            xp: 0,
            level: 1,
            streak: 0,
            lessonsCompleted: 0,
            totalStudyMinutes: 0,
          })),
        }
      },
    }
  )
)
