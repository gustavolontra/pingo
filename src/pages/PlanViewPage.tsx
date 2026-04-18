import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, FileText, Loader2, Share2, Sparkles, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'

interface StoredPlan {
  id: string
  ownerId: string
  title: string
  goal: 'estudo' | 'exame'
  topics: string
  subject?: string
  level?: string
  targetDate?: string
  materials: { id: string; title: string; type: string }[]
  plano: {
    resumo?: string
    tempoEstimadoPorDia?: number
    regras?: Record<string, number>
    dias: { dia: number; data: string; tema: string; resumo: string; fontes?: number[] }[]
  }
  shared: boolean
  createdAt: string
  updatedAt: string
  diasEstudados: number[]
}

export default function PlanViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const studentId = useStudentAuthStore((s) => s.studentId)

  const [plan, setPlan] = useState<StoredPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.getPlan(id).then((p: StoredPlan | null) => {
      setPlan(p)
      setLoading(false)
    })
  }, [id])

  async function toggleShare() {
    if (!plan) return
    setBusy(true)
    const updated = await api.updatePlan(plan.id, { shared: !plan.shared })
    if (updated) setPlan(updated as StoredPlan)
    setBusy(false)
  }

  async function handleDelete() {
    if (!plan) return
    if (!confirm('Tens a certeza que queres apagar este plano?')) return
    setBusy(true)
    await api.deletePlan(plan.id)
    navigate('/biblioteca')
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <Loader2 className="mx-auto animate-spin" size={24} style={{ color: 'var(--text-muted)' }} />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Plano não encontrado.</p>
        <button onClick={() => navigate('/criar-plano')} className="btn-primary mt-4">Criar novo plano</button>
      </div>
    )
  }

  const isOwner = plan.ownerId === studentId
  const { title, goal, targetDate, materials, plano } = plan

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/biblioteca')}
          className="p-2 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold truncate" style={{ color: 'var(--text)' }}>{title}</h1>
          <div className="flex items-center gap-3 mt-1 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <Sparkles size={12} />
              {goal === 'exame' ? 'Plano de exame' : 'Estudo contínuo'}
            </span>
            {plan.level && (
              <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
                {plan.level}
              </span>
            )}
            {targetDate && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(targetDate).toLocaleDateString('pt-PT')}
              </span>
            )}
            {plano.tempoEstimadoPorDia && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {plano.tempoEstimadoPorDia} min/dia
              </span>
            )}
          </div>
        </div>
        {isOwner && (
          <div className="flex items-center gap-1">
            <button onClick={toggleShare} disabled={busy}
              className="p-2 rounded-lg flex items-center gap-1"
              title={plan.shared ? 'Deixar de partilhar' : 'Partilhar com a comunidade'}
              style={{ background: plan.shared ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)',
                       border: `1px solid ${plan.shared ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                       color: plan.shared ? '#10b981' : 'var(--text-muted)' }}>
              <Share2 size={14} />
              <span className="text-xs">{plan.shared ? 'Partilhado' : 'Partilhar'}</span>
            </button>
            <button onClick={handleDelete} disabled={busy}
              className="p-2 rounded-lg" title="Apagar plano"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <Trash2 size={14} style={{ color: '#ef4444' }} />
            </button>
          </div>
        )}
      </div>

      <div className="card mb-4">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{plano.resumo}</p>
        {materials.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {materials.map((m) => (
              <span key={m.id} className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                style={{ background: 'rgba(99,143,255,0.08)', color: '#6270f5' }}>
                <FileText size={10} /> {m.title}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {plano.dias.map((dia) => {
          const done = plan.diasEstudados.includes(dia.dia)
          return (
            <button key={dia.dia} onClick={() => navigate(`/plano/${plan.id}/dia/${dia.dia}`)}
              className="w-full card text-left hover:opacity-90 transition-opacity">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{ background: done ? 'rgba(16,185,129,0.1)' : 'rgba(99,143,255,0.1)',
                               color: done ? '#10b981' : '#6270f5' }}>
                      Dia {dia.dia}{done && ' ✓'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{dia.data}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{dia.tema}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{dia.resumo}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded shrink-0"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                  Estudar →
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
