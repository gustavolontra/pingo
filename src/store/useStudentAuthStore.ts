import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hashPassword } from '@/lib/crypto'
import { useAdminStore } from '@/store/useAdminStore'
import { useStore } from '@/store/useStore'

export function syncCurrentStudentStats() {
  const studentId = useStudentAuthStore.getState().studentId
  if (!studentId) return
  const { user, getDisciplines } = useStore.getState()
  const disciplines = getDisciplines()
  const lessonsCompleted = disciplines.flatMap((d) => d.topics.flatMap((t) => t.lessons)).filter((l) => l.isCompleted).length
  useAdminStore.getState().syncStudentStats(studentId, {
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    lessonsCompleted,
    totalStudyMinutes: user.totalStudyMinutes,
  })
}

interface StudentAuthState {
  isAuthenticated: boolean
  studentId: string | null
  studentName: string | null
  studentEmail: string | null
  studentHandle: string | null  // gerado do email, ex: "marina" de "marina@gmail.com"

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
      studentHandle: null,

      login: async (email, password) => {
        const hash = await hashPassword(password)
        const students = useAdminStore.getState().students
        const student = students.find(
          (s) => s.login === email && s.passwordHash === hash && s.isActive
        )
        if (student) {
          // Reset store if a different student is logging in
          useStore.getState().resetForStudent(student.id)
          set({
            isAuthenticated: true,
            studentId: student.id,
            studentName: student.name,
            studentEmail: student.login,
            studentHandle: student.login.split('@')[0],
          })
          setTimeout(syncCurrentStudentStats, 100)
          return true
        }
        return false
      },

      logout: () => set({
        isAuthenticated: false,
        studentId: null,
        studentName: null,
        studentEmail: null,
        studentHandle: null,
      }),
    }),
    { name: 'pingo-student-auth-v1' }
  )
)
