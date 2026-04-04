import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square } from 'lucide-react'

interface Props {
  text: string
  /** Visual variant: 'default' (dark card style) | 'light' (landing page style) */
  variant?: 'default' | 'light'
}

const SPEEDS = [
  { label: 'Lento', rate: 0.75 },
  { label: 'Normal', rate: 1 },
  { label: 'Rápido', rate: 1.4 },
]

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[-*]\s/gm, '')
    .replace(/^>\s/gm, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .trim()
}

function getPortugueseVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang === 'pt-PT') ??
    voices.find((v) => v.lang.startsWith('pt-PT')) ??
    voices.find((v) => v.lang === 'pt-BR') ??
    voices.find((v) => v.lang.startsWith('pt')) ??
    null
  )
}

export default function TextToSpeech({ text, variant = 'default' }: Props) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused'>('idle')
  const [speedIdx, setSpeedIdx] = useState(1) // Normal by default
  const [noVoice, setNoVoice] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Stop when component unmounts or text changes
  useEffect(() => {
    return () => { window.speechSynthesis.cancel() }
  }, [text])

  // Voices may load async (especially on Chrome)
  useEffect(() => {
    if (!window.speechSynthesis) { setNoVoice(true); return }
    const check = () => {
      if (getPortugueseVoice() === null) setNoVoice(true)
    }
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', check, { once: true })
    } else {
      check()
    }
  }, [])

  function handlePlay() {
    if (!window.speechSynthesis) return

    if (status === 'paused') {
      window.speechSynthesis.resume()
      setStatus('playing')
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(stripMarkdown(text))
    utterance.lang = 'pt-PT'
    utterance.rate = SPEEDS[speedIdx].rate

    const voice = getPortugueseVoice()
    if (voice) utterance.voice = voice

    utterance.onend = () => setStatus('idle')
    utterance.onerror = () => setStatus('idle')

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setStatus('playing')
  }

  function handlePause() {
    window.speechSynthesis.pause()
    setStatus('paused')
  }

  function handleStop() {
    window.speechSynthesis.cancel()
    setStatus('idle')
  }

  const isLight = variant === 'light'
  const btnBase = `flex items-center justify-center rounded-full transition-all`
  const surface = isLight ? 'var(--surface-2)' : 'rgba(255,255,255,0.12)'
  const textMuted = isLight ? 'var(--text-muted)' : 'rgba(255,255,255,0.7)'
  const accent = '#6270f5'
  const border = isLight ? '1px solid var(--border)' : '1px solid rgba(255,255,255,0.15)'

  if (noVoice) {
    return (
      <p className="text-xs italic mt-2" style={{ color: textMuted }}>
        Voz em português não disponível neste dispositivo.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      {/* Play / Pause — botão principal com label */}
      {status === 'playing' ? (
        <button
          onClick={handlePause}
          className={`${btnBase} gap-1.5 px-3`}
          style={{ height: 34, background: accent, color: 'white', borderRadius: 999, fontSize: 13, fontWeight: 600 }}
        >
          <Pause size={13} /> Pausar
        </button>
      ) : (
        <button
          onClick={handlePlay}
          className={`${btnBase} gap-1.5 px-3`}
          style={{ height: 34, background: status === 'paused' ? accent : surface, color: status === 'paused' ? 'white' : textMuted, borderRadius: 999, fontSize: 13, fontWeight: 600, border }}
        >
          <Play size={13} /> {status === 'paused' ? 'Continuar' : '🔊 Ouvir'}
        </button>
      )}

      {/* Stop */}
      {status !== 'idle' && (
        <button
          onClick={handleStop}
          className={`${btnBase} gap-1 px-2.5`}
          style={{ height: 34, background: surface, color: textMuted, borderRadius: 999, fontSize: 13, border }}
        >
          <Square size={11} /> Parar
        </button>
      )}

      {/* Speed selector */}
      <div className="flex items-center gap-1">
        {SPEEDS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => {
              setSpeedIdx(i)
              if (status === 'playing') { window.speechSynthesis.cancel(); setStatus('idle') }
            }}
            className="text-xs px-2.5 py-1 rounded-full transition-all"
            style={{
              background: speedIdx === i ? `${accent}20` : surface,
              color: speedIdx === i ? accent : textMuted,
              fontWeight: speedIdx === i ? 600 : 400,
              border: speedIdx === i ? `1px solid ${accent}40` : border,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {status === 'playing' && (
        <span className="text-xs animate-pulse" style={{ color: accent }}>A ler…</span>
      )}
    </div>
  )
}
