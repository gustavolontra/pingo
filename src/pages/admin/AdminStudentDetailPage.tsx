import { useParams, useNavigate } from 'react-router-dom'
import { useAdminStore } from '@/store/useAdminStore'
import { ArrowLeft, Zap, Flame, Clock, BookOpen, Trophy, School, Mail, GraduationCap, Calendar, AtSign } from 'lucide-react'
import { formatMinutes } from '@/lib/utils'

export default function AdminStudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { students } = useAdminStore()

  const student = students.find((s) => s.id === id)
  if (!student) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
        Aluno não encontrado.
      </div>
    )
  }

  // Ranking among all students by XP
  const ranked = [...students].sort((a, b) => b.xp - a.xp)
  const rankPosition = ranked.findIndex((s) => s.id === id) + 1
  const totalStudents = students.length

  const stats = [
    { label: 'XP total', value: student.xp, icon: Zap, color: '#6270f5' },
    { label: 'Nível', value: student.level, icon: Trophy, color: '#f59e0b' },
    { label: 'Sequência', value: `${student.streak}d`, icon: Flame, color: '#ef4444' },
    { label: 'Aulas feitas', value: student.lessonsCompleted, icon: BookOpen, color: '#10b981' },
    { label: 'Tempo estudo', value: formatMinutes(student.totalStudyMinutes), icon: Clock, color: '#3b82f6' },
    { label: 'Ranking', value: totalStudents > 0 ? `${rankPosition}º / ${totalStudents}` : '—', icon: Trophy, color: '#8b5cf6' },
  ]

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/usuarios')}
        className="flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={16} />
        Voltar a utilizadores
      </button>

      {/* Header */}
      <div className="card flex items-center gap-5 mb-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
          style={{ background: 'rgba(98,112,245,0.12)', color: '#6270f5' }}
        >
          {student.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-display font-bold" style={{ color: 'var(--text)' }}>{student.name}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Mail size={13} /> {student.login}
            </span>
            <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <School size={13} /> {student.school}
            </span>
            <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <GraduationCap size={13} /> {student.grade}
            </span>
            {student.handle && (
              <span className="flex items-center gap-1.5 text-sm" style={{ color: '#6270f5' }}>
                <AtSign size={13} /> {student.handle}
              </span>
            )}
            {student.createdAt && (
              <span className="flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--text-muted)' }}
                title={`Desde ${new Date(student.createdAt).toLocaleString('pt-PT')}`}>
                <Calendar size={13} /> Desde {new Date(student.createdAt).toLocaleDateString('pt-PT')}
              </span>
            )}
          </div>
          {student.lastActiveAt && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Última atividade: {new Date(student.lastActiveAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div
          className="px-3 py-1.5 rounded-full text-xs font-semibold shrink-0"
          style={{
            background: student.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: student.isActive ? '#10b981' : '#ef4444',
          }}
        >
          {student.isActive ? 'Ativo' : 'Inativo'}
        </div>
      </div>

      {/* Stats */}
      <h3 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
        Estatísticas de Estudo
      </h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Ranking table */}
      {totalStudents > 1 && (
        <>
          <h3 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Ranking da Turma
          </h3>
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                  {['#', 'Aluno', 'Nível', 'XP', 'Aulas'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ranked.map((s, i) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: s.id === id ? 'rgba(98,112,245,0.05)' : undefined,
                    }}
                  >
                    <td className="px-5 py-3.5 font-bold" style={{ color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--text-muted)' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`}
                    </td>
                    <td className="px-5 py-3.5 font-medium" style={{ color: s.id === id ? '#6270f5' : 'var(--text)' }}>
                      {s.name} {s.id === id && <span className="text-xs">(este aluno)</span>}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{s.level}</td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{s.xp}</td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{s.lessonsCompleted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totalStudents <= 1 && (
        <div className="card text-center py-8" style={{ color: 'var(--text-muted)' }}>
          <p className="text-sm">Adiciona mais alunos para ver o ranking da turma.</p>
        </div>
      )}
    </div>
  )
}
