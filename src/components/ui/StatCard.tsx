import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  label: string
  value: string | number
  sub?: string
  color?: string
  trend?: 'up' | 'down' | 'neutral'
}

export default function StatCard({ icon: Icon, label, value, sub, color = '#6270f5' }: Props) {
  return (
    <div className="card flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-display font-bold text-white leading-tight">{value}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color }}>{sub}</p>}
      </div>
    </div>
  )
}
