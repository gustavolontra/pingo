interface Env {
  ANTHROPIC_API_KEY: string
}

function getRegras(diasDisponiveis: number) {
  if (diasDisponiveis <= 2) return { flashcards: 20, quiz: 10, intensidade: 'Revisão intensiva', tempoEstimado: 60 }
  if (diasDisponiveis <= 5) return { flashcards: 15, quiz: 8, intensidade: 'Consolidação', tempoEstimado: 40 }
  if (diasDisponiveis <= 10) return { flashcards: 10, quiz: 5, intensidade: 'Aprendizagem gradual', tempoEstimado: 25 }
  return { flashcards: 6, quiz: 3, intensidade: 'Introdução suave', tempoEstimado: 15 }
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exam = new Date(examDate)
    exam.setHours(0, 0, 0, 0)
    // Days from today (inclusive) to day before exam (inclusive)
    // e.g. today=07, exam=14 → 14-07=7 days (07,08,09,10,11,12,13)
    const daysAvailable = Math.max(1, Math.ceil((exam.getTime() - today.getTime()) / 86400000))

    const regras = getRegras(daysAvailable)

    const materiaisText = materiais.length > 0
      ? materiais.map((m) => `--- ${m.nome} ---\n${m.conteudo}`).join('\n\n')
      : 'nenhum'

    const todayStr = today.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })

    const userPrompt = `Matéria: ${subject}
Ano: ${year}
Data de hoje (Dia 1 do plano): ${todayStr}
Data da prova: ${new Date(examDate).toLocaleDateString('pt-PT')}
Dias disponíveis: ${daysAvailable}
Intensidade: ${regras.intensidade}
Flashcards por dia: ${regras.flashcards}
Quiz por dia: ${regras.quiz}
Tempo estimado por dia: ${regras.tempoEstimado} minutos
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
        max_tokens: 8192,
        system: `És um tutor especializado em criar planos de estudo para alunos do ensino básico português.

Cria um plano de estudo detalhado e equilibrado distribuído pelos dias disponíveis.

REGRAS OBRIGATÓRIAS:
- O Dia 1 do plano é HOJE (a data indicada no pedido) — NÃO começar amanhã
- O plano termina um dia antes da prova
- Todos os dias têm o MESMO ritmo — não reduzir nem aumentar ao longo do plano
- Número EXACTO de flashcards por dia: conforme indicado no pedido
- Número EXACTO de quiz por dia: conforme indicado no pedido
- Cada dia inclui também 1 "resumoActivo" — uma pergunta aberta para o aluno explicar por palavras próprias
- O ÚLTIMO DIA é SEMPRE uma revisão geral: 20 flashcards dos conceitos mais importantes de TODOS os dias anteriores + 10 quizzes mistos + 1 resumo activo de revisão global
- Se houver ficha de estudo ou materiais, foca-te nesse conteúdo específico
- Se NÃO houver materiais, gera conteúdo genérico baseado na matéria e ano
- Os flashcards devem ter frente (pergunta) e verso (resposta)
- As perguntas de quiz devem ter 4 opções, índice da correta (0-3), e explicação
- O resumoActivo deve ter uma pergunta aberta e uma respostaEsperada com os pontos-chave
- Escreve sempre em português de Portugal
- Usa datas no formato DD/MM/AAAA

Devolve APENAS JSON válido, sem markdown, sem texto antes ou depois. Formato:
{
  "resumo": "Plano de X dias para [matéria] — ritmo [intensidade]",
  "tempoEstimadoPorDia": ${regras.tempoEstimado},
  "dias": [
    {
      "dia": 1,
      "data": "DD/MM/AAAA",
      "tema": "...",
      "resumo": "Hoje vais estudar...",
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
      ],
      "resumoActivo": {
        "pergunta": "Explica por palavras tuas...",
        "respostaEsperada": "Pontos-chave que devem ser mencionados: ..."
      }
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

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Invalid AI response' }, { status: 500, headers })
    }

    const plan = JSON.parse(jsonMatch[0])
    // Inject tempoEstimado if not present
    if (!plan.tempoEstimadoPorDia) plan.tempoEstimadoPorDia = regras.tempoEstimado
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
