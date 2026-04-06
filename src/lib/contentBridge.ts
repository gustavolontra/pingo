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
  // ── 2.º Ciclo (5.º e 6.º ano) ──
  { id: 'portugues-5', name: 'Português 5.º Ano', subject: 'Português', year: 5, color: '#f59e0b', icon: '📖' },
  { id: 'portugues-6', name: 'Português 6.º Ano', subject: 'Português', year: 6, color: '#f59e0b', icon: '📖' },
  { id: 'matematica-5', name: 'Matemática 5.º Ano', subject: 'Matemática', year: 5, color: '#6270f5', icon: '📐' },
  { id: 'matematica-6', name: 'Matemática 6.º Ano', subject: 'Matemática', year: 6, color: '#6270f5', icon: '📐' },
  { id: 'hgp-5', name: 'HGP 5.º Ano', subject: 'História e Geografia de Portugal', year: 5, color: '#ef4444', icon: '🏛️' },
  { id: 'hgp-6', name: 'HGP 6.º Ano', subject: 'História e Geografia de Portugal', year: 6, color: '#ef4444', icon: '🏛️' },
  { id: 'ciencias-5', name: 'Ciências Naturais 5.º Ano', subject: 'Ciências Naturais', year: 5, color: '#06b6d4', icon: '🔬' },
  { id: 'ciencias-6', name: 'Ciências Naturais 6.º Ano', subject: 'Ciências Naturais', year: 6, color: '#06b6d4', icon: '🔬' },
  { id: 'ingles-5', name: 'Inglês 5.º Ano', subject: 'Inglês', year: 5, color: '#0ea5e9', icon: '🇬🇧' },
  { id: 'ingles-6', name: 'Inglês 6.º Ano', subject: 'Inglês', year: 6, color: '#0ea5e9', icon: '🇬🇧' },
  { id: 'evt-5', name: 'EVT 5.º Ano', subject: 'Educação Visual e Tecnológica', year: 5, color: '#ec4899', icon: '🎨' },
  { id: 'evt-6', name: 'EVT 6.º Ano', subject: 'Educação Visual e Tecnológica', year: 6, color: '#ec4899', icon: '🎨' },
  { id: 'musica-5', name: 'Educação Musical 5.º Ano', subject: 'Educação Musical', year: 5, color: '#a78bfa', icon: '🎵' },
  { id: 'musica-6', name: 'Educação Musical 6.º Ano', subject: 'Educação Musical', year: 6, color: '#a78bfa', icon: '🎵' },
  { id: 'ef-5', name: 'Educação Física 5.º Ano', subject: 'Educação Física', year: 5, color: '#22c55e', icon: '⚽' },
  { id: 'ef-6', name: 'Educação Física 6.º Ano', subject: 'Educação Física', year: 6, color: '#22c55e', icon: '⚽' },
  { id: 'emrc-5', name: 'EMRC 5.º Ano', subject: 'EMRC', year: 5, color: '#78716c', icon: '✝️' },
  { id: 'emrc-6', name: 'EMRC 6.º Ano', subject: 'EMRC', year: 6, color: '#78716c', icon: '✝️' },
  { id: 'cidadania-5', name: 'Cidadania 5.º Ano', subject: 'Cidadania e Desenvolvimento', year: 5, color: '#14b8a6', icon: '🤝' },
  { id: 'cidadania-6', name: 'Cidadania 6.º Ano', subject: 'Cidadania e Desenvolvimento', year: 6, color: '#14b8a6', icon: '🤝' },
  // ── 3.º Ciclo (7.º, 8.º e 9.º ano) ──
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
