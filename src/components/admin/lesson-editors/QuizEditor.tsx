import { useAdminStore, type AdminQuizContent, type AdminQuestion } from '@/store/useAdminStore'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface Props {
  disciplineId: string
  topicId: string
  lessonId: string
  content: AdminQuizContent
}

export default function QuizEditor({ disciplineId, topicId, lessonId, content }: Props) {
  const updateLesson = useAdminStore((s) => s.updateLesson)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function setContent(patch: Partial<AdminQuizContent>) {
    updateLesson(disciplineId, topicId, lessonId, { content: { ...content, ...patch } })
  }

  function addQuestion(type: AdminQuestion['type']) {
    const q: AdminQuestion = {
      id: crypto.randomUUID(),
      text: '',
      type,
      options: type === 'true-false' ? ['Verdadeiro', 'Falso'] : ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    }
    const updated = [...content.questions, q]
    setContent({ questions: updated })
    setExpandedId(q.id)
  }

  function updateQuestion(id: string, patch: Partial<AdminQuestion>) {
    setContent({
      questions: content.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    })
  }

  function removeQuestion(id: string) {
    setContent({ questions: content.questions.filter((q) => q.id !== id) })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          {content.questions.length} questão{content.questions.length !== 1 ? 'es' : ''}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => addQuestion('multiple-choice')}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
            style={{ color: '#6270f5' }}
          >
            <Plus size={14} /> Múltipla escolha
          </button>
          <button
            onClick={() => addQuestion('true-false')}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
            style={{ color: '#10b981' }}
          >
            <Plus size={14} /> Verdadeiro/Falso
          </button>
        </div>
      </div>

      {content.questions.length === 0 && (
        <div className="text-center py-8 rounded-xl" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
          <p className="text-2xl mb-2">❓</p>
          <p className="text-sm">Nenhuma questão. Adiciona uma acima.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {content.questions.map((q, i) => (
          <QuestionItem
            key={q.id}
            question={q}
            index={i}
            expanded={expandedId === q.id}
            onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)}
            onChange={(patch) => updateQuestion(q.id, patch)}
            onRemove={() => removeQuestion(q.id)}
          />
        ))}
      </div>
    </div>
  )
}

function QuestionItem({
  question, index, expanded, onToggle, onChange, onRemove,
}: {
  question: AdminQuestion
  index: number
  expanded: boolean
  onToggle: () => void
  onChange: (patch: Partial<AdminQuestion>) => void
  onRemove: () => void
}) {
  const typeLabel = question.type === 'true-false' ? 'V/F' : 'Múltipla'

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
        style={{ background: 'var(--surface-2)' }}
        onClick={onToggle}
      >
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}>
          {typeLabel}
        </span>
        <span className="flex-1 text-sm font-medium truncate" style={{ color: question.text ? 'var(--text)' : 'var(--text-muted)' }}>
          {question.text || `Questão ${index + 1} (sem texto)`}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="p-1 rounded hover:bg-red-50 transition-colors"
          style={{ color: '#dc2626' }}
        >
          <Trash2 size={13} />
        </button>
        {expanded ? <ChevronUp size={15} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />}
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-4 flex flex-col gap-4" style={{ background: 'var(--surface)' }}>
          {/* Question text */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Enunciado</label>
            <textarea
              value={question.text}
              onChange={(e) => onChange({ text: e.target.value })}
              rows={2}
              placeholder="Escreve a pergunta..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              Opções — seleciona a correcta
            </label>
            <div className="flex flex-col gap-2">
              {question.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === i}
                    onChange={() => onChange({ correctAnswer: i })}
                    className="shrink-0 accent-[#6270f5]"
                  />
                  {question.type === 'true-false' ? (
                    <span className="flex-1 text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                      {opt}
                    </span>
                  ) : (
                    <input
                      value={opt}
                      onChange={(e) => {
                        const opts = [...question.options]
                        opts[i] = e.target.value
                        onChange({ options: opts })
                      }}
                      placeholder={`Opção ${String.fromCharCode(65 + i)}`}
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Explicação da resposta</label>
            <textarea
              value={question.explanation}
              onChange={(e) => onChange({ explanation: e.target.value })}
              rows={2}
              placeholder="Explica porque esta é a resposta correcta..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
