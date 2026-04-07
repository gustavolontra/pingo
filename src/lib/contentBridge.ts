/**
 * contentBridge.ts
 *
 * Lista de disciplinas disponíveis para o dropdown do admin.
 * Apenas nomes/IDs — sem conteúdo hardcoded.
 * O conteúdo real vem sempre do Cloudflare KV.
 */

export interface DisciplineOption {
  id: string
  name: string
  subject: string
  year: number
  color: string
  icon: string
}

// Gera DISCIPLINE_OPTIONS a partir da lista oficial em api.ts
import { DISCIPLINAS_POR_CICLO } from '@/lib/api'

const SUBJECT_COLORS: Record<string, string> = {
  'Português': '#f59e0b', 'Matemática': '#6270f5', 'Inglês': '#0ea5e9',
  'Alemão': '#64748b', 'Francês': '#3b82f6', 'Espanhol': '#f97316',
  'História': '#ef4444', 'Geografia': '#10b981',
  'História e Geografia de Portugal': '#ef4444',
  'Cidadania e Desenvolvimento': '#14b8a6',
  'Ciências Naturais': '#06b6d4', 'Físico-Química': '#8b5cf6',
}
const SUBJECT_ICONS: Record<string, string> = {
  'Português': '📖', 'Matemática': '📐', 'Inglês': '🇬🇧',
  'Alemão': '🇩🇪', 'Francês': '🇫🇷', 'Espanhol': '🇪🇸',
  'História': '🏛️', 'Geografia': '🌍',
  'História e Geografia de Portugal': '🏛️',
  'Cidadania e Desenvolvimento': '🤝',
  'Ciências Naturais': '🔬', 'Físico-Química': '⚗️',
}
function slugify(s: string) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }

export const DISCIPLINE_OPTIONS: DisciplineOption[] = (() => {
  const opts: DisciplineOption[] = []
  for (const [, ciclo] of Object.entries(DISCIPLINAS_POR_CICLO)) {
    for (const ano of ciclo.anos) {
      for (const disc of ciclo.disciplinas) {
        const id = `${slugify(disc)}-${ano}`
        opts.push({
          id,
          name: `${disc} ${ano}.º Ano`,
          subject: disc,
          year: ano,
          color: SUBJECT_COLORS[disc] ?? '#6270f5',
          icon: SUBJECT_ICONS[disc] ?? '📚',
        })
      }
    }
  }
  return opts
})()

/** Devolve o DisciplineOption para um dado id, ou um fallback genérico. */
export function getDisciplineOption(id: string): DisciplineOption {
  return DISCIPLINE_OPTIONS.find((d) => d.id === id) ?? {
    id,
    name: id,
    subject: id,
    year: 7,
    color: '#6270f5',
    icon: '📚',
  }
}
