import { useStore } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { formatMinutes, formatDate } from '@/lib/utils'
import { Flame, Zap, Clock, BookMarked } from 'lucide-react'

const rarityColors = { common: '#94a3b8', rare: '#60a5fa', epic: '#c084fc', legendary: '#fbbf24' }
const rarityLabels = { common: 'Comum', rare: 'Raro', epic: 'Épico', legendary: 'Lendário' }

export default function ProfilePage() {
  const { user, getBooks } = useStore()
  const { studentName, studentHandle } = useStudentAuthStore()
  const displayName = studentName || user.name
  const sharedBooks = getBooks().filter((b) => b.partilhado && b.status === 'lido')
  const xpProgress = Math.round((user.xp / user.xpForNextLevel) * 100)

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card flex items-center gap-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0"
          style={{ background: 'rgba(98,112,245,0.12)', color: '#6270f5' }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>{displayName}</h2>
          {studentHandle && (
            <p className="text-sm font-medium" style={{ color: '#6270f5' }}>@{studentHandle}</p>
          )}
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Membro desde {formatDate(user.joinedAt, "MMMM 'de' yyyy")}
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold" style={{ color: '#6270f5' }}>Nível {user.level}</span>
              <span style={{ color: 'var(--text-muted)' }}>{user.xp} / {user.xpForNextLevel} XP</span>
            </div>
            <div className="xp-bar h-3">
              <div className="xp-fill" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: 'Sequência atual', value: `${user.streak}d`, color: '#f59e0b' },
          { icon: Flame, label: 'Recorde', value: `${user.longestStreak}d`, color: '#ef4444' },
          { icon: Clock, label: 'Horas de estudo', value: formatMinutes(user.totalStudyMinutes), color: '#6270f5' },
          { icon: Zap, label: 'XP total', value: String(user.xp), color: '#a78bfa' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card text-center">
            <Icon size={22} className="mx-auto mb-2" style={{ color }} />
            <p className="text-xl font-display font-bold" style={{ color: 'var(--text)' }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      {/* Livros partilhados */}
      {sharedBooks.length > 0 && (
        <div className="card">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <BookMarked size={16} style={{ color: '#6270f5' }} /> Livros lidos e partilhados
          </h3>
          <div className="flex flex-col gap-3">
            {sharedBooks.map((b) => (
              <div key={b.id} className="p-3 rounded-xl space-y-1" style={{ background: 'var(--surface-2)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{b.titulo}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.autor}</p>
                {b.resumo && <p className="text-xs mt-1.5" style={{ color: 'var(--text)' }}>{b.resumo}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {user.badges.length > 0 ? (
        <div className="card">
          <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text)' }}>
            🏅 Conquistas ({user.badges.filter(b => b.unlockedAt).length}/{user.badges.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {user.badges.map((badge) => {
              const locked = !badge.unlockedAt
              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: locked ? 'rgba(122,146,180,0.05)' : `${rarityColors[badge.rarity]}10`,
                    border: `1px solid ${locked ? 'var(--border)' : `${rarityColors[badge.rarity]}25`}`,
                    opacity: locked ? 0.5 : 1,
                  }}
                >
                  <span className="text-2xl" style={{ filter: locked ? 'grayscale(1)' : 'none' }}>
                    {badge.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{badge.name}</p>
                    <p className="text-xs" style={{ color: rarityColors[badge.rarity] }}>
                      {rarityLabels[badge.rarity]}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="card text-center py-10">
          <p className="text-3xl mb-3">🏅</p>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Sem conquistas ainda</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Completa aulas para desbloquear badges.</p>
        </div>
      )}
    </div>
  )
}
