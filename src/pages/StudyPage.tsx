import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDisciplines } from '@/hooks/useDisciplines'
import type { Lesson, Topic } from '@/types'
import { cn } from '@/lib/utils'
import { Lock, CheckCircle2, ChevronDown, ChevronRight, Zap, Clock } from 'lucide-react'
import QuizLesson from '@/components/study/QuizLesson'
import TextLesson from '@/components/study/TextLesson'
import AudioLesson from '@/components/study/AudioLesson'
import FlashcardLesson from '@/components/study/FlashcardLesson'
import LessonComplete from '@/components/study/LessonComplete'
import ProgressRing from '@/components/ui/ProgressRing'

export default function StudyPage() {
  const { disciplineId } = useParams<{ disciplineId: string }>()
  const disciplines = useDisciplines()
  const discipline = disciplines.find((d) => d.id === disciplineId)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [lessonResult, setLessonResult] = useState<{ score: number; xp: number } | null>(null)
  const [expandedTopic, setExpandedTopic] = useState<string | null>(discipline?.topics[0]?.id ?? null)
  const [retryKey, setRetryKey] = useState(0)

  if (!discipline) return <div className="text-white p-8">Disciplina não encontrada.</div>

  const totalPct = Math.round((discipline.completedLessons / discipline.totalLessons) * 100)

  const handleLessonComplete = (score: number, xp: number) => setLessonResult({ score, xp })
  const handleContinue = () => { setActiveLesson(null); setLessonResult(null) }
  const handleRetry = () => { setLessonResult(null); setRetryKey((k) => k + 1) }

  // ── Result screen ────────────────────────────────────────────────────────
  if (lessonResult && activeLesson) {
    return (
      <LessonComplete
        lesson={activeLesson}
        score={lessonResult.score}
        xpEarned={lessonResult.xp}
        onContinue={handleContinue}
        onRetry={handleRetry}
      />
    )
  }

  // ── Active lesson ────────────────────────────────────────────────────────
  if (activeLesson) {
    const props = { key: retryKey, lesson: activeLesson, onComplete: handleLessonComplete }
    return (
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setActiveLesson(null)}
          className="mb-4 text-sm flex items-center gap-1 hover:text-white transition-colors"
          style={{ color: 'var(--text-muted)' }}>
          ← Voltar
        </button>
        {activeLesson.type === 'quiz' && <QuizLesson {...props} />}
        {activeLesson.type === 'text' && <TextLesson {...props} />}
        {activeLesson.type === 'audio' && <AudioLesson {...props} />}
        {activeLesson.type === 'flashcard' && <FlashcardLesson {...props} />}
      </div>
    )
  }

  // ── Topic list ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="card flex items-center gap-5">
        <ProgressRing value={totalPct} size={72} color={discipline.color}>
          <span className="text-xs font-bold" style={{ color: discipline.color }}>{totalPct}%</span>
        </ProgressRing>
        <div>
          <h2 className="text-xl font-display font-bold text-white">
            {discipline.icon} {discipline.name}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {discipline.completedLessons} de {discipline.totalLessons} aulas concluídas
          </p>
        </div>
      </div>

      {discipline.topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          isExpanded={expandedTopic === topic.id}
          onToggle={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
          onSelectLesson={setActiveLesson}
        />
      ))}
    </div>
  )
}

function TopicCard({ topic, isExpanded, onToggle, onSelectLesson }: {
  topic: Topic; isExpanded: boolean; onToggle: () => void; onSelectLesson: (l: Lesson) => void
}) {
  const completed = topic.lessons.filter((l) => l.isCompleted).length
  const total = topic.lessons.length
  const allDone = completed === total && total > 0

  return (
    <div className="card overflow-hidden" style={{ padding: 0 }}>
      <button onClick={onToggle} disabled={!topic.isUnlocked}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-all">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-display font-bold text-sm"
          style={{
            background: allDone ? 'rgba(16,185,129,0.15)' : topic.isUnlocked ? 'rgba(98,112,245,0.15)' : 'rgba(122,146,180,0.1)',
            color: allDone ? '#10b981' : topic.isUnlocked ? '#a5bbfd' : 'var(--text-muted)',
          }}
        >
          {allDone ? '✓' : topic.order}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold truncate', topic.isUnlocked ? 'text-white' : 'text-slate-500')}>
            {topic.title}
          </p>
          {topic.isUnlocked && total > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(99,143,255,0.1)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${(completed / total) * 100}%`, background: '#6270f5' }} />
              </div>
              <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{completed}/{total}</span>
            </div>
          )}
          {!topic.isUnlocked && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Bloqueado</p>}
        </div>
        {!topic.isUnlocked ? <Lock size={15} className="text-slate-600 shrink-0" />
          : isExpanded ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
          : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
      </button>

      {isExpanded && topic.isUnlocked && (
        <div className="px-5 pb-5 space-y-2">
          {topic.description && (
            <p className="text-xs pb-2" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              {topic.description}
            </p>
          )}
          {topic.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} onSelect={() => onSelectLesson(lesson)} />
          ))}
        </div>
      )}
    </div>
  )
}

const icons: Record<string, string> = { text: '📖', quiz: '❓', audio: '🎧', flashcard: '🃏', video: '🎬', exercise: '✏️' }
const diffColors: Record<string, string> = { basico: '#10b981', intermedio: '#f59e0b', avancado: '#ef4444' }
const diffLabel: Record<string, string> = { basico: 'Básico', intermedio: 'Intermédio', avancado: 'Avançado' }

function LessonRow({ lesson, onSelect }: { lesson: Lesson; onSelect: () => void }) {
  return (
    <button onClick={onSelect}
      className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all hover:scale-[1.01]"
      style={{
        background: lesson.isCompleted ? 'rgba(16,185,129,0.05)' : 'var(--surface-2)',
        border: `1px solid ${lesson.isCompleted ? 'rgba(16,185,129,0.18)' : 'var(--border)'}`,
      }}
    >
      <span className="text-xl shrink-0">{icons[lesson.type]}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', lesson.isCompleted ? 'text-slate-400' : 'text-white')}>
          {lesson.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ color: diffColors[lesson.difficulty], background: `${diffColors[lesson.difficulty]}15` }}>
            {diffLabel[lesson.difficulty]}
          </span>
          <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Clock size={10} /> {lesson.estimatedMinutes}m
          </span>
          {lesson.score !== undefined && (
            <span className="text-xs font-medium" style={{ color: lesson.score >= 70 ? '#10b981' : '#f59e0b' }}>
              {lesson.score}%
            </span>
          )}
        </div>
      </div>
      {lesson.isCompleted
        ? <CheckCircle2 size={16} style={{ color: '#10b981' }} className="shrink-0" />
        : <div className="flex items-center gap-1 shrink-0" style={{ color: '#a5bbfd' }}>
            <Zap size={13} /><span className="text-xs font-semibold">+{lesson.xpReward}</span>
          </div>
      }
    </button>
  )
}