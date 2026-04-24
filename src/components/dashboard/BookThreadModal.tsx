import { useEffect, useRef, useState } from 'react'
import { X, Send, BookMarked, Trash2, Loader2, MessageSquare } from 'lucide-react'
import { api } from '@/lib/api'
import { bookThreadKey } from '@/lib/bookThread'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'

interface BookComment {
  id: string
  threadKey: string
  autorId: string
  autorNome: string
  autorAt: string
  conteudo: string
  data: string
}

interface Props {
  titulo: string
  autor: string
  onClose: () => void
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora mesmo'
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return `há ${d}d`
}

export default function BookThreadModal({ titulo, autor, onClose }: Props) {
  const threadKey = bookThreadKey(titulo, autor)
  const { studentId, studentName, studentHandle } = useStudentAuthStore()
  const students = useAdminStore((s) => s.students)
  const [comments, setComments] = useState<BookComment[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Quem está a ler/leu este livro no clube.
  const readers = students.filter((s) => {
    const inAll = s.allBooks?.some((b) => bookThreadKey(b.titulo, b.autor) === threadKey)
    const inShared = s.sharedBooks?.some((b) => bookThreadKey(b.titulo, b.autor) === threadKey)
    return inAll || inShared
  })

  async function load() {
    setLoading(true)
    const data = await api.getBookComments(threadKey)
    setComments(data as BookComment[])
    setLoading(false)
    // scroll para o fim ao carregar
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  useEffect(() => { load() /* eslint-disable-line */ }, [threadKey])

  async function send() {
    if (!studentId || !draft.trim() || sending) return
    setSending(true)
    const text = draft.trim()
    setDraft('')
    try {
      const created = await api.addBookComment({
        threadKey,
        autorId: studentId,
        autorNome: studentName ?? 'Aluno',
        autorAt: studentHandle ?? '',
        conteudo: text,
      })
      setComments((prev) => [...prev, created as BookComment])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch {
      setDraft(text) // devolve o rascunho se falhar
    } finally {
      setSending(false)
    }
  }

  async function remove(id: string) {
    await api.deleteBookComment(id)
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 60px rgba(15,23,42,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div
            className="shrink-0 w-12 h-16 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(99,143,255,0.14), rgba(167,139,250,0.14))',
              border: '1px solid rgba(99,143,255,0.2)',
            }}
          >
            <BookMarked size={18} style={{ color: '#6270f5' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: 'var(--text-muted)' }}>
              Conversa do clube
            </p>
            <h3 className="text-base font-display font-bold leading-tight mt-0.5" style={{ color: 'var(--text)' }}>
              {titulo}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              de {autor}
            </p>
            {readers.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <div className="flex -space-x-1.5">
                  {readers.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: 'rgba(98,112,245,0.16)',
                        color: '#6270f5',
                        border: '2px solid var(--surface)',
                      }}
                      title={r.name}
                    >
                      {r.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {readers.length} {readers.length === 1 ? 'leitor' : 'leitores'} no clube
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70 shrink-0">
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ background: 'var(--surface-2)' }}>
          {loading ? (
            <div className="text-center py-6">
              <Loader2 size={18} className="mx-auto animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare size={28} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Ainda sem comentários
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Sê o primeiro a partilhar o que achas deste livro.
              </p>
            </div>
          ) : (
            comments.map((c) => <CommentRow key={c.id} comment={c} meId={studentId} onDelete={() => remove(c.id)} />)
          )}
          <div ref={bottomRef} />
        </div>

        {/* Compose */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send() }
              }}
              placeholder="Escreve um comentário…"
              rows={2}
              className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
            />
            <button
              onClick={send}
              disabled={!draft.trim() || sending}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
              style={{
                background: !draft.trim() || sending ? 'var(--surface-2)' : 'linear-gradient(135deg, #6270f5, #4f4de8)',
                color: !draft.trim() || sending ? 'var(--text-muted)' : 'white',
                boxShadow: !draft.trim() || sending ? undefined : '0 4px 14px rgba(98,112,245,0.35)',
              }}
              title="Enviar (Ctrl+Enter)"
            >
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommentRow({
  comment,
  meId,
  onDelete,
}: {
  comment: BookComment
  meId: string | null
  onDelete: () => void
}) {
  const isMine = meId != null && comment.autorId === meId
  return (
    <div
      className="p-3 rounded-2xl"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
      }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(98,112,245,0.18), rgba(167,139,250,0.18))',
            color: '#6270f5',
            border: '1px solid rgba(98,112,245,0.18)',
          }}
        >
          {comment.autorNome.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{comment.autorNome}</span>
            {comment.autorAt && (
              <span className="text-xs" style={{ color: '#6270f5' }}>@{comment.autorAt}</span>
            )}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {timeAgo(comment.data)}</span>
          </div>
          <p className="text-sm whitespace-pre-line mt-1" style={{ color: 'var(--text)' }}>
            {comment.conteudo}
          </p>
        </div>
        {isMine && (
          <button onClick={onDelete} className="p-1 rounded-lg hover:opacity-70 shrink-0" title="Apagar">
            <Trash2 size={12} style={{ color: '#ef4444' }} />
          </button>
        )}
      </div>
    </div>
  )
}
