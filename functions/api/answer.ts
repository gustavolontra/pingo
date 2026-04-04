interface Env {
  ANTHROPIC_API_KEY: string
  PINGO_CONTENT: KVNamespace
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()

  const { query, context } = await request.json() as { query: string; context: string }

  if (!query?.trim()) {
    return Response.json({ error: 'Missing query' }, { status: 400, headers })
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

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: query }],
    }),
  })

  if (!response.ok) {
    return Response.json({ error: 'AI unavailable' }, { status: 502, headers })
  }

  const data = await response.json() as { content: { text: string }[] }
  const text = data.content?.[0]?.text ?? ''

  return Response.json({ answer: text }, { headers })
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
