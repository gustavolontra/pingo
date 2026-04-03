import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { api, type KVDiscipline, type KVContentItem } from '@/lib/api'
import type { Discipline, Topic, Lesson, TextContent, FlashcardContent, QuizContent } from '@/types'

function buildLessonsFromItem(item: KVContentItem): Lesson[] {
  const lessons: Lesson[] = []

  // 1. Text lesson (always)
  const wordCount = item.body.split(/\s+/).length
  lessons.push({
    id: item.id,
    topicId: `topic-${item.disciplineId}`,
    title: item.title,
    type: 'text',
    difficulty: 'basico',
    estimatedMinutes: Math.max(5, Math.round(wordCount / 130)),
    xpReward: 50,
    isCompleted: false,
    content: { type: 'text', body: item.body, keyPoints: item.keyPoints } satisfies TextContent,
  })

  // 2. Flashcard lesson (if has flashcards)
  if (item.flashcards?.length > 0) {
    lessons.push({
      id: `${item.id}-fc`,
      topicId: `topic-${item.disciplineId}`,
      title: `Flashcards — ${item.title}`,
      type: 'flashcard',
      difficulty: 'basico',
      estimatedMinutes: Math.max(3, Math.round(item.flashcards.length * 0.5)),
      xpReward: 40,
      isCompleted: false,
      content: {
        type: 'flashcard',
        cards: item.flashcards.map((f, i) => ({ id: `${item.id}-fc-${i}`, front: f.front, back: f.back })),
      } satisfies FlashcardContent,
    })
  }

  // 3. Quiz lesson (if has questions)
  if (item.questions?.length > 0) {
    lessons.push({
      id: `${item.id}-qz`,
      topicId: `topic-${item.disciplineId}`,
      title: `Quiz — ${item.title}`,
      type: 'quiz',
      difficulty: 'basico',
      estimatedMinutes: Math.max(3, item.questions.length * 1),
      xpReward: 60,
      isCompleted: false,
      content: {
        type: 'quiz',
        questions: item.questions.map((q, i) => ({
          id: `${item.id}-qz-${i}`,
          text: q.text,
          type: 'true-false' as const,
          options: ['Verdadeiro', 'Falso'],
          correctAnswer: q.answer ? 0 : 1,
          explanation: q.explanation,
        })),
      } satisfies QuizContent,
    })
  }

  return lessons
}

function buildDisciplines(kvDisciplines: KVDiscipline[], content: KVContentItem[]): Discipline[] {
  return kvDisciplines.map((d) => {
    const items = content.filter((c) => c.disciplineId === d.id)
    const lessons = items.flatMap(buildLessonsFromItem)

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
