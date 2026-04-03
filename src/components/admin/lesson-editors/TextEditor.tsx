import { useAdminStore, type AdminTextContent } from '@/store/useAdminStore'
import { Plus, X } from 'lucide-react'

interface Props {
  disciplineId: string
  topicId: string
  lessonId: string
  content: AdminTextContent
}

export default function TextEditor({ disciplineId, topicId, lessonId, content }: Props) {
  const updateLesson = useAdminStore((s) => s.updateLesson)

  function setContent(patch: Partial<AdminTextContent>) {
    updateLesson(disciplineId, topicId, lessonId, {
      content: { ...content, ...patch },
    })
  }

  function addKeyPoint() {
    setContent({ keyPoints: [...content.keyPoints, ''] })
  }

  function updateKeyPoint(i: number, value: string) {
    const updated = [...content.keyPoints]
    updated[i] = value
    setContent({ keyPoints: updated })
  }

  function removeKeyPoint(i: number) {
    setContent({ keyPoints: content.keyPoints.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
          Conteúdo (Markdown)
        </label>
        <textarea
          value={content.body}
          onChange={(e) => setContent({ body: e.target.value })}
          rows={12}
          placeholder="## Título&#10;&#10;Escreve o conteúdo da aula aqui...&#10;&#10;**Negrito**, *itálico*, listas com - item"
          className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none resize-none leading-relaxed"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Pontos-chave
          </label>
          <button
            onClick={addKeyPoint}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
            style={{ color: '#6270f5' }}
          >
            <Plus size={13} /> Adicionar
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {content.keyPoints.map((kp, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-bold shrink-0" style={{ color: 'var(--text-muted)' }}>·</span>
              <input
                value={kp}
                onChange={(e) => updateKeyPoint(i, e.target.value)}
                placeholder={`Ponto-chave ${i + 1}`}
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
              <button
                onClick={() => removeKeyPoint(i)}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                style={{ color: '#dc2626' }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {content.keyPoints.length === 0 && (
            <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>
              Nenhum ponto-chave. Clica em "Adicionar".
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
