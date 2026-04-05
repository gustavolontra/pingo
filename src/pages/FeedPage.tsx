import { useState } from 'react'
import { useAdminStore, type FeedItem } from '@/store/useAdminStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { Rss, ThumbsUp, Flame, Star, Plus, X, BookOpen, List, Trophy, Swords } from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora mesmo'
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return `há ${d}d`
}

const TIPO_ICON: Record<FeedItem['tipo'], React.ReactNode> = {
  resumo: <BookOpen size={13} style={{ color: '#6270f5' }} />,
  lista: <List size={13} style={{ color: '#a78bfa' }} />,
  badge: <Trophy size={13} style={{ color: '#f59e0b' }} />,
  desafio: <Swords size={13} style={{ color: '#ef4444' }} />,
}

const TIPO_LABEL: Record<FeedItem['tipo'], string> = {
  resumo: 'Leitura',
  lista: 'Lista',
  badge: 'Conquista',
  desafio: 'Desafio',
}

const REACTIONS = [
  { tipo: 'like', icon: ThumbsUp, color: '#6270f5' },
  { tipo: 'fire', icon: Flame, color: '#f97316' },
  { tipo: 'star', icon: Star, color: '#eab308' },
] as const

// ── Card de publicação ────────────────────────────────────────────────────────

function FeedCard({ item }: { item: FeedItem }) {
  const { reactToFeedItem } = useAdminStore()
  const { studentId } = useStudentAuthStore()

  return (
    <div className="card space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: 'rgba(98,112,245,0.12)', color: '#6270f5' }}
        >
          {item.autorNome.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.autorNome}</span>
            {item.autorAt && (
              <span className="text-xs" style={{ color: '#6270f5' }}>@{item.autorAt}</span>
            )}
            <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
              {TIPO_ICON[item.tipo]} {TIPO_LABEL[item.tipo]}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{timeAgo(item.data)}</p>
        </div>
      </div>

      {/* Conteúdo */}
      <p className="text-sm whitespace-pre-line" style={{ color: 'var(--text)' }}>{item.conteudo}</p>

      {/* Reações */}
      <div className="flex items-center gap-2 pt-1">
        {REACTIONS.map(({ tipo, icon: Icon, color }) => {
          const ids = item.reacoes[tipo] ?? []
          const active = studentId ? ids.includes(studentId) : false
          return (
            <button
              key={tipo}
              onClick={() => studentId && reactToFeedItem(item.id, tipo, studentId)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: active ? `${color}18` : 'var(--surface-2)',
                color: active ? color : 'var(--text-muted)',
                border: `1px solid ${active ? `${color}30` : 'var(--border)'}`,
              }}
            >
              <Icon size={12} />
              {ids.length > 0 && <span>{ids.length}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Modal: Lançar desafio ─────────────────────────────────────────────────────

function ChallengeModal({ onClose }: { onClose: () => void }) {
  const { addFeedItem, students } = useAdminStore()
  const { studentId, studentName, studentHandle } = useStudentAuthStore()
  const [handleInput, setHandleInput] = useState('')
  const [target, setTarget] = useState<{ id: string; nome: string; handle: string } | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [text, setText] = useState('')

  function handleSearch() {
    const h = handleInput.replace(/^@/, '').trim().toLowerCase()
    if (!h) return
    const found = students.find(
      (s) => s.login.split('@')[0].toLowerCase() === h && s.id !== studentId
    )
    if (found) {
      setTarget({ id: found.id, nome: found.name, handle: found.login.split('@')[0] })
      setNotFound(false)
    } else {
      setTarget(null)
      setNotFound(true)
    }
  }

  function handleSend() {
    if (!text.trim() || !studentId || !target) return
    addFeedItem({
      autorId: studentId,
      autorNome: studentName ?? 'Aluno',
      autorAt: studentHandle ?? '',
      tipo: 'desafio',
      conteudo: `desafiou @${target.handle} (${target.nome}):\n\n${text.trim()}`,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>Lançar desafio</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70">
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Passo 1 — encontrar colega */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Quem queres desafiar?
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>@</span>
              <input
                value={handleInput}
                onChange={(e) => { setHandleInput(e.target.value); setTarget(null); setNotFound(false) }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="handle da colega"
                className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--surface-2)', border: `1px solid ${notFound ? '#ef4444' : 'var(--border)'}`, color: 'var(--text)' }}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}
            >
              Procurar
            </button>
          </div>

          {/* Resultado */}
          {notFound && (
            <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>Nenhum colega com esse @.</p>
          )}
          {target && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(98,112,245,0.12)', color: '#6270f5' }}>
                {target.nome.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{target.nome}</p>
                <p className="text-xs" style={{ color: '#6270f5' }}>@{target.handle}</p>
              </div>
            </div>
          )}
        </div>

        {/* Passo 2 — escrever o desafio */}
        {target && (
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              O desafio
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Ex: @${target.handle}, aceitas ler 2 livros esta semana?`}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSend}
            disabled={!target || !text.trim()}
            className="btn-primary flex-1"
            style={{ opacity: !target || !text.trim() ? 0.5 : 1 }}
          >
            Publicar desafio
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function FeedPage() {
  const feedItems = useAdminStore((s) => s.feedItems)
  const [challengeOpen, setChallengeOpen] = useState(false)

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Rss size={22} style={{ color: '#6270f5' }} /> Feed da turma
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Resumos, listas e desafios dos teus colegas.
          </p>
        </div>
        <button
          onClick={() => setChallengeOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shrink-0"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <Plus size={14} /> Lançar desafio
        </button>
      </div>

      {/* Feed */}
      {feedItems.length === 0 ? (
        <div className="card text-center py-14">
          <Rss size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Ainda não há publicações</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Quando os teus colegas partilharem livros ou desafios, aparecem aqui.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {feedItems.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {challengeOpen && <ChallengeModal onClose={() => setChallengeOpen(false)} />}
    </div>
  )
}
