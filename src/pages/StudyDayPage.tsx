import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Brain, Check, CheckCircle2, ChevronRight, Lightbulb, Loader2, RotateCcw, Sparkles, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { cn } from '@/lib/utils'

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
  diasEstudados: number[]
}

export default function StudyDayPage() {
  const { id, dia: diaParam } = useParams<{ id: string; dia: string }>()
  const navigate = useNavigate()
  const studentId = useStudentAuthStore((s) => s.studentId)

  const [plan, setPlan] = useState<StoredPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const diaNum = useMemo(() => parseInt(diaParam ?? '1', 10), [diaParam])
  const dia = plan?.plano.dias.find((d) => d.dia === diaNum) ?? null

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.getPlan(id).then((p: StoredPlan | null) => {
      setPlan(p)
      setLoading(false)
    })
  }, [id])

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

      const updatedDias = plan.plano.dias.map((d) =>
        d.dia === dia.dia ? { ...d, ...result } : d,
      )
      const updated = await api.updatePlan(plan.id, { plano: { ...plan.plano, dias: updatedDias } })
      if (updated) setPlan(updated as StoredPlan)
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
    if (!plan || !dia) return
    const already = plan.diasEstudados.includes(dia.dia)
    const newList = already ? plan.diasEstudados : [...plan.diasEstudados, dia.dia]
    const updated = await api.updatePlan(plan.id, { diasEstudados: newList })
    if (updated) setPlan(updated as StoredPlan)
    navigate(`/plano/${plan.id}`)
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
        <button onClick={() => navigate('/biblioteca')} className="btn-primary mt-4">Voltar</button>
      </div>
    )
  }

  const isDone = plan.diasEstudados.includes(dia.dia)
  const isOwner = plan.ownerId === studentId

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/plano/${plan.id}`)}
          className="p-2 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {plan.title} · Dia {dia.dia} {isOwner && plan.shared && '· (partilhado)'}
          </p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{dia.tema}</h1>
        </div>
      </div>

      <div className="card mb-5">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{dia.resumo}</p>
      </div>

      {generating && (
        <div className="card text-center py-10">
          <Sparkles size={28} className="mx-auto mb-3 animate-pulse" style={{ color: '#6270f5' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>A gerar conteúdo do dia...</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Flashcards, quiz e pergunta de revisão. Pode demorar 10-20s.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg text-sm mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
          {error}
          <button onClick={generateContent} className="ml-2 underline">Tentar novamente</button>
        </div>
      )}

      {!generating && !needsContent && (
        <div className="space-y-6">
          {dia.flashcards && dia.flashcards.length > 0 && <FlashcardsSection cards={dia.flashcards} />}
          {dia.quiz && dia.quiz.length > 0 && <QuizSection questions={dia.quiz} />}
          {dia.resumoActivo && <ResumoActivoSection ra={dia.resumoActivo} />}

          <button onClick={markDone}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            <Check size={18} /> {isDone ? 'Já concluído — atualizar' : 'Concluir dia'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Flashcards ──────────────────────────────────────────────────────────────

function FlashcardsSection({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const card = cards[index]

  function next() {
    setFlipped(false)
    setIndex((i) => (i + 1) % cards.length)
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
      <div className="flex gap-2 mt-3">
        <button onClick={() => { setIndex(0); setFlipped(false) }}
          className="px-3 py-2 rounded-lg text-xs flex items-center gap-1"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <RotateCcw size={12} /> Recomeçar
        </button>
        <button onClick={next}
          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
          style={{ background: '#6270f5', color: 'white' }}>
          Próximo <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Quiz ────────────────────────────────────────────────────────────────────

function QuizSection({ questions }: { questions: QuizQ[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} style={{ color: '#a78bfa' }} />
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
          Quiz <span className="font-normal" style={{ color: 'var(--text-muted)' }}>({questions.length} perguntas)</span>
        </h3>
      </div>
      <div className="space-y-4">
        {questions.map((q, i) => <QuizQuestion key={i} num={i + 1} q={q} />)}
      </div>
    </div>
  )
}

function QuizQuestion({ num, q }: { num: number; q: QuizQ }) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  const isCorrect = selected === q.correta

  return (
    <div className="card">
      <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Q{num}. {q.pergunta}</p>
      <div className="space-y-2">
        {q.opcoes.map((opt, i) => (
          <button key={i}
            onClick={() => { if (!answered) setSelected(i) }}
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
