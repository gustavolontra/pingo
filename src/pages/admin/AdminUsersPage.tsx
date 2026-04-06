import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStore, type Student } from '@/store/useAdminStore'
import { hashPassword } from '@/lib/crypto'
import { UserPlus, Trash2, X, ChevronRight, Pencil, Check, Ban, Copy, Clock } from 'lucide-react'

const GRADE_OPTIONS = [
  '1.º ano', '2.º ano', '3.º ano', '4.º ano',
  '5.º ano', '6.º ano', '7.º ano', '8.º ano', '9.º ano',
]

const EMPTY_FORM = { login: '', name: '', school: '', grade: '7.º ano', password: '' }

export default function AdminUsersPage() {
  const { students, createStudent, updateStudent, deleteStudent, pedidosConvite, fetchPedidosConvite, aprovarConvite, recusarConvite } = useAdminStore()
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [approvedCreds, setApprovedCreds] = useState<{ login: string; password: string } | null>(null)

  const pendentes = pedidosConvite.filter((p) => p.estado === 'pendente')

  useEffect(() => { fetchPedidosConvite() }, [])

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const exists = students.some((s) => s.login === form.login)
    if (exists) { setError('Email já existe.'); return }
    setSaving(true)
    await createStudent(form)
    setSaving(false)
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  function openEdit(student: Student) {
    setEditingStudent(student)
    setForm({ login: student.login, name: student.name, school: student.school, grade: student.grade, password: '' })
    setError('')
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingStudent) return
    setError('')
    const emailTaken = students.some((s) => s.login === form.login && s.id !== editingStudent.id)
    if (emailTaken) { setError('Email já existe noutro utilizador.'); return }
    setSaving(true)
    updateStudent(editingStudent.id, { name: form.name, email: form.login, school: form.school, grade: form.grade })
    // Update login field directly (not covered by updateStudent)
    useAdminStore.setState((s) => ({
      students: s.students.map((s2) =>
        s2.id === editingStudent.id ? { ...s2, login: form.login } : s2
      ),
    }))
    if (form.password.trim()) {
      const passwordHash = await hashPassword(form.password)
      useAdminStore.setState((s) => ({
        students: s.students.map((s2) =>
          s2.id === editingStudent.id ? { ...s2, passwordHash } : s2
        ),
      }))
    }
    setSaving(false)
    setEditingStudent(null)
  }

  function handleDelete(id: string) {
    deleteStudent(id)
    setConfirmDeleteId(null)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>Utilizadores</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{students.length} aluno{students.length !== 1 ? 's' : ''} registado{students.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setError('') }}>
          <UserPlus size={16} />
          Novo utilizador
        </button>
      </div>

      {/* Create modal */}
      {showForm && (
        <Modal title="Novo utilizador" onClose={() => { setShowForm(false); setError('') }}>
          <form onSubmit={handleCreate} className="flex flex-col gap-3.5" autoComplete="off">
            <FormField label="Nome completo" value={form.name} onChange={field('name')} placeholder="Ana Costa" required />
            <FormField label="Email (login)" type="email" value={form.login} onChange={field('login')} placeholder="ana@escola.pt" required />
            <FormField label="Escola" value={form.school} onChange={field('school')} placeholder="Escola Básica de Lisboa" required />
            <GradeSelect value={form.grade} onChange={field('grade')} />
            <FormField label="Senha temporária" type="password" value={form.password} onChange={field('password')} placeholder="••••••••" required />
            {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}
            <div className="flex gap-3 mt-1">
              <button type="button" className="btn-ghost flex-1" onClick={() => { setShowForm(false); setError('') }}>Cancelar</button>
              <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'A guardar...' : 'Criar'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit modal */}
      {editingStudent && (
        <Modal title={`Editar — ${editingStudent.name}`} onClose={() => setEditingStudent(null)}>
          <form onSubmit={handleEdit} className="flex flex-col gap-3.5" autoComplete="off">
            <FormField label="Nome completo" value={form.name} onChange={field('name')} placeholder="Ana Costa" required />
            <FormField label="Email (login)" type="email" value={form.login} onChange={field('login')} placeholder="ana@escola.pt" required />
            <FormField label="Escola" value={form.school} onChange={field('school')} placeholder="Escola Básica de Lisboa" required />
            <GradeSelect value={form.grade} onChange={field('grade')} />
            <FormField label="Nova senha (deixa em branco para não alterar)" type="password" value={form.password} onChange={field('password')} placeholder="••••••••" />
            {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}
            <div className="flex gap-3 mt-1">
              <button type="button" className="btn-ghost flex-1" onClick={() => setEditingStudent(null)}>Cancelar</button>
              <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'A guardar...' : 'Guardar'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm delete modal */}
      {confirmDeleteId && (() => {
        const s = students.find((s) => s.id === confirmDeleteId)!
        return (
          <Modal title="Confirmar exclusão" onClose={() => setConfirmDeleteId(null)}>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              Tens a certeza que queres remover <strong style={{ color: 'var(--text)' }}>{s.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
              <button
                className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold force-white transition-all"
                style={{ background: '#dc2626' }}
                onClick={() => handleDelete(confirmDeleteId)}
              >
                Remover
              </button>
            </div>
          </Modal>
        )
      })()}

      {/* Pending invites */}
      {pendentes.length > 0 && (
        <div className="card mb-6 p-0 overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-2" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <Clock size={15} style={{ color: '#f59e0b' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Pedidos pendentes
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#fef3c7', color: '#92400e' }}>
              {pendentes.length}
            </span>
          </div>
          {pendentes.map((p) => {
            const inviterStudent = students.find((s) => s.id === p.convidadoPor)
            return (
              <div key={p.id} className="px-5 py-3 flex items-center gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{p.nome}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {p.escola} · {p.ano} · {p.email}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#6270f5' }}>
                    Convidado por @{inviterStudent?.login.split('@')[0] ?? '?'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={async () => {
                      const creds = await aprovarConvite(p.id)
                      if (creds) setApprovedCreds(creds)
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                    style={{ background: '#dcfce7', color: '#166534' }}
                  >
                    <Check size={13} /> Aprovar
                  </button>
                  <button
                    onClick={() => recusarConvite(p.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                    style={{ background: '#fef2f2', color: '#dc2626' }}
                  >
                    <Ban size={13} /> Recusar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Approved credentials modal */}
      {approvedCreds && (
        <Modal title="Aluno aprovado!" onClose={() => setApprovedCreds(null)}>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Partilha estes dados de acesso com o aluno:
            </p>
            <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Login:</span>
                <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text)' }}>{approvedCreds.login}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Senha:</span>
                <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text)' }}>{approvedCreds.password}</span>
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`Login: ${approvedCreds.login}\nSenha: ${approvedCreds.password}`)
              }}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            >
              <Copy size={14} /> Copiar dados
            </button>
            <button onClick={() => setApprovedCreds(null)} className="btn-ghost w-full py-2">
              Fechar
            </button>
          </div>
        </Modal>
      )}

      {/* Table */}
      {students.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-3xl mb-3">👤</p>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Nenhum utilizador ainda</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Clica em "Novo utilizador" para começar.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['Nome', 'Email', 'Escola', 'Série', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  onEdit={() => openEdit(student)}
                  onDelete={() => setConfirmDeleteId(student.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StudentRow({ student, onEdit, onDelete }: { student: Student; onEdit: () => void; onDelete: () => void }) {
  const navigate = useNavigate()
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-slate-50 transition-colors">
      <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--text)' }}>
        <div className="flex items-center gap-2">
          {student.name}
          {!student.isActive && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#fef2f2', color: '#dc2626' }}>Inativo</span>
          )}
        </div>
      </td>
      <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{student.login}</td>
      <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{student.school}</td>
      <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{student.grade}</td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/admin/usuarios/${student.id}`)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#6270f5' }} title="Ver detalhe">
            <ChevronRight size={15} />
          </button>
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#6270f5' }} title="Editar">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: '#dc2626' }} title="Remover">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <div className="card w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>
        <h3 className="text-lg font-display font-bold mb-5" style={{ color: 'var(--text)' }}>{title}</h3>
        {children}
      </div>
    </div>
  )
}

function GradeSelect({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Série</label>
      <select value={value} onChange={onChange} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
        {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
      </select>
    </div>
  )
}

function FormField({ label, value, onChange, placeholder, type = 'text', required }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
      />
    </div>
  )
}
