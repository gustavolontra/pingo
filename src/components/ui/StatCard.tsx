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
    <div
      className="relative rounded-2xl p-4 overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${color}1a`,
        boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.04)',
      }}
    >
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-60"
        style={{ background: `radial-gradient(closest-side, ${color}20, transparent)` }}
      />
      <div className="relative flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, color }}
        >
          <Icon size={18} />
        </div>
      </div>
      <div className="relative">
        <p
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-display font-extrabold leading-tight mt-0.5"
          style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}
        >
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-1.5" style={{ color }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}
