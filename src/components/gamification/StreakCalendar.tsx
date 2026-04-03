import type { DailyStats } from '@/types'
// removed

interface Props { stats: DailyStats[] }

export default function StreakCalendar({ stats }: Props) {
  // Build last 28 days
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(Date.now() - (27 - i) * 86400000)
    const key = d.toISOString().split('T')[0]
    const entry = stats.find((s) => s.date === key)
    return { date: d, studied: (entry?.minutesStudied ?? 0) > 0, minutes: entry?.minutesStudied ?? 0 }
  })

  const getColor = (minutes: number) => {
    if (minutes === 0) return 'rgba(99,143,255,0.07)'
    if (minutes < 20) return 'rgba(98,112,245,0.3)'
    if (minutes < 45) return 'rgba(98,112,245,0.55)'
    return '#6270f5'
  }

  return (
    <div>
      <h3 className="font-display font-semibold text-white mb-3 text-sm">Atividade — últimos 28 dias</h3>
      <div className="grid grid-cols-7 gap-1.5">
        {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
          <div key={i} className="text-center text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{d}</div>
        ))}
        {days.map((d, i) => (
          <div
            key={i}
            title={`${d.date.toLocaleDateString('pt-PT')}: ${d.minutes}min`}
            className="aspect-square rounded-md transition-all cursor-default"
            style={{ background: getColor(d.minutes) }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 justify-end">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Menos</span>
        {[0, 15, 30, 60].map((m) => (
          <div key={m} className="w-3 h-3 rounded-sm" style={{ background: getColor(m) }} />
        ))}
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Mais</span>
      </div>
    </div>
  )
}
