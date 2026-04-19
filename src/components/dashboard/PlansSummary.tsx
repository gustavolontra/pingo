import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, ChevronRight, Flame, GraduationCap, Library, Loader2, Plus, Sparkles } from 'lucide-react'

interface DiaPlano {
  dia: number
  data: string
  tema: string
  resumo: string
  flashcards?: unknown[]
  quiz?: unknown[]
}

interface MyPlan {
  id: string
  title: string
  goal: 'estudo' | 'exame'
  subject?: string
  level?: string
  targetDate?: string
  plano: { dias: DiaPlano[]; resumo?: string; tempoEstimadoPorDia?: number }
  shared: boolean
  createdAt: string
}

function todayStr() {
  return new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function parsePtDate(s: string): Date | null {
  const [d, m, y] = s.split('/')
  if (!d || !m || !y) return null
  const date = new Date(+y, +m - 1, +d)
  return isNaN(date.getTime()) ? null : date
}

function daysUntil(date: Date): number {
  const t = new Date(); t.setHours(0, 0, 0, 0)
  const d = new Date(date); d.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - t.getTime()) / 86400000)
}

interface PlanState {
  plan: MyPlan
  progress: number[]
  todayDia: DiaPlano | null
  overdueDia: DiaPlano | null
  nextDia: DiaPlano | null
  completedCount: number
}

function summarizePlan(plan: MyPlan, progress: number[]): PlanState {
  const today = todayStr()
  const now = new Date(); now.setHours(0, 0, 0, 0)

  let todayDia: DiaPlano | null = null
  let overdueDia: DiaPlano | null = null
  let nextDia: DiaPlano | null = null

  for (const d of plan.plano.dias) {
    const done = progress.includes(d.dia)
    if (done) continue
    if (d.data === today) { todayDia = d; continue }
    const dDate = parsePtDate(d.data)
    if (!dDate) continue
    if (dDate < now) {
      if (!overdueDia || overdueDia.dia > d.dia) overdueDia = d
    } else {
      if (!nextDia || nextDia.dia > d.dia) nextDia = d
    }
  }

  return {
    plan,
    progress,
    todayDia,
    overdueDia,
    nextDia,
    completedCount: progress.length,
  }
}

interface Props {
  studentId: string
  plans: MyPlan[]
  progressMap: Record<string, { diasEstudados: number[] }>
  loading: boolean
}

export default function PlansSummary({ studentId: _studentId, plans, progressMap, loading }: Props) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="card text-center py-6">
        <Loader2 size={18} className="mx-auto animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    )
  }

  // Ordenação: mais recentes primeiro (createdAt descendente).
  const sorted = [...plans].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const estudo = sorted.filter((p) => p.goal === 'estudo').map((p) => summarizePlan(p, progressMap[p.id]?.diasEstudados ?? []))
  // Planos de exame cuja data já passou deixam de aparecer no dashboard.
  const exame = sorted
    .filter((p) => p.goal === 'exame')
    .filter((p) => {
      if (!p.targetDate) return true
      return daysUntil(new Date(p.targetDate)) >= 0
    })
    .map((p) => summarizePlan(p, progressMap[p.id]?.diasEstudados ?? []))

  if (estudo.length === 0 && exame.length === 0) {
    return (
      <div className="card text-center py-8">
        <Library size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Ainda não tens planos</p>
        <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
          Cria um plano para começares a estudar à tua maneira.
        </p>
        <button onClick={() => navigate('/criar-plano')} className="btn-primary inline-flex items-center gap-2">
          <Plus size={14} /> Criar plano
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CardEstudo states={estudo} onOpen={(id, dia) => navigate(dia ? `/plano/${id}/dia/${dia}` : `/plano/${id}`)} />
      <CardExame states={exame} onOpen={(id, dia) => navigate(dia ? `/plano/${id}/dia/${dia}` : `/plano/${id}`)} />
    </div>
  )
}

// ── Estudo contínuo ─────────────────────────────────────────────────────────

function CardEstudo({ states, onOpen }: { states: PlanState[]; onOpen: (planId: string, dia: number | null) => void }) {
  const hasAny = states.length > 0

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} style={{ color: '#6270f5' }} />
        <h3 className="text-sm font-display font-semibold" style={{ color: 'var(--text)' }}>Estudo contínuo</h3>
        {hasAny && (
          <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(99,143,255,0.1)', color: '#6270f5' }}>
            {states.length}
          </span>
        )}
      </div>

      {!hasAny ? (
        <EmptyInside label="Sem planos de estudo contínuo." />
      ) : (
        <div className="space-y-2">
          {states.map((s) => <PlanRow key={s.plan.id} state={s} onOpen={onOpen} />)}
        </div>
      )}
    </div>
  )
}

// ── Exames ──────────────────────────────────────────────────────────────────

function CardExame({ states, onOpen }: { states: PlanState[]; onOpen: (planId: string, dia: number | null) => void }) {
  const hasAny = states.length > 0

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={16} style={{ color: '#a78bfa' }} />
        <h3 className="text-sm font-display font-semibold" style={{ color: 'var(--text)' }}>Preparação de exames</h3>
        {hasAny && (
          <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
            {states.length}
          </span>
        )}
      </div>

      {!hasAny ? (
        <EmptyInside label="Sem planos de exame." />
      ) : (
        <div className="space-y-2">
          {states.map((s) => <PlanRow key={s.plan.id} state={s} onOpen={onOpen} showTargetDate />)}
        </div>
      )}
    </div>
  )
}

// ── Linha por plano ─────────────────────────────────────────────────────────

function PlanRow({
  state, onOpen, showTargetDate,
}: {
  state: PlanState
  onOpen: (planId: string, dia: number | null) => void
  showTargetDate?: boolean
}) {
  const { plan, todayDia, overdueDia, nextDia, completedCount } = state
  const total = plan.plano.dias.length
  const daysToTarget = plan.targetDate ? daysUntil(new Date(plan.targetDate)) : null

  const primary = todayDia ?? overdueDia
  const primaryLabel = todayDia ? 'Hoje' : overdueDia ? 'Atrasado' : nextDia ? 'Próximo' : null
  const primaryColor = todayDia ? '#f59e0b' : overdueDia ? '#ef4444' : '#6270f5'

  return (
    <button onClick={() => onOpen(plan.id, primary?.dia ?? null)}
      className="w-full text-left p-3 rounded-xl transition-all"
      style={{ background: 'var(--surface-2)', border: `1px solid ${primary && primary !== nextDia ? `${primaryColor}30` : 'var(--border)'}` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{plan.title}</p>
            {plan.level && (
              <span className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5"
                style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>
                <GraduationCap size={8} /> {plan.level}
              </span>
            )}
            {showTargetDate && plan.targetDate && (
              <span className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: daysToTarget != null && daysToTarget <= 3 ? 'rgba(239,68,68,0.1)' : 'var(--surface)',
                         color: daysToTarget != null && daysToTarget <= 3 ? '#ef4444' : 'var(--text-muted)' }}>
                {daysToTarget != null
                  ? (daysToTarget === 0 ? 'hoje' : daysToTarget < 0 ? 'passou' : `em ${daysToTarget}d`)
                  : ''}
              </span>
            )}
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {completedCount}/{total} dia{total === 1 ? '' : 's'} feito{total === 1 ? '' : 's'}
            {plan.shared && ' · partilhado'}
          </p>

          {primary && primaryLabel && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{ background: `${primaryColor}15`, color: primaryColor }}>
                {primaryLabel === 'Atrasado' && <Flame size={9} className="inline mr-0.5" />}
                {primaryLabel}
              </span>
              <p className="text-xs flex-1 truncate" style={{ color: 'var(--text)' }}>
                Dia {primary.dia} · {primary.tema}
              </p>
            </div>
          )}

          {!primary && nextDia && (
            <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              Sem estudo hoje · próximo Dia {nextDia.dia} ({nextDia.data})
            </div>
          )}

          {!primary && !nextDia && completedCount >= total && (
            <div className="mt-2 text-xs" style={{ color: '#10b981' }}>Plano concluído ✓</div>
          )}
        </div>

        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="shrink-0 mt-1" />
      </div>

      {primary && primaryLabel && primaryLabel !== 'Próximo' && (
        <div className="flex items-center gap-1 mt-2 text-xs font-semibold"
          style={{ color: primaryColor }}>
          <BookOpen size={11} /> Estudar agora
        </div>
      )}
    </button>
  )
}

function EmptyInside({ label }: { label: string }) {
  return (
    <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>{label}</p>
  )
}

// ── Hook opcional para consumir este componente ─────────────────────────────

export function usePlansSummary(studentId: string | null) {
  const [plans, setPlans] = useState<MyPlan[]>([])
  const [progressMap, setProgressMap] = useState<Record<string, { diasEstudados: number[] }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch(`/api/plans?ownerId=${encodeURIComponent(studentId)}`).then((r) => r.ok ? r.json() : []),
      fetch(`/api/plans/progress?studentId=${encodeURIComponent(studentId)}`).then((r) => r.ok ? r.json() : {}),
    ]).then(([p, prog]) => {
      if (cancelled) return
      setPlans(p as MyPlan[])
      setProgressMap(prog as Record<string, { diasEstudados: number[] }>)
      setLoading(false)
    }).catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [studentId])

  return { plans, progressMap, loading }
}
