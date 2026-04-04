import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LogIn, X, Zap, Lock, Trash2, Search } from 'lucide-react'
import { DISCIPLINE_TEMPLATES } from '@/lib/contentBridge'

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface Answer {
  title: string
  body: string
  keyPoints: string[]
  disciplineName: string
  disciplineIcon: string
  disciplineColor: string
  topicTitle: string
  hasInteractive: boolean   // tem quiz ou flashcard relacionado
}

interface RecentItem {
  query: string
  timestamp: number
}

// ── Sugestões a partir do conteúdo real ───────────────────────────────────────

const SUGGESTIONS: string[] = (() => {
  const out: string[] = []
  for (const disc of DISCIPLINE_TEMPLATES) {
    for (const topic of disc.topics) {
      if (out.length >= 6) break
      // usa o título da primeira lição de texto do tópico como sugestão
      const textLesson = topic.lessons.find((l) => l.content.type === 'text')
      if (textLesson) out.push(textLesson.title)
    }
    if (out.length >= 6) break
  }
  return out
})()

// ── Motor de resposta ─────────────────────────────────────────────────────────

function findAnswer(query: string): Answer | null {
  if (!query.trim()) return null
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length >= 3)
  if (words.length === 0) return null

  type Candidate = { score: number; answer: Answer }
  let best: Candidate | null = null

  for (const disc of DISCIPLINE_TEMPLATES) {
    for (const topic of disc.topics) {
      // Verifica se o tópico tem lição de texto
      const textLesson = topic.lessons.find((l) => l.content.type === 'text')
      if (!textLesson || textLesson.content.type !== 'text') continue

      const { body, keyPoints } = textLesson.content
      const hasInteractive = topic.lessons.some((l) => l.content.type === 'quiz' || l.content.type === 'flashcard')

      const searchable = [
        textLesson.title,
        topic.title,
        topic.description,
        body,
        ...keyPoints,
      ].join(' ').toLowerCase()

      // Conta quantas palavras batem
      const score = words.reduce((s, w) => s + (searchable.includes(w) ? 1 : 0), 0)
      if (score === 0) continue

      if (!best || score > best.score) {
        best = {
          score,
          answer: {
            title: textLesson.title,
            body,
            keyPoints,
            disciplineName: disc.name,
            disciplineIcon: disc.icon,
            disciplineColor: disc.color,
            topicTitle: topic.title,
            hasInteractive,
          },
        }
      }
    }
  }

  return best?.answer ?? null
}

// ── Markdown simples → texto limpo ────────────────────────────────────────────

function renderBody(text: string) {
  // Divide em parágrafos/linhas e limpa markdown básico
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { key++; continue }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={key++} className="text-base font-display font-bold mt-5 mb-1" style={{ color: 'var(--text)' }}>
          {trimmed.slice(3)}
        </h3>
      )
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={key++} className="text-sm font-semibold mt-4 mb-1" style={{ color: 'var(--text)' }}>
          {trimmed.slice(4)}
        </h4>
      )
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <li key={key++} className="text-sm ml-4 mb-1" style={{ color: 'var(--text-muted)', listStyleType: 'disc' }}>
          {inlineMarkdown(trimmed.slice(2))}
        </li>
      )
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={key++} className="text-sm pl-3 my-2 italic" style={{ borderLeft: '3px solid var(--border)', color: 'var(--text-muted)' }}>
          {inlineMarkdown(trimmed.slice(2))}
        </blockquote>
      )
    } else {
      elements.push(
        <p key={key++} className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-muted)' }}>
          {inlineMarkdown(trimmed)}
        </p>
      )
    }
  }
  return <div>{elements}</div>
}

function inlineMarkdown(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((p, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: 'var(--text)', fontWeight: 600 }}>{p}</strong>
      : p
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

const FREE_LIMIT = 3

export default function LandingPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loginPrompt, setLoginPrompt] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [questionsUsed, setQuestionsUsed] = useState<number>(() => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const saved = JSON.parse(localStorage.getItem('pingo-q-daily') ?? '{}')
      return saved.date === today ? (saved.count ?? 0) : 0
    } catch { return 0 }
  })
  const [recent, setRecent] = useState<RecentItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('pingo-landing-recent') ?? '[]') } catch { return [] }
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const answerRef = useRef<HTMLDivElement>(null)

  const hasAnswer = answer !== null || aiAnswer !== null || limitReached

  useEffect(() => {
    localStorage.setItem('pingo-landing-recent', JSON.stringify(recent))
  }, [recent])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem('pingo-q-daily', JSON.stringify({ date: today, count: questionsUsed }))
  }, [questionsUsed])

  useEffect(() => {
    if (hasAnswer) answerRef.current?.scrollTo({ top: 0 })
  }, [answer, aiAnswer, hasAnswer])

  async function handleSearch(q: string = query) {
    if (!q.trim()) return

    // Verifica o limite
    if (questionsUsed >= FREE_LIMIT) {
      setLimitReached(true)
      return
    }

    setLoading(true)
    setAnswer(null)
    setAiAnswer(null)
    setLimitReached(false)
    setLoginPrompt(false)

    // Incrementa o contador
    const newCount = questionsUsed + 1
    setQuestionsUsed(newCount)

    setRecent((prev) => {
      const filtered = prev.filter((r) => r.query !== q)
      return [{ query: q, timestamp: Date.now() }, ...filtered].slice(0, 8)
    })

    // Conteúdo local relevante para passar como contexto à IA
    const local = findAnswer(q)

    // Chama o endpoint de IA com o conteúdo local como contexto
    const context = local ? `Título: ${local.title}\n\n${local.body}\n\nPontos-chave: ${local.keyPoints.join('; ')}` : ''
    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, context }),
      })
      if (res.ok) {
        const data = await res.json() as { answer: string }
        const aiText = data.answer
        const isRejection = aiText.startsWith('Boa tentativa!') || aiText.startsWith('Ei, aqui estudamos')
        setAiAnswer(aiText)
        setAnswer(isRejection ? null : local)
      } else {
        // API com erro — mostra conteúdo local se existir
        setAnswer(local)
        if (!local) setAiAnswer('Ocorreu um erro ao obter a resposta. Tenta novamente.')
      }
    } catch {
      // Sem rede — mostra conteúdo local se existir
      setAnswer(local)
      if (!local) setAiAnswer('Sem ligação. Verifica a tua internet e tenta novamente.')
    }

    setLoading(false)
    setQuery('')
  }

  function handleSuggestion(s: string) {
    setQuery(s)
    handleSearch(s)
  }

  function handleNew() {
    setQuery('')
    setAnswer(null)
    setAiAnswer(null)
    setLimitReached(false)
    setLoginPrompt(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function clearRecent() {
    setRecent([])
    localStorage.removeItem('pingo-landing-recent')
  }

  return (
    <div className="flex overflow-hidden" style={{ background: '#ffffff', height: '100dvh' }}>

      {/* ── Sidebar — oculta em mobile ──────────────────────────────────────── */}
      <aside
        className="hidden md:flex w-64 flex-col py-5 px-3 gap-2 shrink-0 overflow-y-auto"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        <div className="px-3 mb-3">
          <h1 className="text-xl font-display font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            pingo<span style={{ color: '#6270f5' }}>.team</span>
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Estudo inteligente</p>
        </div>

        <button
          onClick={handleNew}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-100"
          style={{ color: 'var(--text)', border: '1px solid var(--border)' }}
        >
          <Plus size={16} style={{ color: '#6270f5' }} />
          Nova pesquisa
        </button>

        <div className="flex-1 mt-1 overflow-y-auto">
          {recent.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-3 py-1">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Recentes</p>
                <button onClick={clearRecent} className="p-1 rounded-md hover:bg-slate-100 transition-all" title="Limpar histórico">
                  <Trash2 size={11} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
              {recent.map((r, i) => (
                <div key={i} className="group flex items-center rounded-lg hover:bg-slate-100 transition-all">
                  <button
                    onClick={() => handleSuggestion(r.query)}
                    className="flex items-center gap-2 flex-1 px-3 py-2 text-xs text-left truncate"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Search size={11} className="shrink-0" />
                    <span className="truncate">{r.query}</span>
                  </button>
                  <button
                    onClick={() => setRecent((prev) => prev.filter((_, idx) => idx !== i))}
                    className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={11} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              ))}
            </>
          ) : (
            <p className="px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>As tuas pesquisas aparecem aqui.</p>
          )}
        </div>

        <button onClick={() => navigate('/login')} className="btn-primary flex items-center justify-center gap-2 text-sm">
          <LogIn size={15} />
          Iniciar sessão
        </button>
      </aside>

      {/* ── Área principal ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-hidden">

        {/* Topbar */}
        <div
          className="flex items-center justify-between px-4 md:px-6 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          {/* Logo — só visível em mobile (na sidebar em desktop) */}
          <div className="md:hidden">
            <span className="text-lg font-display font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
              pingo<span style={{ color: '#6270f5' }}>.team</span>
            </span>
          </div>
          <div className="hidden md:block flex-1" />
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:bg-slate-100"
            style={{ color: '#6270f5', border: '1px solid rgba(98,112,245,0.25)' }}
          >
            <LogIn size={14} />
            Iniciar sessão
          </button>
        </div>

        {/* ── Idle: logo + pesquisa centrada ─────────────────────────────── */}
        {!hasAnswer && (
          <div className="flex-1 flex flex-col items-center justify-start md:justify-center px-4 md:px-6 py-6 md:py-12 overflow-y-auto">
            <div className="mb-6 md:mb-8 text-center">
              <img
                src="/favicon.svg"
                alt="Pingo"
                className="w-14 h-14 mx-auto mb-4"
                style={{ filter: 'drop-shadow(0 8px 24px rgba(98,112,245,0.35))' }}
              />
              <h2 className="text-3xl font-display font-normal" style={{ color: 'var(--text)' }}>
                O que vamos aprender hoje?
              </h2>
            </div>

            <SearchInput value={query} onChange={setQuery} onSearch={handleSearch} inputRef={inputRef} large />

            <div className="flex flex-wrap gap-2 justify-center mt-5 w-full" style={{ maxWidth: '42rem' }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="text-sm px-3.5 py-1.5 rounded-full transition-all hover:bg-indigo-50"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Banner — só em desktop */}
            <div
              className="hidden md:block mt-10 w-full rounded-2xl overflow-hidden"
              style={{ maxWidth: '28rem', background: 'rgba(98,112,245,0.07)', border: '1px solid rgba(98,112,245,0.2)' }}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                <Zap size={20} style={{ color: '#6270f5', flexShrink: 0 }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Queres ganhar XP e ver o teu progresso?</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Inicia sessão para aceder a quizzes, flashcards e muito mais.</p>
                </div>
                <button onClick={() => navigate('/login')} className="btn-primary text-xs px-4 py-2 shrink-0">Entrar</button>
              </div>
              <div className="flex items-center gap-3 px-5 py-3" style={{ borderTop: '1px solid rgba(98,112,245,0.15)', background: 'rgba(98,112,245,0.04)' }}>
                <span className="text-base">🏆</span>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text)' }}>Qual é a tua posição no ranking da turma?</strong>
                  {' '}Os teus colegas já estão a acumular XP — não fiques para trás.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Com resposta: conteúdo em cima, input fixo em baixo ────────── */}
        {hasAnswer && (
          <>
            {/* Zona de resposta com scroll */}
            <div ref={answerRef} className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-6 py-8">

                {/* Gate de limite */}
                {limitReached && (
                  <div className="text-center py-20">
                    <p className="text-4xl mb-4">🔒</p>
                    <p className="text-lg font-display font-bold mb-2" style={{ color: 'var(--text)' }}>
                      Chegaste ao limite de {FREE_LIMIT} perguntas gratuitas
                    </p>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                      Inicia sessão para continuar a aprender sem limites.
                    </p>
                    <button onClick={() => navigate('/login')} className="btn-primary px-8 py-3">
                      Iniciar sessão
                    </button>
                  </div>
                )}

                {/* Loading */}
                {loading && (
                  <div className="flex flex-col items-center py-20 gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin" />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>A preparar a resposta…</p>
                  </div>
                )}

                {/* Sem resultado */}
                {!loading && !limitReached && !answer && !aiAnswer && (
                  <div className="text-center py-20">
                    <p className="text-4xl mb-4">🔍</p>
                    <p className="text-lg font-display font-bold mb-2" style={{ color: 'var(--text)' }}>
                      Não encontrei nada sobre "{query}"
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Tenta pesquisar por um tema diferente. Sugestões:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {SUGGESTIONS.map((s) => (
                        <button key={s} onClick={() => handleSuggestion(s)} className="text-sm px-3.5 py-1.5 rounded-full transition-all hover:bg-indigo-50" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resposta da IA sem conteúdo local (rejeição, erro, off-topic) */}
                {!loading && !limitReached && !answer && aiAnswer && (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{aiAnswer}</p>
                )}

                {!loading && !limitReached && answer && (
                  <>
                    {/* Etiqueta da fonte */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-base">{answer.disciplineIcon}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${answer.disciplineColor}18`, color: answer.disciplineColor }}>
                        {answer.disciplineName}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{answer.topicTitle}</span>
                    </div>

                    {/* Título */}
                    <h2 className="text-2xl font-display font-extrabold mb-4" style={{ color: 'var(--text)' }}>
                      {answer.title}
                    </h2>

                    {/* Corpo em Markdown — usa resposta da IA se disponível */}
                    {renderBody(aiAnswer ?? answer.body)}

                    {/* Pontos-chave */}
                    {answer.keyPoints.length > 0 && (
                      <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(98,112,245,0.05)', border: '1px solid rgba(98,112,245,0.12)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6270f5' }}>Pontos-chave</p>
                        <ul className="flex flex-col gap-2">
                          {answer.keyPoints.map((kp, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                              <span className="mt-0.5 shrink-0" style={{ color: '#6270f5' }}>✦</span>
                              {kp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CTA interactivo */}
                    {answer.hasInteractive && (
                      <div className="mt-6">
                        {loginPrompt ? (
                          <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl" style={{ background: 'rgba(98,112,245,0.08)', border: '1px solid rgba(98,112,245,0.2)' }}>
                            <Lock size={15} style={{ color: '#6270f5', flexShrink: 0 }} />
                            <p className="text-sm flex-1" style={{ color: 'var(--text)' }}>Inicia sessão para acederes a quizzes e flashcards sobre este tema.</p>
                            <button onClick={() => navigate('/login')} className="btn-primary text-xs px-4 py-2 shrink-0">Entrar</button>
                            <button onClick={() => setLoginPrompt(false)}><X size={14} style={{ color: 'var(--text-muted)' }} /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setLoginPrompt(true)}
                            className="flex items-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl w-full justify-center transition-all"
                            style={{ background: 'rgba(98,112,245,0.07)', color: '#6270f5', border: '1px solid rgba(98,112,245,0.2)' }}
                          >
                            <Lock size={14} />
                            Praticar com quiz e flashcards — requer conta
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Input fixo em baixo */}
            <div
              className="shrink-0 px-6 py-4"
              style={{ borderTop: '1px solid var(--border)', background: '#ffffff' }}
            >
              <div className="max-w-2xl mx-auto">
                <SearchInput value={query} onChange={setQuery} onSearch={handleSearch} inputRef={inputRef} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

// ── Campo de pesquisa ─────────────────────────────────────────────────────────

function SearchInput({
  value, onChange, onSearch, inputRef, large = false,
}: {
  value: string
  onChange: (v: string) => void
  onSearch: (q: string) => void
  inputRef: React.RefObject<HTMLInputElement>
  large?: boolean
}) {
  const hasValue = value.trim().length > 0
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSearch(value) }}
      className="relative w-full"
    style={{ maxWidth: large ? '42rem' : '100%' }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pesquisa qualquer tema…"
        className="w-full outline-none transition-all"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 999,
          color: 'var(--text)',
          fontSize: '0.9375rem',
          padding: '0.75rem 3.2rem 0.75rem 1.4rem',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}
        autoFocus={large}
      />
      <button
        type="submit"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all"
        style={{
          width: large ? 32 : 28,
          height: large ? 32 : 28,
          background: hasValue ? '#6270f5' : 'var(--surface-2)',
          border: `1px solid ${hasValue ? '#6270f5' : 'var(--border)'}`,
          color: hasValue ? 'white' : 'var(--text-muted)',
        }}
      >
        <svg width={14} height={14} viewBox="0 0 13 13" fill="none">
          <path d="M6.5 11V2M6.5 2L2.5 6M6.5 2L10.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  )
}
