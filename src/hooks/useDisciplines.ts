import { useStore } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import type { Discipline } from '@/types'

export function useDisciplines(): Discipline[] {
  const kvDisciplines = useStore((s) => s.kvDisciplines)
  const progress = useStore((s) => s.progress)
  const studentId = useStudentAuthStore((s) => s.studentId)
  const students = useAdminStore((s) => s.students)

  // Filter by student's year
  const me = students.find((s) => s.id === studentId)
  const anoNum = parseInt(me?.grade ?? '7', 10)
  const merged = kvDisciplines.filter((d) => d.year === anoNum)

  return merged.map((d) => {
    const examDate = progress.examDates[d.id]
      ? new Date(progress.examDates[d.id])
      : d.examDate

    const topics = d.topics.map((t) => ({
      ...t,
      lessons: t.lessons.map((l) => {
        const p = progress.lessons[l.id]
        if (!p) return l
        return {
          ...l,
          isCompleted: p.isCompleted,
          score: p.score,
          completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
        }
      }),
    }))

    const completedLessons = topics
      .flatMap((t) => t.lessons)
      .filter((l) => l.isCompleted).length

    return { ...d, topics, examDate, completedLessons }
  })
}

export function useDiscipline(id: string): Discipline | undefined {
  return useDisciplines().find((d) => d.id === id)
}
