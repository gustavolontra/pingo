/**
 * AdminSubjectsPage.tsx
 *
 * Mostra DUAS secções:
 *   1. "Biblioteca" — disciplinas estáticas (historia7ano, geografia7ano…) — read-only, link para editar
 *   2. "Criadas por ti" — disciplinas criadas no admin — editáveis
 *
 * O admin pode importar uma disciplina estática para o AdminStore,
 * tornando-a editável e "sua" (substitui a estática no aluno).
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminStore } from '@/store/useAdminStore'
import { STATIC_DISCIPLINES, convertAdminDiscipline } from '@/lib/contentBridge'
import type { ManagedDiscipline } from '@/store/useAdminStore'
import type { Discipline } from '@/types'
import { BookOpen, Plus, Pencil, Trash2, Download, Lock } from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────────────────────

function disciplineToManaged(d: Discipline): ManagedDiscipline {
  return {
    id: d.id,
    name: d.name,
    subject: d.subject,
    year: d.year,
    color: d.color,
    icon: d.icon,
    createdAt: new Date().toISOString(),
    topics: d.topics.map((t) => ({
      id: t.id,
      disciplineId: d.id,
      title: t.title,
      description: t.description,
      order: t.order,
      lessons: t.lessons.map((l) => ({
        id: l.id,
        topicId: t.id,
        title: l.title,
        type: l.type as 'text' | 'quiz' | 'flashcard',
        estimatedMinutes: l.estimatedMinutes,
        xpReward: l.xpReward,
        order: 0,
        content: l.content as any,
      })),
    })),
  }
}

// ── Componentes ───────────────────────────────────────────────────────────────

function DisciplineCard({
  discipline,
  isManaged,
  onImport,
  onDelete,
}: {
  discipline: Discipline | ManagedDiscipline
  isManaged: boolean
  onImport?: () => void
  onDelete?: () => void
}) {
  const d = discipline as Discipline
  const totalLessons = isManaged
    ? (discipline as ManagedDiscipline).topics.reduce(
        (acc, t) => acc + t.lessons.length, 0
      )
    : d.totalLessons

  return (
    <div
      className="rounded-xl p-5 flex items-center gap-4 transition-all"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isManaged ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
      }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ background: `${d.color}20` }}
      >
        {d.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-white truncate">{d.name}</p>
          {!isManaged && (
            <span
              className="text-xs px-1.5 py-0.5 rounded flex items-center gap-1"
              style={{ background: 'rgba(99,143,255,0.12)', color: '#a5bbfd' }}
            >
              <Lock size={10} /> Biblioteca
            </span>
          )}
          {isManaged && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}
            >
              Editável
            </span>
          )}
        </div>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {d.year}.º ano · {totalLessons} aula{totalLessons !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {isManaged ? (
          <>
            <Link
              to={`/admin/materias/${d.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              style={{ background: 'rgba(98,112,245,0.12)', color: '#a5bbfd' }}
            >
              <Pencil size={13} /> Editar
            </Link>
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg transition-all hover:opacity-80"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={onImport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <Download size={13} /> Importar e editar
          </button>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminSubjectsPage() {
  const { disciplines: adminDisciplines, createDiscipline, deleteDiscipline } = useAdminStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', subject: '', year: 7, color: '#6270f5', icon: '📚' })
  // Disciplinas estáticas que o admin ainda NÃO importou
  const adminIds = new Set(adminDisciplines.map((d) => d.id))
  const staticOnly = STATIC_DISCIPLINES.filter((d) => !adminIds.has(d.id))

  function handleCreate() {
    if (!form.name || !form.subject) return
    createDiscipline({ name: form.name, subject: form.subject, year: form.year, color: form.color, icon: form.icon })
    setShowForm(false)
    setForm({ name: '', subject: '', year: 7, color: '#6270f5', icon: '📚' })
  }

  function handleImport(d: Discipline) {
    const managed = disciplineToManaged(d)
    useAdminStore.setState((s) => ({
      disciplines: [...s.disciplines, managed],
    }))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Matérias</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Gere o conteúdo que os alunos veem
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nova matéria
        </button>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <div className="card space-y-4 animate-slide-up">
          <h3 className="font-display font-semibold text-white">Nova disciplina</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nome', key: 'name', placeholder: 'ex: Matemática' },
              { label: 'Disciplina', key: 'subject', placeholder: 'ex: Matemática' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
                <input
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Ano</label>
              <select
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                {[7, 8, 9].map((y) => <option key={y} value={y}>{y}.º ano</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Ícone</label>
              <input
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="📐"
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="btn-primary">Criar</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancelar</button>
          </div>
        </div>
      )}

      {/* Disciplinas criadas pelo admin */}
      {adminDisciplines.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Criadas por ti ({adminDisciplines.length})
          </h3>
          {adminDisciplines.map((d) => (
            <DisciplineCard
              key={d.id}
              discipline={convertAdminDiscipline(d)}
              isManaged
              onDelete={() => deleteDiscipline(d.id)}
            />
          ))}
        </section>
      )}

      {/* Biblioteca estática */}
      {staticOnly.length > 0 && (
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Biblioteca de conteúdo ({staticOnly.length})
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Disciplinas pré-carregadas. Clica "Importar e editar" para as gerir.
            </p>
          </div>
          {staticOnly.map((d) => (
            <DisciplineCard
              key={d.id}
              discipline={d}
              isManaged={false}
              onImport={() => handleImport(d)}
            />
          ))}
        </section>
      )}

      {/* Empty state */}
      {adminDisciplines.length === 0 && staticOnly.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p style={{ color: 'var(--text-muted)' }}>Nenhuma disciplina ainda</p>
        </div>
      )}
    </div>
  )
}
