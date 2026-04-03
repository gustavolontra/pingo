import { Link } from 'react-router-dom'
import type { Discipline } from '@/types'
import { getDaysUntilExam, getUrgencyColor } from '@/lib/utils'
import { useStudyPlan } from '@/hooks/useStudyPlan'
import ProgressRing from '@/components/ui/ProgressRing'
import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react'

interface Props { discipline: Discipline }

export default function DisciplineCard({ discipline: d }: Props) {
  const plan = useStudyPlan(d)
  const daysLeft = d.examDate ? getDaysUntilExam(new Date(d.examDate)) : null
  const urgencyColor = daysLeft !== null ? getUrgencyColor(daysLeft) : '#6270f5'

  return (
    <div className="card flex items-center gap-5">
      <ProgressRing value={plan?.progressPct ?? 0} size={72} color={d.color}>
        <span className="text-xs font-bold" style={{ color: d.color }}>{plan?.progressPct ?? 0}%</span>
      </ProgressRing>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span>{d.icon}</span>
          <h3 className="font-display font-semibold text-white truncate">{d.name}</h3>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {d.completedLessons}/{d.totalLessons} aulas concluídas
        </p>

        {daysLeft !== null && (
          <div className="flex items-center gap-1.5 mt-2">
            {daysLeft <= 7 ? (
              <AlertTriangle size={12} style={{ color: urgencyColor }} />
            ) : (
              <CheckCircle2 size={12} style={{ color: urgencyColor }} />
            )}
            <span className="text-xs font-medium" style={{ color: urgencyColor }}>
              {daysLeft === 0 ? 'Exame hoje!' : `Exame em ${daysLeft} dias`}
            </span>
            {plan && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                · {plan.lessonsPerDay} aula{plan.lessonsPerDay !== 1 ? 's' : ''}/dia
              </span>
            )}
          </div>
        )}
      </div>

      <Link
        to={`/study/${d.id}`}
        className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
        style={{ background: `${d.color}18`, color: d.color, border: `1px solid ${d.color}25` }}
      >
        Estudar <ChevronRight size={14} />
      </Link>
    </div>
  )
}
