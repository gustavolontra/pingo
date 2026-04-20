import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useKVContent } from '@/hooks/useKVContent'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import { useStore } from '@/store/useStore'
import { api } from '@/lib/api'
import { Lock, Loader2, Check } from 'lucide-react'

export default function Layout() {
  useKVContent()
  const { mustChangePassword, studentId, clearMustChangePassword } = useStudentAuthStore()

  // Load all server data on mount (localStorage no longer persists it)
  useEffect(() => {
    if (!studentId) return
    useAdminStore.getState().fetchStudents()
    useAdminStore.getState().fetchFeed()
    useStore.getState().fetchServerData(studentId)
  }, [studentId])

  // Poll do feed em segundo plano para o badge de "novo" no sidebar actualizar
  // quando amigos publicam. Refresca a cada 60s e quando o browser volta a ficar
  // visível (evita fetches quando o separador está em background).
  useEffect(() => {
    if (!studentId) return
    const refresh = () => useAdminStore.getState().fetchFeed()
    const interval = window.setInterval(() => {
      if (!document.hidden) refresh()
    }, 60_000)
    const onVisibility = () => { if (!document.hidden) refresh() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [studentId])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
      {mustChangePassword && studentId && (
        <ForcePasswordChange studentId={studentId} onDone={clearMustChangePassword} />
      )}
    </div>
  )
}

function ForcePasswordChange({ studentId, onDone }: { studentId: string; onDone: () => void }) {
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (pw.length < 4) { setError('A senha deve ter pelo menos 4 caracteres.'); return }
    if (pw !== confirm) { setError('As senhas não coincidem.'); return }
    setSaving(true)
    try {
      await api.updateStudent(studentId, { newPassword: pw })
      setDone(true)
      setTimeout(onDone, 1500)
    } catch {
      setError('Erro ao guardar. Tenta novamente.')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {done ? (
          <div className="text-center py-6 space-y-3">
            <Check size={32} className="mx-auto" style={{ color: '#10b981' }} />
            <p className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>Senha atualizada!</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Já podes usar a plataforma.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'rgba(98,112,245,0.12)' }}>
                <Lock size={22} style={{ color: '#6270f5' }} />
              </div>
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>Bem-vindo ao Pingo!</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Escolhe uma nova senha pessoal para a tua conta.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Nova senha</label>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required autoFocus
                placeholder="Mínimo 4 caracteres" autoComplete="new-password"
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Confirmar senha</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                placeholder="Repete a senha" autoComplete="new-password"
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }} />
            </div>
            {error && <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>{error}</p>}
            <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              Guardar nova senha
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
