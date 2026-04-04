import { useState, useRef } from 'react'
import type { Lesson, AudioContent } from '@/types'
import { useStore } from '@/store/useStore'
import { Play, Pause, Volume2, CheckCircle2 } from 'lucide-react'

interface Props { lesson: Lesson; onComplete: (score: number, xp: number) => void }

export default function AudioLesson({ lesson, onComplete }: Props) {
  const { completeLesson } = useStore()
  const content = lesson.content as AudioContent
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [hasListened, setHasListened] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      // Simulate playback for demo (no real audio file)
      setIsPlaying(true)
      const interval = setInterval(() => {
        setCurrentTime((t) => {
          const newT = t + 1
          setProgress((newT / content.duration) * 100)
          if (newT >= content.duration) {
            clearInterval(interval)
            setIsPlaying(false)
            setHasListened(true)
          }
          return newT
        })
      }, 100) // Fast for demo
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  const handleComplete = () => {
    completeLesson(lesson.id, 100, Math.round(content.duration / 60))
    onComplete(100, lesson.xpReward)
  }

  return (
    <div className="animate-slide-up space-y-5">
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Volume2 size={18} style={{ color: 'var(--primary)' }} />
          <h2 className="text-lg font-display font-bold text-white">{lesson.title}</h2>
        </div>

        {/* Player */}
        <div className="audio-player flex-col gap-3">
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6270f5, #4f4de8)' }}
            >
              {isPlaying ? <Pause size={18} className="force-white" /> : <Play size={18} className="force-white ml-0.5" />}
            </button>

            <div className="flex-1">
              <div
                className="h-2 rounded-full cursor-pointer relative"
                style={{ background: 'rgba(99,143,255,0.15)' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6270f5, #a78bfa)' }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(content.duration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div
          className="mt-4 p-4 rounded-xl text-sm"
          style={{ background: 'rgba(99,143,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <p className="font-semibold text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--primary)' }}>
            Transcrição
          </p>
          <p className="leading-relaxed">{content.transcript}</p>
        </div>
      </div>

      {/* Key points */}
      <div className="card">
        <h3 className="font-display font-semibold text-white mb-3">💡 Pontos-chave</h3>
        <ul className="space-y-2">
          {content.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" style={{ color: '#10b981' }} />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleComplete}
        className="btn-primary w-full"
        disabled={!hasListened}
        style={!hasListened ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
      >
        {hasListened ? 'Concluir aula ✓' : 'Ouve o áudio para continuar'}
      </button>
    </div>
  )
}
