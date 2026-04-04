import type { DailyStats } from '@/types'
// removed

interface Props { stats: DailyStats[] }

export default function StreakCalendar({ stats }: Props) {
  // Start from the Monday of 3 weeks ago → always shows 4 full Mon–Sun weeks
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const mondayOffset = (today.getDay() + 6) % 7  // Mon=0 … Sun=6
  const startMonday = new Date(today.getTime() - (mondayOffset + 21) * 86400000)

  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(startMonday.getTime() + i * 86400000)
    const key = d.toISOString().split('T')[0]
    const entry = stats.find((s) => s.date === key)
    return { date: d, future: d > today, minutes: entry?.minutesStudied ?? 0 }
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
            title={`${d.date.toLocaleDateString('pt-PT')}${d.future ? '' : `: ${d.minutes}min`}`}
            className="aspect-square rounded-md transition-all cursor-default flex items-center justify-center"
            style={{ background: d.future ? 'transparent' : getColor(d.minutes), border: d.future ? '1px dashed var(--border)' : 'none' }}
          >
            <span className="text-[9px] font-medium select-none" style={{ color: d.minutes > 0 ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)', opacity: d.future ? 0.4 : 0.8 }}>
              {d.date.getDate()}
            </span>
          </div>
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
