import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { api, type KVDiscipline, type KVContentItem } from '@/lib/api'
import type { Discipline, Topic, Lesson, TextContent } from '@/types'

function buildDisciplines(kvDisciplines: KVDiscipline[], content: KVContentItem[]): Discipline[] {
  return kvDisciplines.map((d) => {
    const items = content.filter((c) => c.disciplineId === d.id)

    const lessons: Lesson[] = items.map((item) => ({
      id: item.id,
      topicId: `topic-${d.id}`,
      title: item.title,
      type: 'text' as const,
      difficulty: 'basico' as const,
      estimatedMinutes: Math.max(5, Math.round(item.body.split(/\s+/).length / 130)),
      xpReward: 50,
      isCompleted: false,
      content: {
        type: 'text',
        body: item.body,
        keyPoints: item.keyPoints,
      } satisfies TextContent,
    }))

    const topic: Topic = {
      id: `topic-${d.id}`,
      disciplineId: d.id,
      title: d.subject,
      description: `Conteúdo de ${d.name}`,
      order: 1,
      isUnlocked: true,
      lessons,
    }

    return {
      id: d.id,
      name: d.name,
      subject: d.subject,
      year: d.year,
      color: d.color,
      icon: d.icon,
      topics: [topic],
      totalLessons: lessons.length,
      completedLessons: 0,
    } satisfies Discipline
  })
}

export function useKVContent() {
  const setDisciplinesFromKV = useStore((s) => s.setDisciplinesFromKV)

  useEffect(() => {
    async function load() {
      const [disciplines, content] = await Promise.all([
        api.getDisciplines(),
        api.getAllContent(),
      ])
      if (disciplines.length > 0) {
        setDisciplinesFromKV(buildDisciplines(disciplines, content))
      }
    }
    load()
  }, [setDisciplinesFromKV])
}
