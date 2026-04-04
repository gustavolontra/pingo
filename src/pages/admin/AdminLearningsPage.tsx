/**
 * AdminLearningsPage — "Aprendizados"
 *
 * Fluxo:
 *   1. Cola texto ou anexa ficheiro → clica "Analisar com IA"
 *   2. IA (claude-sonnet-4-6) sugere título, matéria, ano, tópico,
 *      palavras-chave, resumo, flashcards e quiz
 *   3. Admin revê e edita tudo
 *   4. "Publicar" → envia para KV e aparece em Matérias Publicadas
 *      "Guardar rascunho" → fica em Aprendizados
 *      "Cancelar" → volta à lista
 */

import { useState, useRef } from 'react'
import { useAdminStore, type ContentDraft, type DraftFlashcard, type DraftQuestion } from '@/store/useAdminStore'
import { STATIC_DISCIPLINES } from '@/lib/contentBridge'
import { api } from '@/lib/api'
import {
  Plus, ArrowLeft, Sparkles, Save, Trash2,
  ChevronDown, ChevronUp, Send, Pencil, FileText,
  Upload, Loader2, X, Check,
} from 'lucide-react'

const API_CONTENT = '/api/content'

type View = 'list' | 'editor'
type EditorStep = 'input' | 'analyzing' | 'review'
type DraftData = Omit<ContentDraft, 'id' | 'createdAt'>

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminLearningsPage() {
  const { disciplines: adminDisciplines, contentDrafts, saveDraft, updateDraft, deleteDraft } = useAdminStore()
  const [view, setView] = useState<View>('list')
  const [editingDraft, setEditingDraft] = useState<ContentDraft | null>(null)

  const allDisciplines = [
    ...adminDisciplines.map((d) => ({ id: d.id, name: d.name, subject: d.subject, year: d.year })),
    ...STATIC_DISCIPLINES
      .filter((d) => !adminDisciplines.some((a) => a.id === d.id))
      .map((d) => ({ id: d.id, name: d.name, subject: d.subject, year: d.year })),
  ]

  async function publishData(data: DraftData) {
    await fetch(API_CONTENT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async function handlePublishDraft(draft: ContentDraft) {
    await publishData({ ...draft })
    deleteDraft(draft.id)
    setView('list')
    setEditingDraft(null)
  }

  // ── Editor views ─────────────────────────────────────────────────────────

  if (view === 'editor') {
    return (
      <Editor
        disciplines={allDisciplines}
        initial={editingDraft ?? undefined}
        onBack={() => { setEditingDraft(null); setView('list') }}
        onDraft={(data) => {
          if (editingDraft) {
            updateDraft(editingDraft.id, data)
          } else {
            saveDraft(data)
          }
          setEditingDraft(null)
          setView('list')
        }}
        onPublish={async (data) => {
          if (editingDraft) {
            await publishData({ ...editingDraft, ...data })
            deleteDraft(editingDraft.id)
            setEditingDraft(null)
          } else {
            await publishData(data)
          }
          setView('list')
        }}
      />
    )
  }

  // ── List ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>Aprendizados</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Cola ou anexa conteúdo, analisa com IA e publica para os alunos.
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2 shrink-0"
          onClick={() => { setEditingDraft(null); setView('editor') }}
        >
          <Plus size={16} /> Novo aprendizado
        </button>
      </div>

      {contentDrafts.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mx-auto mb-3 w-fit opacity-30" style={{ color: 'var(--text-muted)' }}>
            <FileText size={36} />
          </div>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Nenhum rascunho</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Clica em "Novo aprendizado" para começar.<br />
            Após publicar, o conteúdo aparece em <strong>Matérias Publicadas</strong>.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
            Rascunhos ({contentDrafts.length})
          </p>
          {contentDrafts.map((d) => {
            const disc = allDisciplines.find((x) => x.id === d.disciplineId)
            return (
              <div key={d.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {disc && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}>
                          {disc.name}
                        </span>
                      )}
                      {d.topico && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                          {d.topico}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                        Rascunho
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(d.createdAt).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{d.titulo || '(sem título)'}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {d.flashcards.length > 0 && <span>🃏 {d.flashcards.length} flashcards</span>}
                      {d.quiz.length > 0 && <span>❓ {d.quiz.length} questões</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={async () => { await handlePublishDraft(d) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
                    >
                      <Send size={12} /> Publicar
                    </button>
                    <button onClick={() => { setEditingDraft(d); setView('editor') }} className="p-1.5 rounded-lg hover:bg-slate-100" style={{ color: '#6270f5' }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => deleteDraft(d.id)} className="p-1.5 rounded-lg hover:bg-red-50" style={{ color: '#dc2626' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Editor ───────────────────────────────────────────────────────────────────

function Editor({
  disciplines, initial, onBack, onDraft, onPublish,
}: {
  disciplines: { id: string; name: string; subject: string; year: number }[]
  initial?: ContentDraft
  onBack: () => void
  onDraft: (data: DraftData) => void
  onPublish: (data: DraftData) => Promise<void>
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<EditorStep>(initial ? 'review' : 'input')
  const [rawContent, setRawContent] = useState(initial?.rawContent ?? '')

  // Review fields
  const [titulo, setTitulo] = useState(initial?.titulo ?? '')
  const [materia, setMateria] = useState(initial?.materia ?? '')
  const [disciplineId, setDisciplineId] = useState(initial?.disciplineId ?? '')
  const [ano, setAno] = useState(initial?.ano ?? 7)
  const [topico, setTopico] = useState(initial?.topico ?? '')
  const [palavrasChave, setPalavrasChave] = useState<string[]>(initial?.palavrasChave ?? [])
  const [resumo, setResumo] = useState(initial?.resumo ?? '')
  const [flashcards, setFlashcards] = useState<DraftFlashcard[]>(initial?.flashcards ?? [])
  const [quiz, setQuiz] = useState<DraftQuestion[]>(initial?.quiz ?? [])

  const [openSection, setOpenSection] = useState<'kp' | 'fc' | 'qz' | null>('kp')
  const [saving, setSaving] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  const canPublish = titulo.trim() && disciplineId && topico.trim() && resumo.trim()

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { setRawContent(ev.target?.result as string) }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleAnalyze() {
    if (!rawContent.trim()) return
    setStep('analyzing')
    setAnalyzeError(null)
    try {
      const data = await api.analyze(rawContent)
      setTitulo(data.titulo ?? '')
      setMateria(data.materia ?? '')
      setAno(data.ano ?? 7)
      setTopico(data.topico ?? '')
      setPalavrasChave(data.palavrasChave ?? [])
      setResumo(data.resumo ?? '')
      setFlashcards((data.flashcards ?? []).map((f) => ({ frente: f.frente, verso: f.verso, exemplo: f.exemplo ?? '' })))
      setQuiz(data.quiz ?? [])
      // Try to match discipline by name
      if (data.materia) {
        const lower = data.materia.toLowerCase()
        const match = disciplines.find((d) =>
          d.name.toLowerCase().includes(lower) || lower.includes(d.name.toLowerCase()) ||
          d.subject.toLowerCase().includes(lower) || lower.includes(d.subject.toLowerCase())
        )
        if (match) setDisciplineId(match.id)
      }
      setStep('review')
      setOpenSection('kp')
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Erro ao contactar a IA')
      setStep('input')
    }
  }

  function getData(): DraftData {
    return { titulo, materia, disciplineId, ano, topico, palavrasChave, resumo, flashcards, quiz, rawContent }
  }

  async function handlePublish() {
    setSaving(true)
    await onPublish(getData())
    setSaving(false)
  }

  // ── Step: Input ────────────────────────────────────────────────────────────

  if (step === 'input') {
    return (
      <div className="p-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-xl font-display font-bold" style={{ color: 'var(--text)' }}>
            Novo aprendizado
          </h2>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                Conteúdo <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(cola ou anexa um ficheiro)</span>
              </label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}
              >
                <Upload size={12} /> Anexar ficheiro
              </button>
              <input ref={fileRef} type="file" accept=".txt,.md,.ts,.csv" className="hidden" onChange={handleFile} />
            </div>
            <textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              rows={16}
              placeholder="Cola o texto aqui — resumos, apontamentos, fichas, capítulos de manual..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none leading-relaxed font-mono"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {rawContent.trim()
                ? `${rawContent.trim().split(/\s+/).length} palavras`
                : 'Aceita texto, Markdown, .txt, .md, .ts'}
            </p>
          </div>

          {analyzeError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
              <X size={15} className="shrink-0" />
              <span>{analyzeError}</span>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!rawContent.trim()}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5', border: '1px solid rgba(98,112,245,0.2)' }}
          >
            <Sparkles size={15} />
            Analisar com IA
          </button>

          <p className="text-xs text-center -mt-2" style={{ color: 'var(--text-muted)' }}>
            Irá sugerir: título · matéria · tópico · palavras-chave · resumo · flashcards · quiz
          </p>
        </div>
      </div>
    )
  }

  // ── Step: Analyzing ────────────────────────────────────────────────────────

  if (step === 'analyzing') {
    return (
      <div className="p-8 max-w-3xl flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(98,112,245,0.1)' }}>
            <Loader2 size={28} className="animate-spin" style={{ color: '#6270f5' }} />
          </div>
          <div className="text-center">
            <p className="font-semibold" style={{ color: 'var(--text)' }}>A analisar com IA...</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              A IA está a gerar título, matéria, flashcards e quiz
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Step: Review ───────────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setStep('input')} className="p-2 rounded-xl hover:bg-slate-100 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-display font-bold" style={{ color: 'var(--text)' }}>
            {initial ? 'Editar rascunho' : 'Rever e publicar'}
          </h2>
          <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#6270f5' }}>
            <Check size={11} /> Análise concluída — edita o que precisares
          </p>
        </div>
        <button
          onClick={() => setStep('input')}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(98,112,245,0.08)', color: '#6270f5' }}
        >
          <Sparkles size={11} /> Reanalisar
        </button>
      </div>

      <div className="flex flex-col gap-5">

        {/* Título */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Título</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título do aprendizado..."
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Matéria + Disciplina + Ano */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
              Matéria <span className="font-normal text-xs" style={{ color: '#6270f5' }}>(sugerida pela IA)</span>
            </label>
            <input
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              placeholder="Ex: História"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Ano</label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              min={5} max={12}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
        </div>

        {/* Disciplina (dropdown) */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Disciplina</label>
          <div className="relative">
            <select
              value={disciplineId}
              onChange={(e) => setDisciplineId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
              style={{ background: 'var(--surface-2)', border: `1px solid ${disciplineId ? 'var(--border)' : 'rgba(239,68,68,0.4)'}`, color: disciplineId ? 'var(--text)' : 'var(--text-muted)' }}
            >
              <option value="">Seleciona a disciplina...</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>{d.name} — {d.subject}</option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Tópico */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Tópico</label>
          <input
            value={topico}
            onChange={(e) => setTopico(e.target.value)}
            placeholder="Ex: Formação do Reino de Portugal"
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Resumo */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Resumo</label>
          <textarea
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            rows={4}
            placeholder="Resumo do conteúdo para os alunos..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none leading-relaxed"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Palavras-chave */}
        <Collapsible
          title={`Palavras-chave (${palavrasChave.length})`}
          open={openSection === 'kp'}
          onToggle={() => setOpenSection(openSection === 'kp' ? null : 'kp')}
        >
          <div className="flex flex-wrap gap-2 mb-3">
            {palavrasChave.map((kp, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}>
                {kp}
                <button onClick={() => setPalavrasChave(palavrasChave.filter((_, j) => j !== i))} className="hover:opacity-70">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
          <AddKeyword onAdd={(kp) => setPalavrasChave([...palavrasChave, kp])} />
        </Collapsible>

        {/* Flashcards */}
        <Collapsible
          title={`Flashcards (${flashcards.length})`}
          open={openSection === 'fc'}
          onToggle={() => setOpenSection(openSection === 'fc' ? null : 'fc')}
        >
          <div className="flex flex-col gap-3">
            {flashcards.map((fc, i) => (
              <div key={i} className="p-3 rounded-xl flex flex-col gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="flex items-start gap-2">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold w-14 shrink-0" style={{ color: '#6270f5' }}>Frente</span>
                      <input value={fc.frente}
                        onChange={(e) => setFlashcards(flashcards.map((f, j) => j === i ? { ...f, frente: e.target.value } : f))}
                        className="flex-1 px-2 py-1.5 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold w-14 shrink-0" style={{ color: 'var(--text-muted)' }}>Verso</span>
                      <input value={fc.verso}
                        onChange={(e) => setFlashcards(flashcards.map((f, j) => j === i ? { ...f, verso: e.target.value } : f))}
                        className="flex-1 px-2 py-1.5 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold w-14 shrink-0" style={{ color: 'var(--text-muted)' }}>Exemplo</span>
                      <input value={fc.exemplo}
                        onChange={(e) => setFlashcards(flashcards.map((f, j) => j === i ? { ...f, exemplo: e.target.value } : f))}
                        placeholder="Exemplo opcional..."
                        className="flex-1 px-2 py-1.5 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                  <button onClick={() => setFlashcards(flashcards.filter((_, j) => j !== i))} className="p-1 rounded hover:bg-red-50 mt-1 shrink-0" style={{ color: '#dc2626' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => setFlashcards([...flashcards, { frente: '', verso: '', exemplo: '' }])}
              className="text-xs font-medium px-3 py-1.5 rounded-lg w-fit"
              style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}
            >
              + Adicionar flashcard
            </button>
          </div>
        </Collapsible>

        {/* Quiz */}
        <Collapsible
          title={`Quiz (${quiz.length} questões)`}
          open={openSection === 'qz'}
          onToggle={() => setOpenSection(openSection === 'qz' ? null : 'qz')}
        >
          <div className="flex flex-col gap-4">
            {quiz.map((q, i) => (
              <QuizCard
                key={i}
                question={q}
                onChange={(updated) => setQuiz(quiz.map((x, j) => j === i ? updated : x))}
                onDelete={() => setQuiz(quiz.filter((_, j) => j !== i))}
              />
            ))}
            <div className="flex gap-2">
              <button
                onClick={() => setQuiz([...quiz, { pergunta: '', tipo: 'multiple-choice', opcoes: ['', '', '', ''], correta: 0, explicacao: '' }])}
                className="text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}
              >
                + Multiple-choice
              </button>
              <button
                onClick={() => setQuiz([...quiz, { pergunta: '', tipo: 'true-false', opcoes: ['Verdadeiro', 'Falso'], correta: 0, explicacao: '' }])}
                className="text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981' }}
              >
                + Verdadeiro/Falso
              </button>
            </div>
          </div>
        </Collapsible>

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <X size={15} /> Cancelar
          </button>
          <button
            onClick={() => onDraft(getData())}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <Save size={15} /> Guardar rascunho
          </button>
          <button
            onClick={handlePublish}
            disabled={!canPublish || saving}
            className="btn-primary flex items-center gap-2 flex-1 justify-center"
            style={{ opacity: !canPublish || saving ? 0.5 : 1 }}
          >
            <Send size={15} />
            {saving ? 'A publicar...' : 'Publicar para os alunos'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── QuizCard ─────────────────────────────────────────────────────────────────

function QuizCard({ question, onChange, onDelete }: {
  question: DraftQuestion
  onChange: (q: DraftQuestion) => void
  onDelete: () => void
}) {
  const isMultiple = question.tipo === 'multiple-choice'

  return (
    <div className="p-3 rounded-xl flex flex-col gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
              background: isMultiple ? 'rgba(98,112,245,0.1)' : 'rgba(16,185,129,0.08)',
              color: isMultiple ? '#6270f5' : '#10b981',
            }}>
              {isMultiple ? 'Multiple-choice' : 'Verdadeiro/Falso'}
            </span>
          </div>
          <textarea
            value={question.pergunta}
            onChange={(e) => onChange({ ...question, pergunta: e.target.value })}
            rows={2}
            placeholder="Texto da pergunta..."
            className="w-full px-2 py-1.5 rounded-lg text-sm outline-none resize-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>
        <button onClick={onDelete} className="p-1 rounded hover:bg-red-50 mt-6 shrink-0" style={{ color: '#dc2626' }}>
          <Trash2 size={13} />
        </button>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-1.5 ml-0">
        {question.opcoes.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-2">
            <button
              onClick={() => onChange({ ...question, correta: oi })}
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
              style={question.correta === oi
                ? { background: '#10b981', borderColor: '#10b981' }
                : { borderColor: 'var(--border)' }}
            >
              {question.correta === oi && <Check size={10} color="white" />}
            </button>
            {isMultiple ? (
              <input
                value={opt}
                onChange={(e) => {
                  const newOpts = question.opcoes.map((o, j) => j === oi ? e.target.value : o)
                  onChange({ ...question, opcoes: newOpts })
                }}
                placeholder={`Opção ${String.fromCharCode(65 + oi)}`}
                className="flex-1 px-2 py-1 rounded-lg text-sm outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            ) : (
              <span className="text-sm" style={{ color: 'var(--text)' }}>{opt}</span>
            )}
          </div>
        ))}
        {isMultiple && question.opcoes.length < 6 && (
          <button
            onClick={() => onChange({ ...question, opcoes: [...question.opcoes, ''] })}
            className="text-xs ml-7 w-fit"
            style={{ color: 'var(--text-muted)' }}
          >
            + opção
          </button>
        )}
      </div>

      {/* Explanation */}
      <input
        value={question.explicacao}
        onChange={(e) => onChange({ ...question, explicacao: e.target.value })}
        placeholder="Explicação da resposta correcta..."
        className="px-2 py-1.5 rounded-lg text-xs outline-none"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
      />
    </div>
  )
}

// ─── AddKeyword ───────────────────────────────────────────────────────────────

function AddKeyword({ onAdd }: { onAdd: (kp: string) => void }) {
  const [val, setVal] = useState('')
  function submit() {
    const trimmed = val.trim()
    if (trimmed) { onAdd(trimmed); setVal('') }
  }
  return (
    <div className="flex gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Nova palavra-chave..."
        className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
      />
      <button onClick={submit} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: 'rgba(98,112,245,0.1)', color: '#6270f5' }}>
        Adicionar
      </button>
    </div>
  )
}

// ─── Collapsible ──────────────────────────────────────────────────────────────

function Collapsible({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-slate-50 transition-all"
        style={{ color: 'var(--text)', background: 'var(--surface)' }}>
        {title}
        {open ? <ChevronUp size={15} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />}
      </button>
      {open && <div className="px-4 py-4" style={{ background: 'var(--surface)' }}>{children}</div>}
    </div>
  )
}
