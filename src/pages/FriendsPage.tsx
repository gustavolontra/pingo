import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import { Users, UserPlus, UserMinus, Flame, Zap, BookMarked, X, Search } from 'lucide-react'

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
  const { getFriends, addFriend, removeFriend } = useStore()
  const { studentId } = useStudentAuthStore()
  const students = useAdminStore((s) => s.students)
  const friendIds = getFriends()

  const [query, setQuery] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [alreadyFriend, setAlreadyFriend] = useState(false)
  const [justAdded, setJustAdded] = useState<string | null>(null)

  const searchQuery = query.replace(/^@/, '').toLowerCase()
  const suggestions = searchQuery.length >= 1
    ? students.filter(
        (s) =>
          s.id !== studentId &&
          s.login.split('@')[0].toLowerCase().startsWith(searchQuery)
      ).slice(0, 6)
    : []

  function handleAdd(s: typeof students[number]) {
    if (friendIds.includes(s.id)) { setAlreadyFriend(true); setNotFound(false); return }
    addFriend(s.id)
    setQuery('')
    setNotFound(false)
    setAlreadyFriend(false)
    setJustAdded(s.name)
    setTimeout(() => setJustAdded(null), 2500)
  }

  function handleSearch() {
    const h = searchQuery.trim()
    if (!h) return
    const found = students.find(
      (s) => s.login.split('@')[0].toLowerCase() === h && s.id !== studentId
    )
    if (!found) { setNotFound(true); setAlreadyFriend(false); return }
    handleAdd(found)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Users size={22} style={{ color: '#6270f5' }} /> Os meus amigos
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Adiciona colegas pelo @ para ver o feed deles, desafiá-los e partilhar leituras.
        </p>
      </div>

      {/* Adicionar amigo */}
      <div className="card space-y-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          <UserPlus size={14} className="inline mr-1.5" style={{ color: '#6270f5', verticalAlign: 'middle' }} />
          Adicionar amigo por @
        </p>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>@</span>
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setNotFound(false); setAlreadyFriend(false) }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="handle do colega"
                className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--surface-2)',
                  border: `1px solid ${notFound ? '#ef4444' : alreadyFriend ? '#f97316' : 'var(--border)'}`,
                  color: 'var(--text)',
                }}
              />
            </div>
            <button
              onClick={handleSearch}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}
            >
              <Search size={14} /> Adicionar
            </button>
          </div>

          {/* Sugestões */}
          {suggestions.length > 0 && (
            <div
              className="absolute left-0 right-28 top-full mt-1 rounded-xl overflow-hidden z-10"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
            >
              {suggestions.map((s, i) => {
                const isFriend = friendIds.includes(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => !isFriend && handleAdd(s)}
                    disabled={isFriend}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-opacity"
                    style={{
                      borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                      opacity: isFriend ? 0.5 : 1,
                    }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(98,112,245,0.12)', color: '#6270f5' }}>
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{s.name}</p>
                      <p className="text-xs" style={{ color: '#6270f5' }}>@{s.login.split('@')[0]}</p>
                    </div>
                    {isFriend && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>já amigo</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {notFound && <p className="text-xs" style={{ color: '#ef4444' }}>Nenhum colega com esse @.</p>}
        {alreadyFriend && <p className="text-xs" style={{ color: '#f97316' }}>Esse colega já está na tua lista.</p>}
        {justAdded && (
          <p className="text-xs font-medium" style={{ color: '#10b981' }}>
            ✓ {justAdded} adicionado aos amigos!
          </p>
        )}
      </div>

      {/* Lista de amigos */}
      {friendIds.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Ainda não tens amigos adicionados</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Pesquisa pelo @ de um colega para começar.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            {friendIds.length} amigo{friendIds.length !== 1 ? 's' : ''}
          </p>
          {friendIds.map((id) => (
            <FriendCard key={id} friendId={id} onRemove={() => removeFriend(id)} />
          ))}
        </div>
      )}
    </div>
  )
}
