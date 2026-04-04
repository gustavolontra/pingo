/**
 * AdminActivityLogPage — Log de atividade de todos os utilizadores
 *
 * Mostra o historial de atividade de cada aluno com base nos dados
 * sincronizados: última sessão, XP ganho, lições, minutos estudados.
 */

import { useState } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { Clock, Flame, BookOpen, Star, Search, ChevronDown, ChevronUp } from 'lucide-react'

type SortKey = 'lastActive' | 'xp' | 'lessons' | 'minutes' | 'streak' | 'name'

function formatDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)

  if (diffMin < 1) return 'agora mesmo'
  if (diffMin < 60) return `há ${diffMin} min`
  if (diffH < 24) return `há ${diffH}h`
  if (diffD === 1) return 'ontem'
  if (diffD < 7) return `há ${diffD} dias`
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
}

function activityStatus(lastActiveAt?: string): { label: string; color: string } {
  if (!lastActiveAt) return { label: 'Nunca entrou', color: '#9ca3af' }
  const diffD = (Date.now() - new Date(lastActiveAt).getTime()) / 86400000
  if (diffD < 1) return { label: 'Ativo hoje', color: '#10b981' }
  if (diffD < 3) return { label: 'Ativo recentemente', color: '#f59e0b' }
  if (diffD < 14) return { label: `Inativo ${Math.floor(diffD)}d`, color: '#ef4444' }
  return { label: 'Inativo +14d', color: '#6b7280' }
}

export default function AdminActivityLogPage() {
  const { students } = useAdminStore()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('lastActive')
  const [sortAsc, setSortAsc] = useState(false)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  const filtered = students
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.school.toLowerCase().includes(search.toLowerCase()) ||
      s.grade.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'lastActive': cmp = (a.lastActiveAt ?? '').localeCompare(b.lastActiveAt ?? ''); break
        case 'xp': cmp = a.xp - b.xp; break
        case 'lessons': cmp = a.lessonsCompleted - b.lessonsCompleted; break
        case 'minutes': cmp = a.totalStudyMinutes - b.totalStudyMinutes; break
        case 'streak': cmp = a.streak - b.streak; break
        case 'name': cmp = a.name.localeCompare(b.name); break
      }
      return sortAsc ? cmp : -cmp
    })

  function SortBtn({ col, label }: { col: SortKey; label: string }) {
    const active = sortKey === col
    return (
      <button
        onClick={() => toggleSort(col)}
        className="flex items-center gap-1 text-xs font-semibold select-none"
        style={{ color: active ? '#6270f5' : 'var(--text-muted)' }}
      >
        {label}
        {active
          ? sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />
          : <ChevronDown size={11} style={{ opacity: 0.3 }} />}
      </button>
    )
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>Log de Atividade</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Historial de atividade e estatísticas de todos os alunos.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5" style={{ maxWidth: 320 }}>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          placeholder="Pesquisar aluno, escola ou ano…"
          className="w-full pl-8 pr-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {students.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Nenhum aluno registado</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {/* Header */}
          <div
            className="grid gap-4 px-4 py-3 text-xs"
            style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
          >
            <SortBtn col="name" label="Aluno" />
            <SortBtn col="lastActive" label="Última atividade" />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Estado</span>
            <SortBtn col="xp" label="XP" />
            <SortBtn col="streak" label="Streak" />
            <SortBtn col="lessons" label="Lições" />
            <SortBtn col="minutes" label="Tempo" />
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum resultado.</div>
          ) : (
            filtered.map((student, idx) => {
              const status = activityStatus(student.lastActiveAt)
              return (
                <div
                  key={student.id}
                  className="grid gap-4 px-4 py-3.5 items-center text-sm"
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    background: 'var(--surface)',
                  }}
                >
                  {/* Nome */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: '#6270f515', color: '#6270f5' }}
                    >
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>{student.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{student.grade} · {student.school}</p>
                    </div>
                  </div>

                  {/* Última atividade */}
                  <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={12} />
                    <span className="text-xs">{formatDate(student.lastActiveAt)}</span>
                  </div>

                  {/* Estado */}
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                    style={{ background: `${status.color}18`, color: status.color }}
                  >
                    {status.label}
                  </span>

                  {/* XP */}
                  <div className="flex items-center gap-1" style={{ color: '#6270f5' }}>
                    <Star size={12} />
                    <span className="text-xs font-semibold">{student.xp} XP</span>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center gap-1" style={{ color: '#f59e0b' }}>
                    <Flame size={12} />
                    <span className="text-xs font-semibold">{student.streak}d</span>
                  </div>

                  {/* Lições */}
                  <div className="flex items-center gap-1" style={{ color: '#10b981' }}>
                    <BookOpen size={12} />
                    <span className="text-xs font-semibold">{student.lessonsCompleted}</span>
                  </div>

                  {/* Tempo */}
                  <div className="flex items-center gap-1" style={{ color: '#8b5cf6' }}>
                    <Clock size={12} />
                    <span className="text-xs font-semibold">
                      {student.totalStudyMinutes >= 60
                        ? `${Math.floor(student.totalStudyMinutes / 60)}h${student.totalStudyMinutes % 60 > 0 ? `${student.totalStudyMinutes % 60}m` : ''}`
                        : `${student.totalStudyMinutes}min`}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
