import { useState } from 'react'
import { useStore, type Book } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import {
  BookMarked, Plus, Pencil, Trash2, CheckCircle2, X,
  BookOpen, Search, Flame, Zap, User, Share2, List, UserPlus, UserMinus,
} from 'lucide-react'

type Tab = 'lendo' | 'lido'

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

function BookFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Book
  onSave: (titulo: string, autor: string, capa: string) => void
  onClose: () => void
}) {
  const [titulo, setTitulo] = useState(initial?.titulo ?? '')
  const [autor, setAutor] = useState(initial?.autor ?? '')
  const [capa, setCapa] = useState(initial?.capa ?? '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
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
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Capa (URL — opcional)</label>
            <input
              value={capa}
              onChange={(e) => setCapa(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => { if (titulo.trim() && autor.trim()) onSave(titulo.trim(), autor.trim(), capa.trim()) }}
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
            <div className="text-center space-y-2">
              <CheckCircle2 size={36} className="mx-auto" style={{ color: '#10b981' }} />
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>
                Já terminaste <em>{book.titulo}</em>!
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Queres escrever um resumo e partilhar com os teus colegas?
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => setStep('resumo')}
                className="btn-primary flex items-center justify-center gap-2 py-3"
              >
                <BookOpen size={15} /> Sim, quero partilhar
              </button>
              <button
                onClick={() => onDone(undefined, false)}
                className="flex items-center justify-center py-3 rounded-xl text-sm font-semibold"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                Não, guardar só para mim
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold" style={{ color: 'var(--text)' }}>Escreve o teu resumo</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70">
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              O resumo ficará visível no teu perfil e poderá ser visto pelos teus colegas.
            </p>
            <textarea
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              placeholder="O que achaste do livro? Do que fala? O que aprendeste?"
              rows={5}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-y"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => onDone(resumo.trim() || undefined, true)}
                className="btn-primary flex-1"
              >
                Partilhar resumo
              </button>
              <button
                onClick={() => onDone(undefined, false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                Sem resumo
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
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <>
      {editing && (
        <BookFormModal
          initial={book}
          onSave={(titulo, autor, capa) => {
            updateBook(book.id, { titulo, autor, capa: capa || undefined })
            setEditing(false)
          }}
          onClose={() => setEditing(false)}
        />
      )}

      <div
        className="card flex gap-4"
        style={{ borderColor: book.partilhado ? 'rgba(16,185,129,0.2)' : undefined }}
      >
        {/* Capa */}
        <div
          className="shrink-0 w-14 h-20 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ background: 'rgba(98,112,245,0.08)', border: '1px solid var(--border)' }}
        >
          {book.capa ? (
            <img src={book.capa} alt={book.titulo} className="w-full h-full object-cover" />
          ) : (
            <BookMarked size={22} style={{ color: '#6270f5', opacity: 0.5 }} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold leading-tight truncate" style={{ color: 'var(--text)' }}>{book.titulo}</p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{book.autor}</p>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {book.status === 'lido' && book.dataFim
              ? `Lido em ${formatDate(book.dataFim)}`
              : `A ler desde ${formatDate(book.dataInicio)}`}
          </p>
          {book.partilhado && (
            <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              partilhado
            </span>
          )}
          {book.resumo && !book.partilhado && (
            <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{book.resumo}</p>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-slate-100/10" title="Editar">
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
              <button onClick={() => setConfirmDelete(false)}>
                <X size={13} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="p-1.5 rounded-lg hover:bg-slate-100/10" title="Eliminar">
              <Trash2 size={13} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
          {book.status === 'lendo' && (
            <button
              onClick={() => onMarkRead(book)}
              className="mt-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
              title="Marcar como lido"
            >
              <CheckCircle2 size={12} /> Lido
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// ── Modal: Perfil público de colega ──────────────────────────────────────────

function ColleagueModal({
  handle,
  onClose,
}: {
  handle: string
  onClose: () => void
}) {
  const students = useAdminStore((s) => s.students)
  const { getFriends, addFriend, removeFriend } = useStore()
  const { studentId } = useStudentAuthStore()
  const student = students.find((s) => s.login.split('@')[0].toLowerCase() === handle.toLowerCase())
  const friendIds = getFriends()
  const isFriend = student ? friendIds.includes(student.id) : false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold" style={{ color: 'var(--text)' }}>Perfil público</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70">
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {!student ? (
          <div className="text-center py-8">
            <User size={32} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold" style={{ color: 'var(--text)' }}>Colega não encontrado</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Nenhum aluno com o @ <strong>@{handle}</strong>.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
                style={{ background: 'rgba(98,112,245,0.12)', color: '#6270f5' }}
              >
                {student.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold" style={{ color: 'var(--text)' }}>{student.name}</p>
                <p className="text-sm" style={{ color: '#6270f5' }}>@{student.login.split('@')[0]}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{student.school} · {student.grade}</p>
              </div>
              {student.id !== studentId && (
                <button
                  onClick={() => isFriend ? removeFriend(student.id) : addFriend(student.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0"
                  style={{
                    background: isFriend ? 'rgba(239,68,68,0.08)' : 'rgba(98,112,245,0.1)',
                    color: isFriend ? '#ef4444' : '#6270f5',
                    border: `1px solid ${isFriend ? 'rgba(239,68,68,0.2)' : 'rgba(98,112,245,0.2)'}`,
                  }}
                >
                  {isFriend ? <><UserMinus size={12} /> Remover</> : <><UserPlus size={12} /> Adicionar</>}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="px-3 py-2.5 rounded-xl text-center" style={{ background: 'var(--surface-2)' }}>
                <Zap size={16} className="mx-auto mb-1" style={{ color: '#a78bfa' }} />
                <p className="text-base font-bold" style={{ color: 'var(--text)' }}>{student.xp}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>XP</p>
              </div>
              <div className="px-3 py-2.5 rounded-xl text-center" style={{ background: 'var(--surface-2)' }}>
                <Flame size={16} className="mx-auto mb-1" style={{ color: '#f59e0b' }} />
                <p className="text-base font-bold" style={{ color: 'var(--text)' }}>{student.streak}d</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sequência</p>
              </div>
            </div>

            {/* Lista completa (se partilhada) */}
            {student.listaPartilhada && student.allBooks && student.allBooks.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Lista de leituras</p>
                <div className="flex flex-col gap-1.5">
                  {student.allBooks.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0" style={{ background: b.status === 'lido' ? 'rgba(16,185,129,0.1)' : 'rgba(98,112,245,0.1)', color: b.status === 'lido' ? '#10b981' : '#6270f5' }}>
                        {b.status === 'lido' ? 'lido' : 'a ler'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{b.titulo}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.autor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumos partilhados */}
            {(student.sharedBooks?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  Resumos partilhados ({student.sharedBooks!.length})
                </p>
                <div className="flex flex-col gap-3">
                  {student.sharedBooks!.map((b) => (
                    <div key={b.bookId} className="p-3 rounded-xl space-y-1" style={{ background: 'var(--surface-2)' }}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{b.titulo}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.autor}</p>
                      {b.resumo && <p className="text-xs mt-1.5" style={{ color: 'var(--text)' }}>{b.resumo}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!student.listaPartilhada && !student.sharedBooks?.length && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ainda não partilhou nada.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function BooksPage() {
  const { getBooks, addBook, markBookRead } = useStore()
  const { studentId, studentName, studentHandle } = useStudentAuthStore()
  const { addFeedItem, toggleStudentListShare, students } = useAdminStore()
  const books = getBooks()

  const student = students.find((s) => s.id === studentId)
  const listaPartilhada = student?.listaPartilhada ?? false

  const [tab, setTab] = useState<Tab>('lendo')
  const [adding, setAdding] = useState(false)
  const [markingBook, setMarkingBook] = useState<Book | null>(null)
  const [searchHandle, setSearchHandle] = useState('')
  const [lookupHandle, setLookupHandle] = useState<string | null>(null)

  const lendo = books.filter((b) => b.status === 'lendo')
  const lidos = books.filter((b) => b.status === 'lido')
  const shown = tab === 'lendo' ? lendo : lidos

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
      })
    }
    setMarkingBook(null)
    setTab('lido')
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
    }
  }

  function handleSearch() {
    const h = searchHandle.replace(/^@/, '').trim()
    if (h) setLookupHandle(h)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <BookMarked size={22} style={{ color: '#6270f5' }} /> Os meus livros
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Regista o que estás a ler e partilha resumos com os teus colegas.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleToggleList}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: listaPartilhada ? 'rgba(16,185,129,0.12)' : 'var(--surface-2)',
              color: listaPartilhada ? '#10b981' : 'var(--text-muted)',
              border: `1px solid ${listaPartilhada ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
            }}
            title={listaPartilhada ? 'Lista visível no perfil público — clica para deixar de partilhar' : 'Partilhar lista no perfil público'}
          >
            {listaPartilhada ? <List size={14} /> : <Share2 size={14} />}
            {listaPartilhada ? 'Lista partilhada' : 'Partilhar lista'}
          </button>
          <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Adicionar livro
          </button>
        </div>
      </div>

      {/* Encontrar colega */}
      <div className="card">
        <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Encontrar colega</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>@</span>
            <input
              value={searchHandle}
              onChange={(e) => setSearchHandle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={`${studentHandle ?? 'nometudante'}`}
              className="w-full pl-7 pr-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}
          >
            <Search size={14} /> Ver perfil
          </button>
        </div>
        {studentHandle && (
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            O teu @ é <span className="font-semibold" style={{ color: '#6270f5' }}>@{studentHandle}</span>
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl p-1" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        {([['lendo', 'A ler', lendo.length], ['lido', 'Lidos', lidos.length]] as const).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
            style={{
              background: tab === key ? 'var(--surface)' : 'transparent',
              color: tab === key ? 'var(--text)' : 'var(--text-muted)',
              boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {label}
            {count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: tab === key ? 'rgba(98,112,245,0.12)' : 'var(--border)', color: tab === key ? '#6270f5' : 'var(--text-muted)' }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {shown.length === 0 ? (
        <div className="card text-center py-12">
          <BookMarked size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--text)' }}>
            {tab === 'lendo' ? 'Nenhum livro em leitura' : 'Ainda não terminaste nenhum livro'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {tab === 'lendo' ? 'Adiciona o livro que estás a ler.' : 'Marca um livro como lido para aparecer aqui.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map((book) => (
            <BookCard key={book.id} book={book} onMarkRead={setMarkingBook} />
          ))}
        </div>
      )}

      {/* Modais */}
      {adding && (
        <BookFormModal
          onSave={(titulo, autor, capa) => { addBook({ titulo, autor, capa: capa || undefined }); setAdding(false) }}
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

      {lookupHandle && (
        <ColleagueModal handle={lookupHandle} onClose={() => setLookupHandle(null)} />
      )}
    </div>
  )
}
