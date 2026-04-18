import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, GraduationCap, Library, Loader2, Plus, Search, Sparkles, User } from 'lucide-react'
import { api } from '@/lib/api'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'

type Tab = 'meus' | 'comunidade'

interface MyPlan {
  id: string
  title: string
  goal: 'estudo' | 'exame'
  subject?: string
  level?: string
  targetDate?: string
  plano: { dias: unknown[]; resumo?: string; tempoEstimadoPorDia?: number }
  shared: boolean
  createdAt: string
}

interface SharedPlanEntry {
  id: string
  title: string
  subject?: string
  level?: string
  goal: 'estudo' | 'exame'
  ownerId: string
  usageCount: number
  createdAt: string
  days: number
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const studentId = useStudentAuthStore((s) => s.studentId)

  const [tab, setTab] = useState<Tab>('meus')
  const [myPlans, setMyPlans] = useState<MyPlan[]>([])
  const [myProgress, setMyProgress] = useState<Record<string, { diasEstudados: number[] }>>({})
  const [sharedPlans, setSharedPlans] = useState<SharedPlanEntry[]>([])
  const [loading, setLoading] = useState(false)

  const [searchQ, setSearchQ] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [goalFilter, setGoalFilter] = useState('')

  const loadMine = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    const [plans, progress] = await Promise.all([
      api.getPlansByOwner(studentId),
      api.getPlanProgressAll(studentId),
    ])
    setMyPlans(plans as MyPlan[])
    setMyProgress(progress)
    setLoading(false)
  }, [studentId])

  const loadShared = useCallback(async () => {
    setLoading(true)
    const plans = await api.searchSharedPlans({
      q: searchQ || undefined,
      level: levelFilter || undefined,
      goal: goalFilter || undefined,
    })
    setSharedPlans(plans as SharedPlanEntry[])
    setLoading(false)
  }, [searchQ, levelFilter, goalFilter])

  useEffect(() => {
    if (tab === 'meus') loadMine()
    else loadShared()
  }, [tab, loadMine, loadShared])

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Library size={22} style={{ color: '#6270f5' }} />
          Biblioteca
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Os teus planos e os que a comunidade partilhou.
        </p>
      </div>

      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'var(--surface-2)' }}>
        <button onClick={() => setTab('meus')}
          className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: tab === 'meus' ? 'var(--surface)' : 'transparent',
                   color: tab === 'meus' ? 'var(--text)' : 'var(--text-muted)' }}>
          Meus planos
        </button>
        <button onClick={() => setTab('comunidade')}
          className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: tab === 'comunidade' ? 'var(--surface)' : 'transparent',
                   color: tab === 'comunidade' ? 'var(--text)' : 'var(--text-muted)' }}>
          Comunidade
        </button>
      </div>

      {tab === 'comunidade' && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input type="text" value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') loadShared() }}
              placeholder="Procurar..." className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text)' }} />
          </div>
          <select value={goalFilter} onChange={(e) => setGoalFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <option value="">Todos os tipos</option>
            <option value="estudo">Estudo contínuo</option>
            <option value="exame">Plano de exame</option>
          </select>
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <option value="">Qualquer nível</option>
            <optgroup label="1.º ciclo">
              <option value="1.º ano">1.º ano</option>
              <option value="2.º ano">2.º ano</option>
              <option value="3.º ano">3.º ano</option>
              <option value="4.º ano">4.º ano</option>
            </optgroup>
            <optgroup label="2.º ciclo">
              <option value="5.º ano">5.º ano</option>
              <option value="6.º ano">6.º ano</option>
            </optgroup>
            <optgroup label="3.º ciclo">
              <option value="7.º ano">7.º ano</option>
              <option value="8.º ano">8.º ano</option>
              <option value="9.º ano">9.º ano</option>
            </optgroup>
            <optgroup label="Secundário">
              <option value="10.º ano">10.º ano</option>
              <option value="11.º ano">11.º ano</option>
              <option value="12.º ano">12.º ano</option>
            </optgroup>
            <option value="Universidade">Universidade</option>
            <option value="Pós-graduação">Pós-graduação</option>
            <option value="Profissional">Profissional</option>
            <option value="Adulto">Adulto</option>
            <option value="Outro">Outro</option>
          </select>
          <button onClick={loadShared}
            className="px-4 rounded-xl text-sm" style={{ background: '#6270f5', color: 'white' }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Procurar'}
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-10">
          <Loader2 className="mx-auto animate-spin" size={20} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}

      {!loading && tab === 'meus' && myPlans.length === 0 && (
        <div className="card text-center">
          <BookOpen size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm mb-1" style={{ color: 'var(--text)' }}>Ainda não tens planos</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Cria um plano ou usa um da comunidade.</p>
          <button onClick={() => navigate('/criar-plano')} className="btn-primary inline-flex items-center gap-2">
            <Plus size={14} /> Criar plano
          </button>
        </div>
      )}

      {!loading && tab === 'meus' && myPlans.length > 0 && (
        <div className="space-y-2">
          {myPlans.map((plan) => (
            <button key={plan.id} onClick={() => navigate(`/plano/${plan.id}`)}
              className="w-full card text-left hover:opacity-90 transition-opacity">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate" style={{ color: 'var(--text)' }}>{plan.title}</h3>
                  <div className="flex items-center gap-2 flex-wrap mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Sparkles size={10} />
                      {plan.goal === 'exame' ? 'Exame' : 'Estudo'}
                    </span>
                    {plan.level && (
                      <span className="flex items-center gap-1">
                        <GraduationCap size={10} /> {plan.level}
                      </span>
                    )}
                    {plan.targetDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> {new Date(plan.targetDate).toLocaleDateString('pt-PT')}
                      </span>
                    )}
                    <span>{plan.plano.dias.length} dias</span>
                    <span>· {(myProgress[plan.id]?.diasEstudados ?? []).length}/{plan.plano.dias.length} feitos</span>
                  </div>
                </div>
                {plan.shared && (
                  <span className="text-xs px-2 py-0.5 rounded"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                    Partilhado
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && tab === 'comunidade' && sharedPlans.length === 0 && (
        <div className="card text-center">
          <Library size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text)' }}>Nenhum plano encontrado</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Ainda ninguém partilhou planos com estes critérios.
          </p>
        </div>
      )}

      {!loading && tab === 'comunidade' && sharedPlans.length > 0 && (
        <div className="space-y-2">
          {sharedPlans.map((plan) => (
            <button key={plan.id} onClick={() => navigate(`/plano/${plan.id}`)}
              className="w-full card text-left hover:opacity-90 transition-opacity">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate" style={{ color: 'var(--text)' }}>{plan.title}</h3>
                  <div className="flex items-center gap-2 flex-wrap mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Sparkles size={10} />
                      {plan.goal === 'exame' ? 'Exame' : 'Estudo'}
                    </span>
                    {plan.level && (
                      <span className="flex items-center gap-1">
                        <GraduationCap size={10} /> {plan.level}
                      </span>
                    )}
                    <span>{plan.days} dias</span>
                    <span className="flex items-center gap-1">
                      <User size={10} /> {plan.usageCount}× usado
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
