import { useState, useRef, useEffect } from 'react'
import { useStore, type Exam, type DiaPlano } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import { api, getDisciplinasPorAno } from '@/lib/api'
import {
  Calendar, Pencil, Trash2, Plus, BookOpen, ChevronDown, ChevronUp, X,
  Sparkles, Loader2, FileText, Upload, Check, ChevronLeft, ChevronRight,
  RotateCcw, Paperclip, Info, PenLine,
} from 'lucide-react'
import SubjectIcon from '@/components/ui/SubjectIcon'

// ── Ícones de matérias ───────────────────────────────────────────────────────

const SUBJECT_ICONS: Record<string, string> = {
  'Português': '📖', 'Matemática': '📐', 'História': '🏛️', 'Geografia': '🌍',
  'Inglês': '🇬🇧', 'Francês': '🇫🇷', 'Espanhol': '🇪🇸', 'Alemão': '🇩🇪',
  'Ciências Naturais': '🔬', 'Físico-Química': '⚗️',
  'História e Geografia de Portugal': '🏛️', 'Cidadania e Desenvolvimento': '🤝',
}

function subjectIcon(name: string) { return SUBJECT_ICONS[name] ?? '📚' }

function daysUntil(dateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
}

function urgencyColor(days: number) {
  if (days <= 3) return '#ef4444'
  if (days <= 7) return '#f97316'
  if (days <= 14) return '#eab308'
  return '#6270f5'
}

// ── Formulário de adicionar / editar ─────────────────────────────────────────

function ExamForm({ initial, onSave, onCancel, subjects }: {
  initial?: { subject: string; date: string }
  onSave: (subject: string, date: string) => void
  onCancel: () => void
  subjects: string[]
}) {
  const [subject, setSubject] = useState(initial?.subject ?? subjects[0] ?? '')
  const [date, setDate] = useState(initial?.date ?? '')
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="card space-y-4">
      <h3 className="font-display font-semibold" style={{ color: 'var(--text)' }}>
        {initial ? 'Editar exame' : 'Novo exame'}
      </h3>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Matéria</label>
        <select value={subject} onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          {subjects.map((s) => <option key={s} value={s}>{subjectIcon(s)} {s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Data do exame</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={today}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', colorScheme: 'dark' }} />
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={() => { if (date) onSave(subject, date) }} disabled={!date}
          className="btn-primary flex-1" style={{ opacity: !date ? 0.5 : 1 }}>
          {initial ? 'Guardar alterações' : 'Adicionar exame'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Flashcard interativo ─────────────────────────────────────────────────────

function Flashcard({ num, frente, verso, onFlip }: { num: number; frente: string; verso: string; onFlip?: () => void }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button onClick={() => { if (!flipped && onFlip) onFlip(); setFlipped(!flipped) }}
      className="w-full p-4 rounded-xl text-sm text-left transition-all min-h-[80px]"
      style={{ background: flipped ? 'rgba(16,185,129,0.08)' : 'var(--surface-2)', border: `1px solid ${flipped ? 'rgba(16,185,129,0.2)' : 'var(--border)'}` }}>
      <p className="text-xs font-semibold mb-1" style={{ color: flipped ? '#10b981' : '#6270f5' }}>
        {flipped ? `Resposta ${num}` : `Pergunta ${num}`}
      </p>
      <p style={{ color: 'var(--text)' }}>{flipped ? verso : frente}</p>
    </button>
  )
}

// ── Quiz interativo ──────────────────────────────────────────────────────────

function QuizQuestion({ num, pergunta, opcoes, correta, explicacao, onAnswer }: DiaPlano['quiz'][number] & { num: number; onAnswer?: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Q{num}. {pergunta}</p>
      <div className="flex flex-col gap-1.5">
        {opcoes.map((opt, i) => {
          const isCorrect = i === correta
          const isSelected = i === selected
          let bg = 'var(--surface-2)'; let border = 'var(--border)'; let col = 'var(--text)'
          if (answered && isCorrect) { bg = 'rgba(16,185,129,0.1)'; border = 'rgba(16,185,129,0.3)'; col = '#10b981' }
          else if (answered && isSelected && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.3)'; col = '#ef4444' }
          return (
            <button key={i} onClick={() => { if (!answered) { setSelected(i); if (onAnswer) onAnswer(i === correta) } }} disabled={answered}
              className="px-3 py-2 rounded-xl text-sm text-left transition-all"
              style={{ background: bg, border: `1px solid ${border}`, color: col }}>
              {opt}
            </button>
          )
        })}
      </div>
      {answered && (
        <p className="text-xs px-1 mt-1" style={{ color: 'var(--text-muted)' }}>{explicacao}</p>
      )}
    </div>
  )
}

// ── Resumo Activo ────────────────────────────────────────────────────────────

function ResumoActivo({ pergunta, respostaEsperada, onResult }: {
  pergunta: string; respostaEsperada: string
  onResult: (nivel: 'bom' | 'parcial' | 'insuficiente') => void
}) {
  const [resposta, setResposta] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState<{ nivel: string; feedback: string } | null>(null)

  async function evaluate() {
    if (!resposta.trim()) return
    setEvaluating(true)
    const res = await api.evaluateResponse(pergunta, resposta, respostaEsperada)
    setResult(res)
    onResult(res.nivel as 'bom' | 'parcial' | 'insuficiente')
    setEvaluating(false)
  }

  const nivelIcon = result?.nivel === 'bom' ? '✅' : result?.nivel === 'parcial' ? '⚠️' : '❌'

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#f59e0b' }}>
        <PenLine size={12} /> Resumo activo
      </p>
      <p className="text-sm" style={{ color: 'var(--text)' }}>{pergunta}</p>
      {!result ? (
        <>
          <textarea value={resposta} onChange={(e) => setResposta(e.target.value)}
            placeholder="Explica por palavras tuas..." rows={3}
            className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-y"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <button onClick={evaluate} disabled={evaluating || !resposta.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', opacity: !resposta.trim() ? 0.4 : 1 }}>
            {evaluating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            Avaliar resposta
          </button>
        </>
      ) : (
        <div className="px-3 py-2.5 rounded-xl text-xs"
          style={{
            background: result.nivel === 'bom' ? 'rgba(16,185,129,0.08)' : result.nivel === 'parcial' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${result.nivel === 'bom' ? 'rgba(16,185,129,0.2)' : result.nivel === 'parcial' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
          <p style={{ color: 'var(--text)' }}>{nivelIcon} {result.feedback}</p>
        </div>
      )}
    </div>
  )
}

// ── Mini card de dia (tab style) ─────────────────────────────────────────────

function DayTab({ dia, isToday, studied, isSelected, onClick }: {
  dia: DiaPlano; isToday: boolean; studied: boolean; isSelected: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick}
      className="shrink-0 px-4 py-3 rounded-xl text-left transition-all"
      style={{
        minWidth: '140px', maxWidth: '180px',
        background: isSelected ? 'rgba(98,112,245,0.1)' : studied ? 'rgba(16,185,129,0.05)' : 'var(--surface-2)',
        border: `1.5px solid ${isSelected ? '#6270f5' : studied ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
      }}>
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-semibold" style={{ color: isToday ? '#6270f5' : 'var(--text-muted)' }}>
          Dia {dia.dia} {isToday && '· hoje'}
        </span>
        {studied && <Check size={12} style={{ color: '#10b981' }} />}
      </div>
      <p className="text-xs font-semibold mt-0.5 line-clamp-1" style={{ color: 'var(--text)' }}>{dia.tema}</p>
    </button>
  )
}

// ── Conteúdo expandido do dia ────────────────────────────────────────────────

function DayContent({ dia, studied, onStudied, tempoEstimado }: {
  dia: DiaPlano; studied: boolean; onStudied: () => void; tempoEstimado: number
}) {
  const { awardStudyPlanXP } = useStore()
  const [attempt, setAttempt] = useState(0)
  const [flippedCount, setFlippedCount] = useState(0)
  const [answeredQuiz, setAnsweredQuiz] = useState(0)
  const [resumoDone, setResumoDone] = useState(false)
  const isRedo = studied

  const totalFlashcards = dia.flashcards.length
  const totalQuiz = dia.quiz.length
  const hasResumo = !!dia.resumoActivo
  const allDone = flippedCount >= totalFlashcards && answeredQuiz >= totalQuiz && (!hasResumo || resumoDone)

  function handleFlashcardView() { setFlippedCount((v) => v + 1); awardStudyPlanXP(2) }
  function handleQuizAnswer(correct: boolean) { setAnsweredQuiz((v) => v + 1); if (correct) awardStudyPlanXP(5) }
  function handleResumoResult(nivel: 'bom' | 'parcial' | 'insuficiente') {
    setResumoDone(true)
    awardStudyPlanXP(nivel === 'bom' ? 10 : nivel === 'parcial' ? 5 : 0)
  }
  function handleComplete() { awardStudyPlanXP(20, tempoEstimado); onStudied() }

  const progress = totalFlashcards + totalQuiz + (hasResumo ? 1 : 0)
  const done = flippedCount + answeredQuiz + (resumoDone ? 1 : 0)

  return (
    <div className="card space-y-5">
      {/* Day header + progress */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-display font-bold" style={{ color: 'var(--text)' }}>{dia.tema}</p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: allDone ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)', color: allDone ? '#10b981' : 'var(--text-muted)' }}>
            {done}/{progress}
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{dia.resumo}</p>
        <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: 'var(--surface-2)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress > 0 ? (done / progress) * 100 : 0}%`, background: allDone ? '#10b981' : '#6270f5' }} />
        </div>
      </div>

      {/* Flashcards — grid 2 cols on tablet+ */}
      <div key={`fc-${attempt}`}>
        <p className="text-xs font-semibold mb-2" style={{ color: '#6270f5' }}>
          Flashcards ({flippedCount}/{totalFlashcards})
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {dia.flashcards.map((f, i) => <Flashcard key={i} num={i + 1} frente={f.frente} verso={f.verso} onFlip={handleFlashcardView} />)}
        </div>
      </div>

      {/* Quiz — grid 2 cols on tablet+ */}
      <div key={`quiz-${attempt}`}>
        <p className="text-xs font-semibold mb-2" style={{ color: '#6270f5' }}>
          Quiz ({answeredQuiz}/{totalQuiz})
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dia.quiz.map((q, i) => <QuizQuestion key={i} num={i + 1} {...q} onAnswer={handleQuizAnswer} />)}
        </div>
      </div>

      {/* Resumo activo */}
      {dia.resumoActivo && (
        <ResumoActivo key={`resumo-${attempt}`}
          pergunta={dia.resumoActivo.pergunta}
          respostaEsperada={dia.resumoActivo.respostaEsperada}
          onResult={handleResumoResult}
        />
      )}

      {/* Complete day */}
      {!isRedo && (
        <button onClick={handleComplete} disabled={!allDone}
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          style={{
            background: allDone ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)',
            color: allDone ? '#10b981' : 'var(--text-muted)',
            border: `1px solid ${allDone ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
            opacity: allDone ? 1 : 0.5,
          }}>
          <Check size={15} />
          {allDone ? 'Marcar como estudado (+20 XP)' : `Completa todas as atividades (${done}/${progress})`}
        </button>
      )}
      {isRedo && (
        <button onClick={() => { setAttempt((a) => a + 1); setFlippedCount(0); setAnsweredQuiz(0); setResumoDone(false) }}
          className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
          style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          <RotateCcw size={13} /> Refazer este dia
        </button>
      )}
    </div>
  )
}

// ── Plano de estudo ──────────────────────────────────────────────────────────

// ── Animação de geração ──────────────────────────────────────────────────────

const GENERATING_MESSAGES = [
  'A analisar os teus materiais de estudo...',
  'A organizar o conteúdo por temas...',
  'A criar flashcards personalizados...',
  'A preparar perguntas de quiz...',
  'A distribuir o estudo pelos dias...',
  'A gerar o resumo activo de cada dia...',
  'Quase pronto... a finalizar o teu plano!',
]

function GeneratingAnimation() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, GENERATING_MESSAGES.length - 1))
    }, 12000)
    const dotInterval = setInterval(() => {
      setDots((d) => d.length >= 3 ? '' : d + '.')
    }, 600)
    return () => { clearInterval(msgInterval); clearInterval(dotInterval) }
  }, [])

  return (
    <div className="card text-center py-8 space-y-4">
      <Loader2 size={28} className="animate-spin mx-auto" style={{ color: '#6270f5' }} />
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          A gerar o teu plano de estudo{dots}
        </p>
        <p className="text-xs mt-2 transition-all" style={{ color: 'var(--text-muted)' }}>
          {GENERATING_MESSAGES[msgIndex]}
        </p>
      </div>
      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
        A IA está a personalizar o plano — isto pode demorar até 2 minutos.
      </p>
    </div>
  )
}

// ── Plano de estudo ──────────────────────────────────────────────────────────

function StudyPlanSection({ exam }: { exam: Exam }) {
  const { setExamPlano, markDiaEstudado, awardStudyPlanXP } = useStore()
  const { studentId } = useStudentAuthStore()
  const students = useAdminStore((s) => s.students)
  const me = students.find((s) => s.id === studentId)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const plano = exam.planoEstudo
  const today = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const daysStudied = plano?.diasEstudados?.length ?? 0
  const totalDays = plano?.dias?.length ?? 0

  // Auto-select today's day or first unstudied
  const todayDia = plano?.dias?.find((d) => d.data === today)
  const effectiveSelected = selectedDay ?? todayDia?.dia ?? plano?.dias?.find((d) => !(plano.diasEstudados ?? []).includes(d.dia))?.dia ?? null
  const activeDia = plano?.dias?.find((d) => d.dia === effectiveSelected)

  async function generate() {
    setGenerating(true)
    setError('')
    try {
      const year = me?.grade ?? '7.º ano'
      const materiaisForAI = (exam.materiais ?? []).map((m) => ({ nome: m.nome, conteudo: m.conteudo }))
      const result = await api.generateStudyPlan({
        subject: exam.subject,
        year,
        examDate: exam.date,
        studyNote: exam.studyNote || '',
        materiais: materiaisForAI,
      })
      setExamPlano(exam.id, { geradoEm: new Date().toISOString(), resumo: result.resumo, tempoEstimadoPorDia: result.tempoEstimadoPorDia, dias: result.dias, diasEstudados: [] })
    } catch (e) {
      setError(`Erro ao gerar o plano. Tenta novamente. ${e instanceof Error ? e.message : ''}`)
    }
    setGenerating(false)
  }

  function scroll(dir: number) {
    scrollRef.current?.scrollBy({ left: dir * 310, behavior: 'smooth' })
  }

  return (
    <div className="space-y-3">
      {/* Generate / Regenerate button */}
      {!generating ? (
        <button onClick={generate}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5', border: '1px solid rgba(98,112,245,0.2)' }}>
          {plano ? <RotateCcw size={14} /> : <Sparkles size={14} />}
          {plano ? 'Regenerar plano de estudo' : 'Gerar plano de estudo com IA'}
        </button>
      ) : (
        <GeneratingAnimation />
      )}
      {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

      {/* Plan view */}
      {plano && plano.dias?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{plano.resumo}</p>
            <span className="text-xs px-2 py-1 rounded-lg font-semibold shrink-0"
              style={{ background: daysStudied === totalDays ? 'rgba(16,185,129,0.1)' : 'rgba(98,112,245,0.1)', color: daysStudied === totalDays ? '#10b981' : '#6270f5' }}>
              {daysStudied}/{totalDays} dias
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${totalDays > 0 ? (daysStudied / totalDays) * 100 : 0}%`, background: '#6270f5' }} />
          </div>

          {/* Day tabs — horizontal scroll */}
          <div className="relative">
            <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 z-10 p-1.5 rounded-full hidden md:flex"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <ChevronLeft size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
            <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
              {plano.dias.map((dia) => (
                <DayTab key={dia.dia} dia={dia} isToday={dia.data === today}
                  studied={(plano.diasEstudados ?? []).includes(dia.dia)}
                  isSelected={effectiveSelected === dia.dia}
                  onClick={() => setSelectedDay(dia.dia)} />
              ))}
            </div>
            <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 z-10 p-1.5 rounded-full hidden md:flex"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          {/* Expanded day content — full width */}
          {activeDia && (
            <DayContent key={activeDia.dia} dia={activeDia}
              studied={(plano.diasEstudados ?? []).includes(activeDia.dia)}
              onStudied={() => {
                markDiaEstudado(exam.id, activeDia.dia)
                const allDone = plano.dias.every((d) => d.dia === activeDia.dia || (plano.diasEstudados ?? []).includes(d.dia))
                if (allDone) awardStudyPlanXP(50)
              }}
              tempoEstimado={plano.tempoEstimadoPorDia ?? 15} />
          )}
        </div>
      )}
    </div>
  )
}

// ── Secção de materiais ──────────────────────────────────────────────────────

function MaterialsSection({ exam }: { exam: Exam }) {
  const { addExamMaterial, removeExamMaterial } = useStore()
  const [addingText, setAddingText] = useState(false)
  const [textName, setTextName] = useState('')
  const [textContent, setTextContent] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const materiais = exam.materiais ?? []

  function addText() {
    if (!textContent.trim()) return
    addExamMaterial(exam.id, { nome: textName.trim() || 'Material de texto', tipo: 'texto', conteudo: textContent })
    setTextName(''); setTextContent(''); setAddingText(false)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result as string
      addExamMaterial(exam.id, { nome: file.name, tipo: 'ficheiro', conteudo: content })
    }
    // Read as text for txt/md, or base64 for others
    if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      reader.readAsText(file)
    } else {
      reader.readAsText(file) // Best effort — PDFs won't be readable but at least stored
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-2">
      {materiais.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {materiais.map((m) => (
            <div key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              {m.tipo === 'texto' ? <FileText size={13} style={{ color: '#6270f5' }} /> : <Paperclip size={13} style={{ color: '#f59e0b' }} />}
              <span className="flex-1 truncate" style={{ color: 'var(--text)' }}>{m.nome}</span>
              <button onClick={() => removeExamMaterial(exam.id, m.id)}
                className="p-0.5 rounded hover:opacity-70" title="Remover">
                <X size={12} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {addingText ? (
        <div className="space-y-2 p-3 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <input value={textName} onChange={(e) => setTextName(e.target.value)} placeholder="Nome do material (opcional)"
            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <textarea value={textContent} onChange={(e) => setTextContent(e.target.value)}
            placeholder="Cola aqui o conteúdo..." rows={4}
            className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-y"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <div className="flex gap-2">
            <button onClick={addText} disabled={!textContent.trim()} className="btn-primary text-xs px-3 py-1.5"
              style={{ opacity: !textContent.trim() ? 0.4 : 1 }}>Adicionar</button>
            <button onClick={() => { setAddingText(false); setTextName(''); setTextContent('') }}
              className="text-xs px-3 py-1.5 rounded-xl" style={{ color: 'var(--text-muted)' }}>Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => setAddingText(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            <FileText size={12} /> Colar texto
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            <Upload size={12} /> Anexar ficheiro
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.docx,.jpg,.png" onChange={handleFile} className="hidden" />
        </div>
      )}
    </div>
  )
}

// ── Card de exame ─────────────────────────────────────────────────────────────

function ExamCard({ exam, subjects }: { exam: Exam; subjects: string[] }) {
  const { updateExam, deleteExam, setExamStudyNote } = useStore()
  const [editing, setEditing] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [materialsOpen, setMaterialsOpen] = useState(false)
  const [noteValue, setNoteValue] = useState(exam.studyNote)
  const [noteSaved, setNoteSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const days = daysUntil(exam.date)
  const color = urgencyColor(days)
  const icon = subjectIcon(exam.subject)

  function saveNote() {
    setExamStudyNote(exam.id, noteValue)
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  if (editing) {
    return (
      <ExamForm
        initial={{ subject: exam.subject, date: exam.date }}
        onSave={(subject, date) => { updateExam(exam.id, subject, date); setEditing(false) }}
        onCancel={() => setEditing(false)}
        subjects={subjects}
      />
    )
  }

  return (
    <div className="card space-y-4" style={{ borderColor: `${color}25` }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <SubjectIcon icon={icon} size={22} color={color} />
          <div>
            <p className="font-display font-semibold" style={{ color: 'var(--text)' }}>{exam.subject}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatDate(exam.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setEditing(true)} className="p-2 rounded-lg transition-all hover:bg-slate-100/10" title="Editar">
            <Pencil size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button onClick={() => deleteExam(exam.id)} className="px-2 py-1 rounded-lg text-xs font-semibold"
                style={{ background: '#ef444420', color: '#ef4444' }}>Confirmar</button>
              <button onClick={() => setConfirmDelete(false)}><X size={13} style={{ color: 'var(--text-muted)' }} /></button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="p-2 rounded-lg transition-all hover:bg-slate-100/10" title="Eliminar">
              <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
        <Calendar size={14} style={{ color }} />
        <span className="text-sm font-semibold" style={{ color }}>
          {days < 0 ? 'Exame já passou' : days === 0 ? 'Exame hoje!' : `${days} dia${days !== 1 ? 's' : ''} para o exame`}
        </span>
      </div>

      {/* Study note */}
      <div>
        <button onClick={() => setNoteOpen((o) => !o)} className="flex items-center gap-2 w-full text-sm font-medium py-1"
          style={{ color: 'var(--text-muted)' }}>
          <BookOpen size={14} />
          Ficha de estudo
          {noteOpen ? <ChevronUp size={13} className="ml-auto" /> : <ChevronDown size={13} className="ml-auto" />}
          {exam.studyNote && !noteOpen && (
            <span className="text-xs px-1.5 py-0.5 rounded-full ml-1" style={{ background: '#6270f520', color: '#6270f5' }}>✓ guardada</span>
          )}
        </button>
        {noteOpen && (
          <div className="mt-2 space-y-2">
            <textarea value={noteValue} onChange={(e) => setNoteValue(e.target.value)}
              placeholder="Escreve ou cola aqui o conteúdo da ficha de estudo..." rows={6}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-y"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            <button onClick={saveNote} className="btn-primary text-sm">
              {noteSaved ? '✓ Guardado' : 'Guardar ficha'}
            </button>
          </div>
        )}
      </div>

      {/* Materials */}
      <div>
        <button onClick={() => setMaterialsOpen((o) => !o)} className="flex items-center gap-2 w-full text-sm font-medium py-1"
          style={{ color: 'var(--text-muted)' }}>
          <Paperclip size={14} />
          Outros materiais
          {materialsOpen ? <ChevronUp size={13} className="ml-auto" /> : <ChevronDown size={13} className="ml-auto" />}
          {(exam.materiais?.length ?? 0) > 0 && !materialsOpen && (
            <span className="text-xs px-1.5 py-0.5 rounded-full ml-1" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
              {exam.materiais!.length}
            </span>
          )}
        </button>
        {materialsOpen && (
          <div className="mt-2">
            <MaterialsSection exam={exam} />
          </div>
        )}
      </div>

      {/* Study plan */}
      {days > 0 && <StudyPlanSection exam={exam} />}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

// ── Info Modal ───────────────────────────────────────────────────────────────

function InfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>Como funciona o plano de estudo?</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70"><X size={16} style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          O Pingo distribui o conteúdo de forma inteligente consoante os dias disponíveis até ao exame:
        </p>
        {[
          { label: '11 ou mais dias', sub: 'Ritmo suave', detail: '6 flashcards, 3 quiz e 1 resumo activo por dia', time: '~15 min/dia' },
          { label: '6 a 10 dias', sub: 'Ritmo gradual', detail: '10 flashcards, 5 quiz e 1 resumo activo por dia', time: '~25 min/dia' },
          { label: '3 a 5 dias', sub: 'Ritmo de consolidação', detail: '15 flashcards, 8 quiz e 1 resumo activo por dia', time: '~40 min/dia' },
          { label: '1 a 2 dias', sub: 'Revisão intensiva', detail: '20 flashcards, 10 quiz e 1 resumo activo por dia', time: '~60 min/dia' },
        ].map(({ label, sub, detail, time }) => (
          <div key={label} className="px-3 py-2.5 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{label} <span className="font-normal" style={{ color: 'var(--text-muted)' }}>— {sub}</span></p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{detail}</p>
            <p className="text-xs" style={{ color: '#6270f5' }}>Tempo estimado: {time}</p>
          </div>
        ))}
        <div className="px-3 py-2.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Último dia <span className="font-normal" style={{ color: 'var(--text-muted)' }}>— Revisão geral</span></p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>20 flashcards e 10 quiz dos temas mais importantes de todos os dias</p>
        </div>
        <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>Gamificação:</p>
          <div className="text-xs space-y-0.5" style={{ color: 'var(--text-muted)' }}>
            <p>+2 XP por flashcard completado</p>
            <p>+5 XP por quiz correcto</p>
            <p>+10 XP por resumo activo bem avaliado</p>
            <p>+5 XP por resumo activo parcialmente correcto</p>
            <p>+20 XP por completar o dia inteiro</p>
            <p>+50 XP por completar o plano todo</p>
          </div>
        </div>
        <p className="text-xs" style={{ color: '#6270f5' }}>
          Dica: quanto mais cedo começares a estudar, mais leve e eficaz será o teu plano!
        </p>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function ExamSchedulePage() {
  const exams = useStore((s) => s.getExams())
  const { addExam } = useStore()
  const { studentId } = useStudentAuthStore()
  const students = useAdminStore((s) => s.students)
  const [adding, setAdding] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const me = students.find((s) => s.id === studentId)
  const anoNum = parseInt(me?.grade ?? '7', 10)
  const subjects = getDisciplinasPorAno(anoNum)

  const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Calendar size={22} style={{ color: '#6270f5' }} /> Gestão de Exames
            <button onClick={() => setShowInfo(true)} className="p-1 rounded-lg hover:opacity-70" title="Como funciona">
              <Info size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Agenda os teus exames, adiciona fichas de estudo e gera planos com IA.
          </p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2 shrink-0">
            <Plus size={15} /> Novo exame
          </button>
        )}
      </div>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {adding && (
        <ExamForm onSave={(subject, date) => { addExam(subject, date); setAdding(false) }} onCancel={() => setAdding(false)} subjects={subjects} />
      )}

      {sorted.length === 0 && !adding && (
        <div className="card text-center py-12">
          <Calendar size={40} className="mx-auto mb-3" style={{ color: '#6270f5', opacity: 0.5 }} />
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Nenhum exame agendado</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Clica em "Novo exame" para começar.</p>
        </div>
      )}

      {sorted.map((exam) => <ExamCard key={exam.id} exam={exam} subjects={subjects} />)}
    </div>
  )
}
