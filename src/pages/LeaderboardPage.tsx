import { useAdminStore } from '@/store/useAdminStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { Trophy } from 'lucide-react'

const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32']
const rankIcons = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const students = useAdminStore((s) => s.students)
  const { studentId } = useStudentAuthStore()

  const leaderboard = [...students]
    .filter((s) => s.isActive)
    .sort((a, b) => b.xp - a.xp)
    .map((s, i) => ({ ...s, rank: i + 1 }))

  const top3 = leaderboard.slice(0, 3)

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}><Trophy size={22} style={{ color: '#f59e0b' }} /> Ranking</h2>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Alunos ordenados por XP total</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="card text-center py-16">
          <Trophy size={48} className="mx-auto mb-3" style={{ color: '#f59e0b' }} />
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Ainda não há dados de ranking</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            O ranking aparece quando os alunos começarem a estudar.
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {top3.length >= 3 && (
            <div className="grid grid-cols-3 gap-4">
              {top3.map((entry, i) => (
                <div
                  key={entry.id}
                  className="card text-center"
                  style={{
                    order: i === 0 ? 2 : i === 1 ? 1 : 3,
                    borderColor: `${rankColors[i]}30`,
                    outline: entry.id === studentId ? '2px solid #6270f5' : 'none',
                  }}
                >
                  <div className="text-3xl mb-2">{rankIcons[i]}</div>
                  <div
                    className="w-12 h-12 rounded-full mx-auto flex items-center justify-center font-bold text-lg mb-2"
                    style={{ background: `${rankColors[i]}20`, color: rankColors[i] }}
                  >
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                    {entry.name.split(' ')[0]}
                    {entry.id === studentId && ' 👤'}
                  </p>
                  <p className="text-xs mt-0.5 font-bold" style={{ color: rankColors[i] }}>
                    {entry.xp} XP
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Full list */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {leaderboard.map((entry, i) => {
              const isCurrentUser = entry.id === studentId
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 px-5 py-4 transition-all"
                  style={{
                    background: isCurrentUser ? 'rgba(98,112,245,0.08)' : 'transparent',
                    borderBottom: i < leaderboard.length - 1 ? '1px solid var(--border)' : 'none',
                    borderLeft: isCurrentUser ? '3px solid #6270f5' : '3px solid transparent',
                  }}
                >
                  <span className="w-6 text-center font-bold text-sm" style={{ color: i < 3 ? rankColors[i] : 'var(--text-muted)' }}>
                    {i + 1}
                  </span>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0"
                    style={{
                      background: isCurrentUser ? 'rgba(98,112,245,0.15)' : 'var(--surface-2)',
                      color: isCurrentUser ? '#6270f5' : 'var(--text-muted)',
                    }}
                  >
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>
                      {entry.name}{isCurrentUser && ' (tu)'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nível {entry.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{entry.xp}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>XP total</p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
