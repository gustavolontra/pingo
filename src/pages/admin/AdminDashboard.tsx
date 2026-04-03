import { useAdminStore } from '@/store/useAdminStore'
import { Users, BookOpen, UserCheck } from 'lucide-react'

export default function AdminDashboard() {
  const { students, disciplines, currentAdmin } = useAdminStore()
  const activeStudents = students.filter((s) => s.isActive).length

  const stats = [
    { label: 'Utilizadores', value: students.length, icon: Users, color: '#6270f5' },
    { label: 'Ativos', value: activeStudents, icon: UserCheck, color: '#10b981' },
    { label: 'Matérias', value: disciplines.length, icon: BookOpen, color: '#f59e0b' },
  ]

  return (
    <div className="p-8">
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

      {students.length === 0 && disciplines.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🚀</p>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Plataforma pronta!</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Começa por criar matérias e adicionar utilizadores.
          </p>
        </div>
      )}
    </div>
  )
}
