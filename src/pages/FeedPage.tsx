import { useState } from 'react'
import { useAdminStore, type FeedItem } from '@/store/useAdminStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useStore } from '@/store/useStore'
import { Rss, ThumbsUp, Flame, Star, Plus, X, BookOpen, List, Trophy, Swords, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
  const { reactToFeedItem, deleteFeedItem } = useAdminStore()
  const { studentId } = useStudentAuthStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

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
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-lg hover:opacity-70 shrink-0"
            title="Apagar publicação"
          >
            <X size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => deleteFeedItem(item.id)}
              className="px-2 py-1 rounded-lg text-xs font-semibold"
              style={{ background: '#ef444420', color: '#ef4444' }}
            >
              Apagar
            </button>
            <button onClick={() => setConfirmDelete(false)}>
              <X size={13} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        )}
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

// ── Modal: Lançar desafio (via lista de amigos) ───────────────────────────────

function ChallengeModal({ onClose }: { onClose: () => void }) {
  const { addFeedItem, students } = useAdminStore()
  const { studentId, studentName, studentHandle } = useStudentAuthStore()
  const { getFriends } = useStore()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])
  const [text, setText] = useState('')

  const friendIds = getFriends()
  const friends = students.filter((s) => friendIds.includes(s.id))

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  function handleSend() {
    if (!text.trim() || !studentId || selected.length === 0) return
    const targets = friends.filter((f) => selected.includes(f.id))
    const mentions = targets.map((t) => `@${t.login.split('@')[0]}`).join(', ')
    const names = targets.map((t) => t.name).join(', ')
    addFeedItem({
      autorId: studentId,
      autorNome: studentName ?? 'Aluno',
      autorAt: studentHandle ?? '',
      tipo: 'desafio',
      conteudo: `desafiou ${mentions} (${names}):\n\n${text.trim()}`,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>Lançar desafio</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70">
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Lista de amigos */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
            Seleciona os amigos a desafiar
          </label>

          {friends.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <Users size={28} className="mx-auto opacity-30" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ainda não tens amigos adicionados.</p>
              <button
                onClick={() => { onClose(); navigate('/amigos') }}
                className="text-sm font-semibold"
                style={{ color: '#6270f5' }}
              >
                Ir para Amigos →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {friends.map((f) => {
                const isSelected = selected.includes(f.id)
                const handle = f.login.split('@')[0]
                return (
                  <button
                    key={f.id}
                    onClick={() => toggle(f.id)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                    style={{
                      background: isSelected ? 'rgba(98,112,245,0.1)' : 'var(--surface-2)',
                      border: `1px solid ${isSelected ? 'rgba(98,112,245,0.3)' : 'var(--border)'}`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: 'rgba(98,112,245,0.12)', color: '#6270f5' }}
                    >
                      {f.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{f.name}</p>
                      <p className="text-xs" style={{ color: '#6270f5' }}>@{handle}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: '#6270f5' }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Texto do desafio */}
        {selected.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>O desafio</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: Quem lê mais livros esta semana?"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSend}
            disabled={selected.length === 0 || !text.trim()}
            className="btn-primary flex-1"
            style={{ opacity: selected.length === 0 || !text.trim() ? 0.5 : 1 }}
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
  const { studentId } = useStudentAuthStore()
  const { getFriends } = useStore()
  const friendIds = getFriends()
  const [challengeOpen, setChallengeOpen] = useState(false)
  const [tab, setTab] = useState<'todos' | 'amigos'>('amigos')

  const shown = tab === 'amigos'
    ? feedItems.filter((f) => f.autorId === studentId || friendIds.includes(f.autorId))
    : feedItems

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Rss size={22} style={{ color: '#6270f5' }} /> Feed
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

      {/* Tabs */}
      <div className="flex rounded-xl p-1" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        {([['amigos', 'Amigos', Users], ['todos', 'Todos', Rss]] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
            style={{
              background: tab === key ? 'var(--surface)' : 'transparent',
              color: tab === key ? 'var(--text)' : 'var(--text-muted)',
              boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {shown.length === 0 ? (
        <div className="card text-center py-14">
          <Rss size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--text)' }}>
            {tab === 'amigos' ? 'Nenhuma publicação dos teus amigos' : 'Ainda não há publicações'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {tab === 'amigos'
              ? 'Adiciona amigos em "Amigos" para ver as publicações deles aqui.'
              : 'Quando os teus colegas partilharem livros ou desafios, aparecem aqui.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {shown.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {challengeOpen && <ChallengeModal onClose={() => setChallengeOpen(false)} />}
    </div>
  )
}
