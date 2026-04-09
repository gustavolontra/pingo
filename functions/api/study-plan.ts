interface Env {
  ANTHROPIC_API_KEY: string
}

function getRegras(diasDisponiveis: number, avancado: boolean) {
  const base = (() => {
    if (diasDisponiveis <= 2) return { flashcards: 20, quiz: 10, intensidade: 'Revisão intensiva', tempoEstimado: 60 }
    if (diasDisponiveis <= 5) return { flashcards: 15, quiz: 8, intensidade: 'Consolidação', tempoEstimado: 40 }
    if (diasDisponiveis <= 10) return { flashcards: 10, quiz: 5, intensidade: 'Aprendizagem gradual', tempoEstimado: 25 }
    return { flashcards: 6, quiz: 3, intensidade: 'Introdução suave', tempoEstimado: 15 }
  })()
  if (avancado) {
    return { ...base, tempoEstimado: base.tempoEstimado + 20, lacunas: 3, classificacao: 2, transformacao: 2, identificacao: 1 }
  }
  return base
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { subject, year, examDate, studyNote, materiais, avancado } = await request.json() as {
      subject: string
      year: string
      examDate: string
      avancado?: boolean
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

    const isAdvanced = avancado === true
    const regras = getRegras(daysAvailable, isAdvanced)

    // Truncate materials to avoid exceeding API limits (~50k chars total)
    const MAX_CHARS = 50000
    let totalChars = 0
    const truncatedMateriais = materiais.map((m) => {
      const remaining = MAX_CHARS - totalChars
      if (remaining <= 0) return null
      const content = m.conteudo.slice(0, remaining)
      totalChars += content.length
      return `--- ${m.nome} ---\n${content}`
    }).filter(Boolean)

    const materiaisText = truncatedMateriais.length > 0
      ? truncatedMateriais.join('\n\n')
      : 'nenhum'

    const todayStr = today.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })

    const userPrompt = `Matéria: ${subject}
Ano: ${year}
Data de hoje (Dia 1 do plano): ${todayStr}
Data da prova: ${new Date(examDate).toLocaleDateString('pt-PT')}
Dias disponíveis: ${daysAvailable}
Intensidade: ${regras.intensidade}
Flashcards por dia: ${regras.flashcards}
Quiz por dia: ${regras.quiz}${isAdvanced ? `
Exercícios de lacunas por dia: ${'lacunas' in regras ? regras.lacunas : 0}
Exercícios de classificação por dia: ${'classificacao' in regras ? regras.classificacao : 0}
Exercícios de transformação por dia: ${'transformacao' in regras ? regras.transformacao : 0}
Exercícios de identificação sintática por dia: ${'identificacao' in regras ? regras.identificacao : 0}` : ''}
Tempo estimado por dia: ${regras.tempoEstimado} minutos
Ficha de estudo: ${studyNote ? studyNote.slice(0, 20000) : 'não fornecida'}
Outros materiais: ${materiaisText}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 16384,
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
  "avancado": ${isAdvanced},
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
      }${isAdvanced ? `,
      "lacunas": [
        { "frase": "frase com ___ no lugar da palavra", "resposta": "palavra", "opcoes": ["op1","op2","op3","op4"], "explicacao": "regra" }
      ],
      "classificacao": [
        { "instrucao": "...", "colunas": ["A","B"], "itens": [{"palavra":"x","coluna":"A"}], "explicacao": "..." }
      ],
      "transformacao": [
        { "instrucao": "...", "frase_original": "...", "resposta": "...", "dica": "...", "explicacao": "..." }
      ],
      "identificacao": [
        { "instrucao": "...", "frase": "...", "constituintes": [{"texto":"...","funcao":"..."}], "explicacao": "..." }
      ]` : ''}
    }
  ]
}`,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      return Response.json({ error: `AI request failed (${res.status})`, detail: errBody.slice(0, 200) }, { status: 502, headers })
    }

    const data = await res.json() as { content: { type: string; text: string }[]; stop_reason?: string }
    const text = data.content?.[0]?.text ?? ''

    // If response was truncated, try to fix the JSON by closing brackets
    let jsonText = text.trim()
    if (data.stop_reason === 'max_tokens') {
      // Try to close any open brackets
      const openBraces = (jsonText.match(/\{/g) || []).length
      const closeBraces = (jsonText.match(/\}/g) || []).length
      const openBrackets = (jsonText.match(/\[/g) || []).length
      const closeBrackets = (jsonText.match(/\]/g) || []).length
      jsonText += ']'.repeat(Math.max(0, openBrackets - closeBrackets))
      jsonText += '}'.repeat(Math.max(0, openBraces - closeBraces))
    }

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Invalid AI response', detail: text.slice(0, 200) }, { status: 500, headers })
    }

    try {
      const plan = JSON.parse(jsonMatch[0])
      if (!plan.tempoEstimadoPorDia) plan.tempoEstimadoPorDia = regras.tempoEstimado
      return Response.json(plan, { headers })
    } catch {
      return Response.json({ error: 'Failed to parse AI response', detail: jsonMatch[0].slice(0, 200) }, { status: 500, headers })
    }
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
