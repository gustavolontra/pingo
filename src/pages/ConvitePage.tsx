import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { UserPlus, Check, AlertCircle, Loader2, BookMarked, GraduationCap, Layers } from 'lucide-react'

type InviterModo = 'estudo' | 'clube' | 'ambos'

export default function ConvitePage() {
  const { codigo } = useParams<{ codigo: string }>()
  const [inviter, setInviter] = useState<{ name: string; handle: string; modo: InviterModo } | null>(null)
  const [loading, setLoading] = useState(true)
  const [invalid, setInvalid] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [nome, setNome] = useState('')
  const [escola, setEscola] = useState('')
  const [ano, setAno] = useState('')
  const [email, setEmail] = useState('')
  const [termosAceites, setTermosAceites] = useState(false)
  const [encarregadoAceite, setEncarregadoAceite] = useState(false)

  useEffect(() => {
    if (!codigo) { setInvalid(true); setLoading(false); return }
    api.getStudentByInviteCode(codigo).then((inv: { name: string; handle: string; modo?: InviterModo } | null) => {
      if (inv) setInviter({ name: inv.name, handle: inv.handle, modo: inv.modo ?? 'estudo' })
      else setInvalid(true)
      setLoading(false)
    })
  }, [codigo])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!codigo) return
    if (!termosAceites || !encarregadoAceite) {
      setError('É necessário o teu acordo e o do teu encarregado de educação para continuar.')
      return
    }
    const nameParts = nome.trim().split(/\s+/).filter(Boolean)
    if (nameParts.length < 2) {
      setError('Coloca o nome completo (pelo menos primeiro nome e um apelido).')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, escola, ano, email, codigoConvite: codigo, termosAceites: true, dataAceite: new Date().toISOString() }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        if (res.status === 409) setError('Este email já está registado.')
        else setError(data.error || 'Erro ao enviar pedido.')
      }
    } catch {
      setError('Erro de ligação. Tenta novamente.')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Loader2 size={28} className="animate-spin" style={{ color: '#6270f5' }} />
      </div>
    )
  }

  if (invalid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-md text-center space-y-4">
          <AlertCircle size={40} className="mx-auto" style={{ color: '#ef4444' }} />
          <h1 className="text-xl font-display font-bold" style={{ color: 'var(--text)' }}>Este convite não é válido.</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            O código de convite pode estar incorreto ou já ter expirado. Pede um novo convite ao teu colega.
          </p>
          <Link to="/" className="inline-block mt-4 text-sm font-semibold" style={{ color: '#6270f5' }}>
            ← Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    const isClub = inviter?.modo === 'clube' || inviter?.modo === 'ambos'
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-md text-center space-y-4">
          <Check size={40} className="mx-auto" style={{ color: '#10b981' }} />
          <h1 className="text-xl font-display font-bold" style={{ color: 'var(--text)' }}>Pedido enviado!</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {isClub
              ? 'Assim que o administrador aprovar, entras no Clube de Leitura e recebes os dados de login.'
              : 'O administrador da plataforma vai aprovar o teu acesso em breve. Receberás os dados de login quando for aprovado.'}
          </p>
          <Link to="/" className="inline-block mt-4 text-sm font-semibold" style={{ color: '#6270f5' }}>
            ← Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  const modo = inviter?.modo ?? 'estudo'
  const theme = modo === 'clube'
    ? {
        accent: '#10b981',
        accentBg: 'rgba(16,185,129,0.12)',
        accentBorder: 'rgba(16,185,129,0.25)',
        icon: BookMarked,
        tag: 'Clube de Leitura',
        title: 'Convite para o Clube de Leitura',
        pitch: 'convidou-te para o Clube de Leitura — partilhem livros, resumos e metas de leitura.',
        checkboxTerms: 'Li e aceito os Termos de Utilização do Pingo e comprometo-me a participar no clube com respeito e responsabilidade.',
      }
    : modo === 'ambos'
    ? {
        accent: '#a78bfa',
        accentBg: 'rgba(167,139,250,0.14)',
        accentBorder: 'rgba(167,139,250,0.3)',
        icon: Layers,
        tag: 'Estudo + Clube',
        title: 'Convite para o Pingo',
        pitch: 'convidou-te para estudar e participar no Clube de Leitura no Pingo.',
        checkboxTerms: 'Li e aceito os Termos de Utilização do Pingo. Comprometo-me a usar a plataforma com respeito e responsabilidade.',
      }
    : {
        accent: '#6270f5',
        accentBg: 'rgba(98,112,245,0.12)',
        accentBorder: 'rgba(98,112,245,0.25)',
        icon: GraduationCap,
        tag: 'Estudo',
        title: 'Convite para o Pingo',
        pitch: 'convidou-te para estudar no Pingo.',
        checkboxTerms: 'Li e aceito os Termos de Utilização do Pingo. Comprometo-me a usar a plataforma com respeito e responsabilidade.',
      }
  const HeaderIcon = theme.icon

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2.5">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
            style={{ background: theme.accentBg, color: theme.accent, border: `1px solid ${theme.accentBorder}` }}
          >
            <HeaderIcon size={11} /> {theme.tag}
          </span>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: theme.accentBg }}
          >
            <UserPlus size={24} style={{ color: theme.accent }} />
          </div>
          <h1 className="text-xl font-display font-bold" style={{ color: 'var(--text)' }}>
            {theme.title}
          </h1>
          {inviter && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: theme.accent }}>@{inviter.handle}</strong> ({inviter.name}) {theme.pitch}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Nome completo</label>
            <input
              value={nome} onChange={(e) => setNome(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
              placeholder="Ex: João Silva"
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Escola</label>
            <input
              value={escola} onChange={(e) => setEscola(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
              placeholder="Ex: Escola Secundária da Maia"
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Ano</label>
            <select
              value={ano} onChange={(e) => setAno(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              <option value="">Seleciona o ano</option>
              <option value="5.º ano">5.º ano</option>
              <option value="6.º ano">6.º ano</option>
              <option value="7.º ano">7.º ano</option>
              <option value="8.º ano">8.º ano</option>
              <option value="9.º ano">9.º ano</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
              placeholder="Ex: joao@gmail.com"
            />
          </div>

          {/* Termos de aceite */}
          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox" checked={termosAceites} onChange={(e) => setTermosAceites(e.target.checked)}
                className="mt-0.5 shrink-0"
                style={{ accentColor: theme.accent }}
              />
              <span className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>
                {theme.checkboxTerms}
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox" checked={encarregadoAceite} onChange={(e) => setEncarregadoAceite(e.target.checked)}
                className="mt-0.5 shrink-0"
                style={{ accentColor: theme.accent }}
              />
              <span className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>
                O meu encarregado de educação tem conhecimento e autoriza a minha participação nesta plataforma educativa.
              </span>
            </label>
          </div>

          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            O Pingo é uma plataforma educativa em fase experimental (beta). Os dados pessoais são tratados de forma confidencial e utilizados exclusivamente para fins educativos, em conformidade com o RGPD. Não partilhamos informação com terceiros. Por favor, não introduzas dados pessoais sensíveis na plataforma.
          </p>

          {error && (
            <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !nome || !escola || !ano || !email || !termosAceites || !encarregadoAceite}
            className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white transition-all"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
              opacity: (!termosAceites || !encarregadoAceite) ? 0.4 : 1,
              boxShadow: `0 4px 18px ${theme.accent}55`,
            }}
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
            {modo === 'clube' ? 'Quero entrar no clube' : 'Pedir acesso'}
          </button>
        </form>

        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Já tens conta? <Link to="/" className="font-semibold" style={{ color: '#6270f5' }}>Iniciar sessão</Link>
        </p>
      </div>
    </div>
  )
}
