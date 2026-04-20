import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { BarChart2, TrendingUp } from 'lucide-react'
import type { DailyStats } from '@/types'

interface Props { stats: DailyStats[] }

export default function WeeklyChart({ stats }: Props) {
  const data = stats.slice(-7).map((s) => ({
    day: new Date(s.date).toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', ''),
    minutos: s.minutesStudied,
    isToday: s.date === new Date().toISOString().split('T')[0],
  }))

  const total = data.reduce((sum, d) => sum + d.minutos, 0)
  const best = data.reduce((max, d) => (d.minutos > max ? d.minutos : max), 0)

  return (
    <div className="card h-full">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(98,112,245,0.12)' }}>
              <BarChart2 size={14} style={{ color: '#6270f5' }} />
            </span>
            <h3 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
              Minutos de estudo
            </h3>
          </div>
          <p className="text-xs ml-9" style={{ color: 'var(--text-muted)' }}>Últimos 7 dias</p>
        </div>
        {total > 0 && (
          <div className="text-right">
            <p className="text-xl font-display font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
              {total}<span className="text-xs font-medium ml-1" style={{ color: 'var(--text-muted)' }}>min</span>
            </p>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <TrendingUp size={11} style={{ color: '#10b981' }} />
              <p className="text-[11px] font-medium" style={{ color: '#10b981' }}>
                Pico: {best}m
              </p>
            </div>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={28} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6270f5" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.75} />
            </linearGradient>
            <linearGradient id="barGToday" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: 12,
              color: '#1e293b',
              fontSize: 12,
              boxShadow: '0 10px 24px rgba(15,23,42,0.1)',
              padding: '8px 12px',
            }}
            cursor={{ fill: 'rgba(98,112,245,0.06)', radius: 8 }}
            formatter={(v: number) => [`${v} min`, 'Estudo']}
            labelFormatter={(label) => String(label).charAt(0).toUpperCase() + String(label).slice(1)}
          />
          <Bar dataKey="minutos" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.isToday ? 'url(#barGToday)' : 'url(#barG)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
