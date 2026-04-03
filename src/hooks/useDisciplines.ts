import { useAdminStore } from '@/store/useAdminStore'
import { useStore } from '@/store/useStore'
import { mergeAllDisciplines } from '@/lib/contentBridge'
import type { Discipline } from '@/types'

export function useDisciplines(): Discipline[] {
  const adminDisciplines = useAdminStore((s) => s.disciplines)
  const hiddenStaticIds = useAdminStore((s) => s.hiddenStaticIds)
  const progress = useStore((s) => s.progress)

  const merged = mergeAllDisciplines(adminDisciplines, hiddenStaticIds)

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
