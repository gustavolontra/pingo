import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Check, Clock, FileText, Loader2, Share2, Sparkles, Tag, Trash2 } from 'lucide-react'
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

function splitIntoSentences(text: string): string[] {
  if (!text) return []
  // Corta em `. ` mas preserva pontos finais; ignora frases muito curtas (<12 chars).
  const parts = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 0)
  if (parts.length <= 1) return [text.trim()]
  return parts
}

function parseTopics(raw: string): string[] {
  if (!raw) return []
  const lines = raw
    .split(/\n|;|,/)
    .map((line) => line.trim())
    // Remove numeração tipo "1.", "2)" ou "-"
    .map((line) => line.replace(/^[\d]+[.)]\s*/, '').replace(/^[-•*]\s*/, '').trim())
    .filter((s) => s.length > 0)
  return lines
}

export default function PlanViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const studentId = useStudentAuthStore((s) => s.studentId)

  const [plan, setPlan] = useState<StoredPlan | null>(null)
  const [progress, setProgress] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id || !studentId) return
    setLoading(true)
    Promise.all([
      api.getPlan(id),
      api.getPlanProgress(studentId, id),
    ]).then(([p, prog]: [StoredPlan | null, { diasEstudados: number[] }]) => {
      setPlan(p)
      setProgress(prog.diasEstudados ?? [])
      setLoading(false)
    })
  }, [id, studentId])

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
  const topics = parseTopics(plan.topics)
  const totalDays = plano.dias.length
  const doneCount = progress.length
  const pct = totalDays > 0 ? Math.round((doneCount / totalDays) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('/biblioteca')}
          className="p-2 rounded-lg mt-1" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--text)' }}>{title}</h1>
          <div className="flex items-center gap-2 mt-2 text-xs flex-wrap">
            <span className="flex items-center gap-1 px-2 py-1 rounded"
              style={{ background: goal === 'exame' ? 'rgba(167,139,250,0.12)' : 'rgba(99,143,255,0.08)',
                       color: goal === 'exame' ? '#a78bfa' : '#6270f5' }}>
              <Sparkles size={11} />
              {goal === 'exame' ? 'Plano de exame' : 'Estudo contínuo'}
            </span>
            {plan.level && (
              <span className="px-2 py-1 rounded" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>
                {plan.level}
              </span>
            )}
            {targetDate && (
              <span className="flex items-center gap-1 px-2 py-1 rounded"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                <Calendar size={11} />
                {new Date(targetDate).toLocaleDateString('pt-PT')}
              </span>
            )}
            {plano.tempoEstimadoPorDia && (
              <span className="flex items-center gap-1 px-2 py-1 rounded"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                <Clock size={11} />
                {plano.tempoEstimadoPorDia} min/dia
              </span>
            )}
          </div>
        </div>
        {isOwner && (
          <div className="flex items-center gap-1 mt-1">
            <button onClick={toggleShare} disabled={busy}
              className="p-2 rounded-lg flex items-center gap-1.5"
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

      {/* Resumo + progresso */}
      <div className="card">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {plano.resumo ?? `Plano de ${totalDays} dia${totalDays !== 1 ? 's' : ''}`}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {doneCount}/{totalDays} dias concluídos
            </p>
          </div>
          <div className="text-xs font-bold" style={{ color: pct === 100 ? '#10b981' : '#6270f5' }}>
            {pct}%
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : 'linear-gradient(90deg, #6270f5, #a78bfa)' }} />
        </div>
      </div>

      {/* Tópicos + Materiais */}
      {(topics.length > 0 || materials.length > 0) && (
        <div className="card space-y-3">
          {topics.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Tag size={11} /> Tópicos do plano
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topics.map((t, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded"
                    style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {materials.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <FileText size={11} /> Materiais
              </p>
              <div className="flex flex-wrap gap-1.5">
                {materials.map((m) => (
                  <span key={m.id} className="text-xs px-2 py-1 rounded flex items-center gap-1"
                    style={{ background: 'rgba(99,143,255,0.08)', color: '#6270f5' }}>
                    <FileText size={10} /> {m.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de dias */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
          Dias
        </p>
        {plano.dias.map((dia) => {
          const done = progress.includes(dia.dia)
          const sentences = splitIntoSentences(dia.resumo)
          return (
            <button key={dia.dia} onClick={() => navigate(`/plano/${plan.id}/dia/${dia.dia}`)}
              className="w-full text-left p-4 rounded-xl transition-all hover:opacity-95"
              style={{ background: 'var(--surface)',
                       border: `1px solid ${done ? 'rgba(16,185,129,0.25)' : 'var(--border)'}` }}>
              <div className="flex items-start gap-4">
                {/* Dia — indicador vertical */}
                <div className="flex flex-col items-center shrink-0 w-14">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                    style={{ background: done ? 'rgba(16,185,129,0.15)' : 'rgba(99,143,255,0.1)',
                             color: done ? '#10b981' : '#6270f5' }}>
                    {done ? <Check size={18} /> : dia.dia}
                  </div>
                  <p className="text-[10px] mt-1 text-center leading-tight" style={{ color: 'var(--text-muted)' }}>
                    {dia.data.slice(0, 5)}
                  </p>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-base leading-snug" style={{ color: 'var(--text)' }}>
                      {dia.tema}
                    </h3>
                    <span className="text-xs font-medium shrink-0 px-2 py-1 rounded"
                      style={{ background: done ? 'rgba(16,185,129,0.08)' : 'rgba(99,143,255,0.08)',
                               color: done ? '#10b981' : '#6270f5' }}>
                      {done ? 'Concluído' : 'Estudar →'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {sentences.map((s, i) => (
                      <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {s}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
