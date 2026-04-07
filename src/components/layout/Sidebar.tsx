import { NavLink, useNavigate } from "react-router-dom"
import { LayoutDashboard, Calendar, Trophy, LogOut, BookMarked, Rss, Users } from 'lucide-react'
import SubjectIcon from '@/components/ui/SubjectIcon'
import { useStore } from '@/store/useStore'
import { useDisciplines } from '@/hooks/useDisciplines'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const { user, getFriends, getIgnoredSuggestions, lastSeenFeedAt } = useStore()
  const disciplines = useDisciplines()
  const { studentName, studentId, logout } = useStudentAuthStore()
  const students = useAdminStore((s) => s.students)
  const feedItems = useAdminStore((s) => s.feedItems)
  const navigate = useNavigate()
  const xpPct = Math.round((user.xp / user.xpForNextLevel) * 100)

  const me = students.find((s) => s.id === studentId)
  const friendIds = getFriends()
  const ignoredIds = getIgnoredSuggestions()
  const suggestionCount = students.filter(
    (s) => s.id !== studentId && s.school === me?.school && !friendIds.includes(s.id) && !ignoredIds.includes(s.id)
  ).length

  const unseenFeedCount = lastSeenFeedAt
    ? feedItems.filter((f) => f.data > lastSeenFeedAt && f.autorId !== studentId).length
    : feedItems.filter((f) => f.autorId !== studentId).length

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <aside
      className="w-64 flex flex-col py-6 px-4 shrink-0 overflow-y-auto"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="px-3 mb-5">
        <h1 className="text-xl font-display font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
          pingo<span style={{ color: '#6270f5' }}>.team</span><span style={{ fontSize: '10px', fontWeight: 500, color: '#9ca3af', letterSpacing: '0.05em', marginLeft: '4px', verticalAlign: 'middle' }}>beta</span>
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {me?.grade?.startsWith('5') || me?.grade?.startsWith('6') ? '2.º Ciclo' : '3.º Ciclo'} · Ensino Básico
        </p>
      </div>

      <nav className="flex flex-col gap-0.5 flex-1">
        {/* Dashboard */}
        <SideNavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

        {/* Agenda */}
        <SectionLabel>Agenda</SectionLabel>
        <SideNavItem to="/exames" icon={Calendar} label="Exames" />

        {/* Disciplinas */}
        <SectionLabel>Disciplinas</SectionLabel>
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
            <SubjectIcon icon={d.icon} size={16} />
            <span className="flex-1 truncate">{d.name}</span>
            <div className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: d.completedLessons === d.totalLessons && d.totalLessons > 0 ? '#10b981' : d.color }} />
          </NavLink>
        ))}
        {disciplines.length === 0 && (
          <p className="px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>Sem disciplinas ainda</p>
        )}

        {/* Comunidade */}
        <SectionLabel>Comunidade</SectionLabel>
        <SideNavItem to="/leituras" icon={BookMarked} label="Leituras" />
        <SideNavItem to="/amigos" icon={Users} label="Amigos" badge={suggestionCount > 0 ? suggestionCount : undefined} />
        <SideNavItem to="/feed" icon={Rss} label="Feed" badge={unseenFeedCount > 0 ? unseenFeedCount : undefined} />
        <SideNavItem to="/ranking" icon={Trophy} label="Ranking" />
      </nav>

      {/* User card — clickable → profile */}
      <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => navigate('/perfil')}
          className="w-full p-3 rounded-xl text-left transition-all hover:opacity-80"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: '#6270f5', color: 'white' }}
            >
              {(studentName ?? user.name).charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{studentName ?? user.name}</p>
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
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full mt-2 px-2 py-2 rounded-xl text-sm font-medium transition-all hover:bg-red-50"
          style={{ color: '#dc2626' }}
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </aside>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
      {children}
    </p>
  )
}

function SideNavItem({ to, icon: Icon, label, badge }: { to: string; icon: React.ComponentType<any>; label: string; badge?: number }) {
  return (
    <NavLink to={to}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
        isActive ? '' : 'hover:bg-slate-100'
      )}
      style={({ isActive }) => isActive ? { background: 'rgba(98,112,245,0.1)', color: '#6270f5' } : { color: 'var(--text-muted)' }}
    >
      <Icon size={17} />
      <span className="flex-1">{label}</span>
      {badge != null && (
        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center" style={{ background: '#6270f5', color: 'white', fontSize: '10px' }}>
          {badge}
        </span>
      )}
    </NavLink>
  )
}
