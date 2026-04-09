export interface ExercicioLacuna {
  tipo: 'lacuna'
  frase: string
  resposta: string
  opcoes: [string, string, string, string]
  explicacao: string
  topico: string
}

export interface ExercicioClassificacao {
  tipo: 'classificacao'
  instrucao: string
  colunas: string[]
  itens: { palavra: string; coluna: string }[]
  explicacao: string
  topico: string
}

export interface ExercicioTransformacao {
  tipo: 'transformacao'
  instrucao: string
  frase_original: string
  resposta: string
  dica: string
  explicacao: string
  topico: string
}

export interface ExercicioIdentificacao {
  tipo: 'identificacao'
  instrucao: string
  frase: string
  constituintes: { texto: string; funcao: string }[]
  explicacao: string
  topico: string
}

export type AdvancedExercise =
  | ExercicioLacuna
  | ExercicioClassificacao
  | ExercicioTransformacao
  | ExercicioIdentificacao

export interface AdvancedExercisesData {
  learningId: string
  tipo: string
  topico: string
  exercicios: AdvancedExercise[]
  criadoEm: string
}
