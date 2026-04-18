import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Calendar, Library, Search, Sparkles, Trash2, Loader2, Check, X } from 'lucide-react'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useMaterials, type MaterialSearchResult } from '@/hooks/useMaterials'
import type { MaterialRef, PlanGoal } from '@/types'
import { api } from '@/lib/api'

type Step = 1 | 2

interface DraftMaterial extends MaterialRef {
  content: string
}

function firstWordsTitle(text: string, n = 6): string {
  const words = text.trim().split(/\s+/).slice(0, n)
  const base = words.join(' ')
  return base.length < text.trim().length ? `${base}...` : base
}

export default function CreatePlanPage() {
  const navigate = useNavigate()
  const studentId = useStudentAuthStore((s) => s.studentId)
  const { uploadMaterial, searchMaterials, getMaterial, incrementUsage, results, loading: searchLoading } = useMaterials()

  const [step, setStep] = useState<Step>(1)
  const [goal, setGoal] = useState<PlanGoal | null>(null)
  const [whatToStudy, setWhatToStudy] = useState('')
  const [topics, setTopics] = useState('')
  const [targetDate, setTargetDate] = useState('')

  // Material colado
  const [pastedContent, setPastedContent] = useState('')
  const [pastedShared, setPastedShared] = useState(false)

  // Materiais escolhidos da biblioteca
  const [libraryMaterials, setLibraryMaterials] = useState<DraftMaterial[]>([])

  // Modal da biblioteca
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searched, setSearched] = useState(false)

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const canGenerate =
    whatToStudy.trim().length > 0 &&
    topics.trim().length > 0 &&
    (goal !== 'exame' || targetDate.length > 0)

  async function handleSearch() {
    setSearched(true)
    await searchMaterials(searchQuery.trim(), undefined, whatToStudy.trim() || undefined)
  }

  async function handleUseFromLibrary(entry: MaterialSearchResult) {
    if (libraryMaterials.some((m) => m.id === entry.id)) return
    const full = await getMaterial(entry.id)
    if (!full) {
      setError('Não foi possível carregar o material.')
      return
    }
    await incrementUsage(entry.id)
    setLibraryMaterials((prev) => [
      ...prev,
      { id: full.id, title: full.title, type: full.type, content: full.content },
    ])
  }

  function removeLibraryMaterial(id: string) {
    setLibraryMaterials((prev) => prev.filter((m) => m.id !== id))
  }

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      const materialsForApi: { title: string; content: string; type: string }[] = []

      // Material colado → cria Material on the fly
      if (pastedContent.trim()) {
        const title = firstWordsTitle(pastedContent)
        if (pastedShared) {
          const created = await uploadMaterial({
            title,
            content: pastedContent,
            type: 'note',
            tags: [],
            subject: whatToStudy,
            shared: true,
            uploadedBy: studentId ?? 'anon',
          })
          if (created) {
            materialsForApi.push({ title: created.title, content: created.content, type: created.type })
          } else {
            materialsForApi.push({ title, content: pastedContent, type: 'note' })
          }
        } else {
          materialsForApi.push({ title, content: pastedContent, type: 'note' })
        }
      }

      // Materiais da biblioteca
      for (const m of libraryMaterials) {
        materialsForApi.push({ title: m.title, content: m.content, type: m.type })
      }

      const result = await api.generateStudyPlan({
        title: whatToStudy,
        goal: goal as PlanGoal,
        topics,
        subject: whatToStudy,
        targetDate: goal === 'exame' ? targetDate : undefined,
        materials: materialsForApi,
      })

      const planId = `plan-${Date.now()}`
      const storedMaterials = [
        ...(pastedContent.trim() ? [{ id: `pasted-${Date.now()}`, title: firstWordsTitle(pastedContent), type: 'note' as const }] : []),
        ...libraryMaterials.map((m) => ({ id: m.id, title: m.title, type: m.type })),
      ]
      sessionStorage.setItem(
        `plan:${planId}`,
        JSON.stringify({ id: planId, title: whatToStudy, goal, topics, targetDate, materials: storedMaterials, plano: result }),
      )
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
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Passo {step} de 2</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6">
        {[1, 2].map((n) => (
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

      {/* STEP 2 — Descrição + material */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text)' }}>O que vais estudar? *</label>
            <input type="text" value={whatToStudy} onChange={(e) => setWhatToStudy(e.target.value)}
              placeholder="ex: revisão de inglês, matemática frações, história de portugal..."
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

          {/* Separador material */}
          <div className="pt-4 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>
              Tens material? <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(opcional)</span>
            </p>
            <textarea value={pastedContent} onChange={(e) => setPastedContent(e.target.value)}
              placeholder="Cola aqui a tua ficha ou apontamentos"
              rows={5}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input type="checkbox" checked={pastedShared} onChange={(e) => setPastedShared(e.target.checked)}
                className="accent-[#6270f5]" />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Partilhar com outros alunos</span>
            </label>
            <button onClick={() => setLibraryOpen(true)}
              className="mt-3 w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
              <Library size={14} /> Buscar na biblioteca
            </button>

            {libraryMaterials.length > 0 && (
              <div className="mt-3 space-y-2">
                {libraryMaterials.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <Library size={14} style={{ color: '#a78bfa' }} />
                    <p className="flex-1 text-sm truncate" style={{ color: 'var(--text)' }}>{m.title}</p>
                    <button onClick={() => removeLibraryMaterial(m.id)} className="p-1 rounded">
                      <Trash2 size={14} style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
              {error}
            </div>
          )}

          <button onClick={handleGenerate} disabled={!canGenerate || generating}
            className="btn-primary w-full flex items-center justify-center gap-2"
            style={{ opacity: (!canGenerate || generating) ? 0.5 : 1, cursor: (!canGenerate || generating) ? 'not-allowed' : 'pointer' }}>
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

      {/* Modal biblioteca */}
      {libraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setLibraryOpen(false)}>
          <div className="w-full max-w-lg rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Library size={18} style={{ color: '#a78bfa' }} />
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Biblioteca da comunidade</h3>
              </div>
              <button onClick={() => setLibraryOpen(false)} className="p-1 rounded">
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                placeholder="Procurar por título..."
                className="flex-1 px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              <button onClick={handleSearch} disabled={searchLoading}
                className="px-4 rounded-lg flex items-center gap-1" style={{ background: '#a78bfa', color: 'white' }}>
                {searchLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              </button>
            </div>
            {searched && results.length === 0 && !searchLoading && (
              <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>
                Nenhum material partilhado encontrado.
              </p>
            )}
            {results.length > 0 && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {results.map((r) => {
                  const added = libraryMaterials.some((m) => m.id === r.id)
                  return (
                    <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
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
        </div>
      )}
    </div>
  )
}
