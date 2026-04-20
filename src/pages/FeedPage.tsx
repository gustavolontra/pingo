import { useState, useEffect } from 'react'
import { useAdminStore, type FeedItem } from '@/store/useAdminStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useStore } from '@/store/useStore'
import { Rss, ThumbsUp, Flame, Star, Plus, X, BookOpen, List, Trophy, Swords, Users, CheckCircle2 } from 'lucide-react'
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

// ── Conteúdo formatado ────────────────────────────────────────────────────────

function capitalizeFirst(s: string): string {
  const t = s.trimStart()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function FeedContent({ tipo, text }: { tipo: FeedItem['tipo']; text: string }) {
  // Separa a "primeira linha" (a acção) do bloco que vem depois de \n\n (citação do aluno)
  const idx = text.indexOf('\n\n')
  const head = idx >= 0 ? text.slice(0, idx) : text
  const body = idx >= 0 ? text.slice(idx + 2).trim() : ''
  // Se body já começa e termina com aspas, mostramos como citação destacada
  const isQuote = body.startsWith('"') && body.endsWith('"')
  const quote = isQuote ? body.slice(1, -1) : body

  // Posts de resumo têm o formato: leu "Titulo" de Autor\n\n"citação"
  // Destacamos o título em negrito e o autor numa linha secundária.
  const resumoMatch = tipo === 'resumo' ? head.match(/^\s*leu\s+"([^"]+)"\s+de\s+(.+)$/i) : null

  return (
    <div className="space-y-2.5">
      {resumoMatch ? (
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 w-10 h-14 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(99,143,255,0.14), rgba(167,139,250,0.12))',
              border: '1px solid rgba(99,143,255,0.2)',
            }}
          >
            <BookOpen size={16} style={{ color: '#6270f5', opacity: 0.8 }} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: 'var(--text-muted)' }}>
              Leu
            </p>
            <p className="text-[15px] font-bold leading-tight mt-0.5" style={{ color: 'var(--text)' }}>
              {resumoMatch[1]}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              de {resumoMatch[2]}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
          {capitalizeFirst(head)}
        </p>
      )}
      {body && (
        isQuote ? (
          <blockquote className="text-sm italic px-3.5 py-2.5 rounded-xl whitespace-pre-line"
            style={{ background: 'rgba(98,112,245,0.06)', borderLeft: '3px solid #6270f5', color: 'var(--text)' }}>
            {quote}
          </blockquote>
        ) : (
          <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: 'var(--text-muted)' }}>{body}</p>
        )
      )}
    </div>
  )
}

// ── Lista partilhada: quebrada por estado ─────────────────────────────────────

function SharedListBreakdown({ autorId, conteudo }: { autorId: string; conteudo: string }) {
  const students = useAdminStore((s) => s.students)
  const author = students.find((s) => s.id === autorId)
  const all = author?.allBooks ?? []

  // Fallback: autor já não tem `allBooks` (lista despartilhada ou dados antigos).
  if (all.length === 0) {
    return (
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
        {capitalizeFirst(conteudo)}
      </p>
    )
  }

  const lendoAll = all.filter((b) => b.status === 'lendo')
  const lidosAll = all.filter((b) => b.status === 'lido')
  const lendo = lendoAll.slice(0, 10)
  const lidos = lidosAll.slice(0, 10)

  const column = (
    kind: 'lendo' | 'lido',
    items: typeof lendo,
    total: number,
  ) => {
    const isLendo = kind === 'lendo'
    const accent = isLendo ? '#6270f5' : '#10b981'
    const label = isLendo ? 'A ler' : 'Lidos'
    const Icon = isLendo ? BookOpen : CheckCircle2

    return (
      <div
        className="rounded-2xl p-3.5"
        style={{
          background: isLendo ? 'rgba(98,112,245,0.05)' : 'rgba(16,185,129,0.05)',
          border: `1px solid ${isLendo ? 'rgba(98,112,245,0.18)' : 'rgba(16,185,129,0.18)'}`,
        }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1.5" style={{ color: accent }}>
            <Icon size={12} /> {label}
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: `${accent}18`, color: accent }}
          >
            {total}
          </span>
        </div>
        {items.length === 0 ? (
          <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
            Nenhum livro ainda.
          </p>
        ) : (
          <ul className="space-y-1">
            {items.map((b, i) => (
              <li key={i} className="text-xs leading-snug flex gap-1.5">
                <span className="shrink-0" style={{ color: accent, opacity: 0.6 }}>•</span>
                <span className="min-w-0">
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>{b.titulo}</span>
                  <span style={{ color: 'var(--text-muted)' }}> · {b.autor}</span>
                </span>
              </li>
            ))}
            {total > items.length && (
              <li className="text-[11px] italic pt-0.5" style={{ color: 'var(--text-muted)' }}>
                + {total - items.length} {total - items.length === 1 ? 'livro' : 'livros'}
              </li>
            )}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      <p className="text-sm" style={{ color: 'var(--text)' }}>
        Partilhou a sua lista de leituras.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {column('lendo', lendo, lendoAll.length)}
        {column('lido', lidos, lidosAll.length)}
      </div>
    </div>
  )
}

// ── Card de publicação ────────────────────────────────────────────────────────

function FeedCard({ item }: { item: FeedItem }) {
  const { reactToFeedItem, deleteFeedItem } = useAdminStore()
  const students = useAdminStore((s) => s.students)
  const { studentId } = useStudentAuthStore()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isOwner = studentId != null && studentId === item.autorId
  // Item sintético (lista derivada de listaPartilhada) ainda não persistida —
  // as reações só funcionam depois do autor fazer auto-heal.
  const isVirtual = item.id.startsWith('virtual-')
  // Handle vivo do autor (fallback para o que ficou congelado no post).
  const author = students.find((s) => s.id === item.autorId)
  const handle = author?.handle ?? item.autorAt

  return (
    <div className="card space-y-3.5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(98,112,245,0.18), rgba(167,139,250,0.18))',
            color: '#6270f5',
            border: '1px solid rgba(98,112,245,0.18)',
          }}
        >
          {item.autorNome.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.autorNome}</span>
            {handle && (
              <span className="text-xs" style={{ color: '#6270f5' }}>@{handle}</span>
            )}
            <span
              className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              {TIPO_ICON[item.tipo]} {TIPO_LABEL[item.tipo]}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{timeAgo(item.data)}</p>
        </div>
        {isOwner && !confirmDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-lg hover:opacity-70 shrink-0"
            title="Apagar publicação"
          >
            <X size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
        {isOwner && confirmDelete && (
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
      {item.tipo === 'lista' ? (
        <SharedListBreakdown autorId={item.autorId} conteudo={item.conteudo} />
      ) : (
        <FeedContent tipo={item.tipo} text={item.conteudo} />
      )}

      {/* Reações */}
      <div className="flex items-center gap-2 pt-1">
        {REACTIONS.map(({ tipo, icon: Icon, color }) => {
          const ids = item.reacoes[tipo] ?? []
          const active = studentId ? ids.includes(studentId) : false
          const disabled = isVirtual || !studentId
          return (
            <button
              key={tipo}
              onClick={() => {
                if (disabled || !studentId) return
                reactToFeedItem(item.id, tipo, studentId)
              }}
              disabled={disabled}
              title={isVirtual ? 'As reações ficam disponíveis assim que a autora atualizar o feed.' : undefined}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: active ? `${color}18` : 'var(--surface-2)',
                color: active ? color : 'var(--text-muted)',
                border: `1px solid ${active ? `${color}30` : 'var(--border)'}`,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
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
    const mentions = targets.map((t) => `@${t.handle ?? t.login.split('@')[0]}`).join(', ')
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
                const handle = f.handle ?? f.login.split('@')[0]
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
  const students = useAdminStore((s) => s.students)
  const fetchFeed = useAdminStore((s) => s.fetchFeed)
  const fetchStudents = useAdminStore((s) => s.fetchStudents)
  const { studentId } = useStudentAuthStore()
  const { getFriends, markFeedSeen } = useStore()
  const friendIds = getFriends()
  const [challengeOpen, setChallengeOpen] = useState(false)

  // Atualiza feed e alunos ao entrar na página para apanhar partilhas recentes.
  useEffect(() => {
    fetchFeed()
    fetchStudents()
  }, [fetchFeed, fetchStudents])

  useEffect(() => { markFeedSeen() }, [feedItems.length])
  const [tab, setTab] = useState<'todos' | 'amigos'>('amigos')

  // Posts de "lista" são derivados do flag `listaPartilhada` dos alunos, não
  // dum feed item persistido — evita drift quando o POST do feed falha. Para
  // cada autor criamos um item sintético; se já existir um real mantemos-lhe o
  // timestamp.
  const listaFeedItems: FeedItem[] = students
    .filter((s) => s.listaPartilhada === true && (s.allBooks?.length ?? 0) > 0)
    .map((s) => {
      const existing = feedItems.find((f) => f.tipo === 'lista' && f.autorId === s.id)
      return existing ?? {
        id: `virtual-lista-${s.id}`,
        autorId: s.id,
        autorNome: s.name,
        autorAt: s.handle ?? '',
        tipo: 'lista' as const,
        conteudo: 'partilhou a sua lista de leituras',
        data: new Date().toISOString(),
        reacoes: {},
      }
    })

  // Combina: restantes tipos (resumo/badge/desafio) + listas derivadas.
  const combined = [
    ...feedItems.filter((f) => f.tipo !== 'lista'),
    ...listaFeedItems,
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  const shown = tab === 'amigos'
    ? combined.filter((f) => f.autorId === studentId || friendIds.includes(f.autorId))
    : combined

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
