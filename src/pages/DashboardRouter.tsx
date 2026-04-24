import { useState } from 'react'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import { GraduationCap, BookMarked } from 'lucide-react'
import DashboardPage from './DashboardPage'
import ClubDashboardPage from './ClubDashboardPage'

export default function DashboardRouter() {
  const { studentId } = useStudentAuthStore()
  const students = useAdminStore((s) => s.students)
  const me = students.find((s) => s.id === studentId)
  const modo = me?.modo ?? 'estudo'

  if (modo === 'clube') return <ClubDashboardPage />
  if (modo === 'estudo') return <DashboardPage />

  // modo === 'ambos' → switcher
  return <DualDashboard />
}

function DualDashboard() {
  const [view, setView] = useState<'estudo' | 'clube'>('estudo')

  return (
    <div className="max-w-6xl mx-auto">
      <div
        className="flex rounded-xl p-1 mb-5 w-fit"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        {(
          [
            { key: 'estudo', label: 'Estudo', icon: GraduationCap, color: '#6270f5' },
            { key: 'clube', label: 'Clube de Leitura', icon: BookMarked, color: '#10b981' },
          ] as const
        ).map(({ key, label, icon: Icon, color }) => {
          const active = view === key
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: active ? 'var(--surface)' : 'transparent',
                color: active ? color : 'var(--text-muted)',
                boxShadow: active ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <Icon size={14} /> {label}
            </button>
          )
        })}
      </div>
      {view === 'estudo' ? <DashboardPage /> : <ClubDashboardPage />}
    </div>
  )
}
