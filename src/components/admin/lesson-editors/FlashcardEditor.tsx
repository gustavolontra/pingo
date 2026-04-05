import { useAdminStore, type AdminFlashcardContent } from '@/store/useAdminStore'
import { Plus, Trash2, Layers } from 'lucide-react'

interface Props {
  disciplineId: string
  topicId: string
  lessonId: string
  content: AdminFlashcardContent
}

export default function FlashcardEditor({ disciplineId, topicId, lessonId, content }: Props) {
  const updateLesson = useAdminStore((s) => s.updateLesson)

  function setContent(patch: Partial<AdminFlashcardContent>) {
    updateLesson(disciplineId, topicId, lessonId, { content: { ...content, ...patch } })
  }

  function addCard() {
    setContent({
      cards: [...content.cards, { id: crypto.randomUUID(), front: '', back: '' }],
    })
  }

  function updateCard(id: string, field: 'front' | 'back', value: string) {
    setContent({
      cards: content.cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    })
  }

  function removeCard(id: string) {
    setContent({ cards: content.cards.filter((c) => c.id !== id) })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          {content.cards.length} cartão{content.cards.length !== 1 ? 'es' : ''}
        </p>
        <button
          onClick={addCard}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
          style={{ color: '#6270f5' }}
        >
          <Plus size={14} /> Novo cartão
        </button>
      </div>

      {content.cards.length === 0 && (
        <div className="text-center py-8 rounded-xl" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
          <Layers size={32} className="mx-auto mb-2" />
          <p className="text-sm">Nenhum cartão. Clica em "Novo cartão".</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {content.cards.map((card, i) => (
          <div
            key={card.id}
            className="rounded-xl p-4"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Cartão {i + 1}
              </span>
              <button
                onClick={() => removeCard(card.id)}
                className="p-1 rounded hover:bg-red-50 transition-colors"
                style={{ color: '#dc2626' }}
              >
                <Trash2 size={13} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Frente</label>
                <textarea
                  value={card.front}
                  onChange={(e) => updateCard(card.id, 'front', e.target.value)}
                  rows={3}
                  placeholder="Pergunta ou conceito..."
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Verso</label>
                <textarea
                  value={card.back}
                  onChange={(e) => updateCard(card.id, 'back', e.target.value)}
                  rows={3}
                  placeholder="Resposta ou definição..."
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
