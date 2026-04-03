import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAdminStore, type AdminTopic, type AdminLesson } from '@/store/useAdminStore'
import {
  ArrowLeft, Plus, Trash2, ChevronRight, FileText, HelpCircle, Layers, X, BookOpen,
} from 'lucide-react'
import TextEditor from '@/components/admin/lesson-editors/TextEditor'
import QuizEditor from '@/components/admin/lesson-editors/QuizEditor'
import FlashcardEditor from '@/components/admin/lesson-editors/FlashcardEditor'

const LESSON_TYPES: { type: AdminLesson['type']; label: string; icon: typeof FileText; color: string }[] = [
  { type: 'text', label: 'Texto', icon: FileText, color: '#6270f5' },
  { type: 'quiz', label: 'Quiz', icon: HelpCircle, color: '#10b981' },
  { type: 'flashcard', label: 'Flashcards', icon: Layers, color: '#f59e0b' },
]

export default function AdminDisciplineContentPage() {
  const { id: disciplineId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { disciplines, addTopic, updateTopic, deleteTopic, addLesson, updateLesson, deleteLesson } = useAdminStore()

  const discipline = disciplines.find((d) => d.id === disciplineId)

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)

  // Topic form
  const [showTopicForm, setShowTopicForm] = useState(false)
  const [topicForm, setTopicForm] = useState({ title: '', description: '' })

  // Lesson type picker
  const [showLessonTypePicker, setShowLessonTypePicker] = useState(false)

  if (!discipline) return null

  const selectedTopic = discipline.topics.find((t) => t.id === selectedTopicId) ?? null
  const selectedLesson = selectedTopic?.lessons.find((l) => l.id === selectedLessonId) ?? null

  function handleAddTopic(e: React.FormEvent) {
    e.preventDefault()
    if (!topicForm.title.trim()) return
    addTopic(disciplineId!, topicForm)
    setTopicForm({ title: '', description: '' })
    setShowTopicForm(false)
  }

  function handleAddLesson(type: AdminLesson['type']) {
    if (!selectedTopicId) return
    addLesson(disciplineId!, selectedTopicId, { title: 'Nova aula', type })
    setShowLessonTypePicker(false)
  }

  function handleSelectLesson(lesson: AdminLesson) {
    setSelectedLessonId(lesson.id)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left panel: topics ─────────────────────────────────────── */}
      <aside
        className="w-72 shrink-0 flex flex-col overflow-y-auto"
        style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        {/* Header */}
        <div className="p-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => navigate('/admin/materias')}
            className="flex items-center gap-1.5 text-xs font-medium mb-3 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={13} /> Matérias
          </button>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">{discipline.icon}</span>
            <div>
              <p className="font-display font-bold text-sm leading-tight" style={{ color: discipline.color }}>
                {discipline.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{discipline.subject}</p>
            </div>
          </div>
        </div>

        {/* Topics list */}
        <div className="flex-1 p-3 flex flex-col gap-1">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Tópicos ({discipline.topics.length})
          </p>
          {discipline.topics.map((topic) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              isSelected={selectedTopicId === topic.id}
              selectedLessonId={selectedLessonId}
              onSelect={() => {
                setSelectedTopicId(topic.id)
                setSelectedLessonId(null)
              }}
              onSelectLesson={handleSelectLesson}
              onDelete={() => {
                deleteTopic(disciplineId!, topic.id)
                if (selectedTopicId === topic.id) {
                  setSelectedTopicId(null)
                  setSelectedLessonId(null)
                }
              }}
            />
          ))}

          {/* New topic form */}
          {showTopicForm ? (
            <form onSubmit={handleAddTopic} className="mt-2 p-3 rounded-xl flex flex-col gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <input
                value={topicForm.title}
                onChange={(e) => setTopicForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Nome do tópico"
                autoFocus
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
              <input
                value={topicForm.description}
                onChange={(e) => setTopicForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descrição (opcional)"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowTopicForm(false)} className="flex-1 btn-ghost text-sm py-2">Cancelar</button>
                <button type="submit" className="flex-1 btn-primary text-sm py-2">Criar</button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowTopicForm(true)}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-slate-100 mt-1"
              style={{ color: '#6270f5' }}
            >
              <Plus size={15} /> Novo tópico
            </button>
          )}
        </div>
      </aside>

      {/* ── Right panel ────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* No topic selected */}
        {!selectedTopic && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <BookOpen size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="mt-4 font-semibold" style={{ color: 'var(--text)' }}>Seleciona um tópico</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {discipline.topics.length === 0
                ? 'Cria o primeiro tópico no painel esquerdo.'
                : 'Clica num tópico para ver e editar as suas aulas.'}
            </p>
          </div>
        )}

        {/* Topic selected, no lesson */}
        {selectedTopic && !selectedLesson && (
          <div className="max-w-2xl">
            {/* Topic header editable */}
            <TopicHeader
              topic={selectedTopic}
              onUpdate={(data) => updateTopic(disciplineId!, selectedTopic.id, data)}
            />

            {/* Lessons list */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  Aulas ({selectedTopic.lessons.length})
                </p>
                <button
                  onClick={() => setShowLessonTypePicker(true)}
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
                  style={{ color: '#6270f5' }}
                >
                  <Plus size={14} /> Nova aula
                </button>
              </div>

              {selectedTopic.lessons.length === 0 ? (
                <div className="text-center py-10 rounded-xl" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                  <p className="text-sm">Nenhuma aula. Clica em "Nova aula".</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedTopic.lessons.map((lesson) => {
                    const lessonType = LESSON_TYPES.find((lt) => lt.type === lesson.type)!
                    const Icon = lessonType.icon
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors hover:bg-slate-50"
                        style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
                        onClick={() => handleSelectLesson(lesson)}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${lessonType.color}12` }}>
                          <Icon size={15} style={{ color: lessonType.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{lesson.title}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{lessonType.label} · {lesson.estimatedMinutes}min · {lesson.xpReward} XP</p>
                        </div>
                        <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteLesson(disciplineId!, selectedTopic.id, lesson.id)
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          style={{ color: '#dc2626' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lesson editor */}
        {selectedTopic && selectedLesson && (
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setSelectedLessonId(null)}
                className="flex items-center gap-1.5 text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                <ArrowLeft size={15} /> {selectedTopic.title}
              </button>
            </div>

            {/* Lesson meta */}
            <div className="card mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-1 flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Título</label>
                    <input
                      value={selectedLesson.title}
                      onChange={(e) => updateLesson(disciplineId!, selectedTopic.id, selectedLesson.id, { title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm font-medium outline-none"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Minutos</label>
                      <input
                        type="number" min={1} max={120}
                        value={selectedLesson.estimatedMinutes}
                        onChange={(e) => updateLesson(disciplineId!, selectedTopic.id, selectedLesson.id, { estimatedMinutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>XP</label>
                      <input
                        type="number" min={10} step={10}
                        value={selectedLesson.xpReward}
                        onChange={(e) => updateLesson(disciplineId!, selectedTopic.id, selectedLesson.id, { xpReward: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content editor */}
            <div className="card">
              <div className="flex items-center gap-2 mb-5">
                {(() => {
                  const lt = LESSON_TYPES.find((t) => t.type === selectedLesson.type)!
                  const Icon = lt.icon
                  return (
                    <>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${lt.color}12` }}>
                        <Icon size={14} style={{ color: lt.color }} />
                      </div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        Conteúdo — {lt.label}
                      </p>
                    </>
                  )
                })()}
              </div>

              {selectedLesson.type === 'text' && (
                <TextEditor
                  disciplineId={disciplineId!}
                  topicId={selectedTopic.id}
                  lessonId={selectedLesson.id}
                  content={selectedLesson.content as any}
                />
              )}
              {selectedLesson.type === 'quiz' && (
                <QuizEditor
                  disciplineId={disciplineId!}
                  topicId={selectedTopic.id}
                  lessonId={selectedLesson.id}
                  content={selectedLesson.content as any}
                />
              )}
              {selectedLesson.type === 'flashcard' && (
                <FlashcardEditor
                  disciplineId={disciplineId!}
                  topicId={selectedTopic.id}
                  lessonId={selectedLesson.id}
                  content={selectedLesson.content as any}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Lesson type picker modal */}
      {showLessonTypePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="card w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold" style={{ color: 'var(--text)' }}>Tipo de aula</h3>
              <button onClick={() => setShowLessonTypePicker(false)} className="p-1 rounded hover:bg-slate-100" style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {LESSON_TYPES.map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  onClick={() => handleAddLesson(type)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:bg-slate-50"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}12` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {type === 'text' && 'Texto com markdown e pontos-chave'}
                      {type === 'quiz' && 'Perguntas de múltipla escolha ou V/F'}
                      {type === 'flashcard' && 'Cartões para memorização'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function TopicItem({
  topic, isSelected, selectedLessonId, onSelect, onSelectLesson, onDelete,
}: {
  topic: AdminTopic
  disciplineId?: string
  isSelected: boolean
  selectedLessonId: string | null
  onSelect: () => void
  onSelectLesson: (lesson: AdminLesson) => void
  onDelete: () => void
}) {
  return (
    <div>
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors"
        style={isSelected ? { background: 'rgba(98,112,245,0.08)', color: '#6270f5' } : { color: 'var(--text-muted)' }}
        onClick={onSelect}
      >
        <ChevronRight size={14} style={{ transform: isSelected ? 'rotate(90deg)' : undefined, transition: 'transform 0.15s' }} />
        <span className="flex-1 text-sm font-medium truncate" style={{ color: isSelected ? '#6270f5' : 'var(--text)' }}>
          {topic.title}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{topic.lessons.length}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="p-1 rounded hover:bg-red-50 transition-colors"
          style={{ color: '#dc2626' }}
        >
          <Trash2 size={12} />
        </button>
      </div>
      {isSelected && topic.lessons.length > 0 && (
        <div className="ml-5 flex flex-col gap-0.5 mt-0.5">
          {topic.lessons.map((lesson) => {
            const lt = lesson.type === 'text' ? '📄' : lesson.type === 'quiz' ? '❓' : '🃏'
            return (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors hover:bg-slate-100 w-full"
                style={{ color: selectedLessonId === lesson.id ? '#6270f5' : 'var(--text-muted)', background: selectedLessonId === lesson.id ? 'rgba(98,112,245,0.06)' : undefined }}
              >
                <span>{lt}</span>
                <span className="truncate">{lesson.title}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TopicHeader({
  topic, onUpdate,
}: {
  topic: AdminTopic
  onUpdate: (data: Partial<Pick<AdminTopic, 'title' | 'description'>>) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <input
        value={topic.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        className="text-xl font-display font-bold outline-none border-b-2 border-transparent focus:border-[#6270f5] pb-1 bg-transparent transition-colors"
        style={{ color: 'var(--text)' }}
      />
      <input
        value={topic.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Descrição do tópico..."
        className="text-sm outline-none bg-transparent"
        style={{ color: 'var(--text-muted)' }}
      />
    </div>
  )
}
