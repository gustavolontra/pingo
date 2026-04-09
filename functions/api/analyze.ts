interface Env {
  ANTHROPIC_API_KEY: string
}

const SYSTEM_PROMPT = `És um assistente pedagógico especializado em criar materiais de estudo para alunos do ensino básico português.
Analisa o conteúdo fornecido e devolve APENAS um JSON válido, sem texto adicional antes ou depois.`

const USER_PROMPT = (content: string) => `Analisa o seguinte conteúdo educativo e devolve um JSON com esta estrutura exacta:

{
  "titulo": "título curto e claro do conteúdo",
  "materia": "nome da disciplina (História, Geografia, Matemática, Ciências Naturais, Português, Inglês, Físico-Química, etc.)",
  "ano": 7,
  "topico": "nome do tópico específico dentro da disciplina",
  "palavrasChave": ["palavra1", "palavra2", "palavra3", "palavra4", "palavra5"],
  "resumo": "resumo claro e pedagógico do conteúdo em 3-5 frases",
  "flashcards": [
    {
      "frente": "conceito, termo ou pergunta curta",
      "verso": "definição, resposta ou explicação",
      "exemplo": "exemplo concreto que ilustra o conceito"
    }
  ],
  "quiz": [
    {
      "pergunta": "texto completo da pergunta",
      "tipo": "multiple-choice",
      "opcoes": ["opção A", "opção B", "opção C", "opção D"],
      "correta": 0,
      "explicacao": "explicação clara de porquê esta resposta é correcta"
    },
    {
      "pergunta": "afirmação para classificar como verdadeira ou falsa",
      "tipo": "true-false",
      "opcoes": ["Verdadeiro", "Falso"],
      "correta": 0,
      "explicacao": "explicação da resposta correcta"
    }
  ]
}

Regras:
- Gera entre 5 e 8 flashcards
- Gera entre 4 e 6 questões de quiz (mistura de multiple-choice e true-false)
- Em multiple-choice, "correta" é o índice (0-3) da opção correcta
- Em true-false, "correta" é 0 para Verdadeiro, 1 para Falso
- Usa linguagem adequada para alunos do ensino básico
- Responde APENAS com o JSON, sem markdown, sem texto extra

Conteúdo a analisar:
${content}`

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()

  if (!env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500, headers })
  }

  const { content } = await request.json() as { content: string }

  if (!content?.trim()) {
    return Response.json({ error: 'content is required' }, { status: 400, headers })
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: USER_PROMPT(content) }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return Response.json({ error: `Anthropic API error: ${err}` }, { status: 502, headers })
  }

  const data = await response.json() as AnthropicResponse
  const text = data.content[0]?.text ?? ''

  // Try multiple parsing strategies
  let parsed: unknown = null
  try { parsed = JSON.parse(text) } catch { /* continue */ }
  if (!parsed) {
    const stripped = text.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    try { parsed = JSON.parse(stripped) } catch { /* continue */ }
    if (!parsed) {
      const m = stripped.match(/\{[\s\S]*\}/)
      if (m) try { parsed = JSON.parse(m[0]) } catch { /* continue */ }
    }
  }
  if (!parsed) {
    return Response.json({ error: 'Failed to parse AI response', raw: text.slice(0, 300) }, { status: 500, headers })
  }
  return Response.json(parsed, { headers })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
