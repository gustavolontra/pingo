interface Env {
  ANTHROPIC_API_KEY: string
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { subject, year, tema, resumo, regras, materiais, avancado } = await request.json() as {
      subject: string
      year: string
      tema: string
      resumo: string
      regras: { flashcards: number; quiz: number; lacunas?: number; classificacao?: number; transformacao?: number; identificacao?: number }
      materiais: string
      avancado: boolean
    }

    if (!env.ANTHROPIC_API_KEY) {
      return Response.json({ error: 'API key not configured' }, { status: 500, headers })
    }

    const advancedBlock = avancado ? `
Também gera:
- ${regras.lacunas ?? 3} exercícios de lacunas: { "frase": "frase com ___", "resposta": "palavra", "opcoes": ["a","b","c","d"], "explicacao": "regra" }
- ${regras.classificacao ?? 2} exercícios de classificação: { "instrucao": "...", "colunas": ["A","B"], "itens": [{"palavra":"x","coluna":"A"}], "explicacao": "..." }
- ${regras.transformacao ?? 2} exercícios de transformação: { "instrucao": "...", "frase_original": "...", "resposta": "...", "dica": "...", "explicacao": "..." }
- ${regras.identificacao ?? 1} exercícios de identificação: { "instrucao": "...", "frase": "...", "constituintes": [{"texto":"...","funcao":"..."}], "explicacao": "..." }` : ''

    const advancedFormat = avancado ? `,
  "lacunas": [...],
  "classificacao": [...],
  "transformacao": [...],
  "identificacao": [...]` : ''

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: `Gera conteúdo de estudo para UM dia de um plano de estudo de ${subject} (${year}).

Tema do dia: ${tema}
Contexto: ${resumo}

Gera EXACTAMENTE:
- ${regras.flashcards} flashcards (frente/verso)
- ${regras.quiz} perguntas de quiz (4 opções, índice correta 0-3, explicação)
- 1 resumoActivo (pergunta aberta + pontos-chave esperados)${advancedBlock}

Português de Portugal. Devolve APENAS JSON válido:
{
  "flashcards": [{ "frente": "...", "verso": "..." }],
  "quiz": [{ "pergunta": "...", "opcoes": ["A","B","C","D"], "correta": 0, "explicacao": "..." }],
  "resumoActivo": { "pergunta": "...", "respostaEsperada": "..." }${advancedFormat}
}`,
        messages: [{ role: 'user', content: materiais ? `Material de referência:\n${materiais.slice(0, 6000)}` : `Gera conteúdo genérico para o tema "${tema}" de ${subject} ${year}.` }],
      }),
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      return Response.json({ error: `AI failed (${res.status})`, detail: errBody.slice(0, 200) }, { status: 502, headers })
    }

    const data = await res.json() as { content: { type: string; text: string }[] }
    const text = data.content?.[0]?.text ?? ''

    let parsed: Record<string, unknown> | null = null
    const stripped = text.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    try { parsed = JSON.parse(stripped) } catch { /* continue */ }
    if (!parsed) {
      const m = stripped.match(/\{[\s\S]*\}/)
      if (m) try { parsed = JSON.parse(m[0]) } catch { /* continue */ }
    }

    if (!parsed) {
      return Response.json({ error: 'Formato inesperado — tenta novamente' }, { status: 500, headers })
    }

    return Response.json(parsed, { headers })
  } catch (e) {
    return Response.json({ error: 'Internal error', detail: String(e).slice(0, 200) }, { status: 500, headers })
  }
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
