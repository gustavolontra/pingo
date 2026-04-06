import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAdminStore } from '@/store/useAdminStore'
import { useStore } from '@/store/useStore'
import { api } from '@/lib/api'

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
  studentHandle: string | null
  mustChangePassword: boolean

  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  clearMustChangePassword: () => void
}

export const useStudentAuthStore = create<StudentAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      studentId: null,
      studentName: null,
      studentEmail: null,
      studentHandle: null,
      mustChangePassword: false,

      login: async (email, password) => {
        const result = await api.login(email, password)
        if (result) {
          useStore.getState().resetForStudent(result.studentId)
          set({
            isAuthenticated: true,
            studentId: result.studentId,
            studentName: result.name,
            studentEmail: result.email,
            studentHandle: result.handle,
            mustChangePassword: result.mustChangePassword ?? false,
          })
          // Refresh server data
          useAdminStore.getState().fetchStudents()
          useAdminStore.getState().fetchFeed()
          useStore.getState().fetchServerData(result.studentId)
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
        mustChangePassword: false,
      }),

      clearMustChangePassword: () => set({ mustChangePassword: false }),
    }),
    { name: 'pingo-student-auth-v1' }
  )
)
