import { useState } from 'react'
import type { Lesson, QuizContent } from '@/types'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Lightbulb, ChevronRight } from 'lucide-react'

interface Props {
  lesson: Lesson
  onComplete: (score: number, xp: number) => void
}

export default function QuizLesson({ lesson, onComplete }: Props) {
  const { completeLesson } = useStore()
  const content = lesson.content as QuizContent
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [startTime] = useState(Date.now())

  const question = content.questions[currentIndex]
  const isLast = currentIndex === content.questions.length - 1

  const handleSelect = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    setShowExplanation(true)
  }

  const handleNext = () => {
    const isCorrect = selected === question.correctAnswer
    const newAnswers = [...answers, isCorrect]

    if (isLast) {
      const score = Math.round((newAnswers.filter(Boolean).length / content.questions.length) * 100)
      const xpEarned = Math.round(lesson.xpReward * (score / 100))
      const duration = Math.round((Date.now() - startTime) / 60000)
      completeLesson(lesson.id, score, Math.max(1, duration))
      onComplete(score, xpEarned)
    } else {
      setAnswers(newAnswers)
      setCurrentIndex(currentIndex + 1)
      setSelected(null)
      setShowExplanation(false)
    }
  }

  const isCorrect = selected === question.correctAnswer

  return (
    <div className="animate-slide-up">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(99,143,255,0.15)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex) / content.questions.length) * 100}%`,
              background: 'linear-gradient(90deg, #6270f5, #a78bfa)',
            }}
          />
        </div>
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {currentIndex + 1}/{content.questions.length}
        </span>
      </div>

      <div className="card">
        <h3 className="text-lg font-display font-semibold text-white mb-6 leading-relaxed">
          {question.text}
        </h3>

        <div className="space-y-3">
          {question.options?.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={cn(
                'answer-option',
                selected === i && i === question.correctAnswer && 'correct',
                selected === i && i !== question.correctAnswer && 'wrong',
                selected !== null && i === question.correctAnswer && 'correct',
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(99,143,255,0.1)', color: '#7a92b4' }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </div>
            </button>
          ))}
        </div>

        {showExplanation && (
          <div
            className="mt-5 p-4 rounded-xl animate-slide-up"
            style={{
              background: isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: '#10b981' }} />
              ) : (
                <XCircle size={18} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
              )}
              <div>
                <p className={`font-semibold text-sm ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isCorrect ? 'Correto! 🎉' : 'Não foi desta vez'}
                </p>
                <div className="flex items-start gap-1.5 mt-2">
                  <Lightbulb size={14} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{question.explanation}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showExplanation && (
          <button onClick={handleNext} className="btn-primary mt-5 w-full flex items-center justify-center gap-2">
            {isLast ? 'Ver resultados' : 'Próxima pergunta'}
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
