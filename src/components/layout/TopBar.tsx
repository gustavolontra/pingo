import { Flame, Zap } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function TopBar() {
  const user = useStore((s) => s.user)

  return (
    <header
      className="h-16 px-6 flex items-center justify-between shrink-0"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      <div />
      <div className="flex items-center gap-4">
        {/* Streak */}
        <div className="streak-badge">
          <Flame size={14} />
          <span>{user.streak} dias</span>
        </div>

        {/* XP */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
          style={{
            background: 'rgba(98,112,245,0.08)',
            border: '1px solid rgba(98,112,245,0.2)',
            color: '#6270f5',
          }}
        >
          <Zap size={14} />
          <span>{user.xp} XP</span>
        </div>
      </div>
    </header>
  )
}
