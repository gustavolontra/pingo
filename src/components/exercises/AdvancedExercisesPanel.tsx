import { useState } from 'react'
import { Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { api } from '@/lib/api'
import type { AdvancedExercisesData, AdvancedExercise } from '@/types/advancedExercises'
import ExerciseRenderer from './ExerciseRenderer'

const EXERCISE_TYPES = [
  { id: 'lacuna', label: 'Preenchimento de lacunas', desc: 'Completa frases com a palavra correta' },
  { id: 'classificacao', label: 'Classificação em colunas', desc: 'Organiza itens nas categorias certas' },
  { id: 'transformacao', label: 'Transformação de frases', desc: 'Reescreve frases aplicando regras' },
  { id: 'identificacao', label: 'Identificação sintática', desc: 'Analisa a estrutura das frases' },
] as const

type ExerciseTypeId = typeof EXERCISE_TYPES[number]['id']

interface Props {
  learningId: string
  topico: string
  conteudo: string
}

export default function AdvancedExercisesPanel({ learningId, topico, conteudo }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<Set<ExerciseTypeId>>(new Set())
  const [generating, setGenerating] = useState(false)
  const [currentGenerating, setCurrentGenerating] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, AdvancedExercisesData>>({})
  const [error, setError] = useState('')
  const [viewingType, setViewingType] = useState<ExerciseTypeId | null>(null)

  function toggleType(id: ExerciseTypeId) {
    const next = new Set(selectedTypes)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedTypes(next)
  }

  function selectAll() {
    setSelectedTypes(new Set(EXERCISE_TYPES.map((t) => t.id)))
  }

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    const types = Array.from(selectedTypes)

    for (const tipo of types) {
      setCurrentGenerating(EXERCISE_TYPES.find((t) => t.id === tipo)?.label ?? tipo)
      try {
        // Try cached first
        let data: AdvancedExercisesData | null = null
        try {
          data = await api.getAdvancedExercises(learningId, tipo) as AdvancedExercisesData | null
        } catch { /* 404 */ }

        if (!data) {
          data = await api.generateAdvancedExercises(learningId, tipo, conteudo, topico) as AdvancedExercisesData
        }

        setResults((prev) => ({ ...prev, [tipo]: data! }))
      } catch (e) {
        setError(`Erro ao gerar ${tipo}: ${e instanceof Error ? e.message : 'erro desconhecido'}`)
        break
      }
    }

    setCurrentGenerating(null)
    setGenerating(false)
    // Auto-view the first generated type
    if (!viewingType && types.length > 0) setViewingType(types[0])
  }

  const generatedTypes = Object.keys(results)
  const hasResults = generatedTypes.length > 0

  return (
    <div className="rounded-xl" style={{ border: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-4 py-3 text-sm font-semibold transition-all rounded-xl"
        style={{ color: '#6270f5' }}
      >
        <Sparkles size={15} />
        <span className="flex-1 text-left">Exercícios avançados</span>
        {hasResults && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}>
            {generatedTypes.length}
          </span>
        )}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Type selector — multi-select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Seleciona os tipos de exercícios:</p>
              <button onClick={selectAll} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}>
                Selecionar todos
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXERCISE_TYPES.map((t) => {
                const isSelected = selectedTypes.has(t.id)
                const isGenerated = t.id in results
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleType(t.id)}
                    className="p-3 rounded-xl text-left transition-all relative"
                    style={{
                      background: isSelected ? 'rgba(98,112,245,0.1)' : isGenerated ? 'rgba(16,185,129,0.05)' : 'var(--surface-2)',
                      border: `1.5px solid ${isSelected ? '#6270f5' : isGenerated ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                    }}
                  >
                    {isGenerated && (
                      <Check size={12} className="absolute top-2 right-2" style={{ color: '#10b981' }} />
                    )}
                    <p className="text-xs font-semibold" style={{ color: isSelected ? '#6270f5' : 'var(--text)' }}>
                      {t.label}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Generate button */}
          {selectedTypes.size > 0 && !generating && (
            <button
              onClick={handleGenerate}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5', border: '1px solid rgba(98,112,245,0.2)' }}
            >
              <Sparkles size={14} />
              Gerar {selectedTypes.size === 4 ? 'todos os exercícios' : `${selectedTypes.size} tipo${selectedTypes.size > 1 ? 's' : ''} de exercícios`}
            </button>
          )}

          {/* Generating state */}
          {generating && (
            <div className="text-center py-4 space-y-2">
              <Loader2 size={22} className="animate-spin mx-auto" style={{ color: '#6270f5' }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                A gerar: {currentGenerating}...
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {generatedTypes.length}/{selectedTypes.size} concluídos
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
              <div>
                <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
                <button onClick={handleGenerate} className="text-xs font-semibold mt-1" style={{ color: '#6270f5' }}>
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {/* Results — tab view */}
          {hasResults && !generating && (
            <div className="space-y-3">
              {/* Tabs */}
              <div className="flex gap-1.5 overflow-x-auto">
                {generatedTypes.map((tipo) => {
                  const label = EXERCISE_TYPES.find((t) => t.id === tipo)?.label ?? tipo
                  return (
                    <button key={tipo} onClick={() => setViewingType(tipo as ExerciseTypeId)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all"
                      style={{
                        background: viewingType === tipo ? 'rgba(98,112,245,0.1)' : 'var(--surface-2)',
                        color: viewingType === tipo ? '#6270f5' : 'var(--text-muted)',
                        border: `1px solid ${viewingType === tipo ? 'rgba(98,112,245,0.2)' : 'var(--border)'}`,
                      }}>
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* Active exercises */}
              {viewingType && results[viewingType] && (
                <ExerciseRenderer exercicios={results[viewingType].exercicios as AdvancedExercise[]} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
