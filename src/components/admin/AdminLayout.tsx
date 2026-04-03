import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminStore } from '@/store/useAdminStore'
import { LayoutDashboard, Users, BookOpen, LogOut, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/usuarios', icon: Users, label: 'Utilizadores' },
  { to: '/admin/materias', icon: BookOpen, label: 'Matérias' },
  { to: '/admin/aprendizados', icon: FileText, label: 'Aprendizados' },
]

export default function AdminLayout() {
  const { currentAdmin, logout } = useAdminStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside
        className="w-56 flex flex-col py-6 px-3 shrink-0"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        <div className="px-3 mb-6">
          <h1 className="text-lg font-display font-extrabold" style={{ color: 'var(--text)' }}>
            pingo<span style={{ color: '#6270f5' }}>.team</span>
          </h1>
          <p className="text-xs mt-0.5 font-medium" style={{ color: '#6270f5' }}>Admin</p>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive ? '' : 'hover:bg-slate-100'
              )}
              style={({ isActive }) =>
                isActive
                  ? { background: 'rgba(98,112,245,0.1)', color: '#6270f5' }
                  : { color: 'var(--text-muted)' }
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="px-3 mb-3">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
              {currentAdmin?.name}
            </p>
            <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
              {currentAdmin?.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-red-50"
            style={{ color: '#dc2626' }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
