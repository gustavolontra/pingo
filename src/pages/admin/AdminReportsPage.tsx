import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Check, ExternalLink, Loader2, MessageSquareWarning, Trash2, X } from 'lucide-react'
import { api } from '@/lib/api'

type ReportStatus = 'aberto' | 'resolvido' | 'ignorado'

interface Report {
  id: string
  studentId: string
  studentName?: string
  studentHandle?: string
  context: 'plan' | 'day' | 'app'
  planId?: string
  planTitle?: string
  diaNumber?: number
  diaTitle?: string
  description: string
  createdAt: string
  status: ReportStatus
  resolvedAt?: string
}

type Tab = 'aberto' | 'resolvido' | 'ignorado' | 'todos'

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('aberto')
  const [busyId, setBusyId] = useState<string | null>(null)

  function reload() {
    setLoading(true)
    api.getReports().then((data: Report[]) => {
      setReports(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const counts = useMemo(() => ({
    aberto: reports.filter((r) => r.status === 'aberto').length,
    resolvido: reports.filter((r) => r.status === 'resolvido').length,
    ignorado: reports.filter((r) => r.status === 'ignorado').length,
    todos: reports.length,
  }), [reports])

  const visible = useMemo(() => {
    return tab === 'todos' ? reports : reports.filter((r) => r.status === tab)
  }, [reports, tab])

  async function setStatus(r: Report, status: ReportStatus) {
    setBusyId(r.id)
    const updated = await api.updateReportStatus(r.id, status)
    if (updated) setReports((prev) => prev.map((x) => (x.id === r.id ? updated as Report : x)))
    setBusyId(null)
  }

  async function remove(r: Report) {
    if (!confirm('Apagar este report permanentemente?')) return
    setBusyId(r.id)
    await api.deleteReport(r.id)
    setReports((prev) => prev.filter((x) => x.id !== r.id))
    setBusyId(null)
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <MessageSquareWarning size={22} style={{ color: '#f59e0b' }} />
          Reports de alunos
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Erros ou problemas reportados pelos alunos nos planos e dias.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-2)' }}>
        {(['aberto', 'resolvido', 'ignorado', 'todos'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all"
            style={{ background: tab === t ? 'var(--surface)' : 'transparent',
                     color: tab === t ? 'var(--text)' : 'var(--text-muted)' }}>
            {t === 'aberto' ? 'Por resolver' : t === 'resolvido' ? 'Resolvidos' : t === 'ignorado' ? 'Ignorados' : 'Todos'}
            <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10">
          <Loader2 className="mx-auto animate-spin" size={20} style={{ color: 'var(--text-muted)' }} />
        </div>
      ) : visible.length === 0 ? (
        <div className="card text-center py-10">
          <AlertTriangle size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text)' }}>Nenhum report nesta categoria.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((r) => (
            <ReportCard key={r.id} report={r}
              busy={busyId === r.id}
              onResolve={() => setStatus(r, 'resolvido')}
              onIgnore={() => setStatus(r, 'ignorado')}
              onReopen={() => setStatus(r, 'aberto')}
              onDelete={() => remove(r)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReportCard({
  report: r, busy, onResolve, onIgnore, onReopen, onDelete,
}: {
  report: Report
  busy: boolean
  onResolve: () => void
  onIgnore: () => void
  onReopen: () => void
  onDelete: () => void
}) {
  const when = new Date(r.createdAt)
  const contextLabel = r.context === 'plan' ? 'Plano' : r.context === 'day' ? 'Dia' : 'App'
  const statusColor = r.status === 'aberto' ? '#f59e0b' : r.status === 'resolvido' ? '#10b981' : 'var(--text-muted)'

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-xs mb-1.5">
            <span className="px-2 py-0.5 rounded font-semibold"
              style={{ background: 'rgba(245,158,11,0.08)', color: '#b45309' }}>
              {contextLabel}
            </span>
            <span className="px-2 py-0.5 rounded"
              style={{ background: `${statusColor}15`, color: statusColor }}>
              {r.status === 'aberto' ? 'Por resolver' : r.status === 'resolvido' ? 'Resolvido' : 'Ignorado'}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              {r.studentName ?? 'Aluno'}{r.studentHandle ? ` · @${r.studentHandle}` : ''}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              · {when.toLocaleDateString('pt-PT')} {when.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {(r.planTitle || r.diaTitle) && (
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              {r.planTitle}
              {r.diaNumber != null && <> · Dia {r.diaNumber}</>}
              {r.diaTitle && <> · {r.diaTitle}</>}
              {r.planId && (
                <a href={`/admin/planos/${r.planId}`} target="_blank" rel="noreferrer"
                  className="ml-2 inline-flex items-center gap-1 hover:underline" style={{ color: '#6270f5' }}>
                  <ExternalLink size={10} /> abrir
                </a>
              )}
            </p>
          )}
          <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
            {r.description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        {r.status === 'aberto' ? (
          <>
            <button onClick={onResolve} disabled={busy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: '#10b981', color: 'white', opacity: busy ? 0.6 : 1 }}>
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Marcar resolvido
            </button>
            <button onClick={onIgnore} disabled={busy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <X size={12} /> Ignorar
            </button>
          </>
        ) : (
          <button onClick={onReopen} disabled={busy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            Reabrir
          </button>
        )}
        <button onClick={onDelete} disabled={busy}
          className="ml-auto p-1.5 rounded-lg" title="Apagar report"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <Trash2 size={13} style={{ color: '#ef4444' }} />
        </button>
      </div>
    </div>
  )
}
