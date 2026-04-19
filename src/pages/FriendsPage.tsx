import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import { Users, UserPlus, UserMinus, Flame, Zap, BookMarked, X, Search, UserCheck, Clock } from 'lucide-react'

// ── Card de sugestão (mesma escola) ──────────────────────────────────────────

function SuggestionCard({
  studentId: sid,
  onAdd,
  onIgnore,
}: {
  studentId: string
  onAdd: () => void
  onIgnore: () => void
}) {
  const students = useAdminStore((s) => s.students)
  const s = students.find((st) => st.id === sid)
  if (!s) return null
  const handle = s.login.split('@')[0]

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
        style={{ background: 'rgba(98,112,245,0.12)', color: '#6270f5' }}
      >
        {s.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{s.name}</p>
        <p className="text-xs" style={{ color: '#6270f5' }}>@{handle}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.grade}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5', border: '1px solid rgba(98,112,245,0.2)' }}
        >
          <UserPlus size={12} /> Aceitar
        </button>
        <button
          onClick={onIgnore}
          className="p-1.5 rounded-xl"
          style={{ color: 'var(--text-muted)' }}
          title="Ignorar sugestão"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Card de amigo ─────────────────────────────────────────────────────────────

function FriendCard({
  friendId,
  onRemove,
}: {
  friendId: string
  onRemove: () => void
}) {
  const students = useAdminStore((s) => s.students)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const s = students.find((st) => st.id === friendId)
  if (!s) return null
  const handle = s.login.split('@')[0]

  return (
    <div className="card flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold shrink-0"
        style={{ background: 'rgba(98,112,245,0.12)', color: '#6270f5' }}
      >
        {s.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>{s.name}</p>
        <p className="text-xs" style={{ color: '#6270f5' }}>@{handle}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Zap size={11} style={{ color: '#a78bfa' }} /> {s.xp} XP
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Flame size={11} style={{ color: '#f59e0b' }} /> {s.streak}d
          </span>
          {(s.sharedBooks?.length ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <BookMarked size={11} style={{ color: '#10b981' }} /> {s.sharedBooks!.length} livro{s.sharedBooks!.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      {confirmRemove ? (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onRemove}
            className="px-2 py-1 rounded-lg text-xs font-semibold"
            style={{ background: '#ef444420', color: '#ef4444' }}
          >
            Confirmar
          </button>
          <button onClick={() => setConfirmRemove(false)}>
            <X size={13} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmRemove(true)}
          className="p-2 rounded-lg hover:bg-slate-100/10 shrink-0"
          title="Remover amigo"
        >
          <UserMinus size={15} style={{ color: 'var(--text-muted)' }} />
        </button>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function FriendsPage() {
  const { getFriends, addFriend, removeFriend, ignoreSuggestion, getIgnoredSuggestions } = useStore()
  const { studentId } = useStudentAuthStore()
  const students = useAdminStore((s) => s.students)
  const pedidosConvite = useAdminStore((s) => s.pedidosConvite)
  const fetchPedidosConvite = useAdminStore((s) => s.fetchPedidosConvite)

  useEffect(() => { fetchPedidosConvite() }, [])

  // Convites que EU fiz e estão pendentes
  const myPendingInvites = pedidosConvite.filter(
    (p) => p.convidadoPor === studentId && p.estado === 'pendente'
  )

  const rawFriendIds = getFriends()
  // Filtra IDs de amigos cujos registos já não existem (contas apagadas).
  // Se os alunos ainda não carregaram, mantém a lista bruta para não "perder" amigos momentaneamente.
  const friendIds = students.length > 0
    ? rawFriendIds.filter((id) => students.some((s) => s.id === id))
    : rawFriendIds
  const ignoredIds = getIgnoredSuggestions()
  const me = students.find((s) => s.id === studentId)

  // Limpa amigos órfãos (conta apagada) — remove-os do store assim que os alunos carregam.
  useEffect(() => {
    if (students.length === 0) return
    const stale = rawFriendIds.filter((id) => !students.some((s) => s.id === id))
    stale.forEach((id) => removeFriend(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students.length])

  // Sugestões: mesma escola, não é o próprio, não é amigo, não ignorado
  const suggestions = students.filter(
    (s) =>
      s.id !== studentId &&
      s.school === me?.school &&
      !friendIds.includes(s.id) &&
      !ignoredIds.includes(s.id)
  )

  const [query, setQuery] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [justAdded, setJustAdded] = useState<string | null>(null)

  const searchQuery = query.replace(/^@/, '').toLowerCase()
  const searchResults = searchQuery.length >= 1
    ? students.filter(
        (s) =>
          s.id !== studentId &&
          !friendIds.includes(s.id) &&
          s.login.split('@')[0].toLowerCase().startsWith(searchQuery)
      ).slice(0, 6)
    : []

  function handleAccept(s: typeof students[number]) {
    addFriend(s.id)
    setJustAdded(s.name)
    setTimeout(() => setJustAdded(null), 2500)
  }

  function handleSearchAdd(s: typeof students[number]) {
    addFriend(s.id)
    ignoreSuggestion(s.id) // remove from suggestions too
    setQuery('')
    setNotFound(false)
    setJustAdded(s.name)
    setTimeout(() => setJustAdded(null), 2500)
  }

  function handleSearchSubmit() {
    const h = searchQuery.trim()
    if (!h) return
    const found = students.find(
      (s) => s.login.split('@')[0].toLowerCase() === h && s.id !== studentId
    )
    if (!found) { setNotFound(true); return }
    if (friendIds.includes(found.id)) { setNotFound(false); return }
    handleSearchAdd(found)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Users size={22} style={{ color: '#6270f5' }} /> Amigos
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Colegas da tua escola, desafios e leituras partilhadas.
        </p>
      </div>

      {/* Sugestões da escola */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck size={15} style={{ color: '#6270f5' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Colegas da tua escola
            </p>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(98,112,245,0.12)', color: '#6270f5' }}>
              {suggestions.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {suggestions.map((s) => (
              <SuggestionCard
                key={s.id}
                studentId={s.id}
                onAdd={() => handleAccept(s)}
                onIgnore={() => ignoreSuggestion(s.id)}
              />
            ))}
          </div>
          {justAdded && (
            <p className="text-xs font-medium px-1" style={{ color: '#10b981' }}>
              ✓ {justAdded} adicionado aos amigos!
            </p>
          )}
        </div>
      )}

      {/* Procurar por @ */}
      <div className="card space-y-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          <Search size={13} className="inline mr-1.5" style={{ color: '#6270f5', verticalAlign: 'middle' }} />
          Procurar por @
        </p>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>@</span>
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setNotFound(false) }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="handle do colega"
                className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--surface-2)',
                  border: `1px solid ${notFound ? '#ef4444' : 'var(--border)'}`,
                  color: 'var(--text)',
                }}
              />
            </div>
            <button
              onClick={handleSearchSubmit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}
            >
              <UserPlus size={14} /> Adicionar
            </button>
          </div>

          {/* Autocomplete */}
          {searchResults.length > 0 && (
            <div
              className="absolute left-0 right-28 top-full mt-1 rounded-xl overflow-hidden z-10"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
            >
              {searchResults.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => handleSearchAdd(s)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:opacity-80 transition-opacity"
                  style={{ borderBottom: i < searchResults.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(98,112,245,0.12)', color: '#6270f5' }}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{s.name}</p>
                    <p className="text-xs" style={{ color: '#6270f5' }}>@{s.login.split('@')[0]} · {s.school}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {notFound && <p className="text-xs" style={{ color: '#ef4444' }}>Nenhum colega com esse @.</p>}
        {!justAdded && suggestions.length === 0 && friendIds.length === 0 && !query && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Ainda não há colegas da tua escola. Partilha o link da app com os teus amigos!
          </p>
        )}
      </div>

      {/* Convites pendentes */}
      {myPendingInvites.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={15} style={{ color: '#f59e0b' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Convites pendentes
            </p>
          </div>
          {myPendingInvites.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}
              >
                {p.nome.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{p.nome}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.escola} · {p.ano}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-lg font-semibold shrink-0" style={{ background: 'rgba(245,158,11,0.1)', color: '#92400e' }}>
                A aguardar aprovação
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Lista de amigos */}
      {friendIds.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            {friendIds.length} amigo{friendIds.length !== 1 ? 's' : ''}
          </p>
          {friendIds.map((id) => (
            <FriendCard key={id} friendId={id} onRemove={() => removeFriend(id)} />
          ))}
        </div>
      )}

      {friendIds.length === 0 && suggestions.length === 0 && (
        <div className="card text-center py-12">
          <Users size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Ainda não tens amigos</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Procura pelo @ de um colega ou aguarda que alunos da tua escola se registem.
          </p>
        </div>
      )}
    </div>
  )
}
