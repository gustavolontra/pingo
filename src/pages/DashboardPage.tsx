import { useState } from 'react'
import { useStore, type DiaPlano } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import { formatMinutes } from '@/lib/utils'
import { Flame, Clock, Zap, BookOpen, Calendar, UserPlus, Copy, Check, Sparkles } from 'lucide-react'
import SubjectIcon from '@/components/ui/SubjectIcon'
import { useNavigate } from 'react-router-dom'
import StatCard from '@/components/ui/StatCard'
import WeeklyChart from '@/components/dashboard/WeeklyChart'
import TodayGoal from '@/components/dashboard/TodayGoal'
import StreakCalendar from '@/components/gamification/StreakCalendar'

const SUBJECT_ICONS: Record<string, string> = {
  'História': '🏛️', 'Geografia': '🌍', 'Matemática': '📐', 'Português': '📖',
  'Inglês': '🇬🇧', 'Francês': '🇫🇷', 'Espanhol': '🇪🇸', 'Alemão': '🇩🇪',
  'Ciências Naturais': '🔬', 'Físico-Química': '⚗️', 'Educação Visual': '🎨',
  'Educação Tecnológica': '🔧', 'Educação Física': '🏃', 'TIC': '💻',
  'Educação Musical': '🎵', 'EMRC': '✝️', 'Cidadania e Desenvolvimento': '🤝',
}
// resolve emoji string for a subject name, used in SubjectIcon
function examSubjectIcon(name: string) { return SUBJECT_ICONS[name] ?? '📚' }

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
  const { user, dailyStats, getExams } = useStore()
  const exams = getExams()
  const { studentName, studentHandle, studentId } = useStudentAuthStore()
  const students = useAdminStore((s) => s.students)
  const navigate = useNavigate()
  const displayName = studentName || user.name
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

      {/* Today's study plan cards */}
      <TodayStudy exams={exams} onGoToExams={(examId, dia) => navigate(`/exames?plan=${examId}&day=${dia}`)} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="md:col-span-2 space-y-5">
          <WeeklyChart stats={dailyStats} />
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
                  <h3 className="text-sm font-display font-semibold flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
                    <Calendar size={14} style={{ color: '#6270f5' }} /> Próximos exames
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
                      <SubjectIcon icon={examSubjectIcon(exam.subject)} size={18} className="shrink-0" />
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

function TodayStudy({ exams, onGoToExams }: { exams: { id: string; subject: string; date: string; planoEstudo?: { dias: DiaPlano[]; diasEstudados: number[] } }[]; onGoToExams: (examId: string, dia: number) => void }) {
  const today = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // Build cards: atrasados + hoje + próximo (always show 2 cards)
  type StudyItem = { examId: string; subject: string; dia: DiaPlano; status: 'feito' | 'hoje' | 'atrasado' | 'proximo' }
  const allItems: StudyItem[] = []

  for (const exam of exams) {
    if (!exam.planoEstudo?.dias) continue
    const studied = exam.planoEstudo.diasEstudados ?? []
    const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0)

    for (const dia of exam.planoEstudo.dias) {
      const isDone = studied.includes(dia.dia)
      const isToday = dia.data === today
      const [d, m, y] = dia.data.split('/')
      const diaDate = new Date(+y, +m - 1, +d)
      const isPast = diaDate < todayDate
      const isFuture = diaDate > todayDate

      if (isToday && isDone) {
        allItems.push({ examId: exam.id, subject: exam.subject, dia, status: 'feito' })
      } else if (isToday) {
        allItems.push({ examId: exam.id, subject: exam.subject, dia, status: 'hoje' })
      } else if (isPast && !isDone) {
        allItems.push({ examId: exam.id, subject: exam.subject, dia, status: 'atrasado' })
      } else if (isFuture && !isDone) {
        allItems.push({ examId: exam.id, subject: exam.subject, dia, status: 'proximo' })
      }
    }
  }

  if (allItems.length === 0) return null

  // Sort: atrasado, hoje, feito, proximo
  const order = { atrasado: 0, hoje: 1, feito: 2, proximo: 3 }
  allItems.sort((a, b) => order[a.status] - order[b.status])

  // Always show exactly 2 cards: prioritize atrasado + hoje, fill with próximo
  const items = allItems.filter((i) => i.status !== 'proximo')
  if (items.length < 2) {
    const proximos = allItems.filter((i) => i.status === 'proximo')
    while (items.length < 2 && proximos.length > 0) {
      items.push(proximos.shift()!)
    }
  }
  // Max 2 cards
  const shown = items.slice(0, 2)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={16} style={{ color: '#6270f5' }} />
        <p className="text-sm font-display font-semibold" style={{ color: 'var(--text)' }}>Plano de estudo</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {shown.map(({ examId, subject, dia, status }) => {
          const colors = {
            feito: { border: 'rgba(16,185,129,0.2)', bg: 'rgba(16,185,129,0.1)', color: '#10b981', text: 'Concluído' },
            atrasado: { border: 'rgba(239,68,68,0.2)', bg: 'rgba(239,68,68,0.1)', color: '#ef4444', text: 'Atrasado' },
            hoje: { border: 'rgba(245,158,11,0.2)', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', text: 'A fazer' },
            proximo: { border: 'var(--border)', bg: 'var(--surface-2)', color: 'var(--text-muted)', text: 'Próximo' },
          }
          const c = colors[status]

          return (
            <div key={`${examId}-${dia.dia}`} className="card" style={{ borderColor: c.border }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                  style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}>
                  {subject}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                  style={{ background: c.bg, color: c.color }}>
                  {c.text}
                </span>
                <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>
                  Dia {dia.dia} · {dia.data}
                </span>
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{dia.tema}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{dia.resumo}</p>
              {status !== 'feito' && status !== 'proximo' && (
                <button onClick={() => onGoToExams(examId, dia.dia)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold mt-2"
                  style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}>
                  <BookOpen size={11} /> {status === 'atrasado' ? 'Recuperar estudo' : 'Estudar agora'}
                </button>
              )}
              {status === 'proximo' && (
                <button onClick={() => onGoToExams(examId, dia.dia)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold mt-2"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                  <BookOpen size={11} /> Ver plano
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}