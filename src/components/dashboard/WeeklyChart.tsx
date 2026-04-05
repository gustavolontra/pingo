import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { BarChart2 } from 'lucide-react'
import type { DailyStats } from '@/types'

interface Props { stats: DailyStats[] }

export default function WeeklyChart({ stats }: Props) {
  const data = stats.slice(-7).map((s) => ({
    day: new Date(s.date).toLocaleDateString('pt-PT', { weekday: 'short' }),
    minutos: s.minutesStudied,
    isToday: s.date === new Date().toISOString().split('T')[0],
  }))

  return (
    <div className="card">
      <h3 className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2"><BarChart2 size={15} style={{ color: '#a5bbfd' }} /> Minutos de estudo esta semana</h3>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barSize={26} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fill: '#7a92b4', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#0f1e35', border: '1px solid rgba(99,143,255,0.15)', borderRadius: 10, color: '#e8f0ff', fontSize: 13 }}
            cursor={{ fill: 'rgba(98,112,245,0.07)' }}
            formatter={(v: number) => [`${v} min`, 'Estudo']}
          />
          <defs>
            <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6270f5" />
              <stop offset="100%" stopColor="#4f4de8" stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id="barGToday" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <Bar dataKey="minutos" radius={[5, 5, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.isToday ? 'url(#barGToday)' : 'url(#barG)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
