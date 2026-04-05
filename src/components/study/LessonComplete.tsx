import { useState } from 'react'
import type { Lesson } from '@/types'
import { Zap, Clock, RotateCcw, Trophy } from 'lucide-react'
import XPToast from '@/components/gamification/XPToast'
import LevelUpModal from '@/components/gamification/LevelUpModal'
import { useStore } from '@/store/useStore'
import { getLevelFromXP } from '@/lib/utils'

interface Props {
  lesson: Lesson
  score: number
  xpEarned: number
  onContinue: () => void
  onRetry?: () => void
}

export default function LessonComplete({ lesson, score, xpEarned, onContinue, onRetry }: Props) {
  const { user } = useStore()
  const [showToast, setShowToast] = useState(true)
  const newLevel = getLevelFromXP(user.xp).level
  const prevLevel = getLevelFromXP(user.xp - xpEarned).level
  const [showLevelUp, setShowLevelUp] = useState(newLevel > prevLevel)

  const getGrade = () => {
    if (score >= 90) return { icon: <Trophy size={56} style={{ color: '#f59e0b' }} />, label: 'Excelente!', color: '#f59e0b' }
    if (score >= 70) return { icon: <span className="text-6xl">🎉</span>, label: 'Muito bem!', color: '#10b981' }
    if (score >= 50) return { icon: <span className="text-6xl">👍</span>, label: 'Bom trabalho!', color: '#6270f5' }
    return { icon: <span className="text-6xl">💪</span>, label: 'Continua a tentar!', color: '#f59e0b' }
  }

  const grade = getGrade()

  return (
    <>
      {showToast && <XPToast xp={xpEarned} onDone={() => setShowToast(false)} />}
      {showLevelUp && <LevelUpModal newLevel={newLevel} onClose={() => setShowLevelUp(false)} />}

      <div className="max-w-md mx-auto text-center animate-pop">
        <div className="card space-y-6">
          <div className="flex justify-center">{grade.icon}</div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white">Aula Concluída!</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{lesson.title}</p>
          </div>

          {/* Score ring for quizzes */}
          {lesson.type === 'quiz' && (
            <div>
              <div className="text-5xl font-display font-black mb-1" style={{ color: grade.color }}>
                {score}%
              </div>
              <p className="text-sm font-semibold" style={{ color: (grade as {color: string}).color }}>{grade.label}</p>
            </div>
          )}

          {/* Rewards */}
          <div className="flex justify-center gap-4">
            <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl"
              style={{ background: 'rgba(98,112,245,0.12)', border: '1px solid rgba(98,112,245,0.2)' }}>
              <Zap size={20} style={{ color: '#a5bbfd' }} />
              <p className="text-lg font-bold text-white">+{xpEarned}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>XP ganhos</p>
            </div>
            <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Clock size={20} style={{ color: '#f59e0b' }} />
              <p className="text-lg font-bold text-white">{lesson.estimatedMinutes}m</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tempo</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={onContinue} className="btn-primary w-full">
              Continuar →
            </button>
            {onRetry && lesson.type === 'quiz' && score < 80 && (
              <button onClick={onRetry} className="btn-ghost w-full flex items-center justify-center gap-2">
                <RotateCcw size={14} /> Tentar novamente
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
