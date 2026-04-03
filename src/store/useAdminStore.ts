import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hashPassword } from '@/lib/crypto'

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

  // Auth
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void

  // Students
  createStudent: (data: { login: string; name: string; school: string; grade: string; password: string }) => Promise<void>
  updateStudent: (id: string, data: Partial<Pick<Student, 'name' | 'email' | 'school' | 'grade' | 'isActive'>>) => void
  syncStudentStats: (id: string, stats: Pick<Student, 'xp' | 'level' | 'streak' | 'lessonsCompleted' | 'totalStudyMinutes'>) => void
  deleteStudent: (id: string) => void

  // Disciplines
  createDiscipline: (data: Omit<ManagedDiscipline, 'id' | 'createdAt' | 'topics'>) => void
  deleteDiscipline: (id: string) => void

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
        const student: Student = {
          id: crypto.randomUUID(),
          login, name, email: login, school, grade, passwordHash,
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

      deleteStudent: (id) =>
        set({ students: get().students.filter((s) => s.id !== id) }),

      // ── Disciplines ─────────────────────────────────────────────────────────

      createDiscipline: (data) => {
        const discipline: ManagedDiscipline = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          topics: [],
        }
        set({ disciplines: [...get().disciplines, discipline] })
      },

      deleteDiscipline: (id) =>
        set({ disciplines: get().disciplines.filter((d) => d.id !== id) }),

      // ── Topics ──────────────────────────────────────────────────────────────

      addTopic: (disciplineId, { title, description }) => {
        const disc = get().disciplines.find((d) => d.id === disciplineId)
        if (!disc) return
        const topic: AdminTopic = {
          id: crypto.randomUUID(),
          disciplineId,
          title,
          description,
          order: disc.topics.length + 1,
          lessons: [],
        }
        set({
          disciplines: updateDiscipline(get().disciplines, disciplineId, (d) => ({
            ...d, topics: [...d.topics, topic],
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
        const topic = disc?.topics.find((t) => t.id === topicId)
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
    { name: 'pingo-admin-v1' }
  )
)
