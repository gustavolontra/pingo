import { useNavigate } from 'react-router-dom'
import { GraduationCap, BookMarked, ArrowRight, Sparkles } from 'lucide-react'

export default function EntryPage() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background:
          'radial-gradient(1200px 600px at 20% -10%, rgba(98,112,245,0.08), transparent 60%), radial-gradient(1000px 500px at 80% 110%, rgba(16,185,129,0.08), transparent 60%), var(--bg)',
      }}
    >
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <h1 className="text-2xl font-display font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            pingo<span style={{ color: '#6270f5' }}>.team</span>
          </h1>
          <span
            className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(98,112,245,0.14)', color: '#6270f5' }}
          >
            beta
          </span>
        </div>

        {/* Hero */}
        <div className="text-center mb-10 space-y-3">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5', border: '1px solid rgba(98,112,245,0.2)' }}
          >
            <Sparkles size={11} /> Duas formas de participar
          </span>
          <h2
            className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight"
            style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
          >
            O que queres explorar hoje?
          </h2>
          <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Escolhe por onde queres começar. Podes alternar entre os dois a qualquer momento.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ProjectCard
            title="Estudo"
            tag="Plataforma de estudo"
            description="Planos personalizados por IA, flashcards, quizzes e acompanhamento de progresso para não entrar em pânico perto do exame."
            bullets={[
              'Planos de estudo gerados por IA',
              'Flashcards e quizzes por disciplina',
              'Ranking, XP e sequência de estudo',
            ]}
            accent="#6270f5"
            accentSoft="rgba(98,112,245,0.08)"
            icon={GraduationCap}
            onClick={() => navigate('/estudo')}
          />
          <ProjectCard
            title="Clube de Leitura"
            tag="Clube entre colegas"
            description="Registem o que andam a ler, partilhem resumos, comentem livros e mantenham uma meta semanal de páginas — juntos."
            bullets={[
              'Livros de cada colega, sempre à vista',
              'Thread de comentários por livro',
              'Meta semanal de páginas lidas',
            ]}
            accent="#10b981"
            accentSoft="rgba(16,185,129,0.08)"
            icon={BookMarked}
            onClick={() => navigate('/clube')}
          />
        </div>

        {/* Login shortcut */}
        <p className="text-center text-sm mt-8" style={{ color: 'var(--text-muted)' }}>
          Já tens conta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-semibold hover:underline"
            style={{ color: '#6270f5' }}
          >
            Inicia sessão
          </button>
        </p>
      </div>
    </div>
  )
}

function ProjectCard({
  title,
  tag,
  description,
  bullets,
  accent,
  accentSoft,
  icon: Icon,
  onClick,
}: {
  title: string
  tag: string
  description: string
  bullets: string[]
  accent: string
  accentSoft: string
  icon: typeof GraduationCap
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group relative text-left rounded-3xl p-6 overflow-hidden transition-all duration-200 hover:-translate-y-1"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${accent}26`,
        boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 10px 32px rgba(15,23,42,0.06)',
      }}
    >
      {/* halo */}
      <div
        aria-hidden
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-60"
        style={{ background: `radial-gradient(closest-side, ${accent}26, transparent)` }}
      />

      <div className="relative">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            color: 'white',
            boxShadow: `0 6px 18px ${accent}55`,
          }}
        >
          <Icon size={22} />
        </div>

        <span
          className="inline-block text-[10px] font-bold uppercase tracking-widest mb-1"
          style={{ color: accent }}
        >
          {tag}
        </span>
        <h3
          className="text-2xl font-display font-extrabold leading-tight"
          style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}
        >
          {title}
        </h3>
        <p className="text-sm mt-2.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>

        <ul className="mt-4 space-y-1.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text)' }}>
              <span
                className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full"
                style={{ background: accent }}
              />
              {b}
            </li>
          ))}
        </ul>

        <div
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5"
          style={{ color: accent }}
        >
          Entrar em {title}
          <ArrowRight size={14} />
        </div>

        <div
          aria-hidden
          className="absolute -bottom-1 -right-1 left-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, transparent, ${accentSoft})` }}
        />
      </div>
    </button>
  )
}
