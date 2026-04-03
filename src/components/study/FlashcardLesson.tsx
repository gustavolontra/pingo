import { useState } from 'react'
import type { Lesson, FlashcardContent } from '@/types'
import { useStore } from '@/store/useStore'
// removed
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

interface Props { lesson: Lesson; onComplete: (score: number, xp: number) => void }

export default function FlashcardLesson({ lesson, onComplete }: Props) {
  const { completeLesson } = useStore()
  const content = lesson.content as FlashcardContent
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [seen, setSeen] = useState<Set<number>>(new Set())
  const [startTime] = useState(Date.now())

  const card = content.cards[index]
  const isLast = index === content.cards.length - 1

  const handleNext = () => {
    setSeen(new Set([...seen, index]))
    if (isLast) {
      const duration = Math.max(1, Math.round((Date.now() - startTime) / 60000))
      completeLesson(lesson.id, 100, duration)
      onComplete(100, lesson.xpReward)
    } else {
      setIndex(index + 1)
      setFlipped(false)
    }
  }

  return (
    <div className="animate-slide-up space-y-5">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5">
        {content.cards.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === index ? 24 : 8,
              background: seen.has(i) ? '#10b981' : i === index ? '#6270f5' : 'rgba(99,143,255,0.15)',
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="card cursor-pointer select-none min-h-[280px] flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:border-primary-600/40"
        style={{ textAlign: 'center' }}
      >
        {!flipped ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Frente
            </p>
            <p className="text-2xl font-display font-bold text-white leading-relaxed">{card.front}</p>
            <div className="flex items-center gap-1.5 text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              <RotateCcw size={12} />
              <span>Clica para revelar</span>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#10b981' }}>
              Resposta
            </p>
            <p className="text-2xl font-display font-bold text-white leading-relaxed">{card.back}</p>
            {card.example && (
              <p className="text-sm mt-2 px-4" style={{ color: 'var(--text-muted)' }}>
                <span className="font-medium" style={{ color: '#f59e0b' }}>Ex:</span> {card.example}
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex gap-3">
        {index > 0 && (
          <button
            onClick={() => { setIndex(index - 1); setFlipped(false) }}
            className="btn-ghost flex items-center gap-2"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
        )}
        <button
          onClick={handleNext}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {isLast ? 'Concluir ✓' : 'Próximo'}
          {!isLast && <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  )
}
