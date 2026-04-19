import { useState } from 'react'
import { AlertTriangle, Check, Loader2, X } from 'lucide-react'
import { api } from '@/lib/api'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'

interface Props {
  context: 'plan' | 'day' | 'app'
  planId?: string
  planTitle?: string
  diaNumber?: number
  diaTitle?: string
  /** Texto opcional a renderizar dentro do botão compacto. Default: "Reportar problema". */
  label?: string
}

export default function ReportProblemButton({ context, planId, planTitle, diaNumber, diaTitle, label = 'Reportar problema' }: Props) {
  const studentId = useStudentAuthStore((s) => s.studentId)
  const studentName = useStudentAuthStore((s) => s.studentName)
  const students = useAdminStore((s) => s.students)
  const handle = students.find((s) => s.id === studentId)?.handle

  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setText('')
    setDone(false)
    setError('')
  }

  async function submit() {
    if (!studentId || !text.trim()) return
    setSending(true)
    setError('')
    try {
      await api.submitReport({
        studentId,
        studentName: studentName ?? undefined,
        studentHandle: handle,
        context,
        planId,
        planTitle,
        diaNumber,
        diaTitle,
        description: text,
      })
      setDone(true)
      setTimeout(() => { setOpen(false); reset() }, 1800)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro a enviar report')
    }
    setSending(false)
  }

  return (
    <>
      <button onClick={() => { reset(); setOpen(true) }}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#b45309' }}>
        <AlertTriangle size={12} /> {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => !sending && setOpen(false)}>
          <div className="w-full max-w-md rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                Reportar problema
              </h3>
              <button onClick={() => !sending && setOpen(false)} className="p-1 rounded">
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {done ? (
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{ background: 'rgba(16,185,129,0.12)' }}>
                  <Check size={18} style={{ color: '#10b981' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Obrigado!</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  O teu report foi enviado à equipa.
                </p>
              </div>
            ) : (
              <>
                {(planTitle || diaTitle) && (
                  <div className="mb-3 p-2 rounded-lg text-xs" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                    <p><strong style={{ color: 'var(--text)' }}>Contexto:</strong> {planTitle ?? 'Geral'}{diaNumber ? ` · Dia ${diaNumber}` : ''}{diaTitle ? ` · ${diaTitle}` : ''}</p>
                  </div>
                )}
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>
                  O que aconteceu?
                </label>
                <textarea value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="Ex: a resposta correcta do quiz está trocada, o tema do dia está incompleto, etc."
                  rows={5}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                {error && (
                  <p className="text-xs mt-2 p-2 rounded" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
                    {error}
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => !sending && setOpen(false)} disabled={sending}
                    className="flex-1 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    Cancelar
                  </button>
                  <button onClick={submit} disabled={sending || !text.trim()}
                    className="flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
                    style={{ background: '#f59e0b', color: 'white', opacity: (sending || !text.trim()) ? 0.6 : 1 }}>
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                    Enviar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
