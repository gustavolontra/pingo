/**
 * useDisciplines.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook central que todos os componentes devem usar para ler as disciplinas.
 *
 * Combina automaticamente:
 *   - Conteúdo (admin + estático) via mergeAllDisciplines
 *   - Progresso do aluno (lições completas, datas de exame) via useStore
 *
 * Uso:
 *   const disciplines = useDisciplines()
 *   const discipline = useDiscipline('historia-7')
 */

import { useAdminStore } from '@/store/useAdminStore'
import { useStore } from '@/store/useStore'
import { mergeAllDisciplines } from '@/lib/contentBridge'
import type { Discipline } from '@/types'

/** Todas as disciplinas com progresso do aluno aplicado. */
export function useDisciplines(): Discipline[] {
  // Re-render automático quando o admin muda o conteúdo
  const adminDisciplines = useAdminStore((s) => s.disciplines)
  // Re-render automático quando o aluno completa uma lição
  const progress = useStore((s) => s.progress)

  const merged = mergeAllDisciplines(adminDisciplines)

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

/** Uma disciplina específica com progresso aplicado. */
export function useDiscipline(id: string): Discipline | undefined {
  return useDisciplines().find((d) => d.id === id)
}
