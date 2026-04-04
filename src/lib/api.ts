const BASE = '/api'

export interface KVFlashcard {
  frente: string
  verso: string
  exemplo?: string
}

export interface KVQuestion {
  pergunta: string
  tipo: 'multiple-choice' | 'true-false'
  opcoes: string[]
  correta: number
  explicacao: string
}

export interface KVContentItem {
  id: string
  disciplineId: string
  topico: string
  titulo: string
  resumo: string
  palavrasChave: string[]
  flashcards: KVFlashcard[]
  quiz: KVQuestion[]
  createdAt: string
  updatedAt: string
}

export interface KVDiscipline {
  id: string
  name: string
  subject: string
  year: number
  color: string
  icon: string
}

export interface AnalysisResult {
  titulo: string
  materia: string
  ano: number
  topico: string
  palavrasChave: string[]
  resumo: string
  flashcards: KVFlashcard[]
  quiz: KVQuestion[]
}

export const api = {
  // AI Analysis
  async analyze(content: string): Promise<AnalysisResult> {
    const res = await fetch(`${BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(err.error ?? `HTTP ${res.status}`)
    }
    return res.json()
  },


  // Disciplines
  async getDisciplines(): Promise<KVDiscipline[]> {
    const res = await fetch(`${BASE}/disciplines`)
    if (!res.ok) return []
    return res.json()
  },

  async putDisciplines(disciplines: KVDiscipline[]): Promise<void> {
    await fetch(`${BASE}/disciplines`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(disciplines),
    })
  },

  async putContent(item: KVContentItem): Promise<void> {
    await fetch(`${BASE}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })
  },

  // Content
  async getAllContent(): Promise<KVContentItem[]> {
    const res = await fetch(`${BASE}/content`)
    if (!res.ok) return []
    return res.json()
  },

  async getContentByDiscipline(disciplineId: string): Promise<KVContentItem[]> {
    const res = await fetch(`${BASE}/content?disciplineId=${disciplineId}`)
    if (!res.ok) return []
    return res.json()
  },

  async deleteContent(id: string, disciplineId: string): Promise<void> {
    await fetch(`${BASE}/content?id=${id}&disciplineId=${disciplineId}`, { method: 'DELETE' })
  },
}
