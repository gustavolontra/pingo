import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { Mail, Lock } from 'lucide-react'

export default function StudentLoginPage() {
  const navigate = useNavigate()
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          'radial-gradient(900px 500px at 0% 0%, rgba(98,112,245,0.14), transparent 60%), radial-gradient(900px 500px at 100% 100%, rgba(16,185,129,0.14), transparent 60%), var(--bg)',
      }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-extrabold" style={{ color: 'var(--text)' }}>
            pingo
            <span style={{
              background: 'linear-gradient(90deg, #6270f5 0%, #a78bfa 50%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              .team
            </span>
            <span style={{ fontSize: '10px', fontWeight: 500, color: '#9ca3af', letterSpacing: '0.05em', marginLeft: '4px', verticalAlign: 'middle' }}>beta</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Estudo + Clube de Leitura · num só sítio
          </p>
        </div>

        <LoginForm navigate={navigate} />

        <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
          O acesso é feito por convite. Pede um convite a um colega ou fala com o teu professor.
        </p>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, #6270f5 0%, #a78bfa 55%, #10b981 100%)',
            boxShadow: '0 6px 20px rgba(98,112,245,0.35)',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'A entrar...' : 'Entrar'}
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
