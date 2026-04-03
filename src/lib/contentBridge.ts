/**
 * contentBridge.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * ÚNICA FONTE DE VERDADE para disciplinas visíveis ao aluno.
 *
 * Ordem de prioridade (mais alta → mais baixa):
 *   1. Disciplinas criadas pelo admin no AdminStore  (conteúdo editável)
 *   2. Ficheiros estáticos em src/data/             (historia7ano, geografia7ano…)
 *   3. mockDisciplines de mockData.ts               (matemática demo)
 *
 * Regra: se um ID já existe numa fonte mais prioritária, a fonte mais baixa é ignorada.
 * Assim o admin pode "sobrescrever" qualquer disciplina estática criando uma com o mesmo ID.
 */

import type { Discipline, Topic, Lesson, LessonContent } from '@/types'
import type { ManagedDiscipline, AdminTopic, AdminLesson } from '@/store/useAdminStore'

// ── Ficheiros estáticos ──────────────────────────────────────────────────────
import { historia7ano } from '@/data/historia7ano'
import { geografia7ano } from '@/data/geografia7ano'
import { mockDisciplines } from '@/lib/mockData'

/** Todas as disciplinas estáticas (ficheiros de conteúdo + demo). */
export const STATIC_DISCIPLINES: Discipline[] = [
  ...mockDisciplines,
  historia7ano,
  geografia7ano,
]

// ── Conversor AdminStore → Discipline ────────────────────────────────────────

function convertLesson(l: AdminLesson): Lesson {
  // Garante que o content tem a estrutura correcta mesmo que esteja incompleto
  let content: LessonContent
  if (l.content.type === 'quiz') {
    content = { type: 'quiz', questions: l.content.questions ?? [] }
  } else if (l.content.type === 'flashcard') {
    content = { type: 'flashcard', cards: l.content.cards ?? [] }
  } else {
    const tc = l.content as { type: 'text'; body?: string; keyPoints?: string[] }
    content = { type: 'text', body: tc.body ?? '', keyPoints: tc.keyPoints ?? [] }
  }

  return {
    id: l.id,
    topicId: l.topicId,
    title: l.title,
    type: l.type,
    difficulty: 'basico',          // admin pode expor isto no futuro
    estimatedMinutes: l.estimatedMinutes ?? 10,
    xpReward: l.xpReward ?? 50,
    isCompleted: false,
    content,
  }
}

function convertTopic(t: AdminTopic): Topic {
  return {
    id: t.id,
    disciplineId: t.disciplineId,
    title: t.title,
    description: t.description,
    order: t.order,
    isUnlocked: true,
    lessons: (t.lessons ?? []).map(convertLesson),
  }
}

export function convertAdminDiscipline(d: ManagedDiscipline): Discipline {
  const topics = (d.topics ?? []).map(convertTopic)
  const totalLessons = topics.reduce((acc, t) => acc + t.lessons.length, 0)
  return {
    id: d.id,
    name: d.name,
    subject: d.subject,
    year: d.year,
    color: d.color,
    icon: d.icon,
    topics,
    totalLessons,
    completedLessons: 0,
  }
}

// ── Merge ────────────────────────────────────────────────────────────────────

/**
 * Recebe as disciplinas geridas pelo admin e devolve o array final
 * que o aluno vai ver, com a prioridade correta.
 */
export function mergeAllDisciplines(adminDisciplines: ManagedDiscipline[]): Discipline[] {
  // Converte as do admin
  const fromAdmin = adminDisciplines.map(convertAdminDiscipline)
  const adminIds = new Set(fromAdmin.map((d) => d.id))

  // Mantém as estáticas que o admin ainda não geriu
  const fromStatic = STATIC_DISCIPLINES.filter((d) => !adminIds.has(d.id))

  // Admin first, depois estáticas
  return [...fromAdmin, ...fromStatic]
}
