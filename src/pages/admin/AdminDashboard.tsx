import { useEffect, useState } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { api } from '@/lib/api'
import { Users, BookOpen, UserCheck, Trophy, Flame, Clock, Star, GraduationCap, BookMarked, Layers } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { students, currentAdmin } = useAdminStore()
  const navigate = useNavigate()
  const [disciplineCount, setDisciplineCount] = useState<number | null>(null)
  const activeStudents = students.filter((s) => s.isActive).length

  useEffect(() => {
    api.getAllContent().then((items) => {
      const unique = new Set(items.map((i) => i.disciplineId))
      setDisciplineCount(unique.size)
    })
  }, [])

  // Distribuição por modo (default = estudo se não estiver definido)
  const modoCounts = {
    estudo: students.filter((s) => (s.modo ?? 'estudo') === 'estudo').length,
    clube: students.filter((s) => s.modo === 'clube').length,
    ambos: students.filter((s) => s.modo === 'ambos').length,
  }
  // Alunos com acesso ao Clube de Leitura = clube + ambos
  const clubeAccess = modoCounts.clube + modoCounts.ambos
  // Alunos com acesso ao Estudo = estudo + ambos
  const estudoAccess = modoCounts.estudo + modoCounts.ambos

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

      <div className="grid grid-cols-3 gap-4 mb-5">
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

      {/* Distribuição por modo */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>Distribuição por modo</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Clica num cartão para filtrar a lista de utilizadores.</p>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="inline-flex items-center gap-1">
              <GraduationCap size={12} style={{ color: '#6270f5' }} />
              Estudo: <strong style={{ color: 'var(--text)' }}>{estudoAccess}</strong>
            </span>
            <span className="inline-flex items-center gap-1">
              <BookMarked size={12} style={{ color: '#10b981' }} />
              Clube: <strong style={{ color: 'var(--text)' }}>{clubeAccess}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ModoBreakdownCard
            label="Só Estudo"
            desc="Planos + biblioteca, sem clube"
            count={modoCounts.estudo}
            total={students.length}
            color="#6270f5"
            icon={GraduationCap}
            onClick={() => navigate('/admin/usuarios')}
          />
          <ModoBreakdownCard
            label="Só Clube de Leitura"
            desc="Apenas clube, sem estudo"
            count={modoCounts.clube}
            total={students.length}
            color="#10b981"
            icon={BookMarked}
            onClick={() => navigate('/admin/usuarios')}
          />
          <ModoBreakdownCard
            label="Ambos"
            desc="Estudo + clube, com switcher"
            count={modoCounts.ambos}
            total={students.length}
            color="#a78bfa"
            icon={Layers}
            onClick={() => navigate('/admin/usuarios')}
          />
        </div>
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

function ModoBreakdownCard({
  label,
  desc,
  count,
  total,
  color,
  icon: Icon,
  onClick,
}: {
  label: string
  desc: string
  count: number
  total: number
  color: string
  icon: typeof Users
  onClick: () => void
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <button
      onClick={onClick}
      className="group text-left p-4 rounded-2xl transition-all hover:-translate-y-0.5"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${color}22`,
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
          <Icon size={16} />
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
          {pct}%
        </span>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-2xl font-display font-extrabold leading-tight mt-0.5" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
        {count}
        <span className="text-xs font-medium ml-1" style={{ color: 'var(--text-muted)' }}>/ {total}</span>
      </p>
      <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      {/* Barra de progresso */}
      <div className="h-1 rounded-full overflow-hidden mt-3" style={{ background: 'var(--surface-2)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </button>
  )
}
