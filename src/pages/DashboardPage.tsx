import { useStore } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useDisciplines } from '@/hooks/useDisciplines'
import { formatMinutes } from '@/lib/utils'
import { Flame, Clock, Zap, BookOpen } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import WeeklyChart from '@/components/dashboard/WeeklyChart'
import DisciplineCard from '@/components/dashboard/DisciplineCard'
import TodayGoal from '@/components/dashboard/TodayGoal'
import StreakCalendar from '@/components/gamification/StreakCalendar'

export default function DashboardPage() {
  const { user, dailyStats } = useStore()
  const { studentName } = useStudentAuthStore()
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
          <div className="card">
            <StreakCalendar stats={dailyStats} />
          </div>
        </div>
      </div>
    </div>
  )
}