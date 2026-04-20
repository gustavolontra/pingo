import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import { formatMinutes } from '@/lib/utils'
import { Flame, Clock, Zap, Award, UserPlus, Copy, Check, Sparkles } from 'lucide-react'
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
  const freshHandle = students.find((s) => s.id === studentId)?.handle
  const handleToShow = freshHandle ?? studentHandle
  const me = students.find((s) => s.id === studentId)
  const inviteCode = me?.codigoConvite ?? ''
  const thisWeekXP = dailyStats.slice(-7).reduce((sum, s) => sum + s.xpEarned, 0)
  const thisWeekMin = dailyStats.slice(-7).reduce((sum, s) => sum + s.minutesStudied, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header — saudação à esquerda, badges à direita */}
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl md:text-[2rem] font-display font-extrabold tracking-tight flex items-center gap-2" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Olá, {displayName.split(' ')[0]}!
            <span className="text-2xl">{user.streak > 0 ? '🔥' : '👋'}</span>
          </h2>
          {handleToShow && (
            <p className="text-sm font-medium mt-1" style={{ color: '#6270f5' }}>@{handleToShow}</p>
          )}
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {user.streak > 0
              ? `${user.streak} ${user.streak === 1 ? 'dia consecutivo' : 'dias consecutivos'} de estudo. Não quebres a sequência!`
              : 'Começa a estudar hoje e inicia a tua sequência.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CompactBadge icon={Flame} label={`${user.streak} ${user.streak === 1 ? 'dia' : 'dias'}`} color="#f59e0b" />
          <CompactBadge icon={Zap} label={`${user.xp} XP`} color="#6270f5" />
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatCard icon={Flame} label="Sequência" value={`${user.streak}d`} color="#f59e0b" sub={`Recorde: ${user.longestStreak}d`} />
        <StatCard icon={Clock} label="Horas totais" value={formatMinutes(user.totalStudyMinutes)} color="#6270f5" sub={`Esta semana: ${formatMinutes(thisWeekMin)}`} />
        <StatCard icon={Zap} label="XP total" value={user.xp} color="#a78bfa" sub={`Esta semana: +${thisWeekXP}`} />
        <StatCard icon={Award} label="Nível" value={user.level} color="#10b981" sub={`${user.xp}/${user.xpForNextLevel} XP`} />
      </div>

      {/* Invite banner */}
      {inviteCode && <InviteBanner code={inviteCode} />}

      {/* Planos do aluno */}
      {studentId && (
        <PlansSummary studentId={studentId} plans={plans} progressMap={progressMap} loading={plansLoading} />
      )}

      {/* Analytics + insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
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

// ── Badge compacto (streak / XP) ──────────────────────────────────────────────

function CompactBadge({
  icon: Icon,
  label,
  color,
}: {
  icon: typeof Flame
  label: string
  color: string
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
      style={{
        background: `${color}14`,
        color,
        border: `1px solid ${color}26`,
      }}
    >
      <Icon size={14} />
      {label}
    </span>
  )
}

// ── Invite banner ─────────────────────────────────────────────────────────────

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
      className="relative overflow-hidden flex items-center gap-4 px-5 py-4 rounded-2xl"
      style={{
        background: 'linear-gradient(115deg, rgba(98,112,245,0.12) 0%, rgba(167,139,250,0.10) 50%, rgba(16,185,129,0.08) 100%)',
        border: '1px solid rgba(98,112,245,0.18)',
      }}
    >
      <div
        aria-hidden
        className="absolute -left-10 -top-10 w-40 h-40 rounded-full opacity-30"
        style={{ background: 'radial-gradient(closest-side, rgba(98,112,245,0.35), transparent)' }}
      />
      <div
        className="relative w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
        style={{
          background: 'linear-gradient(135deg, #6270f5, #a78bfa)',
          color: 'white',
          boxShadow: '0 6px 18px rgba(98,112,245,0.35)',
        }}
      >
        <UserPlus size={20} />
      </div>
      <div className="relative flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Sparkles size={13} style={{ color: '#a78bfa' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Convida os teus colegas</p>
        </div>
        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{link}</p>
      </div>
      <button
        onClick={copy}
        className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all"
        style={{
          background: copied ? '#10b981' : 'linear-gradient(135deg, #6270f5, #4f4de8)',
          color: '#fff',
          boxShadow: copied ? '0 4px 14px rgba(16,185,129,0.35)' : '0 4px 14px rgba(98,112,245,0.35)',
        }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? 'Copiado!' : 'Copiar link'}
      </button>
    </div>
  )
}
