interface Env {
  ANTHROPIC_API_KEY: string
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { pergunta, respostaAluno, respostaEsperada } = await request.json() as {
      pergunta: string; respostaAluno: string; respostaEsperada: string
    }

    if (!env.ANTHROPIC_API_KEY) {
      return Response.json({ error: 'API key not configured' }, { status: 500, headers })
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `Avalia a resposta de um aluno do ensino básico português.

Compara a resposta do aluno com os pontos-chave esperados.
Devolve APENAS JSON válido:
- "nivel": "bom" | "parcial" | "insuficiente"
- "feedback": frase curta em português de Portugal (máximo 2 frases)
- Se "bom": elogia e confirma os pontos certos
- Se "parcial": diz o que faltou mencionar
- Se "insuficiente": indica os pontos importantes que faltaram

Formato: {"nivel":"...","feedback":"..."}`,
        messages: [{
          role: 'user',
          content: `Pergunta: ${pergunta}\nResposta esperada (pontos-chave): ${respostaEsperada}\nResposta do aluno: ${respostaAluno}`,
        }],
      }),
    })

    if (!res.ok) {
      return Response.json({ error: 'AI request failed' }, { status: 502, headers })
    }

    const data = await res.json() as { content: { type: string; text: string }[] }
    const text = data.content?.[0]?.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*?\}/)
    if (!jsonMatch) {
      return Response.json({ nivel: 'parcial', feedback: 'Não foi possível avaliar. Tenta novamente.' }, { headers })
    }
    return Response.json(JSON.parse(jsonMatch[0]), { headers })
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
