import type { Badge } from '@/types'

const rarityColors: Record<string, string> = {
  common: '#94a3b8', rare: '#60a5fa', epic: '#c084fc', legendary: '#fbbf24',
}
const rarityLabel: Record<string, string> = {
  common: 'Comum', rare: 'Raro', epic: 'Épico', legendary: 'Lendário',
}

interface Props { badge: Badge; onClose: () => void }

export default function BadgeUnlocked({ badge, onClose }: Props) {
  const color = rarityColors[badge.rarity]
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(7,17,31,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div className="card text-center max-w-sm w-full mx-4 animate-pop">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color }}>
          Nova Conquista!
        </p>
        <div
          className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-5xl mb-4"
          style={{ background: `${color}15`, border: `2px solid ${color}30` }}
        >
          {badge.icon}
        </div>
        <h2 className="text-xl font-display font-bold text-white">{badge.name}</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{badge.description}</p>
        <span
          className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: `${color}15`, color }}
        >
          {rarityLabel[badge.rarity]}
        </span>
        <button onClick={onClose} className="btn-primary w-full mt-5">Fixe! 🎖️</button>
      </div>
    </div>
  )
}
