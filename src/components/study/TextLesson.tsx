import { useState } from 'react'
import type { Lesson, TextContent } from '@/types'
import { useStore } from '@/store/useStore'
import { CheckCircle2 } from 'lucide-react'
import TextToSpeech from '@/components/ui/TextToSpeech'

interface Props { lesson: Lesson; onComplete: (score: number, xp: number) => void }

export default function TextLesson({ lesson, onComplete }: Props) {
  const { completeLesson } = useStore()
  const content = lesson.content as TextContent
  const [startTime] = useState(Date.now())

  const handleComplete = () => {
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 60000))
    completeLesson(lesson.id, 100, duration)
    onComplete(100, lesson.xpReward)
  }

  // Simple markdown-like rendering
  const renderBody = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-display font-bold text-white mt-4 mb-2">{line.slice(3)}</h2>
      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-display font-semibold text-white mt-3 mb-1.5">{line.slice(4)}</h3>
      if (line.startsWith('> ')) return (
        <blockquote key={i} className="border-l-2 pl-4 my-2 italic" style={{ borderColor: 'var(--primary)', color: 'var(--text-muted)' }}>
          {line.slice(2)}
        </blockquote>
      )
      if (line.startsWith('- ')) return <li key={i} className="ml-4 text-slate-300" style={{ listStyleType: 'disc' }}>{line.slice(2)}</li>
      if (line === '') return <br key={i} />
      // Bold
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      return (
        <p key={i} className="text-slate-300 leading-relaxed">
          {parts.map((part, j) =>
            part.startsWith('**') ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong> : part
          )}
        </p>
      )
    })
  }

  return (
    <div className="animate-slide-up space-y-5">
      <div className="card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-xl font-display font-bold text-white">{lesson.title}</h2>
        </div>
        <TextToSpeech text={`${lesson.title}. ${content.body}. Pontos-chave: ${content.keyPoints.join('. ')}`} />
        <div className="space-y-1.5 mt-4">{renderBody(content.body)}</div>
      </div>

      {/* Key points */}
      <div className="card">
        <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
          <span>💡</span> Pontos-chave
        </h3>
        <ul className="space-y-2">
          {content.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" style={{ color: '#10b981' }} />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleComplete} className="btn-primary w-full">
        Marcar como concluído ✓
      </button>
    </div>
  )
}
