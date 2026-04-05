import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStore } from '@/store/useAdminStore'
import { Lock, User } from 'lucide-react'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const login = useAdminStore((s) => s.login)
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
    if (ok) {
      navigate('/admin/dashboard')
    } else {
      setError('Utilizador ou senha incorretos.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-extrabold" style={{ color: 'var(--text)' }}>
            pingo<span style={{ color: '#6270f5' }}>.team</span><span style={{ fontSize: '10px', fontWeight: 500, color: '#9ca3af', letterSpacing: '0.05em', marginLeft: '4px', verticalAlign: 'middle' }}>beta</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Área de Administração</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="text" style={{ display: 'none' }} readOnly />
            <input type="password" style={{ display: 'none' }} readOnly />

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                Email
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  ref={emailRef}
                  type="text"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                  placeholder="email@exemplo.com"
                  required
                  autoComplete="new-password"
                  readOnly
                  onFocus={() => emailRef.current?.removeAttribute('readonly')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                Senha
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  ref={passRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  readOnly
                  onFocus={() => passRef.current?.removeAttribute('readonly')}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-center" style={{ color: '#dc2626' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-1"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
