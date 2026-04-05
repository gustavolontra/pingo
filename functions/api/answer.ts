interface Env {
  ANTHROPIC_API_KEY: string
  PINGO_CONTENT: KVNamespace
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const { query, context } = await request.json() as { query: string; context: string }

  if (!query?.trim()) {
    return Response.json({ error: 'Missing query' }, { status: 400, headers: corsHeaders() })
  }

  const systemPrompt = `És um assistente de estudo para alunos do 3.º Ciclo do Ensino Básico português (7.º, 8.º e 9.º ano).

LINGUAGEM INAPROPRIADA (verifica PRIMEIRO, antes de tudo):
Se a mensagem contiver xingamentos, palavrões ou linguagem desrespeitosa, responde EXACTAMENTE com este texto e nada mais:
"Ei, aqui estudamos com respeito! 😊 Tenta de novo com outras palavras e eu ajudo-te com o que precisares."
Se reincidir, repete a mesma mensagem calmamente. Nunca de forma agressiva ou em tom de sermão.

FILTRO DE TEMA (verifica a seguir):
Se a pergunta não estiver relacionada com matérias escolares do 3.º Ciclo (História, Geografia, Matemática, Português, Ciências Naturais, Físico-Química, Inglês, TIC ou afins), responde EXACTAMENTE com este texto e nada mais:
"Boa tentativa! 😄 Mas esse assunto foge um bocadinho ao que estudamos aqui. O Pingo foca-se nos conteúdos do 3.º Ciclo — se tiveres dúvidas de História, Geografia, Matemática ou outras matérias, estamos aqui para ajudar!"

FORMATO DAS RESPOSTAS (só para perguntas escolares):
- Pergunta simples → resposta directa em 2-3 linhas, sem introdução
- Lista (países, reis, fórmulas, datas) → vai directo à lista, sem parágrafo introdutório
- Conceito → máximo 1 parágrafo curto + pontos-chave se útil
- Nunca repetir a pergunta
- Nunca começar com "Claro!", "Com todo o gosto", "Óptima pergunta" ou frases semelhantes
- Usa **negrito** apenas para termos-chave importantes
- Responde sempre em português de Portugal

Conteúdo da plataforma (usa como base quando relevante):
${context || '(sem conteúdo específico encontrado para este tema)'}`

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: query }],
    }),
  })

  if (!anthropicRes.ok || !anthropicRes.body) {
    return Response.json({ error: 'AI unavailable' }, { status: 502, headers: corsHeaders() })
  }

  // Forward Anthropic SSE stream, extracting only text deltas
  const reader = anthropicRes.body.getReader()
  const decoder = new TextDecoder()

  const stream = new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) { controller.close(); return }

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') { controller.close(); return }
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              controller.enqueue(new TextEncoder().encode(parsed.delta.text))
            }
          } catch { /* skip malformed lines */ }
        }
      }
    },
    cancel() { reader.cancel() },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Content-Type-Options': 'nosniff',
    },
  })
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
