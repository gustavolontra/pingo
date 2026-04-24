import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAdminStore, type Student } from '@/store/useAdminStore'
import {
  BookMarked, BookOpen, CheckCircle2, Users, Target, Sparkles, Flame,
  TrendingUp, Plus, Minus, MessageSquare,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type ModoStudent = Student & { modo?: 'estudo' | 'clube' | 'ambos' }

export default function ClubDashboardPage() {
  const { studentName } = useStudentAuthStore()
  const students = useAdminStore((s) => s.students) as ModoStudent[]
  const feedItems = useAdminStore((s) => s.feedItems)
  const getBooks = useStore((s) => s.getBooks)
  const displayName = (studentName ?? 'Leitor').split(' ')[0]

  const year = new Date().getFullYear()

  // ── Membros do clube ────────────────────────────────────────────────────────
  const clubMembers = students.filter(
    (s) => s.isActive && (s.modo === 'clube' || s.modo === 'ambos'),
  )

  // ── Agregados anuais ────────────────────────────────────────────────────────
  // Usa allBooks (lista partilhada) + sharedBooks (lidos partilhados com resumo).
  let totalALer = 0
  let totalLidosAno = 0
  for (const m of clubMembers) {
    const all = m.allBooks ?? []
    totalALer += all.filter((b) => b.status === 'lendo').length
    totalLidosAno += (m.sharedBooks ?? []).filter((b) => b.dataFim?.startsWith(String(year))).length
    // Se o aluno não partilhou lista mas tem sharedBooks lidos este ano, já entra.
  }
  // Inclui os livros do próprio aluno (que talvez ainda não tenha partilhado a lista).
  const myBooks = getBooks()
  totalALer += myBooks.filter((b) => b.status === 'lendo').length
  totalLidosAno += myBooks.filter((b) => b.status === 'lido' && (b.dataFim ?? '').startsWith(String(year))).length

  // ── Feed de leituras (só resumos + listas) ──────────────────────────────────
  const clubIds = new Set(clubMembers.map((m) => m.id))
  const readingFeed = feedItems
    .filter((f) => (f.tipo === 'resumo' || f.tipo === 'lista') && clubIds.has(f.autorId))
    .slice(0, 6)

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(99,143,255,0.18))' }}
            >
              <BookMarked size={18} style={{ color: '#10b981' }} />
            </span>
            <span
              className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}
            >
              Clube de Leitura
            </span>
          </div>
          <h2
            className="text-3xl font-display font-extrabold tracking-tight"
            style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
          >
            Olá, {displayName}! 📚
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            O que o clube está a ler, a comentar e a preparar para a próxima leitura.
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <ClubStat icon={Users} label="Membros ativos" value={clubMembers.length} color="#10b981" />
        <ClubStat icon={BookOpen} label="A ler agora" value={totalALer} color="#6270f5" />
        <ClubStat icon={CheckCircle2} label={`Lidos em ${year}`} value={totalLidosAno} color="#a78bfa" />
        <WeeklyGoalStat />
      </div>

      {/* Meta semanal (com controlo) */}
      <WeeklyGoalCard />

      {/* Membros do clube */}
      <MembersPanel members={clubMembers} />

      {/* Feed de leituras */}
      <ReadingFeed items={readingFeed} />
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function ClubStat({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: typeof Users
  label: string
  value: number | string
  color: string
  sub?: string
}) {
  return (
    <div
      className="relative rounded-2xl p-4 overflow-hidden"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${color}1a`,
        boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.04)',
      }}
    >
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-60"
        style={{ background: `radial-gradient(closest-side, ${color}20, transparent)` }}
      />
      <div className="relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
          style={{ background: `${color}18`, color }}
        >
          <Icon size={18} />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        <p
          className="text-2xl font-display font-extrabold leading-tight mt-0.5"
          style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}
        >
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-1.5" style={{ color }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

function WeeklyGoalStat() {
  const { goal, pages } = useStore((s) => s.getWeeklyReading())
  const pct = goal > 0 ? Math.min(100, Math.round((pages / goal) * 100)) : 0
  return (
    <ClubStat
      icon={Target}
      label="Meta semanal"
      value={goal > 0 ? `${pct}%` : '—'}
      color="#f59e0b"
      sub={goal > 0 ? `${pages} / ${goal} pág.` : 'Define a tua meta'}
    />
  )
}

// ── Meta semanal editável ─────────────────────────────────────────────────────

function WeeklyGoalCard() {
  const { goal, pages } = useStore((s) => s.getWeeklyReading())
  const setWeeklyReadingGoal = useStore((s) => s.setWeeklyReadingGoal)
  const addPagesRead = useStore((s) => s.addPagesRead)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(goal || ''))

  const pct = goal > 0 ? Math.min(100, Math.round((pages / goal) * 100)) : 0
  const achieved = goal > 0 && pages >= goal

  function save() {
    const n = parseInt(draft, 10)
    if (!isNaN(n)) setWeeklyReadingGoal(n)
    setEditing(false)
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <Target size={14} style={{ color: '#f59e0b' }} />
          </span>
          <div>
            <h3 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>Meta semanal de leitura</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Semana em curso · reinicia todas as segundas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              onClick={() => { setDraft(String(goal || '')); setEditing(true) }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              {goal > 0 ? 'Alterar meta' : 'Definir meta'}
            </button>
          ) : (
            <>
              <input
                type="number"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="páginas"
                min={0}
                className="w-24 px-3 py-1.5 rounded-xl text-xs outline-none"
                style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                autoFocus
              />
              <button onClick={save} className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: '#6270f5', color: 'white' }}>
                Guardar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-3xl font-display font-extrabold leading-none" style={{ color: 'var(--text)' }}>
              {pages}
              <span className="text-sm font-medium ml-1" style={{ color: 'var(--text-muted)' }}>
                / {goal || 0} páginas
              </span>
            </p>
            <p className="text-xs mt-1" style={{ color: achieved ? '#10b981' : 'var(--text-muted)' }}>
              {achieved ? '🎉 Meta alcançada!' : goal > 0 ? `Faltam ${Math.max(0, goal - pages)} páginas` : 'Define uma meta para esta semana'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => addPagesRead(-10)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              title="Remover 10 páginas"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={() => addPagesRead(10)}
              className="px-3 h-9 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}
            >
              <Plus size={14} /> 10 páginas
            </button>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: achieved
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, #f59e0b, #f97316)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Membros do clube ─────────────────────────────────────────────────────────

function MembersPanel({ members }: { members: ModoStudent[] }) {
  const navigate = useNavigate()

  if (members.length === 0) {
    return (
      <div className="card text-center py-10">
        <Users size={28} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          Nenhum membro do clube ainda
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Define alunos com modo "Clube de Leitura" no painel admin.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <Users size={14} style={{ color: '#10b981' }} />
          </span>
          <h3 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>Membros do clube</h3>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
          {members.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {members.map((m) => <MemberCard key={m.id} member={m} onOpen={() => navigate('/feed')} />)}
      </div>
    </div>
  )
}

function MemberCard({ member, onOpen }: { member: ModoStudent; onOpen: () => void }) {
  const all = member.allBooks ?? []
  const lendo = all.filter((b) => b.status === 'lendo')
  const current = lendo[0]
  const next = lendo[1]
  const lastRead = (member.sharedBooks ?? [])
    .slice()
    .sort((a, b) => (b.dataFim ?? '').localeCompare(a.dataFim ?? ''))[0]

  return (
    <button
      onClick={onOpen}
      className="group text-left p-3.5 rounded-2xl transition-all hover:-translate-y-0.5"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(99,143,255,0.18))',
            color: '#10b981',
            border: '1px solid rgba(16,185,129,0.22)',
          }}
        >
          {member.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{member.name}</p>
          {member.handle && (
            <p className="text-xs truncate" style={{ color: '#6270f5' }}>@{member.handle}</p>
          )}
        </div>
      </div>

      <MemberBookLine label="A ler" icon={BookOpen} color="#6270f5" book={current} />
      <MemberBookLine label="Próximo" icon={Sparkles} color="#a78bfa" book={next} />
      <MemberBookLine
        label="Último lido"
        icon={CheckCircle2}
        color="#10b981"
        book={lastRead ? { titulo: lastRead.titulo, autor: lastRead.autor } : undefined}
      />
    </button>
  )
}

function MemberBookLine({
  label,
  icon: Icon,
  color,
  book,
}: {
  label: string
  icon: typeof BookOpen
  color: string
  book?: { titulo: string; autor: string }
}) {
  return (
    <div className="flex items-start gap-2 text-xs py-1.5" style={{ borderTop: '1px dashed var(--border)' }}>
      <span
        className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5"
        style={{ background: `${color}14`, color }}
      >
        <Icon size={10} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        {book ? (
          <>
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{book.titulo}</p>
            <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{book.autor}</p>
          </>
        ) : (
          <p className="text-[11px] italic" style={{ color: 'var(--text-muted)' }}>
            Ainda não partilhou
          </p>
        )}
      </div>
    </div>
  )
}

// ── Feed de leituras ─────────────────────────────────────────────────────────

function ReadingFeed({ items }: { items: ReturnType<typeof useAdminStore.getState>['feedItems'] }) {
  const navigate = useNavigate()

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(98,112,245,0.12)' }}>
            <MessageSquare size={14} style={{ color: '#6270f5' }} />
          </span>
          <h3 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>Conversas do clube</h3>
        </div>
        <button
          onClick={() => navigate('/feed')}
          className="text-xs font-semibold flex items-center gap-1"
          style={{ color: '#6270f5' }}
        >
          Ver tudo <TrendingUp size={11} />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
          Ainda não há resumos nem listas partilhadas no clube.
        </p>
      ) : (
        <div className="space-y-2.5">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => navigate('/feed')}
              className="w-full text-left p-3 rounded-xl transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                  {it.autorNome}
                </span>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                  style={{
                    background: it.tipo === 'resumo' ? 'rgba(98,112,245,0.12)' : 'rgba(167,139,250,0.15)',
                    color: it.tipo === 'resumo' ? '#6270f5' : '#a78bfa',
                  }}
                >
                  {it.tipo === 'resumo' ? (
                    <><Flame size={9} className="inline mr-0.5" /> Leitura</>
                  ) : (
                    'Lista'
                  )}
                </span>
              </div>
              <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {it.conteudo.replace(/\n+/g, ' · ')}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
