import { useState } from 'react'
import { Check, X as XIcon } from 'lucide-react'
import type {
  AdvancedExercise,
  ExercicioLacuna,
  ExercicioClassificacao,
  ExercicioTransformacao,
  ExercicioIdentificacao,
} from '@/types/advancedExercises'

// ── Lacuna ───────────────────────────────────────────────────────────────────

function LacunaExercise({ exercicio, num }: { exercicio: ExercicioLacuna; num: number }) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  const correct = selected !== null && exercicio.opcoes[selected] === exercicio.resposta

  return (
    <div className="space-y-2">
      <p className="text-sm" style={{ color: 'var(--text)' }}>
        <span className="font-semibold" style={{ color: '#6270f5' }}>{num}.</span>{' '}
        {exercicio.frase.replace('___', answered ? exercicio.resposta : '___')}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {exercicio.opcoes.map((opt, i) => {
          const isThis = selected === i
          const isCorrectOpt = opt === exercicio.resposta
          let bg = 'var(--surface-2)'; let border = 'var(--border)'; let col = 'var(--text)'
          if (answered && isCorrectOpt) { bg = 'rgba(16,185,129,0.1)'; border = 'rgba(16,185,129,0.3)'; col = '#10b981' }
          else if (answered && isThis && !correct) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.3)'; col = '#ef4444' }
          return (
            <button key={i} onClick={() => !answered && setSelected(i)} disabled={answered}
              className="px-3 py-2 rounded-xl text-xs text-left transition-all"
              style={{ background: bg, border: `1px solid ${border}`, color: col }}>
              {opt}
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="flex items-start gap-1.5 px-1">
          {correct ? <Check size={13} className="shrink-0 mt-0.5" style={{ color: '#10b981' }} /> : <XIcon size={13} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{exercicio.explicacao}</p>
        </div>
      )}
    </div>
  )
}

// ── Classificacao ────────────────────────────────────────────────────────────

function ClassificacaoExercise({ exercicio, num }: { exercicio: ExercicioClassificacao; num: number }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  const allAnswered = exercicio.itens.every((it) => answers[it.palavra])

  function handleCheck() { setChecked(true) }

  return (
    <div className="space-y-2">
      <p className="text-sm" style={{ color: 'var(--text)' }}>
        <span className="font-semibold" style={{ color: '#6270f5' }}>{num}.</span> {exercicio.instrucao}
      </p>
      <div className="flex flex-col gap-1.5">
        {exercicio.itens.map((it) => {
          const isCorrect = checked && answers[it.palavra] === it.coluna
          const isWrong = checked && answers[it.palavra] !== it.coluna
          return (
            <div key={it.palavra} className="flex items-center gap-2">
              <span className="text-xs font-medium w-24 truncate" style={{ color: 'var(--text)' }}>{it.palavra}</span>
              <select
                value={answers[it.palavra] ?? ''}
                onChange={(e) => setAnswers({ ...answers, [it.palavra]: e.target.value })}
                disabled={checked}
                className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none"
                style={{
                  background: isCorrect ? 'rgba(16,185,129,0.08)' : isWrong ? 'rgba(239,68,68,0.08)' : 'var(--surface-2)',
                  border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : isWrong ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                  color: 'var(--text)',
                }}
              >
                <option value="">Seleciona...</option>
                {exercicio.colunas.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {checked && (isCorrect ? <Check size={13} style={{ color: '#10b981' }} /> : <XIcon size={13} style={{ color: '#ef4444' }} />)}
            </div>
          )
        })}
      </div>
      {!checked && (
        <button onClick={handleCheck} disabled={!allAnswered}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: allAnswered ? 'rgba(98,112,245,0.1)' : 'var(--surface-2)', color: allAnswered ? '#6270f5' : 'var(--text-muted)', opacity: allAnswered ? 1 : 0.5 }}>
          Verificar
        </button>
      )}
      {checked && (
        <p className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>{exercicio.explicacao}</p>
      )}
    </div>
  )
}

// ── Transformacao ─────────────────────────────────────────────────────────────

function TransformacaoExercise({ exercicio, num }: { exercicio: ExercicioTransformacao; num: number }) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="space-y-2">
      <p className="text-sm" style={{ color: 'var(--text)' }}>
        <span className="font-semibold" style={{ color: '#6270f5' }}>{num}.</span> {exercicio.instrucao}
      </p>
      <p className="text-sm px-3 py-2 rounded-xl" style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
        {exercicio.frase_original}
      </p>
      {exercicio.dica && (
        <p className="text-[10px] px-1" style={{ color: '#f59e0b' }}>Dica: {exercicio.dica}</p>
      )}
      {!submitted ? (
        <>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
            placeholder="Escreve a frase transformada..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <button onClick={() => setSubmitted(true)} disabled={!answer.trim()}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: answer.trim() ? 'rgba(98,112,245,0.1)' : 'var(--surface-2)', color: answer.trim() ? '#6270f5' : 'var(--text-muted)', opacity: answer.trim() ? 1 : 0.5 }}>
            Verificar
          </button>
        </>
      ) : (
        <div className="space-y-1.5">
          <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <p className="font-semibold" style={{ color: '#10b981' }}>Resposta correta:</p>
            <p style={{ color: 'var(--text)' }}>{exercicio.resposta}</p>
          </div>
          <p className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>{exercicio.explicacao}</p>
        </div>
      )}
    </div>
  )
}

// ── Identificacao ─────────────────────────────────────────────────────────────

function IdentificacaoExercise({ exercicio, num }: { exercicio: ExercicioIdentificacao; num: number }) {
  return (
    <div className="space-y-2">
      <p className="text-sm" style={{ color: 'var(--text)' }}>
        <span className="font-semibold" style={{ color: '#6270f5' }}>{num}.</span> {exercicio.instrucao}
      </p>
      <p className="text-sm px-3 py-2 rounded-xl" style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
        {exercicio.frase}
      </p>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th className="text-left py-1.5 px-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Segmento</th>
            <th className="text-left py-1.5 px-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Função</th>
          </tr>
        </thead>
        <tbody>
          {exercicio.constituintes.map((c, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <td className="py-1.5 px-2 font-medium" style={{ color: 'var(--text)' }}>{c.texto}</td>
              <td className="py-1.5 px-2" style={{ color: '#6270f5' }}>{c.funcao}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>{exercicio.explicacao}</p>
    </div>
  )
}

// ── Main Renderer ────────────────────────────────────────────────────────────

export default function ExerciseRenderer({ exercicios }: { exercicios: AdvancedExercise[] }) {
  return (
    <div className="flex flex-col gap-5">
      {exercicios.map((ex, i) => {
        switch (ex.tipo) {
          case 'lacuna': return <LacunaExercise key={i} exercicio={ex} num={i + 1} />
          case 'classificacao': return <ClassificacaoExercise key={i} exercicio={ex} num={i + 1} />
          case 'transformacao': return <TransformacaoExercise key={i} exercicio={ex} num={i + 1} />
          case 'identificacao': return <IdentificacaoExercise key={i} exercicio={ex} num={i + 1} />
          default: return null
        }
      })}
    </div>
  )
}
