import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStore, type ManagedDiscipline } from '@/store/useAdminStore'
import { BookPlus, Trash2, X, Pencil } from 'lucide-react'

const COLOR_OPTIONS = [
  { label: 'Azul', value: '#3b82f6' },
  { label: 'Roxo', value: '#6270f5' },
  { label: 'Verde', value: '#10b981' },
  { label: 'Laranja', value: '#f59e0b' },
  { label: 'Vermelho', value: '#ef4444' },
  { label: 'Rosa', value: '#ec4899' },
  { label: 'Ciano', value: '#06b6d4' },
  { label: 'Índigo', value: '#6366f1' },
]

const ICON_OPTIONS = ['📐', '📝', '🗺️', '🔬', '⚗️', '🏛️', '🌍', '🎨', '🎵', '💻', '📖', '🧮']

const YEAR_OPTIONS = ['1.º ano', '2.º ano', '3.º ano', '4.º ano', '5.º ano', '6.º ano', '7.º ano', '8.º ano', '9.º ano']

const EMPTY_FORM = { name: '', subject: '', year: 5, color: '#3b82f6', icon: '📖' }

export default function AdminSubjectsPage() {
  const { disciplines, createDiscipline, deleteDiscipline } = useAdminStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createDiscipline(form)
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>Matérias</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{disciplines.length} matéria{disciplines.length !== 1 ? 's' : ''} criada{disciplines.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <BookPlus size={16} />
          Nova matéria
        </button>
      </div>

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="card w-full max-w-md relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-display font-bold mb-5" style={{ color: 'var(--text)' }}>Nova matéria</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Sigla / Nome curto</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="HGP"
                  required
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Nome completo</label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="História e Geografia de Portugal"
                  required
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Ano / Série</label>
                <select
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  {YEAR_OPTIONS.map((y, i) => <option key={y} value={i + 1}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, icon }))}
                      className="w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all"
                      style={{
                        background: form.icon === icon ? 'rgba(98,112,245,0.12)' : 'var(--surface-2)',
                        border: `2px solid ${form.icon === icon ? '#6270f5' : 'transparent'}`,
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      title={label}
                      onClick={() => setForm((f) => ({ ...f, color: value }))}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{
                        background: value,
                        outline: form.color === value ? `3px solid ${value}` : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-1">
                <button type="button" className="btn-ghost flex-1" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {disciplines.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-3xl mb-3">📚</p>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Nenhuma matéria ainda</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Clica em "Nova matéria" para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {disciplines.map((d) => (
            <DisciplineCard key={d.id} discipline={d} onDelete={() => deleteDiscipline(d.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function DisciplineCard({ discipline: d, onDelete }: { discipline: ManagedDiscipline; onDelete: () => void }) {
  const navigate = useNavigate()
  const topicCount = d.topics?.length ?? 0
  const lessonCount = d.topics?.flatMap((t) => t.lessons).length ?? 0

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: `${d.color}15` }}
          >
            {d.icon}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate" style={{ color: d.color }}>{d.name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{d.subject}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{d.year}.º ano</p>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
          style={{ color: '#dc2626' }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {topicCount} tópico{topicCount !== 1 ? 's' : ''} · {lessonCount} aula{lessonCount !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => navigate(`/admin/materias/${d.id}`)}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
          style={{ color: '#6270f5' }}
        >
          <Pencil size={12} /> Gerir conteúdo
        </button>
      </div>
    </div>
  )
}
