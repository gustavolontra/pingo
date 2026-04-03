/**
 * AdminSubjectsPage — "Matérias Publicadas"
 * Lista unificada de todo o conteúdo disponível para os alunos.
 * Não há criação aqui — tudo entra via "Aprendizados".
 */

import { useNavigate } from 'react-router-dom'
import { useAdminStore } from '@/store/useAdminStore'
import { useDisciplines } from '@/hooks/useDisciplines'
import { Trash2, Pencil } from 'lucide-react'
import type { Discipline } from '@/types'

export default function AdminSubjectsPage() {
  const navigate = useNavigate()
  const { disciplines: adminDisciplines, deleteDiscipline, hideStaticDiscipline } = useAdminStore()
  const disciplines = useDisciplines()

  const adminIds = new Set(adminDisciplines.map((d) => d.id))

  function handleDelete(d: Discipline) {
    if (adminIds.has(d.id)) deleteDiscipline(d.id)
    else hideStaticDiscipline(d.id)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>Matérias Publicadas</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {disciplines.length} matéria{disciplines.length !== 1 ? 's' : ''} disponível{disciplines.length !== 1 ? 'eis' : ''} para os alunos.
          Para adicionar conteúdo vai a <strong>Aprendizados</strong>.
        </p>
      </div>

      {disciplines.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Nenhuma matéria publicada</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Vai a <strong>Aprendizados</strong> e publica o primeiro conteúdo.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {disciplines.map((d) => {
            const totalLessons = d.topics.reduce((acc, t) => acc + t.lessons.length, 0)
            const totalTopics = d.topics.length
            const isAdmin = adminIds.has(d.id)

            return (
              <div
                key={d.id}
                className="rounded-xl p-5 flex items-center gap-4"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: `${d.color}18` }}
                >
                  {d.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>{d.name}</p>
                    {isAdmin && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                        Editável
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{d.subject}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {d.year}.º ano · {totalTopics} tópico{totalTopics !== 1 ? 's' : ''} · {totalLessons} aula{totalLessons !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {isAdmin && (
                    <button
                      onClick={() => navigate(`/admin/materias/${d.id}`)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      style={{ color: '#6270f5' }}
                      title="Editar conteúdo"
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(d)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    style={{ color: '#dc2626' }}
                    title="Remover"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
