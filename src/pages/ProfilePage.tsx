import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import { formatMinutes, formatDate } from '@/lib/utils'
import { api } from '@/lib/api'
import { Flame, Zap, Clock, BookMarked, Link2, Copy, Check, Users, Pencil, Lock, Loader2, School, GraduationCap, Mail } from 'lucide-react'

const rarityColors = { common: '#94a3b8', rare: '#60a5fa', epic: '#c084fc', legendary: '#fbbf24' }
const rarityLabels = { common: 'Comum', rare: 'Raro', epic: 'Épico', legendary: 'Lendário' }

export default function ProfilePage() {
  const { user, getBooks } = useStore()
  const { studentName, studentHandle, studentId } = useStudentAuthStore()
  const students = useAdminStore((s) => s.students)
  const displayName = studentName || user.name
  const sharedBooks = getBooks().filter((b) => b.partilhado && b.status === 'lido')
  const xpProgress = Math.round((user.xp / user.xpForNextLevel) * 100)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editSchool, setEditSchool] = useState('')
  const [editGrade, setEditGrade] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState(false)

  const me = students.find((s) => s.id === studentId)
  const inviteCode = me?.codigoConvite ?? ''
  const inviteLink = inviteCode ? `${window.location.origin}/convite/${inviteCode}` : ''
  const invitedBy = me?.convidadoPor ? students.find((s) => s.id === me.convidadoPor) : null
  const invitedStudents = students.filter((s) => s.convidadoPor === studentId)

  function copyLink() {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function openEdit() {
    setEditName(me?.name ?? displayName)
    setEditSchool(me?.school ?? '')
    setEditGrade(me?.grade ?? '7.º ano')
    setNewPassword('')
    setConfirmPassword('')
    setEditError('')
    setEditSuccess(false)
    setEditing(true)
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setEditError('')
    if (newPassword && newPassword.length < 4) { setEditError('A senha deve ter pelo menos 4 caracteres.'); return }
    if (newPassword && newPassword !== confirmPassword) { setEditError('As senhas não coincidem.'); return }
    setEditSaving(true)
    try {
      const data: Record<string, unknown> = { name: editName, school: editSchool, grade: editGrade }
      if (newPassword) data.newPassword = newPassword
      await api.updateStudent(studentId!, data)
      useAdminStore.getState().fetchStudents()
      // Update local auth store name
      if (editName !== me?.name) {
        useStudentAuthStore.setState({ studentName: editName })
      }
      setEditSuccess(true)
      setTimeout(() => { setEditing(false); setEditSuccess(false) }, 1500)
    } catch {
      setEditError('Erro ao guardar. Tenta novamente.')
    }
    setEditSaving(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card flex items-center gap-6 relative">
        <button
          onClick={openEdit}
          className="absolute top-4 right-4 p-2 rounded-xl hover:opacity-70 transition-opacity"
          style={{ color: '#6270f5' }}
          title="Editar perfil"
        >
          <Pencil size={16} />
        </button>
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0"
          style={{ background: 'rgba(98,112,245,0.12)', color: '#6270f5' }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>{displayName}</h2>
          {studentHandle && (
            <p className="text-sm font-medium" style={{ color: '#6270f5' }}>@{studentHandle}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
            {me?.school && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <School size={12} /> {me.school}
              </span>
            )}
            {me?.grade && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <GraduationCap size={12} /> {me.grade}
              </span>
            )}
            {me?.email && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Mail size={12} /> {me.email}
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Membro desde {formatDate(user.joinedAt, "MMMM 'de' yyyy")}
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold" style={{ color: '#6270f5' }}>Nível {user.level}</span>
              <span style={{ color: 'var(--text-muted)' }}>{user.xp} / {user.xpForNextLevel} XP</span>
            </div>
            <div className="xp-bar h-3">
              <div className="xp-fill" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {editSuccess ? (
              <div className="text-center py-4 space-y-3">
                <Check size={28} className="mx-auto" style={{ color: '#10b981' }} />
                <p className="font-semibold" style={{ color: 'var(--text)' }}>Perfil atualizado!</p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h3 className="text-lg font-display font-bold" style={{ color: 'var(--text)' }}>Editar perfil</h3>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Nome</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} required
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Escola</label>
                  <input value={editSchool} onChange={(e) => setEditSchool(e.target.value)} required
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Ano</label>
                  <select value={editGrade} onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                    {['5.º ano', '6.º ano', '7.º ano', '8.º ano', '9.º ano'].map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lock size={13} style={{ color: 'var(--text-muted)' }} />
                    <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Alterar senha (opcional)</label>
                  </div>
                  <div className="flex flex-col gap-2">
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nova senha" autoComplete="new-password"
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }} />
                    {newPassword && (
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar nova senha" autoComplete="new-password"
                        className="w-full px-3 py-2.5 rounded-xl text-sm"
                        style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }} />
                    )}
                  </div>
                </div>
                {editError && <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>{editError}</p>}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setEditing(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={editSaving}
                    className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                    {editSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                    Guardar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: 'Sequência atual', value: `${user.streak}d`, color: '#f59e0b' },
          { icon: Flame, label: 'Recorde', value: `${user.longestStreak}d`, color: '#ef4444' },
          { icon: Clock, label: 'Horas de estudo', value: formatMinutes(user.totalStudyMinutes), color: '#6270f5' },
          { icon: Zap, label: 'XP total', value: String(user.xp), color: '#a78bfa' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card text-center">
            <Icon size={22} className="mx-auto mb-2" style={{ color }} />
            <p className="text-xl font-display font-bold" style={{ color: 'var(--text)' }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      {/* Livros partilhados */}
      {sharedBooks.length > 0 && (
        <div className="card">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <BookMarked size={16} style={{ color: '#6270f5' }} /> Livros lidos e partilhados
          </h3>
          <div className="flex flex-col gap-3">
            {sharedBooks.map((b) => (
              <div key={b.id} className="p-3 rounded-xl space-y-1" style={{ background: 'var(--surface-2)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{b.titulo}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.autor}</p>
                {b.resumo && <p className="text-xs mt-1.5" style={{ color: 'var(--text)' }}>{b.resumo}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite section */}
      {inviteCode && (
        <div className="card space-y-4">
          <h3 className="font-display font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Link2 size={16} style={{ color: '#6270f5' }} /> O meu convite
          </h3>

          {invitedBy && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Foste convidado por <strong style={{ color: '#6270f5' }}>@{invitedBy.handle ?? invitedBy.login.split('@')[0]}</strong>
            </p>
          )}

          <div className="flex items-center gap-2">
            <div
              className="flex-1 px-3 py-2.5 rounded-xl text-sm font-mono truncate"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              {inviteLink}
            </div>
            <button onClick={copyLink} className="btn-primary px-3 py-2.5 flex items-center gap-1.5 shrink-0">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Partilha este link com colegas para os convidares para o Pingo.
          </p>

          {invitedStudents.length > 0 && (
            <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Users size={13} /> Convidaste {invitedStudents.length} colega{invitedStudents.length !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {invitedStudents.map((s) => (
                  <span key={s.id} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {user.badges.length > 0 ? (
        <div className="card">
          <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text)' }}>
            🏅 Conquistas ({user.badges.filter(b => b.unlockedAt).length}/{user.badges.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {user.badges.map((badge) => {
              const locked = !badge.unlockedAt
              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: locked ? 'rgba(122,146,180,0.05)' : `${rarityColors[badge.rarity]}10`,
                    border: `1px solid ${locked ? 'var(--border)' : `${rarityColors[badge.rarity]}25`}`,
                    opacity: locked ? 0.5 : 1,
                  }}
                >
                  <span className="text-2xl" style={{ filter: locked ? 'grayscale(1)' : 'none' }}>
                    {badge.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{badge.name}</p>
                    <p className="text-xs" style={{ color: rarityColors[badge.rarity] }}>
                      {rarityLabels[badge.rarity]}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="card text-center py-10">
          <p className="text-3xl mb-3">🏅</p>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Sem conquistas ainda</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Completa aulas para desbloquear badges.</p>
        </div>
      )}
    </div>
  )
}
