interface Env {
  ANTHROPIC_API_KEY: string
  PINGO_CONTENT: KVNamespace
}

const SYSTEM_PROMPT = `És um assistente de estudo especializado em conteúdos escolares portugueses do 2.º e 3.º ciclo.
Gera exercícios interativos do tipo solicitado com base no conteúdo fornecido.
Responde APENAS com um array JSON válido, sem texto antes nem depois, sem markdown, sem blocos de código. Inclui sempre os campos: tipo, explicacao, topico.`

function userPrompt(conteudo: string, topico: string, tipo: string): string {
  const structures: Record<string, string> = {
    lacuna: `[{"tipo":"lacuna","frase":"frase com ___ no lugar da palavra omitida","resposta":"palavra correta","opcoes":["op1","op2","op3","op4"],"explicacao":"regra gramatical aplicada","topico":"tópico"}]`,
    classificacao: `[{"tipo":"classificacao","instrucao":"instrução clara","colunas":["Coluna A","Coluna B","Coluna C"],"itens":[{"palavra":"exemplo","coluna":"Coluna A"}],"explicacao":"critério que distingue as colunas","topico":"tópico"}]`,
    transformacao: `[{"tipo":"transformacao","instrucao":"instrução clara","frase_original":"frase original","resposta":"frase transformada correta","dica":"pista gramatical curta","explicacao":"regra aplicada","topico":"tópico"}]`,
    identificacao: `[{"tipo":"identificacao","instrucao":"instrução clara","frase":"frase completa","constituintes":[{"texto":"segmento","funcao":"função sintática"}],"explicacao":"justificação da análise","topico":"tópico"}]`,
  }

  return `Conteúdo: ${conteudo.slice(0, 20000)}
Tópico: ${topico}
Gera 5 exercícios do tipo '${tipo}' com esta estrutura:

${structures[tipo] ?? structures.lacuna}`
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>
}

// GET: fetch existing exercises from KV
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const learningId = url.searchParams.get('learningId')
  const tipo = url.searchParams.get('tipo')

  if (!learningId || !tipo) {
    return Response.json({ error: 'Missing learningId or tipo' }, { status: 400, headers })
  }

  const key = `advanced_exercises:${learningId}:${tipo}`
  const raw = await env.PINGO_CONTENT.get(key)
  if (!raw) {
    return Response.json({ error: 'Not found' }, { status: 404, headers })
  }

  return Response.json(JSON.parse(raw), { headers })
}

// POST: generate new exercises via AI and store in KV
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()

  if (!env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500, headers })
  }

  try {
    const { learningId, tipo, conteudo, topico } = await request.json() as {
      learningId: string; tipo: string; conteudo: string; topico: string
    }

    if (!learningId || !tipo || !conteudo) {
      return Response.json({ error: 'Missing required fields' }, { status: 400, headers })
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
        messages: [{ role: 'user', content: userPrompt(conteudo, topico, tipo) }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return Response.json({ error: `AI request failed: ${err.slice(0, 200)}` }, { status: 502, headers })
    }

    const data = await response.json() as AnthropicResponse
    const text = data.content[0]?.text ?? ''

    // Try multiple parsing strategies
    let exercicios: unknown[] | null = null

    // Strategy 1: direct parse
    try { exercicios = JSON.parse(text) } catch { /* continue */ }

    // Strategy 2: extract JSON array
    if (!exercicios) {
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try { exercicios = JSON.parse(jsonMatch[0]) } catch { /* continue */ }
      }
    }

    // Strategy 3: strip markdown code blocks
    if (!exercicios) {
      const stripped = text.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
      try { exercicios = JSON.parse(stripped) } catch { /* continue */ }
      if (!exercicios) {
        const m2 = stripped.match(/\[[\s\S]*\]/)
        if (m2) try { exercicios = JSON.parse(m2[0]) } catch { /* continue */ }
      }
    }

    if (!exercicios || !Array.isArray(exercicios)) {
      return Response.json({ error: 'Failed to parse AI response', detail: text.slice(0, 300) }, { status: 500, headers })
    }

    const result = {
      learningId,
      tipo,
      topico,
      exercicios,
      criadoEm: new Date().toISOString(),
    }

    // Store in KV
    const key = `advanced_exercises:${learningId}:${tipo}`
    await env.PINGO_CONTENT.put(key, JSON.stringify(result))

    return Response.json(result, { status: 201, headers })
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500, headers })
  }
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
