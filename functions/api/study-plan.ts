interface Env {
  ANTHROPIC_API_KEY: string
}

function getRegras(diasDisponiveis: number, avancado: boolean) {
  const base = (() => {
    if (diasDisponiveis <= 2) return { flashcards: 8, quiz: 4, intensidade: 'Revisão intensiva', tempoEstimado: 45 }
    if (diasDisponiveis <= 5) return { flashcards: 6, quiz: 3, intensidade: 'Consolidação', tempoEstimado: 30 }
    if (diasDisponiveis <= 10) return { flashcards: 5, quiz: 3, intensidade: 'Aprendizagem gradual', tempoEstimado: 20 }
    return { flashcards: 4, quiz: 2, intensidade: 'Introdução suave', tempoEstimado: 15 }
  })()
  if (avancado) {
    return { ...base, flashcards: Math.ceil(base.flashcards / 2), tempoEstimado: base.tempoEstimado + 20, lacunas: 3, classificacao: 2, transformacao: 2, identificacao: 1 }
  }
  return base
}

// POST: generate plan STRUCTURE only (themes + summaries, no exercises)
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
    const daysAvailable = Math.max(1, Math.ceil((exam.getTime() - today.getTime()) / 86400000))

    const isAdvanced = avancado === true
    const regras = getRegras(daysAvailable, isAdvanced)

    // Truncate materials
    const MAX_CHARS = 8000
    let totalChars = 0
    const truncatedMateriais = materiais.map((m) => {
      const remaining = MAX_CHARS - totalChars
      if (remaining <= 0) return null
      const content = m.conteudo.slice(0, remaining)
      totalChars += content.length
      return `--- ${m.nome} ---\n${content}`
    }).filter(Boolean)

    const materiaisText = truncatedMateriais.length > 0 ? truncatedMateriais.join('\n\n') : 'nenhum'
    const todayStr = today.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })

    const userPrompt = `Matéria: ${subject}
Ano: ${year}
Data de hoje (Dia 1): ${todayStr}
Data da prova: ${new Date(examDate).toLocaleDateString('pt-PT')}
Dias disponíveis: ${daysAvailable}
Ficha de estudo: ${studyNote ? studyNote.slice(0, 4000) : 'não fornecida'}
Materiais: ${materiaisText}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: `És um tutor especializado em criar planos de estudo para alunos do ensino básico português.

Cria APENAS a estrutura do plano — temas e resumos para cada dia. NÃO geres flashcards, quiz nem exercícios.

REGRAS:
- Dia 1 é HOJE (${todayStr})
- O plano termina um dia antes da prova
- Distribui o conteúdo de forma equilibrada
- O último dia é SEMPRE revisão geral
- Se houver materiais, baseia-te neles
- Escreve SEMPRE em Português de Portugal (PT-PT), NUNCA em Português do Brasil
- Usa terminologia PT-PT: "verbo principal" (não "verbo de ação"), "grave/aguda/esdrúxula" (não "paroxítona/oxítona/proparoxítona"), "complemento direto/indireto" (não "objeto direto/indireto"), "conjuntivo" (não "subjuntivo")
- Tratamento "tu/vós" (não "você"), vocabulário de Portugal (autocarro, telemóvel, etc.)
- Datas no formato DD/MM/AAAA

Devolve APENAS JSON válido:
{
  "resumo": "Plano de ${daysAvailable} dias para ${subject} — ritmo ${regras.intensidade}",
  "tempoEstimadoPorDia": ${regras.tempoEstimado},
  "avancado": ${isAdvanced},
  "regras": { "flashcards": ${regras.flashcards}, "quiz": ${regras.quiz}${isAdvanced ? `, "lacunas": ${regras.lacunas}, "classificacao": ${regras.classificacao}, "transformacao": ${regras.transformacao}, "identificacao": ${regras.identificacao}` : ''} },
  "dias": [
    { "dia": 1, "data": "DD/MM/AAAA", "tema": "tema do dia", "resumo": "2-3 frases sobre o que estudar" }
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

    let plan: Record<string, unknown> | null = null
    const stripped = text.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    try { plan = JSON.parse(stripped) } catch { /* continue */ }
    if (!plan) {
      const m = stripped.match(/\{[\s\S]*\}/)
      if (m) try { plan = JSON.parse(m[0]) } catch { /* continue */ }
    }

    if (!plan) {
      return Response.json({ error: 'Formato inesperado da IA — tenta novamente' }, { status: 500, headers })
    }

    if (!plan.tempoEstimadoPorDia) plan.tempoEstimadoPorDia = regras.tempoEstimado
    return Response.json(plan, { headers })
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
