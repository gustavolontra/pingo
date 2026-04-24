import { useState, useEffect } from 'react'
import { useStore, type Book } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import {
  BookMarked, Plus, Pencil, Trash2, CheckCircle2, X,
  BookOpen, Share2, List, MessageSquare,
} from 'lucide-react'
import BookThreadModal from '@/components/dashboard/BookThreadModal'


// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
}

function syncSharedBooks(studentId: string, books: Book[]) {
  const shared = books
    .filter((b) => b.partilhado && b.status === 'lido')
    .map((b) => ({
      bookId: b.id,
      titulo: b.titulo,
      autor: b.autor,
      resumo: b.resumo ?? '',
      dataFim: b.dataFim ?? '',
    }))
  useAdminStore.getState().updateStudentSharedBooks(studentId, shared)
}

// ── Modal: Adicionar / Editar ─────────────────────────────────────────────────

interface BookFormSave {
  titulo: string
  autor: string
  resumo?: string
  partilhado?: boolean
}

function BookFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Book
  onSave: (data: BookFormSave) => void
  onClose: () => void
}) {
  const [titulo, setTitulo] = useState(initial?.titulo ?? '')
  const [autor, setAutor] = useState(initial?.autor ?? '')
  const [resumo, setResumo] = useState(initial?.resumo ?? '')
  const [partilhado, setPartilhado] = useState(initial?.partilhado ?? false)

  const isLido = initial?.status === 'lido'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>
            {initial ? 'Editar livro' : 'Adicionar livro'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70">
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Título *</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="O Nome do Vento"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Autor *</label>
            <input
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Patrick Rothfuss"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>

          {isLido && (
            <>
              <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <label className="block text-sm font-medium mb-1.5 mt-2" style={{ color: 'var(--text-muted)' }}>
                  Resumo
                </label>
                <textarea
                  value={resumo}
                  onChange={(e) => setResumo(e.target.value)}
                  placeholder="O que achaste do livro? Deixa em branco para remover."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-y"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
              <label className="flex items-start gap-2 cursor-pointer p-3 rounded-xl"
                style={{ background: partilhado ? 'rgba(16,185,129,0.08)' : 'var(--surface-2)',
                         border: `1px solid ${partilhado ? 'rgba(16,185,129,0.25)' : 'var(--border)'}` }}>
                <input type="checkbox" checked={partilhado}
                  onChange={(e) => setPartilhado(e.target.checked)}
                  className="accent-[#10b981] mt-0.5"
                  disabled={!resumo.trim()} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Partilhar com colegas
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {resumo.trim()
                      ? 'O resumo ficará visível no feed dos teus colegas.'
                      : 'Escreve um resumo para poder partilhar.'}
                  </p>
                </div>
              </label>
            </>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => {
              if (!titulo.trim() || !autor.trim()) return
              onSave({
                titulo: titulo.trim(),
                autor: autor.trim(),
                resumo: isLido ? (resumo.trim() || undefined) : undefined,
                partilhado: isLido ? (partilhado && !!resumo.trim()) : undefined,
              })
            }}
            disabled={!titulo.trim() || !autor.trim()}
            className="btn-primary flex-1"
            style={{ opacity: !titulo.trim() || !autor.trim() ? 0.5 : 1 }}
          >
            {initial ? 'Guardar' : 'Adicionar'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal: Marcar como lido ───────────────────────────────────────────────────

function MarkReadModal({
  book,
  onDone,
  onClose,
}: {
  book: Book
  onDone: (resumo: string | undefined, partilhado: boolean) => void
  onClose: () => void
}) {
  const [step, setStep] = useState<'ask' | 'resumo'>('ask')
  const [resumo, setResumo] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {step === 'ask' ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                <h3 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
                  Já terminaste <em>{book.titulo}</em>!
                </h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70" title="Cancelar">
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Queres escrever um resumo? Podes partilhá-lo com os teus colegas ou guardá-lo só para ti.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => setStep('resumo')}
                className="btn-primary flex items-center justify-center gap-2 py-3"
              >
                <BookOpen size={15} /> Escrever resumo
              </button>
              <button
                onClick={() => onDone(undefined, false)}
                className="flex items-center justify-center py-3 rounded-xl text-sm font-semibold"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                Só marcar como lido
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center py-2 rounded-xl text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold" style={{ color: 'var(--text)' }}>Escreve o teu resumo</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70" title="Cancelar">
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              O resumo fica sempre visível no teu perfil. Se partilhares, os teus colegas também podem ver.
            </p>
            <textarea
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              placeholder="O que achaste do livro? Do que fala? O que aprendeste?"
              rows={5}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-y"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onDone(resumo.trim() || undefined, true)}
                disabled={!resumo.trim()}
                className="btn-primary py-2.5"
                style={{ opacity: resumo.trim() ? 1 : 0.5 }}
              >
                Partilhar resumo com colegas
              </button>
              <button
                onClick={() => onDone(resumo.trim() || undefined, false)}
                className="py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
              >
                Guardar só para mim
              </button>
              <button
                onClick={() => setStep('ask')}
                className="py-2 rounded-xl text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                ← Voltar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Card de livro ─────────────────────────────────────────────────────────────

function BookCard({
  book,
  onMarkRead,
}: {
  book: Book
  onMarkRead: (book: Book) => void
}) {
  const { updateBook, deleteBook } = useStore()
  const { studentId, studentName, studentHandle } = useStudentAuthStore()
  const { feedItems, addFeedItem, deleteFeedItem } = useAdminStore()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showThread, setShowThread] = useState(false)

  function handleSave(data: BookFormSave) {
    const wasShared = book.partilhado
    const oldResumo = book.resumo ?? ''
    const newResumo = data.resumo ?? ''
    const nowShared = data.partilhado ?? false

    updateBook(book.id, {
      titulo: data.titulo,
      autor: data.autor,
      resumo: data.resumo,
      partilhado: nowShared,
    })

    // Sincroniza feed se algo relevante para os colegas mudou.
    const resumoMudou = oldResumo !== newResumo
    const partilhaMudou = wasShared !== nowShared
    if (book.status === 'lido' && (resumoMudou || partilhaMudou)) {
      // Remove posts existentes sobre este livro (tanto por bookId como por título).
      const orphans = feedItems.filter((f) =>
        f.autorId === studentId && (
          f.bookId === book.id ||
          (f.tipo === 'resumo' && f.conteudo.includes(`"${book.titulo}"`))
        ),
      )
      for (const f of orphans) deleteFeedItem(f.id)

      // Recria se continua partilhado com resumo.
      if (nowShared && newResumo && studentId) {
        addFeedItem({
          autorId: studentId,
          autorNome: studentName ?? 'Aluno',
          autorAt: studentHandle ?? '',
          tipo: 'resumo',
          conteudo: `leu "${data.titulo}" de ${data.autor}\n\n"${newResumo}"`,
          bookId: book.id,
        })
      }
    }
    setEditing(false)
  }

  return (
    <>
      {editing && (
        <BookFormModal
          initial={book}
          onSave={handleSave}
          onClose={() => setEditing(false)}
        />
      )}

      <div className="group relative rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: 'var(--surface)',
          border: `1px solid ${book.partilhado ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
          boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 2px 6px rgba(15,23,42,0.04)',
        }}>
        {/* Status badge no topo-direito */}
        <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
          style={{
            background: book.status === 'lido' ? 'rgba(16,185,129,0.12)' : 'rgba(99,143,255,0.12)',
            color: book.status === 'lido' ? '#10b981' : '#6270f5',
          }}>
          {book.status === 'lido' ? 'Lido' : 'A ler'}
        </span>

        <div className="flex gap-3">
          {/* Capa */}
          <div className="shrink-0 w-14 h-20 rounded-xl overflow-hidden flex items-center justify-center"
            style={{
              background: book.status === 'lido'
                ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))'
                : 'linear-gradient(135deg, rgba(99,143,255,0.14), rgba(167,139,250,0.12))',
              border: '1px solid var(--border)',
            }}>
            {book.capa ? (
              <img src={book.capa} alt={book.titulo} className="w-full h-full object-cover" />
            ) : (
              <BookMarked size={22} style={{ color: book.status === 'lido' ? '#10b981' : '#6270f5', opacity: 0.6 }} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pr-14">
            <p className="font-semibold leading-tight truncate text-[15px]" style={{ color: 'var(--text)' }}>{book.titulo}</p>
            <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{book.autor}</p>
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              {book.status === 'lido' && book.dataFim
                ? <>✓ Lido em {formatDate(book.dataFim)}</>
                : <>📖 A ler desde {formatDate(book.dataInicio)}</>}
            </p>
            {book.partilhado && (
              <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                partilhado com colegas
              </span>
            )}
            {book.resumo && (
              <p className="text-xs mt-2 line-clamp-3 pl-3 py-1"
                style={{ color: 'var(--text-muted)', borderLeft: '2px solid rgba(99,143,255,0.25)' }}>
                {book.resumo}
              </p>
            )}
          </div>
        </div>

        {/* Ações no rodapé */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Editar">
              <Pencil size={13} style={{ color: 'var(--text-muted)' }} />
            </button>
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => deleteBook(book.id)}
                  className="px-2 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: '#ef444420', color: '#ef4444' }}
                >
                  Confirmar
                </button>
                <button onClick={() => setConfirmDelete(false)} className="p-1 rounded">
                  <X size={12} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
                <Trash2 size={13} style={{ color: '#ef4444' }} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowThread(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5', border: '1px solid rgba(98,112,245,0.2)' }}
              title="Comentar no clube"
            >
              <MessageSquare size={12} /> Comentar
            </button>
            {book.status === 'lendo' && (
              <button
                onClick={() => onMarkRead(book)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}
                title="Marcar como lido"
              >
                <CheckCircle2 size={12} /> Marcar lido
              </button>
            )}
          </div>
        </div>
      </div>

      {showThread && (
        <BookThreadModal
          titulo={book.titulo}
          autor={book.autor}
          onClose={() => setShowThread(false)}
        />
      )}
    </>
  )
}

// ── Coluna por estado ─────────────────────────────────────────────────────────

function BooksColumn({
  title, icon, accent, books, onMarkRead, emptyText,
}: {
  title: string
  icon: string
  accent: string
  books: Book[]
  onMarkRead: (book: Book) => void
  emptyText: string
}) {
  return (
    <div className="rounded-2xl p-4 md:p-5"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{ background: `${accent}20`, color: accent }}>
            {icon}
          </span>
          {title}
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${accent}18`, color: accent }}>
          {books.length}
        </span>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-10 rounded-xl" style={{ background: 'var(--surface)' }}>
          <BookMarked size={26} className="mx-auto mb-2 opacity-25" style={{ color: 'var(--text-muted)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{emptyText}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onMarkRead={onMarkRead} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function BooksPage() {
  const { getBooks, addBook, markBookRead } = useStore()
  const { studentId, studentName, studentHandle } = useStudentAuthStore()
  const { addFeedItem, toggleStudentListShare, students, feedItems, deleteFeedItem } = useAdminStore()
  const books = getBooks()

  const student = students.find((s) => s.id === studentId)
  const listaPartilhada = student?.listaPartilhada ?? false

  const [adding, setAdding] = useState(false)
  const [markingBook, setMarkingBook] = useState<Book | null>(null)

  const lendo = books.filter((b) => b.status === 'lendo')
  const lidos = books.filter((b) => b.status === 'lido')

  // Auto-heal: se `listaPartilhada` está ativo mas o post no feed nunca foi
  // persistido (POST falhou em algum momento), recria-o agora para que
  // colegas possam reagir. Corre uma única vez por montagem.
  useEffect(() => {
    if (!studentId || !listaPartilhada || books.length === 0) return
    const hasListaPost = feedItems.some((f) => f.autorId === studentId && f.tipo === 'lista')
    if (hasListaPost) return
    addFeedItem({
      autorId: studentId,
      autorNome: studentName ?? 'Aluno',
      autorAt: studentHandle ?? '',
      tipo: 'lista',
      conteudo: `partilhou a sua lista de leituras (${books.length} livro${books.length !== 1 ? 's' : ''})`,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, listaPartilhada])

  function handleMarkDone(resumo: string | undefined, partilhado: boolean) {
    if (!markingBook || !studentId) return
    markBookRead(markingBook.id, resumo, partilhado)
    const updated = books.map((b) =>
      b.id === markingBook.id
        ? { ...b, status: 'lido' as const, dataFim: new Date().toISOString().split('T')[0], resumo, partilhado }
        : b
    )
    syncSharedBooks(studentId, updated)
    if (partilhado && resumo) {
      addFeedItem({
        autorId: studentId,
        autorNome: studentName ?? 'Aluno',
        autorAt: studentHandle ?? '',
        tipo: 'resumo',
        conteudo: `leu "${markingBook.titulo}" de ${markingBook.autor}${resumo ? `\n\n"${resumo}"` : ''}`,
        bookId: markingBook.id,
      })
    }
    setMarkingBook(null)
  }

  function handleToggleList() {
    if (!studentId) return
    const next = !listaPartilhada
    const allBooks = books.map((b) => ({ titulo: b.titulo, autor: b.autor, status: b.status }))
    toggleStudentListShare(studentId, next, allBooks)
    if (next) {
      addFeedItem({
        autorId: studentId,
        autorNome: studentName ?? 'Aluno',
        autorAt: studentHandle ?? '',
        tipo: 'lista',
        conteudo: `partilhou a sua lista de leituras (${books.length} livro${books.length !== 1 ? 's' : ''}: ${books.slice(0, 3).map(b => `"${b.titulo}"`).join(', ')}${books.length > 3 ? '...' : ''})`,
      })
    } else {
      // Ao despartilhar, remove do feed todos os posts "lista" deste aluno.
      const mine = feedItems.filter((f) => f.autorId === studentId && f.tipo === 'lista')
      for (const f of mine) deleteFeedItem(f.id)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2.5" style={{ color: 'var(--text)' }}>
            <span className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(99,143,255,0.18), rgba(167,139,250,0.18))' }}>
              <BookMarked size={18} style={{ color: '#6270f5' }} />
            </span>
            Os meus livros
          </h2>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Regista o que estás a ler e partilha resumos com os teus colegas.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleToggleList}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: listaPartilhada ? 'rgba(16,185,129,0.12)' : 'transparent',
              color: listaPartilhada ? '#10b981' : 'var(--text-muted)',
              border: `1px solid ${listaPartilhada ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
            }}
            title={listaPartilhada ? 'Lista visível no perfil público — clica para deixar de partilhar' : 'Partilhar lista no perfil público'}
          >
            {listaPartilhada ? <List size={14} /> : <Share2 size={14} />}
            {listaPartilhada ? 'Lista partilhada' : 'Partilhar lista'}
          </button>
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #6270f5, #a78bfa)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(99,143,255,0.35)',
            }}>
            <Plus size={15} /> Adicionar livro
          </button>
        </div>
      </div>

      {/* Duas colunas: A ler | Lidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <BooksColumn
          title="A ler"
          icon="📖"
          accent="#6270f5"
          books={lendo}
          onMarkRead={setMarkingBook}
          emptyText="Adiciona o livro que estás a ler."
        />
        <BooksColumn
          title="Lidos"
          icon="✓"
          accent="#10b981"
          books={lidos}
          onMarkRead={setMarkingBook}
          emptyText="Marca um livro como lido para aparecer aqui."
        />
      </div>

      {/* Modais */}
      {adding && (
        <BookFormModal
          onSave={({ titulo, autor }) => { addBook({ titulo, autor }); setAdding(false) }}
          onClose={() => setAdding(false)}
        />
      )}

      {markingBook && (
        <MarkReadModal
          book={markingBook}
          onDone={handleMarkDone}
          onClose={() => setMarkingBook(null)}
        />
      )}

    </div>
  )
}
