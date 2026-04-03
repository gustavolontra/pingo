import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hashPassword } from '@/lib/crypto'
import { useAdminStore } from '@/store/useAdminStore'

interface StudentAuthState {
  isAuthenticated: boolean
  studentId: string | null
  studentName: string | null
  studentEmail: string | null

  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useStudentAuthStore = create<StudentAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      studentId: null,
      studentName: null,
      studentEmail: null,

      login: async (email, password) => {
        const hash = await hashPassword(password)
        const students = useAdminStore.getState().students
        const student = students.find(
          (s) => s.login === email && s.passwordHash === hash && s.isActive
        )
        if (student) {
          set({
            isAuthenticated: true,
            studentId: student.id,
            studentName: student.name,
            studentEmail: student.login,
          })
          return true
        }
        return false
      },

      logout: () => set({
        isAuthenticated: false,
        studentId: null,
        studentName: null,
        studentEmail: null,
      }),
    }),
    { name: 'pingo-student-auth-v1' }
  )
)
