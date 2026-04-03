const BASE = '/api'

export interface KVFlashcard {
  front: string
  back: string
}

export interface KVQuestion {
  text: string
  answer: boolean
  explanation: string
}

export interface KVContentItem {
  id: string
  disciplineId: string
  title: string
  body: string
  keyPoints: string[]
  flashcards: KVFlashcard[]
  questions: KVQuestion[]
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

export const api = {
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
}
