import { useEffect, useState } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { api } from '@/lib/api'
import { Users, BookOpen, UserCheck, Trophy, Flame, Clock, Star } from 'lucide-react'

export default function AdminDashboard() {
  const { students, currentAdmin } = useAdminStore()
  const [disciplineCount, setDisciplineCount] = useState<number | null>(null)
  const activeStudents = students.filter((s) => s.isActive).length

  useEffect(() => {
    api.getAllContent().then((items) => {
      const unique = new Set(items.map((i) => i.disciplineId))
      setDisciplineCount(unique.size)
    })
  }, [])

  const stats = [
    { label: 'Utilizadores', value: students.length, icon: Users, color: '#6270f5' },
    { label: 'Ativos', value: activeStudents, icon: UserCheck, color: '#10b981' },
    { label: 'Matérias', value: disciplineCount ?? '…', icon: BookOpen, color: '#f59e0b' },
  ]

  const ranking = [...students].sort((a, b) => b.xp - a.xp)

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>
          Olá, {currentAdmin?.name.split(' ')[0]} 👋
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Visão geral da plataforma
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-display font-bold" style={{ color: 'var(--text)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Ranking de alunos */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Trophy size={18} style={{ color: '#f59e0b' }} />
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>Ranking de alunos</h3>
        </div>

        {students.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Nenhum aluno registado ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {ranking.map((student, idx) => (
              <div
                key={student.id}
                className="flex items-center gap-4 px-4 py-3 rounded-xl"
                style={{ background: idx === 0 ? 'rgba(245,158,11,0.07)' : 'var(--surface-2)', border: `1px solid ${idx === 0 ? 'rgba(245,158,11,0.25)' : 'var(--border)'}` }}
              >
                {/* Posição */}
                <div className="w-7 text-center shrink-0">
                  {idx === 0 ? <span className="text-lg">🥇</span>
                    : idx === 1 ? <span className="text-lg">🥈</span>
                    : idx === 2 ? <span className="text-lg">🥉</span>
                    : <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>#{idx + 1}</span>}
                </div>

                {/* Avatar + nome */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: '#6270f515', color: '#6270f5' }}
                >
                  {student.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{student.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{student.grade} · {student.school}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 shrink-0">
                  <StatPill icon={<Star size={11} />} value={`${student.xp} XP`} color="#6270f5" />
                  <StatPill icon={<span className="text-xs">Nível</span>} value={String(student.level)} color="#10b981" />
                  <StatPill icon={<Flame size={11} />} value={`${student.streak}d`} color="#f59e0b" />
                  <StatPill icon={<Clock size={11} />} value={`${student.totalStudyMinutes}min`} color="#8b5cf6" />
                  <StatPill icon={<BookOpen size={11} />} value={`${student.lessonsCompleted} lições`} color="#06b6d4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatPill({ icon, value, color }: { icon: React.ReactNode; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: `${color}12`, color }}>
      {icon}
      <span>{value}</span>
    </div>
  )
}
