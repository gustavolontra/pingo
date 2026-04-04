/**
 * AdminSubjectsPage — "Matérias Publicadas"
 *
 * Visualização read-only do conteúdo publicado via "Aprendizados".
 * Agrupa por disciplina → tópico.
 * Para adicionar conteúdo, usa "Aprendizados".
 */

import { useEffect, useState } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { STATIC_DISCIPLINES } from '@/lib/contentBridge'
import { api, type KVContentItem } from '@/lib/api'
import { BookOpen, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

export default function AdminSubjectsPage() {
  const { disciplines: adminDisciplines } = useAdminStore()
  const [items, setItems] = useState<KVContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openDisc, setOpenDisc] = useState<string | null>(null)

  const allDisciplines = [
    ...adminDisciplines.map((d) => ({ id: d.id, name: d.name, subject: d.subject, year: d.year, color: d.color, icon: d.icon })),
    ...STATIC_DISCIPLINES
      .filter((d) => !adminDisciplines.some((a) => a.id === d.id))
      .map((d) => ({ id: d.id, name: d.name, subject: d.subject, year: d.year, color: d.color, icon: d.icon })),
  ]

  useEffect(() => {
    api.getAllContent()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  // Group items by disciplineId → topico
  const grouped = items.reduce<Record<string, Record<string, KVContentItem[]>>>((acc, item) => {
    if (!acc[item.disciplineId]) acc[item.disciplineId] = {}
    if (!acc[item.disciplineId][item.topico]) acc[item.disciplineId][item.topico] = []
    acc[item.disciplineId][item.topico].push(item)
    return acc
  }, {})

  const disciplineIds = Object.keys(grouped)

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>Matérias Publicadas</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Conteúdo publicado via <strong>Aprendizados</strong>. Para adicionar mais, vai a Aprendizados.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">A carregar...</span>
        </div>
      ) : disciplineIds.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mx-auto mb-3 w-fit opacity-30" style={{ color: 'var(--text-muted)' }}>
            <BookOpen size={36} />
          </div>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Nenhum conteúdo publicado</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Vai a <strong>Aprendizados</strong> e publica o primeiro aprendizado.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {disciplineIds.map((discId) => {
            const disc = allDisciplines.find((d) => d.id === discId)
            const topics = grouped[discId]
            const topicNames = Object.keys(topics)
            const totalItems = Object.values(topics).reduce((acc, t) => acc + t.length, 0)
            const isOpen = openDisc === discId

            return (
              <div key={discId} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {/* Discipline header */}
                <button
                  onClick={() => setOpenDisc(isOpen ? null : discId)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-all text-left"
                  style={{ background: 'var(--surface)' }}
                >
                  {disc?.icon && (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: disc.color ? `${disc.color}18` : 'var(--surface-2)' }}
                    >
                      {disc.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                      {disc?.name ?? discId}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {disc?.subject} · {topicNames.length} tópico{topicNames.length !== 1 ? 's' : ''} · {totalItems} conteúdo{totalItems !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {isOpen
                    ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
                    : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                </button>

                {/* Topics + content */}
                {isOpen && (
                  <div style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
                    {topicNames.map((topicName) => (
                      <div key={topicName} className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6270f5' }}>
                          {topicName}
                        </p>
                        <div className="flex flex-col gap-2">
                          {topics[topicName].map((item) => (
                            <div key={item.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.titulo}</p>
                                {item.palavrasChave?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {item.palavrasChave.slice(0, 4).map((kp, i) => (
                                      <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                                        {kp}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {item.flashcards?.length > 0 && <span>🃏 {item.flashcards.length} flashcards</span>}
                                  {item.quiz?.length > 0 && <span>❓ {item.quiz.length} questões</span>}
                                  <span>{new Date(item.createdAt).toLocaleDateString('pt-PT')}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
