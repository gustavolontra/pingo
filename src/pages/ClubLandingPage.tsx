import { useNavigate } from 'react-router-dom'
import {
  BookMarked, BookOpen, MessageSquare, Target, Users, ArrowLeft, LogIn,
  CheckCircle2, Sparkles,
} from 'lucide-react'

export default function ClubLandingPage() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(900px 500px at 0% 0%, rgba(16,185,129,0.12), transparent 60%), radial-gradient(900px 500px at 100% 100%, rgba(98,112,245,0.08), transparent 60%), var(--bg)',
      }}
    >
      {/* Top bar */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={14} /> Voltar
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-display font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            pingo<span style={{ color: '#10b981' }}>.clube</span>
          </h1>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
          }}
        >
          <LogIn size={14} /> Iniciar sessão
        </button>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-8 pb-16 md:pt-14 md:pb-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-5"
            style={{ background: 'rgba(16,185,129,0.14)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <BookMarked size={11} /> Clube de Leitura
          </span>
          <h2
            className="text-4xl md:text-5xl font-display font-extrabold leading-tight"
            style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
          >
            Lê em <span style={{ color: '#10b981' }}>boa companhia</span>.
          </h2>
          <p className="text-base mt-4 max-w-md leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Um espaço calmo para os teus alunos partilharem livros, comentarem leituras e avançarem em conjunto — semana após semana.
          </p>

          <div className="flex flex-wrap gap-3 mt-7">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                boxShadow: '0 6px 22px rgba(16,185,129,0.4)',
              }}
            >
              <LogIn size={15} /> Entrar no clube
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              Ver outros projetos
            </button>
          </div>

          <div className="flex items-center gap-2 mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Sparkles size={12} style={{ color: '#10b981' }} />
            Convite? Pede o link ao colega ou professor do clube.
          </div>
        </div>

        {/* Mockup */}
        <ClubMockup />
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h3
          className="text-2xl md:text-3xl font-display font-extrabold text-center"
          style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}
        >
          O que encontras no clube
        </h3>
        <p className="text-sm text-center mt-2 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
          Tudo o que precisas para ler em grupo, sem ruído e sem fricção.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Feature
            icon={Users}
            title="Leitores ao lado"
            body="Vê o que cada colega está a ler, o próximo livro e os que já terminou este ano."
          />
          <Feature
            icon={MessageSquare}
            title="Thread por livro"
            body="Cada livro tem a sua conversa — comentários, reações, pensamentos à medida que leem."
          />
          <Feature
            icon={Target}
            title="Meta semanal"
            body="Define quantas páginas queres ler esta semana. Marca o progresso e reinicia à segunda."
          />
          <Feature
            icon={BookOpen}
            title="Resumos partilhados"
            body="Quando terminas um livro, podes deixar um resumo para os colegas que ainda não leram."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 pb-10 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        <p>
          Pingo Clube de Leitura · {new Date().getFullYear()} ·
          <button
            onClick={() => navigate('/')}
            className="ml-1 hover:underline font-semibold"
            style={{ color: '#10b981' }}
          >
            também fazemos Estudo →
          </button>
        </p>
      </footer>
    </div>
  )
}

// ── Mockup ilustrativo ────────────────────────────────────────────────────────

function ClubMockup() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-2 rounded-3xl opacity-60"
        style={{
          background:
            'radial-gradient(closest-side, rgba(16,185,129,0.22), transparent 70%)',
        }}
        aria-hidden
      />
      <div
        className="relative rounded-3xl p-5 space-y-4"
        style={{
          background: 'var(--surface)',
          border: '1px solid rgba(16,185,129,0.18)',
          boxShadow: '0 20px 60px rgba(15,23,42,0.1)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <BookMarked size={15} style={{ color: 'white' }} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#10b981' }}>
                Clube
              </p>
              <p className="text-sm font-display font-extrabold leading-tight" style={{ color: 'var(--text)' }}>
                Semana de leitura
              </p>
            </div>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.14)', color: '#10b981' }}
          >
            3 membros
          </span>
        </div>

        {/* Member row */}
        <div className="space-y-2">
          {[
            { name: 'Marina', book: 'Príncipe Cruel', author: 'Holly Black', color: '#6270f5' },
            { name: 'Lontra', book: 'Nexus', author: 'Yuval Harari', color: '#a78bfa' },
            { name: 'Sofia', book: 'Era uma vez…', author: 'Stephanie Garber', color: '#10b981' },
          ].map((m) => (
            <div
              key={m.name}
              className="flex items-center gap-3 p-2.5 rounded-xl"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}35` }}
              >
                {m.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight" style={{ color: 'var(--text)' }}>{m.name}</p>
                <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                  a ler <strong style={{ color: 'var(--text)' }}>{m.book}</strong> · {m.author}
                </p>
              </div>
              <CheckCircle2 size={14} style={{ color: m.color, opacity: 0.5 }} />
            </div>
          ))}
        </div>

        {/* Goal bar */}
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#f59e0b' }}>
              Meta da semana
            </span>
            <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>
              120 / 200 páginas
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: '60%', background: 'linear-gradient(90deg, #f59e0b, #f97316)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Users
  title: string
  body: string
}) {
  return (
    <div
      className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
      style={{
        background: 'var(--surface)',
        border: '1px solid rgba(16,185,129,0.14)',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
      }}
    >
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}
      >
        <Icon size={18} />
      </span>
      <h4 className="text-sm font-display font-bold" style={{ color: 'var(--text)' }}>
        {title}
      </h4>
      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {body}
      </p>
    </div>
  )
}
