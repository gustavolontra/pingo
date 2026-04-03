/**
 * AdminLearningsPage — "Aprendizados"
 *
 * Fluxo único:
 *   1. Admin cola um texto (ou arrasta um ficheiro .ts no futuro)
 *   2. Sistema sugere automaticamente a matéria
 *   3. Admin confirma/ajusta a matéria e clica "Publicar"
 *   4. Conteúdo fica disponível em tempo real para todos os alunos via KV
 *
 * Aba "Publicados" lista tudo o que já foi publicado, com opção de remover.
 */

import { useState } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { STATIC_DISCIPLINES } from '@/lib/contentBridge'
import { Sparkles, Save, Trash2, BookOpen, ChevronDown } from 'lucide-react'

const API = '/api/content'

interface SavedContent {
  id: string
  disciplineId: string
  title: string
  body: string
  keyPoints: string[]
  createdAt: string
  updatedAt: string
}

function suggestDiscipline(text: string, disciplines: { id: string; name: string; subject: string }[]) {
  const lower = text.toLowerCase()
  const scores = disciplines.map((d) => {
    const words = `${d.name} ${d.subject}`.toLowerCase().split(/\s+/)
    const score = words.reduce((acc, w) => acc + (lower.includes(w) ? w.length : 0), 0)
    return { ...d, score }
  })
  return scores.sort((a, b) => b.score - a.score)[0] ?? null
}

function extractKeyPoints(text: string): string[] {
  const lines = text.split('\n')
  const points: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (/^[-*•]\s+.{10,}/.test(trimmed)) points.push(trimmed.replace(/^[-*•]\s+/, ''))
    const bold = trimmed.match(/\*\*(.{5,40})\*\*/g)
    if (bold) points.push(...bold.map((b) => b.replace(/\*\*/g, '')))
  }
  return [...new Set(points)].slice(0, 5)
}

export default function AdminLearningsPage() {
  const { disciplines: adminDisciplines } = useAdminStore()

  // Todas as disciplinas disponíveis (admin + estáticas)
  const allDisciplines = [
    ...adminDisciplines.map((d) => ({ id: d.id, name: d.name, subject: d.subject })),
    ...STATIC_DISCIPLINES
      .filter((d) => !adminDisciplines.some((a) => a.id === d.id))
      .map((d) => ({ id: d.id, name: d.name, subject: d.subject })),
  ]

  const [activeTab, setActiveTab] = useState<'new' | 'published'>('new')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedDisciplineId, setSelectedDisciplineId] = useState('')
  const [suggestion, setSuggestion] = useState<{ id: string; name: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [publishedList, setPublishedList] = useState<SavedContent[]>([])
  const [loading, setLoading] = useState(false)

  const canSave = title.trim() && body.trim() && selectedDisciplineId

  function handleAnalyze() {
    if (!body.trim() || allDisciplines.length === 0) return
    const match = suggestDiscipline(body, allDisciplines)
    if (match) {
      setSuggestion(match)
      setSelectedDisciplineId(match.id)
    }
  }

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, disciplineId: selectedDisciplineId, keyPoints: extractKeyPoints(body) }),
      })
      setSaved(true)
      setTitle('')
      setBody('')
      setSuggestion(null)
      setSelectedDisciplineId('')
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert('Erro ao publicar. Verifica a ligação.')
    }
    setSaving(false)
  }

  async function loadPublished() {
    setLoading(true)
    setActiveTab('published')
    try {
      const res = await fetch(API)
      setPublishedList(await res.json())
    } catch {
      setPublishedList([])
    }
    setLoading(false)
  }

  async function handleDelete(item: SavedContent) {
    await fetch(`${API}?id=${item.id}&disciplineId=${item.disciplineId}`, { method: 'DELETE' })
    setPublishedList((prev) => prev.filter((c) => c.id !== item.id))
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>Aprendizados</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Cola qualquer texto de estudo, associa a uma matéria e publica. Fica disponível para todos os alunos em tempo real.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--surface-2)' }}>
        {[
          { key: 'new', label: '+ Novo aprendizado' },
          { key: 'published', label: 'Publicados' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => key === 'published' ? loadPublished() : setActiveTab('new')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={activeTab === key
              ? { background: 'var(--surface)', color: '#6270f5', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
              : { color: 'var(--text-muted)' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* New */}
      {activeTab === 'new' && (
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: A Formação do Reino de Portugal"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Conteúdo</label>
            <textarea
              value={body}
              onChange={(e) => { setBody(e.target.value); setSuggestion(null) }}
              rows={12}
              placeholder="Cola aqui o texto do aprendizado — resumos, explicações, datas, conceitos, listas..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none leading-relaxed"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              {body.length > 0 ? `${body.length} caracteres · ${body.trim().split(/\s+/).length} palavras` : 'Suporta Markdown'}
            </p>
          </div>

          {/* Matéria */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Matéria</p>
              <button
                onClick={handleAnalyze}
                disabled={!body.trim() || allDisciplines.length === 0}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100 disabled:opacity-40"
                style={{ color: '#6270f5' }}
              >
                <Sparkles size={14} /> Sugerir automaticamente
              </button>
            </div>

            {suggestion && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(98,112,245,0.08)', color: '#6270f5' }}>
                <Sparkles size={13} />
                <span>Sugestão: <strong>{suggestion.name}</strong></span>
              </div>
            )}

            {allDisciplines.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Nenhuma matéria disponível. Vai a <strong>Matérias</strong> para criar ou importar.
              </p>
            ) : (
              <div className="relative">
                <select
                  value={selectedDisciplineId}
                  onChange={(e) => setSelectedDisciplineId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: selectedDisciplineId ? 'var(--text)' : 'var(--text-muted)' }}
                >
                  <option value="">Seleciona a matéria...</option>
                  {allDisciplines.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} — {d.subject}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="btn-primary flex items-center justify-center gap-2 w-full"
            style={{ opacity: !canSave || saving ? 0.5 : 1 }}
          >
            <Save size={16} />
            {saving ? 'A publicar...' : saved ? '✓ Publicado para todos os alunos!' : 'Publicar aprendizado'}
          </button>
        </div>
      )}

      {/* Published */}
      {activeTab === 'published' && (
        <div>
          {loading ? (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>A carregar...</div>
          ) : publishedList.length === 0 ? (
            <div className="card text-center py-12">
              <BookOpen size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p className="font-semibold" style={{ color: 'var(--text)' }}>Nenhum aprendizado publicado</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Vai ao separador "+ Novo aprendizado" para começar.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {publishedList.map((item) => {
                const disc = allDisciplines.find((d) => d.id === item.disciplineId)
                return (
                  <div key={item.id} className="card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {disc && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}>
                              {disc.name}
                            </span>
                          )}
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {new Date(item.createdAt).toLocaleDateString('pt-PT')}
                          </span>
                        </div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{item.title}</p>
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{item.body}</p>
                        {item.keyPoints.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.keyPoints.slice(0, 3).map((kp, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                                {kp.length > 40 ? kp.slice(0, 40) + '…' : kp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                        style={{ color: '#dc2626' }}
                        title="Remover aprendizado"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
