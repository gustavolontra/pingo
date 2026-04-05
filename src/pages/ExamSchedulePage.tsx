import { useState } from 'react'
import { useStore, type Exam } from '@/store/useStore'
import { Calendar, Pencil, Trash2, Plus, BookOpen, Lock, ChevronDown, ChevronUp, X } from 'lucide-react'
import SubjectIcon from '@/components/ui/SubjectIcon'

// ── Lista fixa de matérias do 3.º Ciclo ──────────────────────────────────────

const SUBJECTS = [
  { name: 'História',                      icon: '🏛️' },
  { name: 'Geografia',                     icon: '🌍' },
  { name: 'Matemática',                    icon: '📐' },
  { name: 'Português',                     icon: '📖' },
  { name: 'Inglês',                        icon: '🇬🇧' },
  { name: 'Francês',                       icon: '🇫🇷' },
  { name: 'Espanhol',                      icon: '🇪🇸' },
  { name: 'Alemão',                        icon: '🇩🇪' },
  { name: 'Ciências Naturais',             icon: '🔬' },
  { name: 'Físico-Química',               icon: '⚗️' },
  { name: 'Educação Visual',               icon: '🎨' },
  { name: 'Educação Tecnológica',          icon: '🔧' },
  { name: 'Educação Física',               icon: '🏃' },
  { name: 'TIC',                           icon: '💻' },
  { name: 'Educação Musical',              icon: '🎵' },
  { name: 'EMRC',                          icon: '✝️' },
  { name: 'Cidadania e Desenvolvimento',   icon: '🤝' },
]

function subjectIcon(name: string) {
  return SUBJECTS.find((s) => s.name === name)?.icon ?? '📚'
}

function daysUntil(dateStr: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
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

function ExamForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { subject: string; date: string }
  onSave: (subject: string, date: string) => void
  onCancel: () => void
}) {
  const [subject, setSubject] = useState(initial?.subject ?? SUBJECTS[0].name)
  const [date, setDate] = useState(initial?.date ?? '')
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="card space-y-4">
      <h3 className="font-display font-semibold" style={{ color: 'var(--text)' }}>
        {initial ? 'Editar exame' : 'Novo exame'}
      </h3>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Matéria</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          {SUBJECTS.map((s) => (
            <option key={s.name} value={s.name}>{s.icon} {s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Data do exame</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={today}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', colorScheme: 'dark' }}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={() => { if (date) onSave(subject, date) }}
          disabled={!date}
          className="btn-primary flex-1"
          style={{ opacity: !date ? 0.5 : 1 }}
        >
          {initial ? 'Guardar alterações' : 'Adicionar exame'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Card de exame ─────────────────────────────────────────────────────────────

function ExamCard({ exam }: { exam: Exam }) {
  const { updateExam, deleteExam, setExamStudyNote } = useStore()
  const [editing, setEditing] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteValue, setNoteValue] = useState(exam.studyNote)
  const [noteSaved, setNoteSaved] = useState(false)
  const [premiumMsg, setPremiumMsg] = useState(false)
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
          <button
            onClick={() => setEditing(true)}
            className="p-2 rounded-lg transition-all hover:bg-slate-100/10"
            title="Editar"
          >
            <Pencil size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => deleteExam(exam.id)}
                className="px-2 py-1 rounded-lg text-xs font-semibold"
                style={{ background: '#ef444420', color: '#ef4444' }}
              >
                Confirmar
              </button>
              <button onClick={() => setConfirmDelete(false)}>
                <X size={13} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2 rounded-lg transition-all hover:bg-slate-100/10"
              title="Eliminar"
            >
              <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Contagem */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
        <Calendar size={14} style={{ color }} />
        <span className="text-sm font-semibold" style={{ color }}>
          {days < 0 ? 'Exame já passou' : days === 0 ? 'Exame hoje!' : `${days} dia${days !== 1 ? 's' : ''} para o exame`}
        </span>
      </div>

      {/* Ficha de estudo */}
      <div>
        <button
          onClick={() => setNoteOpen((o) => !o)}
          className="flex items-center gap-2 w-full text-sm font-medium py-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <BookOpen size={14} />
          Ficha de estudo
          {noteOpen ? <ChevronUp size={13} className="ml-auto" /> : <ChevronDown size={13} className="ml-auto" />}
          {exam.studyNote && !noteOpen && (
            <span className="text-xs px-1.5 py-0.5 rounded-full ml-1" style={{ background: '#6270f520', color: '#6270f5' }}>
              ✓ guardada
            </span>
          )}
        </button>
        {noteOpen && (
          <div className="mt-2 space-y-2">
            <textarea
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              placeholder="Escreve ou cola aqui o conteúdo da ficha de estudo..."
              rows={6}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-y"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <button
              onClick={saveNote}
              className="btn-primary text-sm"
            >
              {noteSaved ? '✓ Guardado' : 'Guardar ficha'}
            </button>
          </div>
        )}
      </div>

      {/* Premium */}
      <div>
        <button
          onClick={() => setPremiumMsg((v) => !v)}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <Lock size={14} style={{ color: '#eab308' }} />
          Criar rotina de estudo com IA
          <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: '#eab30820', color: '#eab308' }}>
            Premium
          </span>
        </button>
        {premiumMsg && (
          <p className="mt-2 text-sm px-1" style={{ color: 'var(--text-muted)' }}>
            ✨ Funcionalidade Premium — Em breve vais poder gerar uma rotina de estudo personalizada até um dia antes do exame. Fica atento!
          </p>
        )}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function ExamSchedulePage() {
  const exams = useStore((s) => s.exams)
  const { addExam } = useStore()
  const [adding, setAdding] = useState(false)

  const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}><Calendar size={22} style={{ color: '#6270f5' }} /> Gestão de Exames</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Agenda os teus exames, adiciona fichas de estudo e acompanha os prazos.
          </p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="btn-primary flex items-center gap-2 shrink-0"
          >
            <Plus size={15} />
            Novo exame
          </button>
        )}
      </div>

      {adding && (
        <ExamForm
          onSave={(subject, date) => { addExam(subject, date); setAdding(false) }}
          onCancel={() => setAdding(false)}
        />
      )}

      {sorted.length === 0 && !adding && (
        <div className="card text-center py-12">
          <Calendar size={40} className="mx-auto mb-3" style={{ color: '#6270f5', opacity: 0.5 }} />
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Nenhum exame agendado</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Clica em "Novo exame" para começar.</p>
        </div>
      )}

      {sorted.map((exam) => (
        <ExamCard key={exam.id} exam={exam} />
      ))}
    </div>
  )
}
