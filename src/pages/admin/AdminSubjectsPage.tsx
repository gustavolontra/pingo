/**
 * AdminSubjectsPage — "Matérias Publicadas"
 *
 * Visualização do conteúdo publicado via "Aprendizados".
 * Agrupa por disciplina → tópico.
 * Permite editar e apagar itens publicados.
 */

import { useEffect, useState } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { getDisciplineOption } from '@/lib/contentBridge'
import { api, type KVContentItem, type KVFlashcard, type KVQuestion } from '@/lib/api'
import { BookOpen, ChevronDown, ChevronUp, Loader2, Pencil, Trash2, X, Save, Plus, Layers, HelpCircle } from 'lucide-react'

export default function AdminSubjectsPage() {
  const { disciplines: adminDisciplines } = useAdminStore()
  const [items, setItems] = useState<KVContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openDisc, setOpenDisc] = useState<string | null>(null)
  const [editing, setEditing] = useState<KVContentItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<KVContentItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  function discInfo(id: string) {
    const opt = getDisciplineOption(id)
    const admin = adminDisciplines.find((d) => d.id === id)
    // Always use canonical name/subject from DISCIPLINE_OPTIONS; keep admin color/icon if set
    return {
      id,
      name: opt.name,
      subject: opt.subject,
      year: opt.year,
      color: admin?.color ?? opt.color,
      icon: admin?.icon ?? opt.icon,
    }
  }

  function reload() {
    setLoading(true)
    api.getAllContent()
      .then(setItems)
      .finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const grouped = items.reduce<Record<string, Record<string, KVContentItem[]>>>((acc, item) => {
    if (!acc[item.disciplineId]) acc[item.disciplineId] = {}
    if (!acc[item.disciplineId][item.topico]) acc[item.disciplineId][item.topico] = []
    acc[item.disciplineId][item.topico].push(item)
    return acc
  }, {})

  const disciplineIds = Object.keys(grouped)

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    await api.putContent(editing)
    setItems((prev) => prev.map((i) => i.id === editing.id ? editing : i))
    setEditing(null)
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    await api.deleteContent(confirmDelete.id, confirmDelete.disciplineId)
    setItems((prev) => prev.filter((i) => i.id !== confirmDelete.id))
    setConfirmDelete(null)
    setDeleting(false)
  }

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
            const disc = discInfo(discId)
            const topics = grouped[discId]
            const topicNames = Object.keys(topics)
            const totalItems = Object.values(topics).reduce((acc, t) => acc + t.length, 0)
            const isOpen = openDisc === discId

            return (
              <div key={discId} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
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
                                  {item.flashcards?.length > 0 && <span className="flex items-center gap-1"><Layers size={11} /> {item.flashcards.length} flashcards</span>}
                                  {item.quiz?.length > 0 && <span className="flex items-center gap-1"><HelpCircle size={11} /> {item.quiz.length} questões</span>}
                                  <span>{new Date(item.createdAt).toLocaleDateString('pt-PT')}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => setEditing({ ...item })}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-all"
                                  title="Editar"
                                >
                                  <Pencil size={13} style={{ color: 'var(--text-muted)' }} />
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(item)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 transition-all"
                                  title="Apagar"
                                >
                                  <Trash2 size={13} style={{ color: '#ef4444' }} />
                                </button>
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

      {/* ── Modal de edição ─────────────────────────────────────────────────── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>Editar conteúdo</p>
              <button onClick={() => setEditing(null)}><X size={18} style={{ color: 'var(--text-muted)' }} /></button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto">
              {/* Título */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Título</label>
                <input
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={editing.titulo}
                  onChange={(e) => setEditing({ ...editing, titulo: e.target.value })}
                />
              </div>

              {/* Tópico */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Tópico</label>
                <input
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={editing.topico}
                  onChange={(e) => setEditing({ ...editing, topico: e.target.value })}
                />
              </div>

              {/* Resumo */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Resumo / Conteúdo</label>
                <textarea
                  rows={6}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-y"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={editing.resumo}
                  onChange={(e) => setEditing({ ...editing, resumo: e.target.value })}
                />
              </div>

              {/* Palavras-chave */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Palavras-chave (separadas por vírgula)</label>
                <input
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={editing.palavrasChave.join(', ')}
                  onChange={(e) => setEditing({ ...editing, palavrasChave: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                />
              </div>

              {/* Flashcards */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Flashcards ({editing.flashcards.length})</label>
                  <button
                    onClick={() => setEditing({ ...editing, flashcards: [{ frente: '', verso: '' }, ...editing.flashcards] })}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                    style={{ color: '#6270f5', border: '1px solid rgba(98,112,245,0.3)' }}
                  >
                    <Plus size={11} /> Adicionar
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {editing.flashcards.map((fc, i) => (
                    <FlashcardEditor
                      key={i}
                      fc={fc}
                      onChange={(updated) => {
                        const fcs = [...editing.flashcards]
                        fcs[i] = updated
                        setEditing({ ...editing, flashcards: fcs })
                      }}
                      onDelete={() => setEditing({ ...editing, flashcards: editing.flashcards.filter((_, idx) => idx !== i) })}
                    />
                  ))}
                </div>
              </div>

              {/* Quiz */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Questões ({editing.quiz.length})</label>
                  <button
                    onClick={() => setEditing({
                      ...editing,
                      quiz: [{ pergunta: '', tipo: 'multiple-choice', opcoes: ['', '', '', ''], correta: 0, explicacao: '' }, ...editing.quiz]
                    })}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                    style={{ color: '#6270f5', border: '1px solid rgba(98,112,245,0.3)' }}
                  >
                    <Plus size={11} /> Adicionar
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {editing.quiz.map((q, i) => (
                    <QuestionEditor
                      key={i}
                      q={q}
                      onChange={(updated) => {
                        const qs = [...editing.quiz]
                        qs[i] = updated
                        setEditing({ ...editing, quiz: qs })
                      }}
                      onDelete={() => setEditing({ ...editing, quiz: editing.quiz.filter((_, idx) => idx !== i) })}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl text-sm" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm px-5 py-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmação de eliminação ────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="font-display font-bold mb-2" style={{ color: 'var(--text)' }}>Apagar conteúdo?</p>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              "<strong>{confirmDelete.titulo}</strong>" será removido permanentemente do KV.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl text-sm" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#ef4444' }}
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function FlashcardEditor({ fc, onChange, onDelete }: { fc: KVFlashcard; onChange: (fc: KVFlashcard) => void; onDelete: () => void }) {
  return (
    <div className="rounded-xl p-3 flex flex-col gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#6270f5' }}><Layers size={12} /> Flashcard</span>
        <button onClick={onDelete}><X size={13} style={{ color: '#ef4444' }} /></button>
      </div>
      <input
        placeholder="Frente"
        className="w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        value={fc.frente}
        onChange={(e) => onChange({ ...fc, frente: e.target.value })}
      />
      <input
        placeholder="Verso"
        className="w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        value={fc.verso}
        onChange={(e) => onChange({ ...fc, verso: e.target.value })}
      />
    </div>
  )
}

function QuestionEditor({ q, onChange, onDelete }: { q: KVQuestion; onChange: (q: KVQuestion) => void; onDelete: () => void }) {
  return (
    <div className="rounded-xl p-3 flex flex-col gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#6270f5' }}><HelpCircle size={12} /> Questão</span>
        <button onClick={onDelete}><X size={13} style={{ color: '#ef4444' }} /></button>
      </div>
      <input
        placeholder="Pergunta"
        className="w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        value={q.pergunta}
        onChange={(e) => onChange({ ...q, pergunta: e.target.value })}
      />
      <div className="flex flex-col gap-1">
        {q.opcoes.map((op, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              checked={q.correta === i}
              onChange={() => onChange({ ...q, correta: i })}
              title="Marcar como correta"
            />
            <input
              placeholder={`Opção ${i + 1}`}
              className="flex-1 rounded-lg px-2.5 py-1.5 text-xs outline-none"
              style={{ background: 'var(--surface)', border: `1px solid ${q.correta === i ? '#6270f5' : 'var(--border)'}`, color: 'var(--text)' }}
              value={op}
              onChange={(e) => {
                const opcoes = [...q.opcoes]
                opcoes[i] = e.target.value
                onChange({ ...q, opcoes })
              }}
            />
          </div>
        ))}
      </div>
      <input
        placeholder="Explicação da resposta correta"
        className="w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        value={q.explicacao}
        onChange={(e) => onChange({ ...q, explicacao: e.target.value })}
      />
    </div>
  )
}
