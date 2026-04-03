/**
 * AdminLearningsPage — "Aprendizados"
 *
 * Único ponto de entrada de conteúdo:
 *   1. Colar texto OU anexar ficheiro .ts/.md/.txt
 *   2. "Analisar" → gera título, matéria sugerida, palavras-chave, flashcards, quiz
 *   3. Rever / editar cada secção
 *   4. "Guardar rascunho" ou "Publicar para os alunos"
 *   5. Publicado aparece em "Publicados" (e em Matérias Publicadas para os alunos)
 */

import { useState, useRef } from 'react'
import { useAdminStore, type ContentDraft } from '@/store/useAdminStore'
import { STATIC_DISCIPLINES } from '@/lib/contentBridge'
import { autoGenerate } from '@/lib/autoGenerate'
import { api, type KVContentItem } from '@/lib/api'
import {
  Plus, ArrowLeft, Sparkles, Save, Trash2, BookOpen,
  ChevronDown, ChevronUp, Send, Pencil, FileText, Upload,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API = '/api/content'
type View = 'list' | 'editor'
type DraftData = Omit<ContentDraft, 'id' | 'createdAt'>

async function fetchPublished(): Promise<KVContentItem[]> {
  try { return await (await fetch(API)).json() } catch { return [] }
}

function suggestDiscipline(text: string, disciplines: { id: string; name: string; subject: string }[]) {
  const lower = text.toLowerCase()
  const scored = disciplines.map((d) => {
    const words = `${d.name} ${d.subject}`.toLowerCase().split(/\s+/)
    return { ...d, score: words.reduce((acc, w) => acc + (lower.includes(w) ? w.length : 0), 0) }
  })
  return scored.sort((a, b) => b.score - a.score).find((d) => d.score > 0) ?? null
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminLearningsPage() {
  const { disciplines: adminDisciplines, contentDrafts, saveDraft, updateDraft, deleteDraft } = useAdminStore()
  const [view, setView] = useState<View>('list')
  const [activeTab, setActiveTab] = useState<'drafts' | 'published'>('drafts')
  const [published, setPublished] = useState<KVContentItem[]>([])
  const [loadingPublished, setLoadingPublished] = useState(false)
  const [editingDraft, setEditingDraft] = useState<ContentDraft | null>(null)
  const [editingPublished, setEditingPublished] = useState<KVContentItem | null>(null)

  const allDisciplines = [
    ...adminDisciplines.map((d) => ({ id: d.id, name: d.name, subject: d.subject })),
    ...STATIC_DISCIPLINES
      .filter((d) => !adminDisciplines.some((a) => a.id === d.id))
      .map((d) => ({ id: d.id, name: d.name, subject: d.subject })),
  ]

  async function loadPublished() {
    setLoadingPublished(true)
    setActiveTab('published')
    setPublished(await fetchPublished())
    setLoadingPublished(false)
  }

  async function publishData(data: DraftData) {
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await loadPublished()
    setView('list')
  }

  async function handlePublishDraft(draft: ContentDraft) {
    await publishData(draft)
    deleteDraft(draft.id)
  }

  async function handleUpdatePublished(item: KVContentItem) {
    await api.putContent(item)
    setPublished((p) => p.map((c) => c.id === item.id ? item : c))
    setEditingPublished(null)
    setView('list')
  }

  async function handleDeletePublished(item: KVContentItem) {
    await fetch(`${API}?id=${item.id}&disciplineId=${item.disciplineId}`, { method: 'DELETE' })
    setPublished((p) => p.filter((c) => c.id !== item.id))
  }

  const discName = (id: string) => allDisciplines.find((d) => d.id === id)?.name ?? id

  // ── Editor views ──────────────────────────────────────────────────────────

  if (view === 'editor' && !editingDraft && !editingPublished) {
    return (
      <Editor
        disciplines={allDisciplines}
        onBack={() => setView('list')}
        onDraft={(data) => { saveDraft(data); setView('list') }}
        onPublish={publishData}
      />
    )
  }

  if (view === 'editor' && editingDraft) {
    return (
      <Editor
        disciplines={allDisciplines}
        initial={editingDraft}
        onBack={() => { setEditingDraft(null); setView('list') }}
        onDraft={(data) => { updateDraft(editingDraft.id, data); setEditingDraft(null); setView('list') }}
        onPublish={async (data) => { await handlePublishDraft({ ...editingDraft, ...data }); setEditingDraft(null) }}
      />
    )
  }

  if (view === 'editor' && editingPublished) {
    return (
      <Editor
        disciplines={allDisciplines}
        initial={editingPublished}
        isPublished
        onBack={() => { setEditingPublished(null); setView('list') }}
        onDraft={(data) => handleUpdatePublished({ ...editingPublished, ...data })}
        onPublish={(data) => handleUpdatePublished({ ...editingPublished, ...data })}
      />
    )
  }

  // ── List ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>Aprendizados</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Cola texto ou anexa um ficheiro, analisa, revê e publica para os alunos.
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2 shrink-0"
          onClick={() => { setEditingDraft(null); setEditingPublished(null); setView('editor') }}
        >
          <Plus size={16} /> Novo conteúdo
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--surface-2)' }}>
        <TabBtn active={activeTab === 'drafts'} onClick={() => setActiveTab('drafts')}>
          Rascunhos ({contentDrafts.length})
        </TabBtn>
        <TabBtn active={activeTab === 'published'} onClick={loadPublished}>
          Publicados {activeTab === 'published' && published.length > 0 ? `(${published.length})` : ''}
        </TabBtn>
      </div>

      {/* Drafts */}
      {activeTab === 'drafts' && (
        contentDrafts.length === 0
          ? <EmptyState icon={<FileText size={32} />} title="Nenhum rascunho" sub='Clica em "Novo conteúdo" para começar.' />
          : <div className="flex flex-col gap-3">
            {contentDrafts.map((d) => (
              <Card
                key={d.id}
                title={d.title || '(sem título)'}
                disc={discName(d.disciplineId)}
                date={d.createdAt}
                fc={d.flashcards.length}
                qz={d.questions.length}
                draft
                onEdit={() => { setEditingDraft(d); setView('editor') }}
                onDelete={() => deleteDraft(d.id)}
                onPublish={() => handlePublishDraft(d)}
              />
            ))}
          </div>
      )}

      {/* Published */}
      {activeTab === 'published' && (
        loadingPublished
          ? <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>A carregar...</div>
          : published.length === 0
            ? <EmptyState icon={<BookOpen size={32} />} title="Nenhum conteúdo publicado" sub='Publica o primeiro aprendizado.' />
            : <div className="flex flex-col gap-3">
              {published.map((item) => (
                <Card
                  key={item.id}
                  title={item.title}
                  disc={discName(item.disciplineId)}
                  date={item.createdAt}
                  fc={item.flashcards?.length ?? 0}
                  qz={item.questions?.length ?? 0}
                  onEdit={() => { setEditingPublished(item); setView('editor') }}
                  onDelete={() => handleDeletePublished(item)}
                />
              ))}
            </div>
      )}
    </div>
  )
}

// ─── Editor ───────────────────────────────────────────────────────────────────

function Editor({
  disciplines, initial, isPublished, onBack, onDraft, onPublish,
}: {
  disciplines: { id: string; name: string; subject: string }[]
  initial?: Partial<DraftData>
  isPublished?: boolean
  onBack: () => void
  onDraft: (data: DraftData) => void
  onPublish: (data: DraftData) => Promise<void>
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [disciplineId, setDisciplineId] = useState(initial?.disciplineId ?? '')
  const [keyPoints, setKeyPoints] = useState<string[]>(initial?.keyPoints ?? [])
  const [flashcards, setFlashcards] = useState(initial?.flashcards ?? [])
  const [questions, setQuestions] = useState(initial?.questions ?? [])
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [analyzed, setAnalyzed] = useState(!!initial?.keyPoints?.length)
  const [openSection, setOpenSection] = useState<'kp' | 'fc' | 'qz' | null>('kp')
  const [saving, setSaving] = useState(false)

  const canPublish = title.trim() && body.trim() && disciplineId

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setBody(text)
      setAnalyzed(false)
    }
    reader.readAsText(file)
  }

  function handleAnalyze() {
    const gen = autoGenerate(body)
    if (!title && gen.title) setTitle(gen.title)
    setKeyPoints(gen.keyPoints)
    setFlashcards(gen.flashcards)
    setQuestions(gen.questions)
    setAnalyzed(true)
    if (!disciplineId) {
      const match = suggestDiscipline(body, disciplines)
      if (match) { setDisciplineId(match.id); setSuggestion(match.name) }
    }
    setOpenSection('kp')
  }

  function getData(): DraftData {
    return { title, body, disciplineId, keyPoints, flashcards, questions }
  }

  async function handlePublish() {
    setSaving(true)
    await onPublish(getData())
    setSaving(false)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-display font-bold" style={{ color: 'var(--text)' }}>
            {isPublished ? 'Editar publicado' : initial?.title ? 'Editar rascunho' : 'Novo aprendizado'}
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Os Primeiros Povos da Península Ibérica"
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Matéria */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Matéria</label>
          {suggestion && (
            <p className="text-xs mb-1.5 flex items-center gap-1" style={{ color: '#6270f5' }}>
              <Sparkles size={11} /> Sugestão automática: <strong>{suggestion}</strong>
            </p>
          )}
          <div className="relative">
            <select
              value={disciplineId}
              onChange={(e) => setDisciplineId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: disciplineId ? 'var(--text)' : 'var(--text-muted)' }}
            >
              <option value="">Seleciona a matéria...</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>{d.name} — {d.subject}</option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Conteúdo — paste ou upload */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Conteúdo</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}
            >
              <Upload size={12} /> Anexar ficheiro
            </button>
            <input ref={fileRef} type="file" accept=".ts,.md,.txt" className="hidden" onChange={handleFile} />
          </div>
          <textarea
            value={body}
            onChange={(e) => { setBody(e.target.value); setAnalyzed(false) }}
            rows={12}
            placeholder="Cola aqui o texto ou clica em 'Anexar ficheiro' para carregar um .ts, .md ou .txt..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none leading-relaxed font-mono"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {body.length > 0 ? `${body.trim().split(/\s+/).length} palavras` : 'Aceita Markdown, ficheiros .ts (gerados pelo Claude), .md ou .txt'}
          </p>
        </div>

        {/* Botão analisar */}
        <button
          onClick={handleAnalyze}
          disabled={!body.trim()}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: analyzed ? 'rgba(16,185,129,0.08)' : 'rgba(98,112,245,0.08)',
            color: analyzed ? '#10b981' : '#6270f5',
            border: `1px solid ${analyzed ? 'rgba(16,185,129,0.2)' : 'rgba(98,112,245,0.2)'}`,
          }}
        >
          <Sparkles size={15} />
          {analyzed ? '✓ Analisado — clica para reanalisar' : 'Analisar automaticamente'}
        </button>
        {!analyzed && (
          <p className="text-xs -mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
            Gera automaticamente: título · matéria sugerida · palavras-chave · flashcards · quiz
          </p>
        )}

        {/* Secções geradas */}
        {analyzed && (
          <div className="flex flex-col gap-3">
            <Collapsible title={`Palavras-chave (${keyPoints.length})`} open={openSection === 'kp'} onToggle={() => setOpenSection(openSection === 'kp' ? null : 'kp')}>
              <div className="flex flex-col gap-2">
                {keyPoints.map((kp, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={kp} onChange={(e) => setKeyPoints(keyPoints.map((k, j) => j === i ? e.target.value : k))}
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                    <button onClick={() => setKeyPoints(keyPoints.filter((_, j) => j !== i))} className="p-1 rounded hover:bg-red-50" style={{ color: '#dc2626' }}><Trash2 size={13} /></button>
                  </div>
                ))}
                <button onClick={() => setKeyPoints([...keyPoints, ''])} className="text-xs font-medium px-3 py-1.5 rounded-lg w-fit" style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}>+ Adicionar</button>
              </div>
            </Collapsible>

            <Collapsible title={`Flashcards (${flashcards.length})`} open={openSection === 'fc'} onToggle={() => setOpenSection(openSection === 'fc' ? null : 'fc')}>
              <div className="flex flex-col gap-3">
                {flashcards.map((fc, i) => (
                  <div key={i} className="p-3 rounded-xl flex flex-col gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold w-12 shrink-0" style={{ color: '#6270f5' }}>Frente</span>
                      <input value={fc.front} onChange={(e) => setFlashcards(flashcards.map((f, j) => j === i ? { ...f, front: e.target.value } : f))}
                        className="flex-1 px-2 py-1.5 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold w-12 shrink-0" style={{ color: 'var(--text-muted)' }}>Verso</span>
                      <input value={fc.back} onChange={(e) => setFlashcards(flashcards.map((f, j) => j === i ? { ...f, back: e.target.value } : f))}
                        className="flex-1 px-2 py-1.5 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                      <button onClick={() => setFlashcards(flashcards.filter((_, j) => j !== i))} className="p-1 rounded hover:bg-red-50 shrink-0" style={{ color: '#dc2626' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
                <button onClick={() => setFlashcards([...flashcards, { front: '', back: '' }])} className="text-xs font-medium px-3 py-1.5 rounded-lg w-fit" style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}>+ Adicionar flashcard</button>
              </div>
            </Collapsible>

            <Collapsible title={`Quiz — Verdadeiro/Falso (${questions.length})`} open={openSection === 'qz'} onToggle={() => setOpenSection(openSection === 'qz' ? null : 'qz')}>
              <div className="flex flex-col gap-3">
                {questions.map((q, i) => (
                  <div key={i} className="p-3 rounded-xl flex flex-col gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div className="flex items-start gap-2">
                      <textarea value={q.text} onChange={(e) => setQuestions(questions.map((x, j) => j === i ? { ...x, text: e.target.value } : x))}
                        rows={2} className="flex-1 px-2 py-1.5 rounded-lg text-sm outline-none resize-none"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                      <button onClick={() => setQuestions(questions.filter((_, j) => j !== i))} className="p-1 rounded hover:bg-red-50 mt-1 shrink-0" style={{ color: '#dc2626' }}><Trash2 size={13} /></button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Correto:</span>
                      {[true, false].map((val) => (
                        <button key={String(val)} onClick={() => setQuestions(questions.map((x, j) => j === i ? { ...x, answer: val } : x))}
                          className="text-xs px-2 py-1 rounded-lg font-medium transition-all"
                          style={q.answer === val
                            ? { background: val ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)', color: val ? '#10b981' : '#ef4444' }
                            : { background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          {val ? 'Verdadeiro' : 'Falso'}
                        </button>
                      ))}
                    </div>
                    <input value={q.explanation} onChange={(e) => setQuestions(questions.map((x, j) => j === i ? { ...x, explanation: e.target.value } : x))}
                      placeholder="Explicação após responder..."
                      className="px-2 py-1.5 rounded-lg text-xs outline-none"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }} />
                  </div>
                ))}
                <button onClick={() => setQuestions([...questions, { text: '', answer: true, explanation: '' }])} className="text-xs font-medium px-3 py-1.5 rounded-lg w-fit" style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}>+ Adicionar questão</button>
              </div>
            </Collapsible>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          {!isPublished && (
            <button
              onClick={() => onDraft(getData())}
              disabled={!body.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-40"
              style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              <Save size={15} /> Guardar rascunho
            </button>
          )}
          <button
            onClick={handlePublish}
            disabled={!canPublish || saving}
            className="btn-primary flex items-center gap-2 flex-1 justify-center"
            style={{ opacity: !canPublish || saving ? 0.5 : 1 }}
          >
            <Send size={15} />
            {saving ? 'A publicar...' : isPublished ? 'Guardar alterações' : 'Publicar para os alunos'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Small components ─────────────────────────────────────────────────────────

function Card({ title, disc, date, fc, qz, draft, onEdit, onDelete, onPublish }: {
  title: string; disc: string; date: string; fc: number; qz: number
  draft?: boolean; onEdit: () => void; onDelete: () => void; onPublish?: () => void
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {disc && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}>{disc}</span>}
            {draft && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>Rascunho</span>}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(date).toLocaleDateString('pt-PT')}</span>
          </div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{title}</p>
          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            {fc > 0 && <span>🃏 {fc} flashcards</span>}
            {qz > 0 && <span>❓ {qz} questões</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {draft && onPublish && (
            <button onClick={onPublish} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              <Send size={12} /> Publicar
            </button>
          )}
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-slate-100" style={{ color: '#6270f5' }}><Pencil size={15} /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50" style={{ color: '#dc2626' }}><Trash2 size={15} /></button>
        </div>
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
      style={active ? { background: 'var(--surface)', color: '#6270f5', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : { color: 'var(--text-muted)' }}>
      {children}
    </button>
  )
}

function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="card text-center py-12">
      <div className="mx-auto mb-3 w-fit opacity-30" style={{ color: 'var(--text-muted)' }}>{icon}</div>
      <p className="font-semibold" style={{ color: 'var(--text)' }}>{title}</p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  )
}

function Collapsible({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-slate-50 transition-all"
        style={{ color: 'var(--text)', background: 'var(--surface)' }}>
        {title}
        {open ? <ChevronUp size={15} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />}
      </button>
      {open && <div className="px-4 py-4" style={{ background: 'var(--surface)' }}>{children}</div>}
    </div>
  )
}
