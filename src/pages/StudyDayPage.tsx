import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Brain, Check, CheckCircle2, ChevronRight, Lightbulb, Loader2, RotateCcw, Sparkles, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { cn } from '@/lib/utils'
import ReportProblemButton from '@/components/ReportProblemButton'

interface Flashcard { frente: string; verso: string }
interface QuizQ { pergunta: string; opcoes: string[]; correta: number; explicacao: string }
interface ResumoActivo { pergunta: string; respostaEsperada: string }

interface DiaPlano {
  dia: number
  data: string
  tema: string
  resumo: string
  fontes?: number[]
  flashcards?: Flashcard[]
  quiz?: QuizQ[]
  resumoActivo?: ResumoActivo
}

interface StoredPlan {
  id: string
  ownerId: string
  title: string
  goal: 'estudo' | 'exame'
  subject?: string
  level?: string
  shared: boolean
  plano: {
    dias: DiaPlano[]
    regras?: Record<string, number>
    [k: string]: unknown
  }
}

export default function StudyDayPage() {
  const { id, dia: diaParam } = useParams<{ id: string; dia: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const studentId = useStudentAuthStore((s) => s.studentId)
  const inAdminContext = location.pathname.startsWith('/admin/')
  const planPath = inAdminContext ? `/admin/planos/${id}` : `/plano/${id}`
  const libraryPath = inAdminContext ? '/admin/planos' : '/biblioteca'

  const [plan, setPlan] = useState<StoredPlan | null>(null)
  const [progress, setProgress] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  // Respostas do quiz — lifted state para saber quando o dia pode ser concluído
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})

  const diaNum = useMemo(() => parseInt(diaParam ?? '1', 10), [diaParam])
  const dia = plan?.plano.dias.find((d) => d.dia === diaNum) ?? null

  useEffect(() => {
    if (!id || !studentId) return
    setLoading(true)
    Promise.all([
      api.getPlan(id),
      api.getPlanProgress(studentId, id),
    ]).then(([p, prog]: [StoredPlan | null, { diasEstudados: number[] }]) => {
      setPlan(p)
      setProgress(prog.diasEstudados ?? [])
      setLoading(false)
    })
  }, [id, studentId])

  // Reset respostas ao mudar de dia
  useEffect(() => {
    setQuizAnswers({})
  }, [diaNum])

  const needsContent = dia != null && (!dia.flashcards || dia.flashcards.length === 0) && (!dia.quiz || dia.quiz.length === 0)

  const generateContent = useCallback(async () => {
    if (!plan || !dia || generating) return
    setGenerating(true)
    setError('')
    try {
      const result = await api.generateStudyDay({
        subject: plan.subject ?? plan.title,
        year: plan.level ?? '',
        tema: dia.tema,
        resumo: dia.resumo,
        regras: plan.plano.regras ?? { flashcards: 5, quiz: 3 },
        materiais: '',
        avancado: false,
      })

      // Merge atómico no servidor — evita que duas sessões a gerar dias
      // diferentes em paralelo se sobrescrevam.
      const savedDay = await api.savePlanDayContent(plan.id, dia.dia, result)
      if (savedDay) {
        const updatedDias = plan.plano.dias.map((d) =>
          d.dia === dia.dia ? { ...d, ...(savedDay as Partial<DiaPlano>) } : d,
        )
        setPlan({ ...plan, plano: { ...plan.plano, dias: updatedDias } })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro a gerar conteúdo')
    } finally {
      setGenerating(false)
    }
  }, [plan, dia, generating])

  useEffect(() => {
    if (plan && dia && needsContent && !generating) {
      generateContent()
    }
  }, [plan, dia, needsContent, generating, generateContent])

  async function markDone() {
    if (!plan || !dia || !studentId) return
    const already = progress.includes(dia.dia)
    const newList = already ? progress : [...progress, dia.dia]
    await api.setPlanProgress(studentId, plan.id, newList)
    setProgress(newList)
    navigate(planPath)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <Loader2 className="mx-auto animate-spin" size={24} style={{ color: 'var(--text-muted)' }} />
      </div>
    )
  }

  if (!plan || !dia) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Dia não encontrado.</p>
        <button onClick={() => navigate(libraryPath)} className="btn-primary mt-4">Voltar</button>
      </div>
    )
  }

  const isDone = progress.includes(dia.dia)
  const totalQuiz = dia.quiz?.length ?? 0
  const answeredQuiz = Object.keys(quizAnswers).length
  const allAnswered = totalQuiz === 0 || answeredQuiz >= totalQuiz
  const canConclude = !generating && !needsContent && allAnswered

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(planPath)}
          className="p-2 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {plan.title} · Dia {dia.dia}{plan.shared && ' · partilhado'}
          </p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{dia.tema}</h1>
        </div>
      </div>

      <div className="card mb-5">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{dia.resumo}</p>
      </div>

      {generating && <GeneratingContent />}

      {error && (
        <div className="p-3 rounded-lg text-sm mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
          {error}
          <button onClick={generateContent} className="ml-2 underline">Tentar novamente</button>
        </div>
      )}

      {!generating && !needsContent && (
        <div className="space-y-6">
          {dia.flashcards && dia.flashcards.length > 0 && <FlashcardsSection cards={dia.flashcards} />}
          {dia.quiz && dia.quiz.length > 0 && (
            <QuizSection questions={dia.quiz}
              answers={quizAnswers}
              onAnswer={(i, choice) => setQuizAnswers((prev) => ({ ...prev, [i]: choice }))} />
          )}
          {dia.resumoActivo && <ResumoActivoSection ra={dia.resumoActivo} />}

          {!allAnswered && totalQuiz > 0 && (
            <div className="p-3 rounded-lg text-sm text-center"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#b45309' }}>
              Responde todas as {totalQuiz} perguntas do quiz para poder concluir o dia.
              <span className="block text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {answeredQuiz} / {totalQuiz} respondidas
              </span>
            </div>
          )}

          <button onClick={markDone} disabled={!canConclude}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            style={{ opacity: canConclude ? 1 : 0.5, cursor: canConclude ? 'pointer' : 'not-allowed' }}>
            <Check size={18} /> {isDone ? 'Já concluído — voltar' : 'Concluir dia'}
          </button>

          <div className="pt-2 flex justify-center">
            <ReportProblemButton
              context="day"
              planId={plan.id}
              planTitle={plan.title}
              diaNumber={dia.dia}
              diaTitle={dia.tema}
              label="Algo errado neste dia? Reportar"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Loading animado ─────────────────────────────────────────────────────────

const GEN_MESSAGES = [
  { icon: '📖', text: 'A ler o tema e o contexto do dia...' },
  { icon: '🎯', text: 'A identificar os conceitos mais importantes...' },
  { icon: '🧠', text: 'A preparar flashcards que reforçam a aprendizagem...' },
  { icon: '❓', text: 'A formular perguntas que testam a compreensão...' },
  { icon: '✍️', text: 'A escrever explicações claras em Português de Portugal...' },
  { icon: '🔍', text: 'A rever a coerência entre respostas e explicações...' },
  { icon: '⚖️', text: 'A equilibrar dificuldade com o nível de ensino...' },
  { icon: '✨', text: 'A afinar os últimos detalhes...' },
  { icon: '⏳', text: 'Quase lá...' },
]

function GeneratingContent() {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, GEN_MESSAGES.length - 1))
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const current = GEN_MESSAGES[stepIndex]

  return (
    <div className="card overflow-hidden relative">
      <div className="py-10 text-center">
        {/* Ícone animado com gradiente pulsante */}
        <div className="relative mx-auto mb-4 w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(99,143,255,0.15)' }} />
          <div className="absolute inset-1 rounded-full"
            style={{ background: 'linear-gradient(135deg, rgba(99,143,255,0.25), rgba(167,139,250,0.25))' }} />
          <div className="relative text-3xl animate-bounce" style={{ animationDuration: '1.6s' }}>
            {current.icon}
          </div>
        </div>

        {/* Mensagem actual com fade */}
        <p key={stepIndex} className="text-sm font-medium animate-fade-in"
          style={{ color: 'var(--text)' }}>
          {current.text}
        </p>
        <p className="text-xs mt-2 max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          A preparação cuidada de flashcards e quiz consistentes demora normalmente entre <strong>1 e 2 minutos</strong>. Vale a pena esperar — o material fica mais afinado ao nível e aos tópicos.
        </p>

        {/* Pontos que pulsam */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {GEN_MESSAGES.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
              style={{
                background: i <= stepIndex ? '#6270f5' : 'var(--surface-2)',
                transform: i === stepIndex ? 'scale(1.4)' : 'scale(1)',
              }} />
          ))}
        </div>
      </div>

      {/* Barra indeterminada no fundo */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden"
        style={{ background: 'var(--surface-2)' }}>
        <div className="h-full w-1/3 animate-gen-shimmer"
          style={{ background: 'linear-gradient(90deg, transparent, #6270f5, transparent)' }} />
      </div>

      <style>{`
        @keyframes gen-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-gen-shimmer {
          animation: gen-shimmer 1.6s ease-in-out infinite;
        }
        @keyframes gen-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: gen-fade-in 0.35s ease-out;
        }
      `}</style>
    </div>
  )
}

// ── Flashcards ──────────────────────────────────────────────────────────────

function FlashcardsSection({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [completed, setCompleted] = useState(false)
  const card = cards[index]
  const isLast = index === cards.length - 1

  function next() {
    if (isLast) {
      setCompleted(true)
      setFlipped(false)
      return
    }
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  function restart() {
    setCompleted(false)
    setIndex(0)
    setFlipped(false)
  }

  if (completed) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Brain size={16} style={{ color: '#10b981' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            Flashcards <span className="font-normal" style={{ color: 'var(--text-muted)' }}>({cards.length}/{cards.length} ✓)</span>
          </h3>
        </div>
        <div className="w-full p-6 rounded-2xl text-center"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-sm font-semibold mb-1" style={{ color: '#10b981' }}>Completaste todos os flashcards!</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Viste as {cards.length} cartas deste dia. Podes recomeçar para rever ou seguir para o quiz.
          </p>
          <button onClick={restart}
            className="mt-4 px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 mx-auto"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <RotateCcw size={12} /> Recomeçar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Brain size={16} style={{ color: '#6270f5' }} />
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
          Flashcards <span className="font-normal" style={{ color: 'var(--text-muted)' }}>({index + 1}/{cards.length})</span>
        </h3>
      </div>
      <button onClick={() => setFlipped(!flipped)}
        className="w-full p-6 rounded-2xl text-left min-h-[160px] transition-all"
        style={{ background: flipped ? 'rgba(16,185,129,0.08)' : 'var(--surface-2)',
                 border: `1px solid ${flipped ? 'rgba(16,185,129,0.25)' : 'var(--border)'}` }}>
        <p className="text-xs font-semibold mb-2" style={{ color: flipped ? '#10b981' : '#6270f5' }}>
          {flipped ? 'Resposta' : 'Pergunta'}
        </p>
        <p className="text-base" style={{ color: 'var(--text)' }}>{flipped ? card.verso : card.frente}</p>
        <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          {flipped ? 'Clica para ver a pergunta' : 'Clica para ver a resposta'}
        </p>
      </button>
      {/* Progress pips */}
      <div className="flex items-center gap-1 mt-3 justify-center">
        {cards.map((_, i) => (
          <div key={i} className="rounded-full transition-all"
            style={{
              width: i === index ? 14 : 6,
              height: 6,
              background: i === index ? '#6270f5' : i < index ? 'rgba(99,143,255,0.45)' : 'var(--surface-2)',
            }} />
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={restart}
          className="px-3 py-2 rounded-lg text-xs flex items-center gap-1"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <RotateCcw size={12} /> Recomeçar
        </button>
        <button onClick={next}
          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
          style={{ background: '#6270f5', color: 'white' }}>
          {isLast ? 'Terminar' : 'Próximo'} <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Quiz ────────────────────────────────────────────────────────────────────

function QuizSection({
  questions, answers, onAnswer,
}: {
  questions: QuizQ[]
  answers: Record<number, number>
  onAnswer: (index: number, choice: number) => void
}) {
  const total = questions.length
  const done = Object.keys(answers).length
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} style={{ color: '#a78bfa' }} />
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
          Quiz <span className="font-normal" style={{ color: 'var(--text-muted)' }}>({done}/{total})</span>
        </h3>
      </div>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <QuizQuestion key={i} num={i + 1} q={q}
            selected={answers[i]}
            onSelect={(choice) => onAnswer(i, choice)} />
        ))}
      </div>
    </div>
  )
}

function QuizQuestion({
  num, q, selected, onSelect,
}: {
  num: number
  q: QuizQ
  selected: number | undefined
  onSelect: (choice: number) => void
}) {
  const answered = selected !== undefined
  const isCorrect = selected === q.correta

  return (
    <div className="card">
      <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Q{num}. {q.pergunta}</p>
      <div className="space-y-2">
        {q.opcoes.map((opt, i) => (
          <button key={i}
            onClick={() => { if (!answered) onSelect(i) }}
            disabled={answered}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
              !answered && 'hover:bg-slate-100',
            )}
            style={{
              background: answered && i === q.correta ? 'rgba(16,185,129,0.1)'
                       : answered && i === selected ? 'rgba(239,68,68,0.1)'
                       : 'var(--surface-2)',
              border: `1px solid ${answered && i === q.correta ? 'rgba(16,185,129,0.3)'
                                : answered && i === selected ? 'rgba(239,68,68,0.3)'
                                : 'var(--border)'}`,
              color: answered && i === q.correta ? '#10b981'
                  : answered && i === selected ? '#ef4444'
                  : 'var(--text)',
            }}>
            {opt}
          </button>
        ))}
      </div>
      {answered && (
        <div className="mt-3 p-3 rounded-lg flex items-start gap-2"
          style={{ background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                   border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
          {isCorrect
            ? <CheckCircle2 size={16} style={{ color: '#10b981' }} className="shrink-0 mt-0.5" />
            : <XCircle size={16} style={{ color: '#ef4444' }} className="shrink-0 mt-0.5" />}
          <div>
            <p className="text-xs font-semibold" style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>
              {isCorrect ? 'Correto!' : 'Resposta errada'}
            </p>
            <p className="text-xs mt-1 flex items-start gap-1" style={{ color: 'var(--text-muted)' }}>
              <Lightbulb size={11} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
              {q.explicacao}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Resumo Activo ───────────────────────────────────────────────────────────

function ResumoActivoSection({ ra }: { ra: ResumoActivo }) {
  const [shown, setShown] = useState(false)
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Brain size={16} style={{ color: '#10b981' }} />
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Pergunta de revisão</h3>
      </div>
      <div className="card">
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>{ra.pergunta}</p>
        <button onClick={() => setShown(!shown)}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          {shown ? 'Esconder resposta esperada' : 'Mostrar resposta esperada'}
        </button>
        {shown && (
          <div className="mt-3 p-3 rounded-lg text-sm"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--text)' }}>
            {ra.respostaEsperada}
          </div>
        )}
      </div>
    </div>
  )
}
