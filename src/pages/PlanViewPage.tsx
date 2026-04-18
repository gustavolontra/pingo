import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, FileText, Sparkles } from 'lucide-react'

interface StoredPlan {
  id: string
  title: string
  goal: 'estudo' | 'exame'
  topics: string
  targetDate?: string
  materials: { id: string; title: string; type: string }[]
  plano: {
    resumo: string
    tempoEstimadoPorDia?: number
    dias: { dia: number; data: string; tema: string; resumo: string; fontes?: number[] }[]
  }
}

export default function PlanViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [plan, setPlan] = useState<StoredPlan | null>(null)

  useEffect(() => {
    if (!id) return
    const raw = sessionStorage.getItem(`plan:${id}`)
    if (raw) setPlan(JSON.parse(raw) as StoredPlan)
  }, [id])

  if (!plan) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Plano não encontrado.</p>
        <button onClick={() => navigate('/criar-plano')}
          className="btn-primary mt-4">Criar novo plano</button>
      </div>
    )
  }

  const { title, goal, targetDate, materials, plano } = plan

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')}
          className="p-2 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{title}</h1>
          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <Sparkles size={12} />
              {goal === 'exame' ? 'Plano de exame' : 'Estudo contínuo'}
            </span>
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
        {plano.dias.map((dia) => (
          <div key={dia.dia} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold"
                    style={{ background: 'rgba(99,143,255,0.1)', color: '#6270f5' }}>
                    Dia {dia.dia}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{dia.data}</span>
                </div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{dia.tema}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{dia.resumo}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
