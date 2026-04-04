import { useStore } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useDisciplines } from '@/hooks/useDisciplines'
import { formatMinutes } from '@/lib/utils'
import { Flame, Clock, Zap, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '@/components/ui/StatCard'
import WeeklyChart from '@/components/dashboard/WeeklyChart'
import DisciplineCard from '@/components/dashboard/DisciplineCard'
import TodayGoal from '@/components/dashboard/TodayGoal'
import StreakCalendar from '@/components/gamification/StreakCalendar'

const SUBJECT_ICONS: Record<string, string> = {
  'História': '🏛️', 'Geografia': '🌍', 'Matemática': '📐', 'Português': '📖',
  'Inglês': '🇬🇧', 'Francês': '🇫🇷', 'Espanhol': '🇪🇸', 'Alemão': '🇩🇪',
  'Ciências Naturais': '🔬', 'Físico-Química': '⚗️', 'Educação Visual': '🎨',
  'Educação Tecnológica': '🔧', 'Educação Física': '🏃', 'TIC': '💻',
  'Educação Musical': '🎵', 'EMRC': '✝️', 'Cidadania e Desenvolvimento': '🤝',
}

function daysUntil(dateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

function urgencyColor(days: number) {
  if (days <= 3) return '#ef4444'
  if (days <= 7) return '#f97316'
  if (days <= 14) return '#eab308'
  return '#6270f5'
}

export default function DashboardPage() {
  const { user, dailyStats, exams } = useStore()
  const { studentName } = useStudentAuthStore()
  const navigate = useNavigate()
  const displayName = studentName || user.name
  const disciplines = useDisciplines()
  const thisWeekXP = dailyStats.slice(-7).reduce((sum, s) => sum + s.xpEarned, 0)
  const thisWeekMin = dailyStats.slice(-7).reduce((sum, s) => sum + s.minutesStudied, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-white">
          Olá, {displayName.split(' ')[0]}! {user.streak > 0 ? '🔥' : '👋'}
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {user.streak > 0
            ? `${user.streak} dias consecutivos de estudo. Não quebres a sequência!`
            : 'Começa a estudar hoje e inicia a tua sequência.'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Sequência atual" value={`${user.streak}d`} color="#f59e0b" sub={`Recorde: ${user.longestStreak}d`} />
        <StatCard icon={Clock} label="Horas totais" value={formatMinutes(user.totalStudyMinutes)} color="#6270f5" sub={`Esta semana: ${formatMinutes(thisWeekMin)}`} />
        <StatCard icon={Zap} label="XP total" value={user.xp} color="#a78bfa" sub={`Esta semana: +${thisWeekXP}`} />
        <StatCard icon={BookOpen} label="Nível" value={user.level} color="#10b981" sub={`${user.xp}/${user.xpForNextLevel} XP`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="md:col-span-2 space-y-5">
          <WeeklyChart stats={dailyStats} />
          {disciplines.map((d) => <DisciplineCard key={d.id} discipline={d} />)}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <TodayGoal />

          {/* Próximos exames */}
          {exams.length > 0 && (() => {
            const upcoming = [...exams]
              .filter((e) => daysUntil(e.date) >= 0)
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 3)
            if (upcoming.length === 0) return null
            return (
              <div className="card space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-display font-semibold" style={{ color: 'var(--text)' }}>
                    📅 Próximos exames
                  </h3>
                  <button onClick={() => navigate('/exames')} className="text-xs font-medium" style={{ color: '#6270f5' }}>
                    Ver todos
                  </button>
                </div>
                {upcoming.map((exam) => {
                  const days = daysUntil(exam.date)
                  const color = urgencyColor(days)
                  return (
                    <div
                      key={exam.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: 'var(--surface-2)', border: `1px solid ${color}25` }}
                    >
                      <span className="text-base shrink-0">{SUBJECT_ICONS[exam.subject] ?? '📚'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{exam.subject}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(exam.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <span className="text-xs font-semibold shrink-0 px-2 py-1 rounded-lg" style={{ background: `${color}18`, color }}>
                        {days === 0 ? 'hoje' : `${days}d`}
                      </span>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          <div className="card">
            <StreakCalendar stats={dailyStats} />
          </div>
        </div>
      </div>
    </div>
  )
}