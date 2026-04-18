import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Calendar, FileText, Library, Plus, Search, Sparkles, Trash2, Upload, Loader2, Check } from 'lucide-react'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useMaterials, type MaterialSearchResult } from '@/hooks/useMaterials'
import type { MaterialRef, PlanGoal } from '@/types'
import { api } from '@/lib/api'

type Step = 1 | 2 | 3

interface DraftMaterial extends MaterialRef {
  content: string
  tags: string[]
  subject: string
}

export default function CreatePlanPage() {
  const navigate = useNavigate()
  const studentId = useStudentAuthStore((s) => s.studentId)
  const { uploadMaterial, searchMaterials, getMaterial, incrementUsage, results, loading: searchLoading } = useMaterials()

  const [step, setStep] = useState<Step>(1)
  const [goal, setGoal] = useState<PlanGoal | null>(null)
  const [title, setTitle] = useState('')
  const [topics, setTopics] = useState('')
  const [subject, setSubject] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [materials, setMaterials] = useState<DraftMaterial[]>([])

  // Secção A: colar texto
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteTags, setNoteTags] = useState('')
  const [noteShared, setNoteShared] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Secção B: pesquisa
  const [searchQuery, setSearchQuery] = useState('')
  const [searched, setSearched] = useState(false)

  // Geração
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const canAdvanceStep2 = title.trim().length > 0 && topics.trim().length > 0 && (goal !== 'exame' || targetDate.length > 0)

  async function handleAddNote() {
    if (!noteTitle.trim() || !noteContent.trim()) return
    setUploading(true)
    setError('')
    const tagList = noteTags.split(',').map((t) => t.trim()).filter(Boolean)

    if (noteShared) {
      const created = await uploadMaterial({
        title: noteTitle,
        content: noteContent,
        type: 'note',
        tags: tagList,
        subject: subject || title,
        shared: true,
        uploadedBy: studentId ?? 'anon',
      })
      if (created) {
        setMaterials((prev) => [
          ...prev,
          { id: created.id, title: created.title, type: created.type, content: created.content, tags: created.tags, subject: created.subject },
        ])
      } else {
        setError('Erro a partilhar material. Foi adicionado só ao plano.')
        setMaterials((prev) => [
          ...prev,
          { id: `local-${Date.now()}`, title: noteTitle, type: 'note', content: noteContent, tags: tagList, subject: subject || title },
        ])
      }
    } else {
      setMaterials((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, title: noteTitle, type: 'note', content: noteContent, tags: tagList, subject: subject || title },
      ])
    }

    setNoteTitle('')
    setNoteContent('')
    setNoteTags('')
    setNoteShared(false)
    setUploading(false)
  }

  async function handleSearch() {
    setSearched(true)
    await searchMaterials(searchQuery.trim(), undefined, subject.trim() || undefined)
  }

  async function handleUseFromLibrary(entry: MaterialSearchResult) {
    if (materials.some((m) => m.id === entry.id)) return
    const full = await getMaterial(entry.id)
    if (!full) {
      setError('Não foi possível carregar o material.')
      return
    }
    await incrementUsage(entry.id)
    setMaterials((prev) => [
      ...prev,
      { id: full.id, title: full.title, type: full.type, content: full.content, tags: full.tags, subject: full.subject },
    ])
  }

  function removeMaterial(id: string) {
    setMaterials((prev) => prev.filter((m) => m.id !== id))
  }

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      const result = await api.generateStudyPlan({
        title,
        goal: goal as PlanGoal,
        topics,
        subject,
        targetDate: goal === 'exame' ? targetDate : undefined,
        materials: materials.map((m) => ({ title: m.title, content: m.content, type: m.type })),
      })
      // Por agora, o plano é devolvido mas não há rota /plano/:id.
      // Guardamos em sessionStorage e redirecionamos para /exames onde é apresentado.
      const planId = `plan-${Date.now()}`
      sessionStorage.setItem(`plan:${planId}`, JSON.stringify({ id: planId, title, goal, topics, targetDate, materials, plano: result }))
      navigate(`/plano/${planId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro a gerar plano')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => (step > 1 ? setStep((step - 1) as Step) : navigate(-1))}
          className="p-2 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Criar plano de estudo</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Passo {step} de 3</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex-1 h-1 rounded-full"
            style={{ background: n <= step ? 'linear-gradient(90deg, #6270f5, #a78bfa)' : 'var(--surface-2)' }} />
        ))}
      </div>

      {/* STEP 1 — Modo */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>O que queres fazer?</p>
          <button onClick={() => { setGoal('estudo'); setStep(2) }}
            className="w-full p-5 rounded-xl text-left transition-all"
            style={{ background: goal === 'estudo' ? 'rgba(99,143,255,0.1)' : 'var(--surface-2)',
                     border: `2px solid ${goal === 'estudo' ? '#6270f5' : 'var(--border)'}` }}>
            <div className="flex items-center gap-3">
              <BookOpen size={24} style={{ color: '#6270f5' }} />
              <div>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>Estudar um tema</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Aprendizagem contínua, sem data limite</p>
              </div>
            </div>
          </button>
          <button onClick={() => { setGoal('exame'); setStep(2) }}
            className="w-full p-5 rounded-xl text-left transition-all"
            style={{ background: goal === 'exame' ? 'rgba(167,139,250,0.1)' : 'var(--surface-2)',
                     border: `2px solid ${goal === 'exame' ? '#a78bfa' : 'var(--border)'}` }}>
            <div className="flex items-center gap-3">
              <Calendar size={24} style={{ color: '#a78bfa' }} />
              <div>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>Preparar uma prova</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Plano até à data do exame</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* STEP 2 — Descrição */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>Título do plano *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Revisão de Português — teste de 5ª"
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>Matéria (opcional)</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Português, Matemática, Biologia..."
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>Tópicos a cobrir *</label>
            <textarea value={topics} onChange={(e) => setTopics(e.target.value)}
              placeholder="Ex: Verbos copulativos, predicativo do sujeito, classes de palavras..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>

          {goal === 'exame' && (
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>Data da prova *</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
          )}

          <button onClick={() => setStep(3)} disabled={!canAdvanceStep2}
            className="btn-primary w-full flex items-center justify-center gap-2"
            style={{ opacity: canAdvanceStep2 ? 1 : 0.5, cursor: canAdvanceStep2 ? 'pointer' : 'not-allowed' }}>
            Continuar <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* STEP 3 — Material */}
      {step === 3 && (
        <div className="space-y-5">
          {/* A) Colar texto */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} style={{ color: '#6270f5' }} />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Colar texto</h3>
            </div>
            <input type="text" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Título (ex: Apontamentos da aula)"
              className="w-full px-3 py-2 rounded-lg text-sm mb-2"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Cola aqui o conteúdo (apontamentos, ficha, resumo...)"
              rows={4}
              className="w-full px-3 py-2 rounded-lg text-sm resize-none mb-2"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            <input type="text" value={noteTags} onChange={(e) => setNoteTags(e.target.value)}
              placeholder="Tags (separadas por vírgula): gramática, 5º ano"
              className="w-full px-3 py-2 rounded-lg text-sm mb-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input type="checkbox" checked={noteShared} onChange={(e) => setNoteShared(e.target.checked)}
                className="accent-[#6270f5]" />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Partilhar com a comunidade (outros alunos podem reutilizar)
              </span>
            </label>
            <button onClick={handleAddNote} disabled={!noteTitle.trim() || !noteContent.trim() || uploading}
              className="w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              style={{ background: '#6270f5', color: 'white', opacity: (!noteTitle.trim() || !noteContent.trim() || uploading) ? 0.5 : 1 }}>
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Adicionar ao plano
            </button>
          </div>

          {/* B) Biblioteca */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Library size={18} style={{ color: '#a78bfa' }} />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Buscar na biblioteca</h3>
            </div>
            <div className="flex gap-2 mb-3">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                placeholder="Procurar por título..."
                className="flex-1 px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              <button onClick={handleSearch} disabled={searchLoading}
                className="px-4 rounded-lg flex items-center gap-1" style={{ background: '#a78bfa', color: 'white' }}>
                {searchLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              </button>
            </div>
            {searched && results.length === 0 && !searchLoading && (
              <p className="text-xs text-center py-3" style={{ color: 'var(--text-muted)' }}>
                Nenhum material partilhado encontrado.
              </p>
            )}
            {results.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.map((r) => {
                  const added = materials.some((m) => m.id === r.id)
                  return (
                    <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: 'var(--text)' }}>{r.title}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {r.subject} · {r.usageCount}× usado
                        </p>
                      </div>
                      <button onClick={() => handleUseFromLibrary(r)} disabled={added}
                        className="px-3 py-1 rounded text-xs"
                        style={{ background: added ? 'var(--surface-2)' : '#a78bfa', color: added ? 'var(--text-muted)' : 'white' }}>
                        {added ? <Check size={12} /> : 'Usar'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* C) Materiais adicionados */}
          {materials.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Upload size={18} style={{ color: '#10b981' }} />
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                  Materiais neste plano ({materials.length})
                </h3>
              </div>
              <div className="space-y-2">
                {materials.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: 'var(--text)' }}>{m.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {m.type} · {m.content.length} caracteres
                      </p>
                    </div>
                    <button onClick={() => removeMaterial(m.id)} className="p-1 rounded">
                      <Trash2 size={14} style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
              {error}
            </div>
          )}

          {materials.length === 0 && (
            <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(99,143,255,0.08)', border: '1px solid rgba(99,143,255,0.2)', color: 'var(--text-muted)' }}>
              <span style={{ color: '#6270f5', fontWeight: 600 }}>Nota:</span> podes gerar sem materiais — a IA vai criar o conteúdo a partir dos tópicos.
            </div>
          )}

          <button onClick={handleGenerate} disabled={generating}
            className="btn-primary w-full flex items-center justify-center gap-2"
            style={{ opacity: generating ? 0.6 : 1 }}>
            {generating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> A gerar plano...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Gerar plano
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
