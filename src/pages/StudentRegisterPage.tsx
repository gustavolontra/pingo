import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdminStore } from '@/store/useAdminStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { Mail, Lock, User, School, ArrowLeft } from 'lucide-react'

const GRADE_OPTIONS = [
  '7.º ano', '8.º ano', '9.º ano',
  '5.º ano', '6.º ano',
  '1.º ano', '2.º ano', '3.º ano', '4.º ano',
]

export default function StudentRegisterPage() {
  const navigate = useNavigate()
  const { students, createStudent } = useAdminStore()
  const login = useStudentAuthStore((s) => s.login)

  const [form, setForm] = useState({ name: '', login: '', school: '', grade: '7.º ano', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const schoolRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('As senhas não coincidem.')
      return
    }
    if (form.password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.')
      return
    }

    const emailNorm = form.login.toLowerCase().trim()
    const exists = students.some((s) => s.login === emailNorm)
    if (exists) {
      setError('Este email já está registado.')
      return
    }

    setLoading(true)
    await createStudent({ ...form, login: emailNorm })
    // Auto-login após registo
    await login(emailNorm, form.password)
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-extrabold" style={{ color: 'var(--text)' }}>
            pingo<span style={{ color: '#6270f5' }}>.team</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Cria a tua conta de estudante</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" autoComplete="off">
            {/* Hidden fields to prevent autofill */}
            <input type="text" style={{ display: 'none' }} readOnly />
            <input type="password" style={{ display: 'none' }} readOnly />

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Nome completo</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  ref={nameRef}
                  type="text"
                  value={form.name}
                  onChange={field('name')}
                  placeholder="Ana Costa"
                  required
                  readOnly
                  onFocus={() => nameRef.current?.removeAttribute('readonly')}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Email (usado para entrar)</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  ref={emailRef}
                  type="text"
                  inputMode="email"
                  value={form.login}
                  onChange={field('login')}
                  placeholder="ana@escola.pt"
                  required
                  readOnly
                  onFocus={() => emailRef.current?.removeAttribute('readonly')}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
            </div>

            {/* Escola */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Escola</label>
              <div className="relative">
                <School size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  ref={schoolRef}
                  type="text"
                  value={form.school}
                  onChange={field('school')}
                  placeholder="Escola Básica de Lisboa"
                  required
                  readOnly
                  onFocus={() => schoolRef.current?.removeAttribute('readonly')}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
            </div>

            {/* Série */}
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

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Senha</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  ref={passRef}
                  type="password"
                  value={form.password}
                  onChange={field('password')}
                  placeholder="••••••••"
                  required
                  readOnly
                  onFocus={() => passRef.current?.removeAttribute('readonly')}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
            </div>

            {/* Confirmar senha */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Confirmar senha</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  ref={confirmRef}
                  type="password"
                  value={form.confirm}
                  onChange={field('confirm')}
                  placeholder="••••••••"
                  required
                  readOnly
                  onFocus={() => confirmRef.current?.removeAttribute('readonly')}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
            </div>

            {error && <p className="text-sm text-center" style={{ color: '#dc2626' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-1"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'A criar conta...' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
          Já tens conta?{' '}
          <Link to="/login" className="font-semibold" style={{ color: '#6270f5' }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
