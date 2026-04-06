export const DISCIPLINAS_2_CICLO = [
  'Português',
  'Matemática',
  'História e Geografia de Portugal',
  'Ciências Naturais',
  'Educação Visual e Tecnológica',
  'Educação Musical',
  'Educação Física',
  'Inglês',
  'EMRC',
  'Cidadania e Desenvolvimento',
]

export const ANOS_2_CICLO = [5, 6]
export const ANOS_3_CICLO = [7, 8, 9]

export function getDisciplinasPorAno(ano: number): string[] {
  if (ANOS_2_CICLO.includes(ano)) return DISCIPLINAS_2_CICLO
  return [] // 3.º Ciclo já existe no código actual
}
