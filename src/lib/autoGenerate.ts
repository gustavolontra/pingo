/**
 * autoGenerate.ts
 * Gera automaticamente título, palavras-chave, flashcards e quiz
 * a partir de texto em formato Markdown.
 */

export interface GeneratedFlashcard {
  front: string
  back: string
}

export interface GeneratedQuestion {
  text: string
  answer: boolean       // true = afirmação verdadeira, false = falsa
  explanation: string
}

export interface GeneratedContent {
  title: string
  keyPoints: string[]
  flashcards: GeneratedFlashcard[]
  questions: GeneratedQuestion[]
}

// ── Título ────────────────────────────────────────────────────────────────────

export function extractTitle(text: string): string {
  const lines = text.split('\n')
  for (const line of lines) {
    const m = line.match(/^#{1,3}\s+(.+)/)
    if (m) return m[1].trim()
  }
  const first = lines.find((l) => l.trim().length > 5 && l.trim().length < 100)
  return first?.trim().replace(/\*\*/g, '') ?? ''
}

// ── Palavras-chave ─────────────────────────────────────────────────────────────

export function extractKeyPoints(text: string): string[] {
  const lines = text.split('\n')
  const points: string[] = []
  for (const line of lines) {
    const t = line.trim()
    if (/^[-*•]\s+.{15,}/.test(t)) {
      points.push(t.replace(/^[-*•]\s+/, '').replace(/\*\*/g, ''))
    }
    const bold = t.match(/\*\*([^*]{8,60})\*\*/g)
    if (bold) points.push(...bold.map((b) => b.replace(/\*\*/g, '')))
  }
  return [...new Set(points)].slice(0, 8)
}

// ── Flashcards ────────────────────────────────────────────────────────────────

export function generateFlashcards(text: string): GeneratedFlashcard[] {
  const cards: GeneratedFlashcard[] = []
  const lines = text.split('\n')

  // Pattern 1: **Termo** — ou **: descrição
  for (const line of lines) {
    const m = line.match(/\*\*([^*]{3,50})\*\*\s*[—–:]\s*(.{15,220})/)
    if (m) {
      const front = m[1].trim()
      const back = m[2].replace(/\*\*/g, '').trim()
      if (!cards.some((c) => c.front === front)) cards.push({ front, back })
    }
  }

  // Pattern 2: ### Cabeçalho → primeiro parágrafo
  let currentHeading = ''
  let buffer: string[] = []
  for (const line of lines) {
    const hm = line.match(/^#{2,3}\s+(.+)/)
    if (hm) {
      if (currentHeading && buffer.length > 0) {
        const back = buffer.join(' ').replace(/\*\*/g, '').slice(0, 220)
        if (back.length > 20 && !cards.some((c) => c.front === currentHeading)) {
          cards.push({ front: currentHeading, back })
        }
      }
      currentHeading = hm[1].replace(/\*\*/g, '').trim()
      buffer = []
    } else if (currentHeading && line.trim() && !line.startsWith('#') && !line.startsWith('>')) {
      buffer.push(line.trim())
      if (buffer.join(' ').length > 150) currentHeading = '' // flush
    }
  }
  if (currentHeading && buffer.length > 0) {
    const back = buffer.join(' ').replace(/\*\*/g, '').slice(0, 220)
    if (back.length > 20) cards.push({ front: currentHeading, back })
  }

  // Pattern 3: bullet "X: Y" or "X é Y"
  for (const line of lines) {
    const t = line.trim().replace(/^[-*•]\s+/, '')
    const m1 = t.match(/^([^:]{4,40}):\s+(.{15,200})$/)
    if (m1 && !cards.some((c) => c.front === m1[1].replace(/\*\*/g, ''))) {
      cards.push({ front: m1[1].replace(/\*\*/g, ''), back: m1[2].replace(/\*\*/g, '') })
    }
  }

  return cards.slice(0, 12)
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

export function generateQuiz(text: string, keyPoints: string[]): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = []

  // Verdadeiras: das keyPoints diretas
  for (const kp of keyPoints.slice(0, 4)) {
    if (kp.length >= 15) {
      questions.push({ text: kp, answer: true, explanation: 'Afirmação correta com base no texto.' })
    }
  }

  // Falsas: trocar termos em negrito entre si
  const boldTerms = [...text.matchAll(/\*\*([^*]{3,35})\*\*/g)].map((m) => m[1])
  let falseCount = 0
  for (const kp of keyPoints.slice(0, 4)) {
    if (falseCount >= 2) break
    for (const term of boldTerms) {
      if (kp.includes(term)) {
        const others = boldTerms.filter((t) => t !== term && t.length > 2)
        if (others.length > 0) {
          // Pick a different term that wouldn't make the same meaning
          const swap = others.find((t) => !kp.includes(t)) ?? others[0]
          if (swap && swap !== term) {
            const falseStatement = kp.replace(term, swap)
            if (falseStatement !== kp) {
              questions.push({
                text: falseStatement,
                answer: false,
                explanation: `Incorreto. A afirmação correta usa "${term}", não "${swap}".`,
              })
              falseCount++
              break
            }
          }
        }
      }
    }
  }

  return questions.slice(0, 6)
}

// ── Função principal ──────────────────────────────────────────────────────────

export function autoGenerate(text: string): GeneratedContent {
  const keyPoints = extractKeyPoints(text)
  return {
    title: extractTitle(text),
    keyPoints,
    flashcards: generateFlashcards(text),
    questions: generateQuiz(text, keyPoints),
  }
}
