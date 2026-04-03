import { mockLeaderboard } from '@/lib/mockData'

const CURRENT_USER_ID = 'user-1'

const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32']
const rankIcons = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  // unused

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white">🏆 Ranking Semanal</h2>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>XP ganhos nos últimos 7 dias</p>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-4">
        {mockLeaderboard.slice(0, 3).map((entry, i) => (
          <div
            key={entry.userId}
            className="card text-center"
            style={{ order: i === 0 ? 2 : i === 1 ? 1 : 3, borderColor: `${rankColors[i]}30` }}
          >
            <div className="text-3xl mb-2">{rankIcons[i]}</div>
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center font-bold text-lg mb-2"
              style={{ background: `${rankColors[i]}20`, color: rankColors[i] }}
            >
              {entry.name.charAt(0)}
            </div>
            <p className="text-sm font-semibold text-white truncate">{entry.name.split(' ')[0]}</p>
            <p className="text-xs mt-0.5 font-bold" style={{ color: rankColors[i] }}>
              +{entry.weeklyXp} XP
            </p>
          </div>
        ))}
      </div>

      {/* Full list */}
      <div className="card space-y-0" style={{ padding: 0, overflow: 'hidden' }}>
        {mockLeaderboard.map((entry, i) => {
          const isCurrentUser = entry.userId === CURRENT_USER_ID
          return (
            <div
              key={entry.userId}
              className="flex items-center gap-4 px-5 py-4 transition-all"
              style={{
                background: isCurrentUser ? 'rgba(98,112,245,0.08)' : 'transparent',
                borderBottom: i < mockLeaderboard.length - 1 ? '1px solid var(--border)' : 'none',
                borderLeft: isCurrentUser ? '3px solid #6270f5' : '3px solid transparent',
              }}
            >
              <span className="w-6 text-center font-bold text-sm" style={{ color: i < 3 ? rankColors[i] : 'var(--text-muted)' }}>
                {i + 1}
              </span>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0"
                style={{ background: isCurrentUser ? 'rgba(98,112,245,0.2)' : 'var(--surface-2)', color: isCurrentUser ? '#a5bbfd' : 'var(--text-muted)' }}
              >
                {entry.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">
                  {entry.name}{isCurrentUser && ' (tu)'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nível {entry.level}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-white">+{entry.weeklyXp}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>XP semana</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
