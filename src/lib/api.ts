const BASE = '/api'

// ── Disciplinas oficiais do Pingo ───────────────────────────────────────────

export const DISCIPLINAS_POR_CICLO = {
  '2ciclo': {
    anos: [5, 6],
    disciplinas: [
      'Português', 'Inglês', 'História e Geografia de Portugal',
      'Cidadania e Desenvolvimento', 'Matemática', 'Ciências Naturais',
    ],
  },
  '3ciclo': {
    anos: [7, 8, 9],
    disciplinas: [
      'Português', 'Inglês', 'Alemão', 'Francês', 'Espanhol',
      'História', 'Geografia', 'Cidadania e Desenvolvimento',
      'Matemática', 'Ciências Naturais', 'Físico-Química',
    ],
  },
}

export function getDisciplinasPorAno(ano: number): string[] {
  if ([5, 6].includes(ano)) return DISCIPLINAS_POR_CICLO['2ciclo'].disciplinas
  if ([7, 8, 9].includes(ano)) return DISCIPLINAS_POR_CICLO['3ciclo'].disciplinas
  return []
}

export function todasAsDisciplinas(): string[] {
  return [
    ...new Set([
      ...DISCIPLINAS_POR_CICLO['2ciclo'].disciplinas,
      ...DISCIPLINAS_POR_CICLO['3ciclo'].disciplinas,
    ]),
  ]
}

export const SUGESTOES_GENERICAS: Record<string, string[]> = {
  'Português': ['O que é um adjetivo?', 'Qual a diferença entre conto e novela?'],
  'Inglês': ['O que é o Present Simple?', 'Como se usa o verbo "to be"?'],
  'História e Geografia de Portugal': ['Onde fica Portugal no mapa da Europa?', 'Quem foi D. Afonso Henriques?'],
  'Cidadania e Desenvolvimento': ['O que são direitos humanos?', 'O que é a democracia?'],
  'Matemática': ['O que é uma fração?', 'Como se calcula a área de um retângulo?'],
  'Ciências Naturais': ['O que é a fotossíntese?', 'Como funciona o sistema digestivo?'],
  'História': ['O que foi a Peste Negra?', 'O que foi a Batalha de Aljubarrota?'],
  'Geografia': ['O que é a latitude?', 'Qual a diferença entre clima e estado do tempo?'],
  'Físico-Química': ['O que é um átomo?', 'O que é a velocidade média?'],
  'Alemão': ['Como se diz "bom dia" em alemão?', 'O que é o artigo definido em alemão?'],
  'Francês': ['Como se conjuga o verbo "être"?', 'O que é o passé composé?'],
  'Espanhol': ['O que é o pretérito indefinido?', 'Como se usa "ser" e "estar" em espanhol?'],
}

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

  // ── Auth ──────────────────────────────────────────────────────────────────
  async login(email: string, password: string): Promise<{ studentId: string; name: string; email: string; handle: string; token: string; mustChangePassword?: boolean } | null> {
    const res = await fetch(`${BASE}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) return null
    return res.json()
  },

  // ── Students ──────────────────────────────────────────────────────────────
  async getStudents() {
    const res = await fetch(`${BASE}/students`)
    if (!res.ok) return []
    return res.json()
  },
  async createStudent(data: { login: string; name: string; school: string; grade: string; password: string }) {
    const res = await fetch(`${BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },
  async updateStudent(id: string, data: Record<string, unknown>) {
    await fetch(`${BASE}/students`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    })
  },
  async deleteStudent(id: string) {
    await fetch(`${BASE}/students?id=${id}`, { method: 'DELETE' })
  },

  // ── Feed ──────────────────────────────────────────────────────────────────
  async getFeed() {
    const res = await fetch(`${BASE}/feed`)
    if (!res.ok) return []
    return res.json()
  },
  async addFeedItem(item: { autorId: string; autorNome: string; autorAt: string; tipo: string; conteudo: string }) {
    const res = await fetch(`${BASE}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })
    return res.json()
  },
  async deleteFeedItem(id: string) {
    await fetch(`${BASE}/feed?id=${id}`, { method: 'DELETE' })
  },
  async reactToFeedItem(id: string, tipo: string, studentId: string) {
    await fetch(`${BASE}/feed`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, tipo, studentId }),
    })
  },

  // ── Friends ───────────────────────────────────────────────────────────────
  async getFriends(studentId: string): Promise<string[]> {
    const res = await fetch(`${BASE}/friends?studentId=${studentId}`)
    if (!res.ok) return []
    return res.json()
  },
  async addFriend(studentId: string, friendId: string) {
    await fetch(`${BASE}/friends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, friendId }),
    })
  },
  async removeFriend(studentId: string, friendId: string) {
    await fetch(`${BASE}/friends?studentId=${studentId}&friendId=${friendId}`, { method: 'DELETE' })
  },

  // ── Books ─────────────────────────────────────────────────────────────────
  async getBooks(studentId: string) {
    const res = await fetch(`${BASE}/books?studentId=${studentId}`)
    if (!res.ok) return []
    return res.json()
  },
  async addBook(studentId: string, data: { titulo: string; autor: string; capa?: string }) {
    const res = await fetch(`${BASE}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, ...data }),
    })
    return res.json()
  },
  async updateBook(studentId: string, bookId: string, data: Record<string, unknown>) {
    await fetch(`${BASE}/books`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, bookId, ...data }),
    })
  },
  async deleteBook(studentId: string, bookId: string) {
    await fetch(`${BASE}/books?studentId=${studentId}&bookId=${bookId}`, { method: 'DELETE' })
  },

  // ── Exams ─────────────────────────────────────────────────────────────────
  async getExams(studentId: string) {
    const res = await fetch(`${BASE}/exams?studentId=${studentId}`)
    if (!res.ok) return []
    return res.json()
  },
  async addExam(studentId: string, subject: string, date: string) {
    const res = await fetch(`${BASE}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, subject, date }),
    })
    return res.json()
  },
  async updateExam(studentId: string, examId: string, data: Record<string, unknown>) {
    await fetch(`${BASE}/exams`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, examId, ...data }),
    })
  },
  async deleteExam(studentId: string, examId: string) {
    await fetch(`${BASE}/exams?studentId=${studentId}&examId=${examId}`, { method: 'DELETE' })
  },

  // ── Progress ──────────────────────────────────────────────────────────────
  async getProgress(studentId: string) {
    const res = await fetch(`${BASE}/progress?studentId=${studentId}`)
    if (!res.ok) return { lessons: {}, examDates: {} }
    return res.json()
  },
  async saveProgress(studentId: string, data: Record<string, unknown>) {
    await fetch(`${BASE}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, ...data }),
    })
  },

  // ── Suggestions ───────────────────────────────────────────────────────────
  async getIgnoredSuggestions(studentId: string): Promise<string[]> {
    const res = await fetch(`${BASE}/suggestions?studentId=${studentId}`)
    if (!res.ok) return []
    return res.json()
  },
  async ignoreSuggestion(studentId: string, ignoredId: string) {
    await fetch(`${BASE}/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, ignoredId }),
    })
  },

  // ── Convites ───────────────────────────────────────────────────────────────
  async submitConvite(data: { nome: string; escola: string; ano: string; email: string; codigoConvite: string }) {
    const res = await fetch(`${BASE}/convites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },
  async getPedidosConvite() {
    const res = await fetch(`${BASE}/convites`)
    if (!res.ok) return []
    return res.json()
  },
  async aprovarConvite(id: string): Promise<{ login: string; password: string } | null> {
    const res = await fetch(`${BASE}/convites`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'aprovar' }),
    })
    if (!res.ok) return null
    return res.json()
  },
  async recusarConvite(id: string) {
    await fetch(`${BASE}/convites`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'recusar' }),
    })
  },
  async getStudentByInviteCode(code: string) {
    const res = await fetch(`${BASE}/convites?code=${encodeURIComponent(code)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.inviter ?? null
  },

  // ── User Data (stats, sessions, dailyStats) ───────────────────────────────
  async getUserData(studentId: string) {
    const res = await fetch(`${BASE}/userdata?studentId=${studentId}`)
    if (!res.ok) return null
    return res.json()
  },
  async saveUserData(studentId: string, data: Record<string, unknown>) {
    fetch(`${BASE}/userdata`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, ...data }),
    }).catch(() => {})
  },

  // ── Advanced Exercises ─────────────────────────────────────────────────────
  async getAdvancedExercises(learningId: string, tipo: string) {
    const res = await fetch(`${BASE}/advanced-exercises?learningId=${encodeURIComponent(learningId)}&tipo=${encodeURIComponent(tipo)}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },
  async generateAdvancedExercises(learningId: string, tipo: string, conteudo: string, topico: string) {
    const res = await fetch(`${BASE}/advanced-exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learningId, tipo, conteudo, topico }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(err.detail || err.error || `HTTP ${res.status}`)
    }
    return res.json()
  },

  // ── Evaluate Response ──────────────────────────────────────────────────────
  async evaluateResponse(pergunta: string, respostaAluno: string, respostaEsperada: string): Promise<{ nivel: 'bom' | 'parcial' | 'insuficiente'; feedback: string }> {
    const res = await fetch(`${BASE}/evaluate-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pergunta, respostaAluno, respostaEsperada }),
    })
    if (!res.ok) return { nivel: 'parcial', feedback: 'Não foi possível avaliar.' }
    return res.json()
  },

  // ── Study Plan ─────────────────────────────────────────────────────────────
  async shareStudyPlan(fromStudentId: string, examId: string, friendIds: string[]) {
    const res = await fetch(`${BASE}/share-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromStudentId, examId, friendIds }),
    })
    if (!res.ok) throw new Error('Failed to share plan')
    return res.json()
  },

  async generateStudyDay(data: { subject: string; year: string; tema: string; resumo: string; regras: Record<string, number>; materiais: string; avancado: boolean }) {
    const res = await fetch(`${BASE}/study-day`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(err.detail || err.error || `HTTP ${res.status}`)
    }
    return res.json()
  },
  async generateStudyPlan(data: { subject: string; year: string; examDate: string; studyNote: string; materiais: { nome: string; conteudo: string }[]; avancado?: boolean }) {
    const res = await fetch(`${BASE}/study-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(err.detail || err.error || `HTTP ${res.status}`)
    }
    return res.json()
  },

  // ── Seed ──────────────────────────────────────────────────────────────────
  async seed() {
    await fetch(`${BASE}/seed`, { method: 'POST' })
  },
}
