import { useState, useRef } from 'react'
import { useStore, type Exam, type DiaPlano } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import { api, getDisciplinasPorAno } from '@/lib/api'
import {
  Calendar, Pencil, Trash2, Plus, BookOpen, ChevronDown, ChevronUp, X,
  Sparkles, Loader2, FileText, Upload, Check, ChevronLeft, ChevronRight,
  RotateCcw, Paperclip,
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

function Flashcard({ frente, verso }: { frente: string; verso: string }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button onClick={() => setFlipped(!flipped)}
      className="w-full p-4 rounded-xl text-sm text-left transition-all min-h-[80px]"
      style={{ background: flipped ? 'rgba(16,185,129,0.08)' : 'var(--surface-2)', border: `1px solid ${flipped ? 'rgba(16,185,129,0.2)' : 'var(--border)'}` }}>
      <p className="text-xs font-semibold mb-1" style={{ color: flipped ? '#10b981' : '#6270f5' }}>
        {flipped ? 'Resposta' : 'Pergunta'}
      </p>
      <p style={{ color: 'var(--text)' }}>{flipped ? verso : frente}</p>
    </button>
  )
}

// ── Quiz interativo ──────────────────────────────────────────────────────────

function QuizQuestion({ pergunta, opcoes, correta, explicacao }: DiaPlano['quiz'][number]) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{pergunta}</p>
      <div className="flex flex-col gap-1.5">
        {opcoes.map((opt, i) => {
          const isCorrect = i === correta
          const isSelected = i === selected
          let bg = 'var(--surface-2)'; let border = 'var(--border)'; let col = 'var(--text)'
          if (answered && isCorrect) { bg = 'rgba(16,185,129,0.1)'; border = 'rgba(16,185,129,0.3)'; col = '#10b981' }
          else if (answered && isSelected && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.3)'; col = '#ef4444' }
          return (
            <button key={i} onClick={() => !answered && setSelected(i)} disabled={answered}
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

// ── Card de um dia do plano ──────────────────────────────────────────────────

function DayCard({ dia, isToday, studied, onStudied }: {
  dia: DiaPlano; isToday: boolean; studied: boolean; onStudied: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-w-[280px] max-w-[320px] shrink-0 card space-y-3"
      style={{ borderColor: isToday ? 'rgba(98,112,245,0.3)' : studied ? 'rgba(16,185,129,0.2)' : undefined }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold" style={{ color: isToday ? '#6270f5' : 'var(--text-muted)' }}>
            Dia {dia.dia} · {dia.data} {isToday && '(hoje)'}
          </p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{dia.tema}</p>
        </div>
        {studied && <Check size={16} style={{ color: '#10b981' }} />}
      </div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{dia.resumo}</p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5">
          {isToday ? <Sparkles size={13} /> : <BookOpen size={13} />}
          {isToday ? 'Estudar hoje' : 'Ver conteúdo'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold" style={{ color: '#6270f5' }}>Flashcards</p>
            {dia.flashcards.map((f, i) => <Flashcard key={i} frente={f.frente} verso={f.verso} />)}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold" style={{ color: '#6270f5' }}>Quiz</p>
            {dia.quiz.map((q, i) => <QuizQuestion key={i} {...q} />)}
          </div>
          {!studied && (
            <button onClick={onStudied} className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
              <Check size={13} /> Marcar como estudado
            </button>
          )}
          <button onClick={() => setOpen(false)} className="text-xs w-full text-center" style={{ color: 'var(--text-muted)' }}>
            Recolher
          </button>
        </div>
      )}
    </div>
  )
}

// ── Plano de estudo ──────────────────────────────────────────────────────────

function StudyPlanSection({ exam }: { exam: Exam }) {
  const { setExamPlano, markDiaEstudado } = useStore()
  const { studentId } = useStudentAuthStore()
  const students = useAdminStore((s) => s.students)
  const me = students.find((s) => s.id === studentId)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const plano = exam.planoEstudo
  const today = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const daysStudied = plano?.diasEstudados?.length ?? 0
  const totalDays = plano?.dias?.length ?? 0

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
      setExamPlano(exam.id, { geradoEm: new Date().toISOString(), resumo: result.resumo, dias: result.dias, diasEstudados: [] })
    } catch {
      setError('Erro ao gerar o plano. Tenta novamente.')
    }
    setGenerating(false)
  }

  function scroll(dir: number) {
    scrollRef.current?.scrollBy({ left: dir * 310, behavior: 'smooth' })
  }

  return (
    <div className="space-y-3">
      {/* Generate / Regenerate button */}
      <button onClick={generate} disabled={generating}
        className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5', border: '1px solid rgba(98,112,245,0.2)' }}>
        {generating ? <Loader2 size={14} className="animate-spin" /> : plano ? <RotateCcw size={14} /> : <Sparkles size={14} />}
        {generating ? 'A gerar plano de estudo...' : plano ? 'Regenerar plano de estudo' : 'Gerar plano de estudo com IA'}
      </button>
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

          {/* Horizontal scrollable day cards */}
          <div className="relative">
            <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 z-10 p-1.5 rounded-full hidden md:flex"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <ChevronLeft size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
            <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
              {plano.dias.map((dia) => (
                <DayCard key={dia.dia} dia={dia} isToday={dia.data === today}
                  studied={(plano.diasEstudados ?? []).includes(dia.dia)}
                  onStudied={() => markDiaEstudado(exam.id, dia.dia)} />
              ))}
            </div>
            <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 z-10 p-1.5 rounded-full hidden md:flex"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
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

export default function ExamSchedulePage() {
  const exams = useStore((s) => s.getExams())
  const { addExam } = useStore()
  const { studentId } = useStudentAuthStore()
  const students = useAdminStore((s) => s.students)
  const [adding, setAdding] = useState(false)

  const me = students.find((s) => s.id === studentId)
  const anoNum = parseInt(me?.grade ?? '7', 10)
  const subjects = getDisciplinasPorAno(anoNum)

  const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Calendar size={22} style={{ color: '#6270f5' }} /> Gestão de Exames
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
