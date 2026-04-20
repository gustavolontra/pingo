import { useStore } from '@/store/useStore'
import { useDisciplines } from '@/hooks/useDisciplines'
import { useStudyPlan } from '@/hooks/useStudyPlan'
import ProgressRing from '@/components/ui/ProgressRing'
import { Target, Sparkles } from 'lucide-react'

export default function TodayGoal() {
  const { dailyStats } = useStore()
  const disciplines = useDisciplines()
  const discipline = disciplines[0]
  const plan = useStudyPlan(discipline)

  const todayKey = new Date().toISOString().split('T')[0]
  const todayStats = dailyStats.find((s) => s.date === todayKey)
  const doneLessons = todayStats?.lessonsCompleted ?? 0
  const goal = plan?.lessonsPerDay ?? 3
  const pct = Math.min(100, Math.round((doneLessons / goal) * 100))
  const done = pct >= 100
  const accent = done ? '#10b981' : '#f59e0b'

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}18` }}>
          <Target size={14} style={{ color: accent }} />
        </span>
        <h3 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>Meta de hoje</h3>
      </div>
      <div className="flex items-center gap-5">
        <ProgressRing value={pct} size={78} color={accent}>
          <span className="text-sm font-extrabold" style={{ color: accent }}>
            {pct}%
          </span>
        </ProgressRing>
        <div className="flex-1 min-w-0">
          <p className="text-3xl font-display font-extrabold leading-none" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            {doneLessons}
            <span className="text-sm font-medium ml-1" style={{ color: 'var(--text-muted)' }}>
              / {goal} aulas
            </span>
          </p>
          <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            {done ? (
              <><Sparkles size={11} style={{ color: '#10b981' }} /> Meta atingida! Óptimo trabalho.</>
            ) : (
              <>Faltam {goal - doneLessons} aula{goal - doneLessons !== 1 ? 's' : ''} para hoje</>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
