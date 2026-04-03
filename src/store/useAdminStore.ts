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
}

export interface ManagedDiscipline {
  id: string
  name: string
  subject: string
  year: number
  color: string
  icon: string
  createdAt: string
}

// SHA-256 of "1234"
const MASTER_PASSWORD_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'

const INITIAL_ADMIN: AdminUser = {
  id: 'master-1',
  email: 'gustavolontra@gmail.com',
  passwordHash: MASTER_PASSWORD_HASH,
  role: 'master',
  name: 'Gustavo Lontra',
}

interface AdminState {
  isAuthenticated: boolean
  currentAdmin: AdminUser | null
  admins: AdminUser[]
  students: Student[]
  disciplines: ManagedDiscipline[]

  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  createStudent: (data: { login: string; name: string; school: string; grade: string; password: string }) => Promise<void>
  updateStudent: (id: string, data: Partial<Pick<Student, 'name' | 'email' | 'school' | 'grade' | 'isActive'>>) => void
  deleteStudent: (id: string) => void
  createDiscipline: (data: Omit<ManagedDiscipline, 'id' | 'createdAt'>) => void
  deleteDiscipline: (id: string) => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentAdmin: null,
      admins: [INITIAL_ADMIN],
      students: [],
      disciplines: [],

      login: async (email, password) => {
        const hash = await hashPassword(password)
        const admin = get().admins.find(
          (a) => a.email === email && a.passwordHash === hash
        )
        if (admin) {
          set({ isAuthenticated: true, currentAdmin: admin })
          return true
        }
        return false
      },

      logout: () => set({ isAuthenticated: false, currentAdmin: null }),

      createStudent: async ({ login, name, school, grade, password }) => {
        const passwordHash = await hashPassword(password)
        const student: Student = {
          id: crypto.randomUUID(),
          login,
          name,
          email: login,
          school,
          grade,
          passwordHash,
          createdAt: new Date().toISOString(),
          isActive: true,
        }
        set({ students: [...get().students, student] })
      },

      updateStudent: (id, data) =>
        set({
          students: get().students.map((s) => (s.id === id ? { ...s, ...data } : s)),
        }),

      deleteStudent: (id) =>
        set({ students: get().students.filter((s) => s.id !== id) }),

      createDiscipline: (data) => {
        const discipline: ManagedDiscipline = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set({ disciplines: [...get().disciplines, discipline] })
      },

      deleteDiscipline: (id) =>
        set({ disciplines: get().disciplines.filter((d) => d.id !== id) }),
    }),
    { name: 'pingo-admin-v1' }
  )
)
