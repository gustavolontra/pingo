import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { useDisciplines } from '@/hooks/useDisciplines'
import { getDaysUntilExam, formatDate, generateStudyPlan, getUrgencyColor } from '@/lib/utils'
import { Calendar, Target, BookOpen, AlertTriangle } from 'lucide-react'

export default function ExamSchedulePage() {
  const { setExamDate } = useStore()
  const disciplines = useDisciplines()
  const discipline = disciplines[0]
  const [dateInput, setDateInput] = useState(
    discipline.examDate ? new Date(discipline.examDate).toISOString().split('T')[0] : ''
  )
  const [saved, setSaved] = useState(false)

  const daysLeft = discipline.examDate ? getDaysUntilExam(discipline.examDate) : null
  const plan = discipline.examDate
    ? generateStudyPlan(discipline.totalLessons, discipline.completedLessons, new Date(discipline.examDate))
    : null

  const handleSave = () => {
    if (!dateInput) return
    setExamDate(discipline.id, new Date(dateInput))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white">📅 Gestão de Exames</h2>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
          Define a data do exame e o sistema cria um plano de estudo automático.
        </p>
      </div>

      {/* Exam date setter */}
      <div className="card space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{discipline.icon}</span>
          <div>
            <h3 className="font-display font-semibold text-white">{discipline.name}</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{discipline.year}.º ano</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
            Data do exame
          </label>
          <div className="flex gap-3">
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="flex-1 px-4 py-3 rounded-xl text-white text-sm font-medium transition-all outline-none"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                colorScheme: 'dark',
              }}
            />
            <button onClick={handleSave} className="btn-primary">
              {saved ? '✓ Guardado' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      {/* Countdown + plan */}
      {daysLeft !== null && plan && (
        <>
          {/* Countdown */}
          <div
            className="card flex items-center gap-5"
            style={{ borderColor: `${getUrgencyColor(daysLeft)}30` }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${getUrgencyColor(daysLeft)}15` }}
            >
              {daysLeft <= 7 ? (
                <AlertTriangle size={28} style={{ color: getUrgencyColor(daysLeft) }} />
              ) : (
                <Calendar size={28} style={{ color: getUrgencyColor(daysLeft) }} />
              )}
            </div>
            <div>
              <p className="text-3xl font-display font-black" style={{ color: getUrgencyColor(daysLeft) }}>
                {daysLeft} dias
              </p>
              <p style={{ color: 'var(--text-muted)' }}>
                até ao exame · {formatDate(new Date(discipline.examDate!), "d 'de' MMMM 'de' yyyy")}
              </p>
            </div>
          </div>

          {/* Study plan */}
          <div className="card space-y-4">
            <h3 className="font-display font-semibold text-white flex items-center gap-2">
              <Target size={18} style={{ color: 'var(--primary)' }} />
              Plano de Estudo Gerado
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Dias restantes', value: plan.daysLeft, icon: '📅' },
                { label: 'Aulas por dia', value: plan.lessonsPerDay, icon: '📚' },
                { label: 'Aulas em falta', value: discipline.totalLessons - discipline.completedLessons, icon: '🎯' },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl text-center"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                >
                  <p className="text-2xl mb-1">{icon}</p>
                  <p className="text-2xl font-display font-bold text-white">{value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Daily breakdown preview */}
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
                Próximos 5 dias
              </p>
              <div className="space-y-2">
                {Array.from({ length: Math.min(5, plan.daysLeft) }, (_, i) => {
                  const date = new Date(Date.now() + (i + 1) * 86400000)
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen size={15} style={{ color: 'var(--primary)' }} />
                        <span className="text-sm text-white">{formatDate(date, "EEEE, d MMM")}</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: '#a5bbfd' }}>
                        {plan.lessonsPerDay} aula{plan.lessonsPerDay !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}