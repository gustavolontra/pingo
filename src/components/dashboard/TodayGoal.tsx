import { useStore } from '@/store/useStore'
import { useStudyPlan } from '@/hooks/useStudyPlan'
import ProgressRing from '@/components/ui/ProgressRing'
import { Target } from 'lucide-react'

export default function TodayGoal() {
  const { disciplines, dailyStats } = useStore()
  const discipline = disciplines[0]
  const plan = useStudyPlan(discipline)

  const todayKey = new Date().toISOString().split('T')[0]
  const todayStats = dailyStats.find((s) => s.date === todayKey)
  const doneLessons = todayStats?.lessonsCompleted ?? 0
  const goal = plan?.lessonsPerDay ?? 3
  const pct = Math.min(100, Math.round((doneLessons / goal) * 100))

  return (
    <div className="card flex items-center gap-5">
      <ProgressRing value={pct} size={68} color={pct >= 100 ? '#10b981' : '#f59e0b'}>
        <span className="text-xs font-bold" style={{ color: pct >= 100 ? '#10b981' : '#f59e0b' }}>
          {pct}%
        </span>
      </ProgressRing>
      <div>
        <div className="flex items-center gap-2">
          <Target size={15} style={{ color: '#f59e0b' }} />
          <h3 className="font-display font-semibold text-white text-sm">Meta de hoje</h3>
        </div>
        <p className="text-2xl font-display font-black text-white mt-1">
          {doneLessons}<span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>/ {goal} aulas</span>
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {pct >= 100 ? '🎉 Meta atingida! Óptimo trabalho.' : `Faltam ${goal - doneLessons} aula${goal - doneLessons !== 1 ? 's' : ''} para hoje`}
        </p>
      </div>
    </div>
  )
}
