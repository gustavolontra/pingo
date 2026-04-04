import { useStore } from '@/store/useStore'
import type { Discipline } from '@/types'

/** Todas as disciplinas com progresso do aluno aplicado. Fonte: KV via useKVContent. */
export function useDisciplines(): Discipline[] {
  return useStore((s) => s.getDisciplines())
}

/** Uma disciplina específica com progresso aplicado. */
export function useDiscipline(id: string): Discipline | undefined {
  return useDisciplines().find((d) => d.id === id)
}
