import { useState } from 'react'
import { useAdminStore, type Student } from '@/store/useAdminStore'
import { UserPlus, Trash2, X } from 'lucide-react'

const GRADE_OPTIONS = [
  '1.º ano', '2.º ano', '3.º ano', '4.º ano',
  '5.º ano', '6.º ano', '7.º ano', '8.º ano', '9.º ano',
]

const EMPTY_FORM = { login: '', name: '', school: '', grade: '5.º ano', password: '' }

export default function AdminUsersPage() {
  const { students, createStudent, deleteStudent } = useAdminStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const exists = students.some((s) => s.login === form.login)
    if (exists) { setError('Login já existe.'); return }
    setSaving(true)
    await createStudent(form)
    setSaving(false)
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>Utilizadores</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{students.length} aluno{students.length !== 1 ? 's' : ''} registado{students.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <UserPlus size={16} />
          Novo utilizador
        </button>
      </div>

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="card w-full max-w-md relative">
            <button
              onClick={() => { setShowForm(false); setError('') }}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-display font-bold mb-5" style={{ color: 'var(--text)' }}>Novo utilizador</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <FormField label="Nome completo" value={form.name} onChange={field('name')} placeholder="Ana Costa" required />
              <FormField label="Email" type="email" value={form.login} onChange={field('login')} placeholder="ana@escola.pt" required />
              <FormField label="Escola" value={form.school} onChange={field('school')} placeholder="Escola Básica de Lisboa" required />
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Série</label>
                <select
                  value={form.grade}
                  onChange={field('grade')}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <FormField label="Senha temporária" type="password" value={form.password} onChange={field('password')} placeholder="••••••••" required />
              {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}
              <div className="flex gap-3 mt-1">
                <button type="button" className="btn-ghost flex-1" onClick={() => { setShowForm(false); setError('') }}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1" style={{ opacity: saving ? 0.7 : 1 }} disabled={saving}>
                  {saving ? 'A guardar...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
                <StudentRow key={student.id} student={student} onDelete={() => deleteStudent(student.id)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StudentRow({ student, onDelete }: { student: Student; onDelete: () => void }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-slate-50 transition-colors">
      <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--text)' }}>{student.name}</td>
      <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{student.login}</td>
      <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{student.school}</td>
      <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{student.grade}</td>
      <td className="px-5 py-3.5">
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          style={{ color: '#dc2626' }}
          title="Remover"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  )
}

function FormField({
  label, value, onChange, placeholder, type = 'text', required,
}: {
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
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
      />
    </div>
  )
}
