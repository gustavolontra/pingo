import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import { formatMinutes } from '@/lib/utils'
import { Flame, Clock, Zap, BookOpen, UserPlus, Copy, Check } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import WeeklyChart from '@/components/dashboard/WeeklyChart'
import TodayGoal from '@/components/dashboard/TodayGoal'
import StreakCalendar from '@/components/gamification/StreakCalendar'
import PlansSummary, { usePlansSummary } from '@/components/dashboard/PlansSummary'

export default function DashboardPage() {
  const { user, dailyStats } = useStore()
  const { studentName, studentHandle, studentId } = useStudentAuthStore()
  const students = useAdminStore((s) => s.students)
  const displayName = studentName || user.name
  const { plans, progressMap, loading: plansLoading } = usePlansSummary(studentId)
  const me = students.find((s) => s.id === studentId)
  const inviteCode = me?.codigoConvite ?? ''
  const thisWeekXP = dailyStats.slice(-7).reduce((sum, s) => sum + s.xpEarned, 0)
  const thisWeekMin = dailyStats.slice(-7).reduce((sum, s) => sum + s.minutesStudied, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-white">
          Olá, {displayName.split(' ')[0]}! {user.streak > 0 ? <Flame size={22} style={{ color: '#f59e0b', display: 'inline' }} /> : '👋'}
        </h2>
        {studentHandle && (
          <p className="text-sm font-medium mt-0.5" style={{ color: '#6270f5' }}>@{studentHandle}</p>
        )}
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

      {/* Invite banner */}
      {inviteCode && <InviteBanner code={inviteCode} />}

      {/* Planos do aluno */}
      {studentId && (
        <PlansSummary studentId={studentId} plans={plans} progressMap={progressMap} loading={plansLoading} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <WeeklyChart stats={dailyStats} />
        </div>

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

function InviteBanner({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/convite/${code}`

  function copy() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5 rounded-2xl"
      style={{ background: 'rgba(98,112,245,0.08)', border: '1px solid rgba(98,112,245,0.15)' }}
    >
      <UserPlus size={20} style={{ color: '#6270f5' }} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Convida os teus colegas!</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{link}</p>
      </div>
      <button
        onClick={copy}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all"
        style={{ background: '#6270f5', color: '#fff' }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? 'Copiado!' : 'Copiar link'}
      </button>
    </div>
  )
}

