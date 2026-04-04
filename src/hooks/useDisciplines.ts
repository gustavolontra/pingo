import { useStore } from '@/store/useStore'
import type { Discipline } from '@/types'

export function useDisciplines(): Discipline[] {
  const kvDisciplines = useStore((s) => s.kvDisciplines)
  const progress = useStore((s) => s.progress)

  // Fonte única de verdade para o aluno: KV (carregado via useKVContent no Layout)
  const merged = kvDisciplines

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
