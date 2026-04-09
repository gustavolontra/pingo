import { useState } from 'react'
import { Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [selectedType, setSelectedType] = useState<ExerciseTypeId>('lacuna')
  const [state, setState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [data, setData] = useState<AdvancedExercisesData | null>(null)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setState('loading')
    setError('')
    try {
      // Try GET first (cached)
      const existing = await api.getAdvancedExercises(learningId, selectedType)
      if (existing) {
        setData(existing as AdvancedExercisesData)
        setState('loaded')
        return
      }
    } catch {
      // 404 or error — generate new
    }

    try {
      const result = await api.generateAdvancedExercises(learningId, selectedType, conteudo, topico)
      setData(result as AdvancedExercisesData)
      setState('loaded')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar exercícios')
      setState('error')
    }
  }

  function handleChangeType(tipo: ExerciseTypeId) {
    setSelectedType(tipo)
    setState('idle')
    setData(null)
    setError('')
  }

  return (
    <div className="rounded-xl" style={{ border: '1px solid var(--border)' }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-4 py-3 text-sm font-semibold transition-all rounded-xl"
        style={{ color: '#6270f5' }}
      >
        <Sparkles size={15} />
        <span className="flex-1 text-left">Exercícios avançados</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2">
            {EXERCISE_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleChangeType(t.id)}
                className="p-3 rounded-xl text-left transition-all"
                style={{
                  background: selectedType === t.id ? 'rgba(98,112,245,0.1)' : 'var(--surface-2)',
                  border: `1.5px solid ${selectedType === t.id ? '#6270f5' : 'var(--border)'}`,
                }}
              >
                <p className="text-xs font-semibold" style={{ color: selectedType === t.id ? '#6270f5' : 'var(--text)' }}>
                  {t.label}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
              </button>
            ))}
          </div>

          {/* Generate button */}
          {state !== 'loaded' && (
            <button
              onClick={handleGenerate}
              disabled={state === 'loading'}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5', border: '1px solid rgba(98,112,245,0.2)' }}
            >
              {state === 'loading' ? (
                <><Loader2 size={14} className="animate-spin" /> A gerar exercícios...</>
              ) : (
                <><Sparkles size={14} /> Gerar {EXERCISE_TYPES.find((t) => t.id === selectedType)?.label.toLowerCase()}</>
              )}
            </button>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>{error}</p>
                <button onClick={handleGenerate} className="text-xs font-semibold mt-1" style={{ color: '#6270f5' }}>
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {/* Exercises */}
          {state === 'loaded' && data && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {data.exercicios.length} exercícios · {EXERCISE_TYPES.find((t) => t.id === selectedType)?.label}
                </p>
                <button
                  onClick={() => { setState('idle'); setData(null) }}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
                >
                  Gerar novos
                </button>
              </div>
              <ExerciseRenderer exercicios={data.exercicios as AdvancedExercise[]} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
