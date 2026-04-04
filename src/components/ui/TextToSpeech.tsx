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
  const surface = isLight ? 'var(--surface-2)' : 'rgba(255,255,255,0.08)'
  const textMuted = isLight ? 'var(--text-muted)' : 'rgba(255,255,255,0.5)'
  const accent = '#6270f5'

  if (noVoice) {
    return (
      <p className="text-xs italic mt-2" style={{ color: textMuted }}>
        Voz em português não disponível neste dispositivo.
      </p>
    )
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      {/* Play / Pause */}
      {status === 'playing' ? (
        <button
          onClick={handlePause}
          className={btnBase}
          style={{ width: 32, height: 32, background: accent, color: 'white' }}
          title="Pausar"
        >
          <Pause size={13} />
        </button>
      ) : (
        <button
          onClick={handlePlay}
          className={btnBase}
          style={{ width: 32, height: 32, background: status === 'paused' ? accent : surface, color: status === 'paused' ? 'white' : textMuted }}
          title={status === 'paused' ? 'Continuar' : 'Ouvir'}
        >
          <Play size={13} />
        </button>
      )}

      {/* Stop */}
      {status !== 'idle' && (
        <button
          onClick={handleStop}
          className={btnBase}
          style={{ width: 28, height: 28, background: surface, color: textMuted }}
          title="Parar"
        >
          <Square size={11} />
        </button>
      )}

      {/* Speed selector */}
      <div className="flex items-center gap-1 ml-1">
        {SPEEDS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => {
              setSpeedIdx(i)
              // If playing, restart with new speed
              if (status === 'playing') {
                window.speechSynthesis.cancel()
                setStatus('idle')
              }
            }}
            className="text-xs px-2 py-0.5 rounded-full transition-all"
            style={{
              background: speedIdx === i ? `${accent}20` : 'transparent',
              color: speedIdx === i ? accent : textMuted,
              fontWeight: speedIdx === i ? 600 : 400,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {status === 'playing' && (
        <span className="text-xs ml-1 animate-pulse" style={{ color: accent }}>
          🔊 A ler…
        </span>
      )}
      {status === 'paused' && (
        <span className="text-xs ml-1" style={{ color: textMuted }}>
          ⏸ Pausado
        </span>
      )}
    </div>
  )
}
