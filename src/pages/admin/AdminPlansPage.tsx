import { useEffect, useMemo, useState } from 'react'
import { Calendar, ExternalLink, GraduationCap, Library, Loader2, Search, Share2, Trash2, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { useAdminStore } from '@/store/useAdminStore'

interface AdminPlan {
  id: string
  title: string
  ownerId: string
  goal: 'estudo' | 'exame'
  subject?: string
  level?: string
  targetDate?: string
  shared: boolean
  wasShared?: boolean
  followersCount?: number
  createdAt: string
  updatedAt: string
  plano: { dias: unknown[] }
}

type SortKey = 'createdAt' | 'updatedAt' | 'title' | 'followers'

export default function AdminPlansPage() {
  const students = useAdminStore((s) => s.students)
  const fetchStudents = useAdminStore((s) => s.fetchStudents)
  const [plans, setPlans] = useState<AdminPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [goalFilter, setGoalFilter] = useState<'all' | 'estudo' | 'exame'>('all')
  const [sharedFilter, setSharedFilter] = useState<'all' | 'shared' | 'private'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [busyId, setBusyId] = useState<string | null>(null)

  function reload() {
    setLoading(true)
    api.getAllPlans().then((data: AdminPlan[]) => {
      setPlans(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchStudents()
    reload()
  }, [fetchStudents])

  async function toggleShare(p: AdminPlan) {
    setBusyId(p.id)
    const updated = await api.updatePlan(p.id, { shared: !p.shared })
    if (updated) {
      setPlans((prev) => prev.map((x) => (x.id === p.id ? updated as AdminPlan : x)))
    }
    setBusyId(null)
  }

  async function deleteForever(p: AdminPlan) {
    const label = p.shared || p.wasShared
      ? `Este plano foi partilhado${p.followersCount ? ` e tem ${p.followersCount} seguidor(es)` : ''}. Apagar mesmo assim? Os alunos que o estavam a usar perdem acesso.`
      : 'Apagar este plano? A operação é irreversível.'
    if (!confirm(label)) return
    setBusyId(p.id)
    await api.deletePlan(p.id, { force: true })
    setPlans((prev) => prev.filter((x) => x.id !== p.id))
    setBusyId(null)
  }

  const studentsById = useMemo(() => {
    const map: Record<string, { name: string; handle: string }> = {}
    for (const s of students) map[s.id] = { name: s.name, handle: s.login.split('@')[0] }
    return map
  }, [students])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const list = plans.filter((p) => {
      if (q) {
        const haystack = `${p.title} ${p.subject ?? ''} ${studentsById[p.ownerId]?.name ?? ''}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (goalFilter !== 'all' && p.goal !== goalFilter) return false
      if (sharedFilter === 'shared' && !p.shared) return false
      if (sharedFilter === 'private' && p.shared) return false
      return true
    })
    const sorted = [...list].sort((a, b) => {
      switch (sortKey) {
        case 'createdAt': return b.createdAt.localeCompare(a.createdAt)
        case 'updatedAt': return b.updatedAt.localeCompare(a.updatedAt)
        case 'title': return a.title.localeCompare(b.title)
        case 'followers': return (b.followersCount ?? 0) - (a.followersCount ?? 0)
      }
    })
    return sorted
  }, [plans, filter, goalFilter, sharedFilter, sortKey, studentsById])

  const totals = useMemo(() => ({
    total: plans.length,
    shared: plans.filter((p) => p.shared).length,
    exame: plans.filter((p) => p.goal === 'exame').length,
    estudo: plans.filter((p) => p.goal === 'estudo').length,
  }), [plans])

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Library size={22} style={{ color: '#6270f5' }} />
          Planos de estudo
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Vista admin de todos os planos criados na plataforma.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total" value={totals.total} color="#6270f5" />
        <Stat label="Partilhados" value={totals.shared} color="#10b981" />
        <Stat label="Exames" value={totals.exame} color="#a78bfa" />
        <Stat label="Estudo contínuo" value={totals.estudo} color="#6270f5" />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
            placeholder="Procurar por título, matéria ou autor..."
            className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--text)' }} />
        </div>
        <select value={goalFilter} onChange={(e) => setGoalFilter(e.target.value as 'all' | 'estudo' | 'exame')}
          className="px-3 py-2 rounded-xl text-sm"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          <option value="all">Todos os tipos</option>
          <option value="estudo">Estudo</option>
          <option value="exame">Exame</option>
        </select>
        <select value={sharedFilter} onChange={(e) => setSharedFilter(e.target.value as 'all' | 'shared' | 'private')}
          className="px-3 py-2 rounded-xl text-sm"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          <option value="all">Todos</option>
          <option value="shared">Partilhados</option>
          <option value="private">Privados</option>
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="px-3 py-2 rounded-xl text-sm"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          <option value="updatedAt">Última edição</option>
          <option value="createdAt">Data de criação</option>
          <option value="title">Título</option>
          <option value="followers">Seguidores</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="text-center py-10">
            <Loader2 className="mx-auto animate-spin" size={20} style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
            Nenhum plano encontrado.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <Th>Título</Th>
                <Th>Autor</Th>
                <Th>Tipo</Th>
                <Th>Nível</Th>
                <Th>Data prova</Th>
                <Th>Dias</Th>
                <Th>Seguidores</Th>
                <Th>Partilhado</Th>
                <Th>Criado</Th>
                <Th>Editado</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const author = studentsById[p.ownerId]
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-3 py-3">
                      <a href={`/plano/${p.id}`} target="_blank" rel="noreferrer"
                        className="font-medium hover:underline" style={{ color: 'var(--text)' }}>
                        {p.title}
                      </a>
                      {p.subject && p.subject !== p.title && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.subject}</p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {author ? (
                        <>
                          <p style={{ color: 'var(--text)' }}>{author.name}</p>
                          <p className="text-xs" style={{ color: '#6270f5' }}>@{author.handle}</p>
                        </>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs px-2 py-0.5 rounded"
                        style={{ background: p.goal === 'exame' ? 'rgba(167,139,250,0.12)' : 'rgba(99,143,255,0.08)',
                                 color: p.goal === 'exame' ? '#a78bfa' : '#6270f5' }}>
                        {p.goal === 'exame' ? 'Exame' : 'Estudo'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {p.level ? <span className="flex items-center gap-1"><GraduationCap size={11} /> {p.level}</span> : '—'}
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {p.targetDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(p.targetDate).toLocaleDateString('pt-PT')}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {p.plano?.dias?.length ?? 0}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <span className="flex items-center gap-1" style={{ color: (p.followersCount ?? 0) > 0 ? '#6270f5' : 'var(--text-muted)' }}>
                        <Users size={11} /> {p.followersCount ?? 0}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {p.shared ? (
                        <span className="flex items-center gap-1" style={{ color: '#10b981' }}>
                          <Share2 size={11} /> Sim
                        </span>
                      ) : p.wasShared ? (
                        <span style={{ color: 'var(--text-muted)' }} title="Foi partilhado no passado">
                          Foi (agora não)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(p.createdAt).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(p.updatedAt).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <div className="flex items-center gap-1">
                        <a href={`/plano/${p.id}`} target="_blank" rel="noreferrer"
                          className="p-1.5 rounded hover:bg-slate-100" title="Abrir plano">
                          <ExternalLink size={13} style={{ color: 'var(--text-muted)' }} />
                        </a>
                        <button onClick={() => toggleShare(p)} disabled={busyId === p.id}
                          className="p-1.5 rounded hover:bg-slate-100"
                          title={p.shared ? 'Despartilhar' : 'Partilhar'}>
                          <Share2 size={13} style={{ color: p.shared ? '#10b981' : 'var(--text-muted)' }} />
                        </button>
                        <button onClick={() => deleteForever(p)} disabled={busyId === p.id}
                          className="p-1.5 rounded hover:bg-red-50" title="Apagar definitivamente">
                          {busyId === p.id
                            ? <Loader2 size={13} className="animate-spin" style={{ color: '#ef4444' }} />
                            : <Trash2 size={13} style={{ color: '#ef4444' }} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card">
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider"
      style={{ color: 'var(--text-muted)', background: 'var(--surface-2)' }}>
      {children}
    </th>
  )
}
