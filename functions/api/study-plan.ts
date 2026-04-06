interface Env {
  ANTHROPIC_API_KEY: string
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { subject, year, examDate, studyNote, materiais } = await request.json() as {
      subject: string
      year: string
      examDate: string
      studyNote: string
      materiais: { nome: string; conteudo: string }[]
    }

    if (!env.ANTHROPIC_API_KEY) {
      return Response.json({ error: 'API key not configured' }, { status: 500, headers })
    }

    // Calculate days available (today until day before exam)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exam = new Date(examDate)
    exam.setHours(0, 0, 0, 0)
    const daysAvailable = Math.max(1, Math.ceil((exam.getTime() - today.getTime()) / 86400000) - 1)

    const materiaisText = materiais.length > 0
      ? materiais.map((m) => `--- ${m.nome} ---\n${m.conteudo}`).join('\n\n')
      : 'nenhum'

    const userPrompt = `Matéria: ${subject}
Ano: ${year}
Data da prova: ${new Date(examDate).toLocaleDateString('pt-PT')}
Dias disponíveis: ${daysAvailable}
Ficha de estudo: ${studyNote || 'não fornecida'}
Outros materiais: ${materiaisText}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: `És um tutor especializado em criar planos de estudo para alunos do ensino básico português.

Cria um plano de estudo detalhado e equilibrado distribuído pelos dias disponíveis.

REGRAS:
- O plano começa hoje e termina um dia antes da prova
- Distribui o conteúdo de forma equilibrada pelos dias
- Para cada dia gera: tema a estudar, resumo curto (2-3 frases), 3 flashcards e 2 perguntas de quiz
- Os flashcards devem ter frente (pergunta) e verso (resposta)
- As perguntas de quiz devem ter 4 opções, índice da correta (0-3), e explicação
- Se não houver materiais de estudo, gera um plano genérico baseado na matéria e ano
- Se houver materiais, foca-te nesse conteúdo específico
- Escreve sempre em português de Portugal
- Usa datas no formato DD/MM/AAAA

Devolve APENAS JSON válido, sem markdown, sem texto antes ou depois. Formato:
{
  "resumo": "Plano de X dias para [matéria]",
  "dias": [
    {
      "dia": 1,
      "data": "DD/MM/AAAA",
      "tema": "...",
      "resumo": "...",
      "flashcards": [
        { "frente": "...", "verso": "..." }
      ],
      "quiz": [
        {
          "pergunta": "...",
          "opcoes": ["A", "B", "C", "D"],
          "correta": 0,
          "explicacao": "..."
        }
      ]
    }
  ]
}`,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!res.ok) {
      return Response.json({ error: 'AI request failed' }, { status: 502, headers })
    }

    const data = await res.json() as { content: { type: string; text: string }[] }
    const text = data.content?.[0]?.text ?? ''

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Invalid AI response' }, { status: 500, headers })
    }

    const plan = JSON.parse(jsonMatch[0])
    return Response.json(plan, { headers })
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
