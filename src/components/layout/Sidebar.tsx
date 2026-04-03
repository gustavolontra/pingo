import { NavLink } from "react-router-dom"
import { LayoutDashboard, Calendar, Trophy, User } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/exames', icon: Calendar, label: 'Exames' },
  { to: '/ranking', icon: Trophy, label: 'Ranking' },
  { to: '/perfil', icon: User, label: 'Perfil' },
]

export default function Sidebar() {
  const { user, disciplines } = useStore()
  const xpPct = Math.round((user.xp / user.xpForNextLevel) * 100)

  return (
    <aside
      className="w-64 flex flex-col py-6 px-4 gap-1 shrink-0 overflow-y-auto"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="px-3 mb-5">
        <h1 className="text-xl font-display font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
          pingo<span style={{ color: '#6270f5' }}>.team</span>
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>3.º Ciclo · Ensino Básico</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        {navItems.slice(0, 1).map(({ to, icon: Icon, label }) => (
          <SideNavItem key={to} to={to} icon={Icon} label={label} />
        ))}

        {/* Disciplines section */}
        <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Disciplinas
        </p>
        {disciplines.map((d) => (
          <NavLink
            key={d.id}
            to={`/study/${d.id}`}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive ? '' : 'hover:bg-slate-100'
            )}
            style={({ isActive }) => isActive ? { background: `${d.color}15`, color: d.color } : { color: 'var(--text-muted)' }}
          >
            <span>{d.icon}</span>
            <span className="flex-1 truncate">{d.name}</span>
            <div className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: `${Math.round((d.completedLessons / d.totalLessons) * 100)}%` === '100%' ? '#10b981' : d.color }} />
          </NavLink>
        ))}

        <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Conta
        </p>
        {navItems.slice(1).map(({ to, icon: Icon, label }) => (
          <SideNavItem key={to} to={to} icon={Icon} label={label} />
        ))}
      </nav>

      {/* User card */}
      <div className="mt-auto pt-4">
        <div
          className="p-3 rounded-xl"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: '#6270f5', color: 'white' }}
            >
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{user.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nível {user.level}</p>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              <span>{user.xp} XP</span><span>{user.xpForNextLevel} XP</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function SideNavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <NavLink to={to}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
        isActive ? '' : 'hover:bg-slate-100'
      )}
      style={({ isActive }) => isActive ? { background: 'rgba(98,112,245,0.1)', color: '#6270f5' } : { color: 'var(--text-muted)' }}
    >
      <Icon size={17} />
      {label}
    </NavLink>
  )
}
