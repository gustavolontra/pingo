import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import { Mail, Lock, User, School } from 'lucide-react'

function toTitleCase(str: string) {
  return str.trim().replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

const GRADE_OPTIONS = [
  '7.º ano', '8.º ano', '9.º ano',
  '5.º ano', '6.º ano',
  '1.º ano', '2.º ano', '3.º ano', '4.º ano',
]

export default function StudentLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'registar' ? 'registar' : 'login'
  const [tab, setTab] = useState<'login' | 'registar'>(initialTab)

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-extrabold" style={{ color: 'var(--text)' }}>
            pingo<span style={{ color: '#6270f5' }}>.team</span><span style={{ fontSize: '10px', fontWeight: 500, color: '#9ca3af', letterSpacing: '0.05em', marginLeft: '4px', verticalAlign: 'middle' }}>beta</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>O teu estudo inteligente</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl p-1 mb-5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          {(['login', 'registar'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: tab === t ? 'var(--surface)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {t === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        {tab === 'login'
          ? <LoginForm navigate={navigate} />
          : <RegisterForm navigate={navigate} />}
      </div>
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────────────────

function LoginForm({ navigate }: { navigate: (p: string) => void }) {
  const login = useStudentAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await login(email, password)
    setLoading(false)
    if (ok) navigate('/dashboard')
    else setError('Email ou senha incorretos.')
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
        <input type="text" style={{ display: 'none' }} readOnly />
        <input type="password" style={{ display: 'none' }} readOnly />

        <Field label="Email" icon={<Mail size={15} />}>
          <input
            ref={emailRef}
            type="text"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@escola.pt"
            required
            readOnly
            onFocus={() => emailRef.current?.removeAttribute('readonly')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </Field>

        <Field label="Senha" icon={<Lock size={15} />}>
          <input
            ref={passRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            readOnly
            onFocus={() => passRef.current?.removeAttribute('readonly')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </Field>

        {error && <p className="text-sm text-center" style={{ color: '#dc2626' }}>{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-1" style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? 'A entrar...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

// ── Registo ───────────────────────────────────────────────────────────────────

function RegisterForm({ navigate }: { navigate: (p: string) => void }) {
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
    if (form.password !== form.confirm) { setError('As senhas não coincidem.'); return }
    if (form.password.length < 4) { setError('A senha deve ter pelo menos 4 caracteres.'); return }
    const emailNorm = form.login.toLowerCase().trim()
    if (students.some((s) => s.login === emailNorm)) { setError('Este email já está registado.'); return }
    setLoading(true)
    await createStudent({ ...form, name: toTitleCase(form.name), school: toTitleCase(form.school), login: emailNorm })
    await login(emailNorm, form.password)
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" autoComplete="off">
        <input type="text" style={{ display: 'none' }} readOnly />
        <input type="password" style={{ display: 'none' }} readOnly />

        <Field label="Nome completo" icon={<User size={15} />}>
          <input ref={nameRef} type="text" value={form.name} onChange={field('name')} placeholder="Ana Costa" required readOnly onFocus={() => nameRef.current?.removeAttribute('readonly')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        </Field>

        <Field label="Email (usado para entrar)" icon={<Mail size={15} />}>
          <input ref={emailRef} type="text" inputMode="email" value={form.login} onChange={field('login')} placeholder="ana@escola.pt" required readOnly onFocus={() => emailRef.current?.removeAttribute('readonly')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        </Field>

        <Field label="Escola" icon={<School size={15} />}>
          <input ref={schoolRef} type="text" value={form.school} onChange={field('school')} placeholder="Escola Básica de Lisboa" required readOnly onFocus={() => schoolRef.current?.removeAttribute('readonly')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        </Field>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Série</label>
          <select value={form.grade} onChange={field('grade')} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <Field label="Senha" icon={<Lock size={15} />}>
          <input ref={passRef} type="password" value={form.password} onChange={field('password')} placeholder="••••••••" required readOnly onFocus={() => passRef.current?.removeAttribute('readonly')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        </Field>

        <Field label="Confirmar senha" icon={<Lock size={15} />}>
          <input ref={confirmRef} type="password" value={form.confirm} onChange={field('confirm')} placeholder="••••••••" required readOnly onFocus={() => confirmRef.current?.removeAttribute('readonly')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        </Field>

        {error && <p className="text-sm text-center" style={{ color: '#dc2626' }}>{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-1" style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? 'A criar conta...' : 'Criar conta'}
        </button>
      </form>
    </div>
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>{icon}</span>
        {children}
      </div>
    </div>
  )
}
