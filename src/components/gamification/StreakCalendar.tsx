import type { DailyStats } from '@/types'
import { Activity } from 'lucide-react'

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
    return {
      date: d,
      future: d > today,
      isToday: d.getTime() === today.getTime(),
      minutes: entry?.minutesStudied ?? 0,
    }
  })

  const getColor = (minutes: number) => {
    if (minutes === 0) return 'rgba(148,163,184,0.14)'
    if (minutes < 20) return 'rgba(98,112,245,0.35)'
    if (minutes < 45) return 'rgba(98,112,245,0.65)'
    return '#6270f5'
  }

  const activeDays = days.filter((d) => !d.future && d.minutes > 0).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(98,112,245,0.12)' }}>
            <Activity size={14} style={{ color: '#6270f5' }} />
          </span>
          <h3 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>Atividade</h3>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}
        >
          {activeDays} {activeDays === 1 ? 'dia ativo' : 'dias ativos'}
        </span>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Últimos 28 dias</p>

      <div className="grid grid-cols-7 gap-1.5">
        {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>{d}</div>
        ))}
        {days.map((d, i) => (
          <div
            key={i}
            title={`${d.date.toLocaleDateString('pt-PT')}${d.future ? '' : `: ${d.minutes} min`}`}
            className="aspect-square rounded-lg transition-all hover:scale-110 cursor-default flex items-center justify-center"
            style={{
              background: d.future ? 'transparent' : getColor(d.minutes),
              border: d.future
                ? '1px dashed var(--border)'
                : d.isToday
                  ? '2px solid #6270f5'
                  : 'none',
            }}
          >
            <span
              className="text-[9px] font-semibold select-none"
              style={{
                color: d.minutes >= 45 ? 'white' : d.minutes > 0 ? '#4338ca' : 'var(--text-muted)',
                opacity: d.future ? 0.35 : 0.9,
              }}
            >
              {d.date.getDate()}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Menos</span>
        {[0, 15, 30, 60].map((m) => (
          <div key={m} className="w-3 h-3 rounded" style={{ background: getColor(m) }} />
        ))}
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Mais</span>
      </div>
    </div>
  )
}
