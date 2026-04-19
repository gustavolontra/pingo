import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookmarkPlus, BookmarkCheck, Calendar, Check, Clock, FileText, Loader2, Pencil, RefreshCw, Share2, Sparkles, Tag, Trash2, X } from 'lucide-react'
import { api } from '@/lib/api'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'

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
  wasShared?: boolean
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

function formatPtDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
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
  const isAdmin = useAdminStore((s) => s.isAuthenticated)

  const [plan, setPlan] = useState<StoredPlan | null>(null)
  const [progress, setProgress] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  // Edição da data de prova
  const [editDateOpen, setEditDateOpen] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [dateError, setDateError] = useState('')

  // Regeneração
  const [regenOpen, setRegenOpen] = useState(false)
  const [regenError, setRegenError] = useState('')

  // Apagar
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Seguir (para visitantes)
  const [isFollowing, setIsFollowing] = useState(false)
  const [confirmFollowOpen, setConfirmFollowOpen] = useState(false)
  const [pendingDay, setPendingDay] = useState<number | null>(null)

  useEffect(() => {
    if (!id || !studentId) return
    setLoading(true)
    Promise.all([
      api.getPlan(id),
      api.getPlanProgress(studentId, id),
      api.getFollowedPlanIds(studentId),
    ]).then(([p, prog, followedIds]: [StoredPlan | null, { diasEstudados: number[] }, string[]]) => {
      setPlan(p)
      setProgress(prog.diasEstudados ?? [])
      setIsFollowing(followedIds.includes(id))
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

  async function confirmDelete() {
    if (!plan) return
    setBusy(true)
    // Admin pode apagar mesmo planos partilhados (force ignora a proteção wasShared).
    await api.deletePlan(plan.id, { force: isAdmin })
    navigate(isAdmin ? '/admin/planos' : '/biblioteca')
  }

  async function toggleFollow() {
    if (!plan || !studentId) return
    setBusy(true)
    if (isFollowing) {
      await api.unfollowPlan(studentId, plan.id)
      setIsFollowing(false)
    } else {
      await api.followPlan(studentId, plan.id)
      setIsFollowing(true)
    }
    setBusy(false)
  }

  function handleDayClick(diaNum: number) {
    if (!plan) return
    const isVisitor = plan.ownerId !== studentId
    if (isVisitor && !isFollowing) {
      setPendingDay(diaNum)
      setConfirmFollowOpen(true)
      return
    }
    navigate(`/plano/${plan.id}/dia/${diaNum}`)
  }

  async function confirmFollowAndStudy() {
    if (!plan || !studentId || pendingDay == null) return
    setBusy(true)
    await api.followPlan(studentId, plan.id)
    setIsFollowing(true)
    setBusy(false)
    const dia = pendingDay
    setPendingDay(null)
    setConfirmFollowOpen(false)
    navigate(`/plano/${plan.id}/dia/${dia}`)
  }

  function studyWithoutFollowing() {
    if (!plan || pendingDay == null) return
    const dia = pendingDay
    setPendingDay(null)
    setConfirmFollowOpen(false)
    navigate(`/plano/${plan.id}/dia/${dia}`)
  }

  async function unshareInstead() {
    if (!plan) return
    setBusy(true)
    const updated = await api.updatePlan(plan.id, { shared: false })
    if (updated) setPlan(updated as StoredPlan)
    setBusy(false)
    setDeleteOpen(false)
  }

  function openEditDate() {
    if (!plan) return
    // Pre-preencher com a data actual se existir, senão com hoje.
    const base = plan.targetDate ? new Date(plan.targetDate) : new Date()
    setNewDate(base.toISOString().slice(0, 10))
    setDateError('')
    setEditDateOpen(true)
  }

  async function regeneratePlan() {
    if (!plan || !studentId) return
    setBusy(true)
    setRegenError('')
    try {
      // Tenta recuperar conteúdo dos materiais que ficaram na biblioteca.
      // Materiais colados localmente (id "pasted-...") perdem-se.
      const materialsForApi: { title: string; content: string; type: string }[] = []
      for (const m of plan.materials) {
        if (m.id.startsWith('pasted-') || m.id.startsWith('local-')) continue
        const res = await fetch(`/api/materials/${encodeURIComponent(m.id)}`).catch(() => null)
        if (res && res.ok) {
          const full = await res.json() as { title: string; content: string; type: string }
          materialsForApi.push({ title: full.title, content: full.content, type: full.type })
        }
      }

      const result = await api.generateStudyPlan({
        title: plan.title,
        goal: plan.goal,
        topics: plan.topics,
        subject: plan.subject ?? plan.title,
        year: plan.level,
        targetDate: plan.targetDate,
        materials: materialsForApi,
      })

      const updated = await api.updatePlan(plan.id, { plano: result })
      if (updated) setPlan(updated as StoredPlan)

      // Reinicia o progresso deste aluno — os números de dia apontam agora
      // para temas diferentes.
      await api.setPlanProgress(studentId, plan.id, [])
      setProgress([])

      setRegenOpen(false)
    } catch (e) {
      setRegenError(e instanceof Error ? e.message : 'Erro a regerar plano')
    }
    setBusy(false)
  }

  async function saveNewDate() {
    if (!plan || !newDate) return
    const target = new Date(newDate)
    target.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (target.getTime() <= today.getTime()) {
      setDateError('A data da prova tem de ser depois de hoje.')
      return
    }

    setBusy(true)

    const totalDays = plan.plano.dias.length
    // Dias disponíveis entre hoje e a data da prova (inclusivo do dia da prova).
    const availableDays = Math.max(1, Math.ceil((target.getTime() - today.getTime()) / 86400000) + 1)

    // Se o plano tem um nº de dias diferente do que a nova data comporta,
    // regeneramos a estrutura para o aluno não ficar com overflow ou lacunas.
    if (totalDays !== availableDays) {
      setEditDateOpen(false)

      // Materiais da biblioteca (pasted/local perdem-se).
      const materialsForApi: { title: string; content: string; type: string }[] = []
      for (const m of plan.materials) {
        if (m.id.startsWith('pasted-') || m.id.startsWith('local-')) continue
        const res = await fetch(`/api/materials/${encodeURIComponent(m.id)}`).catch(() => null)
        if (res && res.ok) {
          const full = await res.json() as { title: string; content: string; type: string }
          materialsForApi.push({ title: full.title, content: full.content, type: full.type })
        }
      }
      try {
        const result = await api.generateStudyPlan({
          title: plan.title,
          goal: plan.goal,
          topics: plan.topics,
          subject: plan.subject ?? plan.title,
          year: plan.level,
          targetDate: target.toISOString(),
          materials: materialsForApi,
        })
        // Um só PATCH com targetDate + plano para evitar race condition com
        // o KV (eventual consistency pode reverter o targetDate se forem 2 calls).
        const updated = await api.updatePlan(plan.id, {
          targetDate: target.toISOString(),
          plano: result,
        })
        if (updated) setPlan(updated as StoredPlan)
        await api.setPlanProgress(studentId!, plan.id, [])
        setProgress([])
      } catch (e) {
        setDateError(e instanceof Error ? `Regeneração falhou: ${e.message}` : 'Regeneração falhou.')
      }
      setBusy(false)
      return
    }

    // Se o nº de dias bate certo, só re-datamos sem regerar.
    const updatedDias = plan.plano.dias.map((d, i) => {
      const data = new Date(today)
      data.setDate(today.getDate() + i)
      return { ...d, data: formatPtDate(data) }
    })

    const updated = await api.updatePlan(plan.id, {
      targetDate: target.toISOString(),
      plano: { ...plan.plano, dias: updatedDias },
    })
    if (updated) setPlan(updated as StoredPlan)
    setBusy(false)
    setEditDateOpen(false)
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
  // Admin tem os mesmos poderes que o dono (pode ainda apagar mesmo partilhados via force).
  const canEdit = isOwner || isAdmin
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
              <button onClick={canEdit && goal === 'exame' ? openEditDate : undefined}
                disabled={!(canEdit && goal === 'exame')}
                className="flex items-center gap-1 px-2 py-1 rounded transition-all"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)',
                         cursor: canEdit && goal === 'exame' ? 'pointer' : 'default' }}
                title={canEdit && goal === 'exame' ? 'Editar data da prova' : undefined}>
                <Calendar size={11} />
                {new Date(targetDate).toLocaleDateString('pt-PT')}
                {canEdit && goal === 'exame' && <Pencil size={10} className="ml-1 opacity-60" />}
              </button>
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
        {canEdit && (
          <div className="flex items-center gap-1 mt-1">
            {isAdmin && !isOwner && (
              <span className="text-[10px] font-semibold px-2 py-1 rounded self-center"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                title="Estás a ver como administrador">
                Admin
              </span>
            )}
            <button onClick={toggleShare} disabled={busy}
              className="p-2 rounded-lg flex items-center gap-1.5"
              title={plan.shared ? 'Deixar de partilhar' : 'Partilhar com a comunidade'}
              style={{ background: plan.shared ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)',
                       border: `1px solid ${plan.shared ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                       color: plan.shared ? '#10b981' : 'var(--text-muted)' }}>
              <Share2 size={14} />
              <span className="text-xs">{plan.shared ? 'Partilhado' : 'Partilhar'}</span>
            </button>
            <button onClick={() => { setRegenError(''); setRegenOpen(true) }} disabled={busy}
              className="p-2 rounded-lg" title="Regerar plano"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <RefreshCw size={14} style={{ color: '#a78bfa' }} />
            </button>
            {/* Admin pode sempre apagar; dono só se nunca foi partilhado. */}
            {(isAdmin || !(plan.shared || plan.wasShared)) && (
              <button onClick={() => setDeleteOpen(true)} disabled={busy}
                className="p-2 rounded-lg" title="Apagar plano"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <Trash2 size={14} style={{ color: '#ef4444' }} />
              </button>
            )}
          </div>
        )}
        {!canEdit && (
          <div className="flex items-center gap-1 mt-1">
            <button onClick={toggleFollow} disabled={busy}
              className="px-3 py-2 rounded-lg flex items-center gap-1.5 text-xs font-medium"
              title={isFollowing ? 'Remover dos teus planos' : 'Adicionar aos teus planos'}
              style={{ background: isFollowing ? 'rgba(16,185,129,0.1)' : '#6270f5',
                       border: `1px solid ${isFollowing ? 'rgba(16,185,129,0.3)' : '#6270f5'}`,
                       color: isFollowing ? '#10b981' : 'white', opacity: busy ? 0.6 : 1 }}>
              {busy ? <Loader2 size={14} className="animate-spin" />
                : isFollowing ? <BookmarkCheck size={14} />
                : <BookmarkPlus size={14} />}
              {isFollowing ? 'Nos meus planos' : 'Adicionar aos meus planos'}
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
              {doneCount}/{totalDays} dia{totalDays === 1 ? '' : 's'} concluído{totalDays === 1 ? '' : 's'}
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
            <button key={dia.dia} onClick={() => handleDayClick(dia.dia)}
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

      {/* Modal: adicionar plano antes de estudar */}
      {confirmFollowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => !busy && setConfirmFollowOpen(false)}>
          <div className="w-full max-w-sm rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <BookmarkPlus size={16} style={{ color: '#6270f5' }} />
                Começar a estudar
              </h3>
              <button onClick={() => !busy && setConfirmFollowOpen(false)} className="p-1 rounded">
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <p className="text-sm mb-3" style={{ color: 'var(--text)' }}>
              Este plano é da comunidade. Queres adicioná-lo aos teus planos para aparecer
              no teu dashboard e biblioteca?
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Se preferires só espreitar, podes estudar o dia sem adicionar — depois
              decides se queres guardar.
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={confirmFollowAndStudy} disabled={busy}
                className="w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
                style={{ background: '#6270f5', color: 'white', opacity: busy ? 0.6 : 1 }}>
                {busy ? <Loader2 size={14} className="animate-spin" /> : <BookmarkPlus size={14} />}
                Adicionar aos meus planos e estudar
              </button>
              <button onClick={studyWithoutFollowing} disabled={busy}
                className="w-full py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                Só ver este dia
              </button>
              <button onClick={() => !busy && setConfirmFollowOpen(false)} disabled={busy}
                className="w-full py-2 rounded-lg text-xs"
                style={{ color: 'var(--text-muted)' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: apagar plano */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => !busy && setDeleteOpen(false)}>
          <div className="w-full max-w-sm rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <Trash2 size={16} style={{ color: '#ef4444' }} />
                Apagar plano
              </h3>
              <button onClick={() => !busy && setDeleteOpen(false)} className="p-1 rounded">
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {plan.shared ? (
              <>
                <p className="text-sm mb-3" style={{ color: 'var(--text)' }}>
                  Este plano está <strong>partilhado</strong> com a comunidade.
                </p>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  Planos partilhados não podem ser apagados — quem já começou a estudar
                  mantém acesso. Podes despartilhar: deixa de aparecer na Biblioteca a
                  novos alunos, mas os que já lá estavam continuam.
                </p>
                <div className="flex flex-col gap-2">
                  <button onClick={unshareInstead} disabled={busy}
                    className="w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
                    style={{ background: '#10b981', color: 'white', opacity: busy ? 0.6 : 1 }}>
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                    Despartilhar
                  </button>
                  <button onClick={() => !busy && setDeleteOpen(false)} disabled={busy}
                    className="w-full py-2 rounded-lg text-sm"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    Cancelar
                  </button>
                </div>
              </>
            ) : plan.wasShared ? (
              <>
                <p className="text-sm mb-3" style={{ color: 'var(--text)' }}>
                  Este plano já foi <strong>partilhado</strong> no passado.
                </p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  Por precaução não pode ser apagado — pode haver alunos que começaram
                  a estudar a partir dele. Fica em modo privado e continua acessível
                  para quem tem o URL ou progresso associado.
                </p>
                <button onClick={() => !busy && setDeleteOpen(false)}
                  className="w-full py-2 rounded-lg text-sm font-medium"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  Compreendi
                </button>
              </>
            ) : (
              <>
                <p className="text-sm mb-4" style={{ color: 'var(--text)' }}>
                  Tens a certeza que queres apagar este plano? O progresso associado também será perdido.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => !busy && setDeleteOpen(false)} disabled={busy}
                    className="flex-1 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    Cancelar
                  </button>
                  <button onClick={confirmDelete} disabled={busy}
                    className="flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
                    style={{ background: '#ef4444', color: 'white', opacity: busy ? 0.6 : 1 }}>
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Apagar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal: regerar plano */}
      {regenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => !busy && setRegenOpen(false)}>
          <div className="w-full max-w-sm rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <RefreshCw size={16} style={{ color: '#a78bfa' }} />
                Regerar plano
              </h3>
              <button onClick={() => !busy && setRegenOpen(false)} className="p-1 rounded">
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <p className="text-sm mb-3" style={{ color: 'var(--text)' }}>
              A IA vai criar uma nova estrutura para este plano com os mesmos tópicos e nível.
            </p>
            <ul className="text-xs space-y-1 mb-3 list-disc pl-4" style={{ color: 'var(--text-muted)' }}>
              <li>Todos os dias (tema, resumo) serão substituídos.</li>
              <li>O conteúdo já gerado (flashcards, quiz) dos dias actuais é apagado.</li>
              <li>O teu progresso é reiniciado porque os dias vão cobrir temas diferentes.</li>
              {plan.materials.some((m) => m.id.startsWith('pasted-') || m.id.startsWith('local-')) && (
                <li>Material colado localmente não pode ser recuperado — a regeneração será feita a partir dos tópicos.</li>
              )}
            </ul>
            {plan.shared && (
              <p className="text-xs mt-3 p-2 rounded" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#b45309' }}>
                Este plano está partilhado. Todos os alunos que o estão a usar vão ver a nova estrutura — o progresso deles mantém-se mas pode deixar de fazer sentido.
              </p>
            )}
            {regenError && (
              <p className="text-xs mt-3 p-2 rounded" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
                {regenError}
              </p>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => !busy && setRegenOpen(false)} disabled={busy}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Cancelar
              </button>
              <button onClick={regeneratePlan} disabled={busy}
                className="flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
                style={{ background: '#a78bfa', color: 'white', opacity: busy ? 0.6 : 1 }}>
                {busy ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {busy ? 'A regerar...' : 'Regerar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: editar data da prova */}
      {editDateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setEditDateOpen(false)}>
          <div className="w-full max-w-sm rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <Calendar size={16} style={{ color: '#a78bfa' }} />
                Editar data da prova
              </h3>
              <button onClick={() => setEditDateOpen(false)} className="p-1 rounded">
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
              Nova data da prova
            </label>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
              min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Se o número de dias do plano bater com o intervalo até à nova data, apenas re-datamos. Se não bater, o plano é regerado para caber no novo intervalo (o conteúdo existente será substituído).
            </p>
            {dateError && (
              <p className="text-xs mt-3 p-2 rounded" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
                {dateError}
              </p>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditDateOpen(false)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Cancelar
              </button>
              <button onClick={saveNewDate} disabled={busy || !newDate}
                className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{ background: '#a78bfa', color: 'white', opacity: (busy || !newDate) ? 0.5 : 1 }}>
                {busy ? 'A guardar...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
