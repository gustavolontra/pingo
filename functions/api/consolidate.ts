/**
 * POST /api/consolidate
 * Recebe { disciplineId }
 * Busca todos os itens da disciplina, pede ao Claude para gerar flashcards/quiz/keywords
 * consolidados que cobrem TODO o material, guarda como synthesis:{disciplineId} no KV.
 *
 * GET /api/consolidate?disciplineId=historia-7
 * Devolve o synthesis guardado (ou null).
 */

interface Env {
  ANTHROPIC_API_KEY: string
  PINGO_CONTENT: KVNamespace
}

interface ContentItem {
  id: string
  disciplineId: string
  titulo: string
  resumo: string
  palavrasChave: string[]
  flashcards: { frente: string; verso: string }[]
  quiz: { pergunta: string; tipo: string; opcoes: string[]; correta: number; explicacao: string }[]
}

interface Synthesis {
  disciplineId: string
  flashcards: { frente: string; verso: string }[]
  quiz: { pergunta: string; tipo: string; opcoes: string[]; correta: number; explicacao: string }[]
  palavrasChave: string[]
  updatedAt: string
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url)
  const disciplineId = url.searchParams.get('disciplineId')
  if (!disciplineId) {
    return Response.json({ error: 'Missing disciplineId' }, { status: 400, headers: corsHeaders() })
  }
  const raw = await env.PINGO_CONTENT.get(`synthesis:${disciplineId}`)
  return Response.json(raw ? JSON.parse(raw) : null, { headers: corsHeaders() })
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const { disciplineId } = await request.json() as { disciplineId: string }

  if (!disciplineId) {
    return Response.json({ error: 'Missing disciplineId' }, { status: 400, headers })
  }

  // Busca todos os itens da disciplina
  const raw = await env.PINGO_CONTENT.get(`content:${disciplineId}`)
  const items: ContentItem[] = raw ? JSON.parse(raw) : []

  if (items.length === 0) {
    return Response.json({ error: 'No content found for discipline' }, { status: 404, headers })
  }

  // Combina todo o conteúdo
  const combined = items
    .map((i) => `Título: ${i.titulo}\n\n${i.resumo}`)
    .join('\n\n---\n\n')

  const systemPrompt = `És um assistente pedagógico especializado em criar materiais de estudo para alunos do ensino básico português.
Analisa o conteúdo fornecido e devolve APENAS um JSON válido, sem texto adicional antes ou depois.`

  const userPrompt = `Analisa o seguinte conteúdo educativo (múltiplos tópicos da mesma disciplina) e devolve um JSON com esta estrutura:

{
  "palavrasChave": ["palavra1", "palavra2", ..., "palavra10"],
  "flashcards": [
    { "frente": "pergunta ou conceito", "verso": "resposta ou definição" }
  ],
  "quiz": [
    {
      "pergunta": "texto da pergunta",
      "tipo": "multiple-choice",
      "opcoes": ["A", "B", "C", "D"],
      "correta": 0,
      "explicacao": "explicação"
    }
  ]
}

Regras:
- Gera 10 palavras-chave cobrindo todos os tópicos
- Gera 8 a 12 flashcards que cubram os conceitos mais importantes de TODOS os tópicos
- Gera 6 a 8 questões de quiz (mistura multiple-choice e true-false) cobrindo todos os tópicos
- Usa linguagem adequada para alunos do ensino básico
- Responde APENAS com o JSON, sem markdown, sem texto extra

Conteúdo:
${combined}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!res.ok) {
    return Response.json({ error: 'AI unavailable' }, { status: 502, headers })
  }

  const aiData = await res.json() as { content: { text: string }[] }
  const text = aiData.content[0]?.text ?? ''

  let parsed: { palavrasChave: string[]; flashcards: Synthesis['flashcards']; quiz: Synthesis['quiz'] }
  try {
    parsed = JSON.parse(text)
  } catch {
    return Response.json({ error: 'Failed to parse AI response' }, { status: 500, headers })
  }

  const synthesis: Synthesis = {
    disciplineId,
    flashcards: parsed.flashcards ?? [],
    quiz: parsed.quiz ?? [],
    palavrasChave: parsed.palavrasChave ?? [],
    updatedAt: new Date().toISOString(),
  }

  await env.PINGO_CONTENT.put(`synthesis:${disciplineId}`, JSON.stringify(synthesis))

  return Response.json(synthesis, { headers })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
