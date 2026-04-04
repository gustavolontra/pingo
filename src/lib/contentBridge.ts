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

export const DISCIPLINE_OPTIONS: DisciplineOption[] = [
  { id: 'historia-7', name: 'História 7.º Ano', subject: 'História', year: 7, color: '#ef4444', icon: '🏛️' },
  { id: 'historia-8', name: 'História 8.º Ano', subject: 'História', year: 8, color: '#ef4444', icon: '🏛️' },
  { id: 'historia-9', name: 'História 9.º Ano', subject: 'História', year: 9, color: '#ef4444', icon: '🏛️' },
  { id: 'geografia-7', name: 'Geografia 7.º Ano', subject: 'Geografia', year: 7, color: '#10b981', icon: '🌍' },
  { id: 'geografia-8', name: 'Geografia 8.º Ano', subject: 'Geografia', year: 8, color: '#10b981', icon: '🌍' },
  { id: 'geografia-9', name: 'Geografia 9.º Ano', subject: 'Geografia', year: 9, color: '#10b981', icon: '🌍' },
  { id: 'matematica-7', name: 'Matemática 7.º Ano', subject: 'Matemática', year: 7, color: '#6270f5', icon: '📐' },
  { id: 'matematica-8', name: 'Matemática 8.º Ano', subject: 'Matemática', year: 8, color: '#6270f5', icon: '📐' },
  { id: 'matematica-9', name: 'Matemática 9.º Ano', subject: 'Matemática', year: 9, color: '#6270f5', icon: '📐' },
  { id: 'portugues-7', name: 'Português 7.º Ano', subject: 'Português', year: 7, color: '#f59e0b', icon: '📖' },
  { id: 'portugues-8', name: 'Português 8.º Ano', subject: 'Português', year: 8, color: '#f59e0b', icon: '📖' },
  { id: 'portugues-9', name: 'Português 9.º Ano', subject: 'Português', year: 9, color: '#f59e0b', icon: '📖' },
  { id: 'ciencias-7', name: 'Ciências Naturais 7.º Ano', subject: 'Ciências Naturais', year: 7, color: '#06b6d4', icon: '🔬' },
  { id: 'ciencias-8', name: 'Ciências Naturais 8.º Ano', subject: 'Ciências Naturais', year: 8, color: '#06b6d4', icon: '🔬' },
  { id: 'ciencias-9', name: 'Ciências Naturais 9.º Ano', subject: 'Ciências Naturais', year: 9, color: '#06b6d4', icon: '🔬' },
  { id: 'fisico-quimica-7', name: 'Físico-Química 7.º Ano', subject: 'Físico-Química', year: 7, color: '#8b5cf6', icon: '⚗️' },
  { id: 'fisico-quimica-8', name: 'Físico-Química 8.º Ano', subject: 'Físico-Química', year: 8, color: '#8b5cf6', icon: '⚗️' },
  { id: 'fisico-quimica-9', name: 'Físico-Química 9.º Ano', subject: 'Físico-Química', year: 9, color: '#8b5cf6', icon: '⚗️' },
  { id: 'ingles-7', name: 'Inglês 7.º Ano', subject: 'Inglês', year: 7, color: '#0ea5e9', icon: '🇬🇧' },
  { id: 'ingles-8', name: 'Inglês 8.º Ano', subject: 'Inglês', year: 8, color: '#0ea5e9', icon: '🇬🇧' },
  { id: 'ingles-9', name: 'Inglês 9.º Ano', subject: 'Inglês', year: 9, color: '#0ea5e9', icon: '🇬🇧' },
]

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
