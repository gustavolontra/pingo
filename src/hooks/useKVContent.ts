import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { api, type KVDiscipline, type KVContentItem } from '@/lib/api'
import { getDisciplineOption } from '@/lib/contentBridge'
import type { Discipline, Topic, Lesson, TextContent, FlashcardContent, QuizContent } from '@/types'

function buildLessonsFromItem(item: KVContentItem): Lesson[] {
  const lessons: Lesson[] = []

  // 1. Text lesson (always)
  const wordCount = item.resumo.split(/\s+/).length
  lessons.push({
    id: item.id,
    topicId: `topic-${item.disciplineId}`,
    title: item.titulo,
    type: 'text',
    difficulty: 'basico',
    estimatedMinutes: Math.max(5, Math.round(wordCount / 130)),
    xpReward: 50,
    isCompleted: false,
    content: { type: 'text', body: item.resumo, keyPoints: item.palavrasChave } satisfies TextContent,
  })

  // 2. Flashcard lesson (if has flashcards)
  if (item.flashcards?.length > 0) {
    lessons.push({
      id: `${item.id}-fc`,
      topicId: `topic-${item.disciplineId}`,
      title: `Flashcards — ${item.titulo}`,
      type: 'flashcard',
      difficulty: 'basico',
      estimatedMinutes: Math.max(3, Math.round(item.flashcards.length * 0.5)),
      xpReward: 40,
      isCompleted: false,
      content: {
        type: 'flashcard',
        cards: item.flashcards.map((f, i) => ({
          id: `${item.id}-fc-${i}`,
          front: f.frente,
          back: f.verso,
        })),
      } satisfies FlashcardContent,
    })
  }

  // 3. Quiz lesson (if has questions)
  if (item.quiz?.length > 0) {
    lessons.push({
      id: `${item.id}-qz`,
      topicId: `topic-${item.disciplineId}`,
      title: `Quiz — ${item.titulo}`,
      type: 'quiz',
      difficulty: 'basico',
      estimatedMinutes: Math.max(3, item.quiz.length * 1),
      xpReward: 60,
      isCompleted: false,
      content: {
        type: 'quiz',
        questions: item.quiz.map((q, i) => ({
          id: `${item.id}-qz-${i}`,
          text: q.pergunta,
          type: q.tipo,
          options: q.opcoes,
          correctAnswer: q.correta,
          explanation: q.explicacao,
        })),
      } satisfies QuizContent,
    })
  }

  return lessons
}

function buildDisciplines(kvDisciplines: KVDiscipline[], content: KVContentItem[]): Discipline[] {
  // Mapa de disciplinas: usa sempre o nome canónico de getDisciplineOption,
  // mantendo cor/ícone do KV se disponíveis
  const discMap = new Map<string, KVDiscipline>()
  kvDisciplines.forEach((d) => {
    const opt = getDisciplineOption(d.id)
    discMap.set(d.id, { ...d, name: opt.name, subject: opt.subject, year: opt.year })
  })

  return Array.from(discMap.values()).map((d) => {
    const items = content.filter((c) => c.disciplineId === d.id)

    // Agrupa por tópico
    const topicMap = new Map<string, Lesson[]>()
    for (const item of items) {
      const key = item.topico || 'Geral'
      if (!topicMap.has(key)) topicMap.set(key, [])
      topicMap.get(key)!.push(...buildLessonsFromItem(item))
    }

    const topics: Topic[] = Array.from(topicMap.entries()).map(([topicTitle, lessons], i) => ({
      id: `topic-${d.id}-${i}`,
      disciplineId: d.id,
      title: topicTitle,
      description: '',
      order: i + 1,
      isUnlocked: true,
      lessons,
    }))

    const totalLessons = topics.reduce((s, t) => s + t.lessons.length, 0)

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
      if (content.length > 0) {
        setDisciplinesFromKV(buildDisciplines(disciplines, content))
      }
    }
    load()
  }, [setDisciplinesFromKV])
}
