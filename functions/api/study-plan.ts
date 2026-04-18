interface Env {
  ANTHROPIC_API_KEY: string
}

interface MaterialInput {
  nome?: string
  title?: string
  conteudo?: string
  content?: string
  type?: string
}

interface PlanoDia {
  dia: number
  data: string
  tema: string
  resumo: string
  fontes?: number[]
}

function getRegras(days: number, totalChars: number, avancado: boolean) {
  const density = totalChars / Math.max(days, 1)
  const dense = density > 3000
  const base = (() => {
    if (days <= 2) return { flashcards: 8, quiz: 4, intensidade: 'Revisão intensiva', tempoEstimado: 45 }
    if (days <= 5) return { flashcards: dense ? 8 : 6, quiz: dense ? 4 : 3, intensidade: 'Consolidação', tempoEstimado: dense ? 40 : 30 }
    if (days <= 10) return { flashcards: dense ? 6 : 5, quiz: 3, intensidade: 'Aprendizagem gradual', tempoEstimado: dense ? 25 : 20 }
    return { flashcards: dense ? 5 : 4, quiz: 2, intensidade: 'Introdução suave', tempoEstimado: dense ? 20 : 15 }
  })()
  if (avancado) {
    return { ...base, flashcards: Math.ceil(base.flashcards / 2), tempoEstimado: base.tempoEstimado + 20, lacunas: 3, classificacao: 2, transformacao: 2, identificacao: 1 }
  }
  return base
}

function validatePlano(dias: PlanoDia[], daysAvailable: number): string[] {
  const errors: string[] = []
  if (!Array.isArray(dias) || dias.length < 1) errors.push('Plano vazio')
  if (dias.length > daysAvailable) errors.push(`${dias.length} dias gerados para ${daysAvailable} disponíveis`)
  const lastTema = dias.at(-1)?.tema?.toLowerCase() ?? ''
  if (dias.length > 1 && !lastTema.includes('revis')) errors.push('Último dia não é revisão')
  return errors
}

function applyRevisaoEspacada(dias: PlanoDia[]): PlanoDia[] {
  return dias.map((dia, i) => {
    if (i > 0 && i % 3 === 0 && i < dias.length - 1) {
      const anterior = dias[i - 1]?.tema
      if (anterior) {
        return { ...dia, resumo: `[Revisão rápida: ${anterior}] — ${dia.resumo}` }
      }
    }
    return dia
  })
}

// POST: generate plan STRUCTURE only (themes + summaries, no exercises)
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const body = await request.json() as {
      subject?: string
      year?: string
      examDate?: string
      targetDate?: string
      goal?: 'estudo' | 'exame'
      title?: string
      topics?: string
      avancado?: boolean
      studyNote?: string
      materiais?: MaterialInput[]
      materials?: MaterialInput[]
    }

    if (!env.ANTHROPIC_API_KEY) {
      return Response.json({ error: 'API key not configured' }, { status: 500, headers })
    }

    const subject = body.subject ?? ''
    const year = body.year ?? ''
    const goal: 'estudo' | 'exame' = body.goal ?? (body.examDate || body.targetDate ? 'exame' : 'estudo')
    const title = body.title ?? (subject ? `${subject}${year ? ` — ${year}` : ''}` : 'Plano de estudo')
    const topics = body.topics ?? ''
    const rawMaterials = body.materials ?? body.materiais ?? []
    const normalizedMaterials = rawMaterials.map((m) => ({
      title: m.title ?? m.nome ?? 'Material',
      content: m.content ?? m.conteudo ?? '',
      type: m.type ?? 'text',
    })).filter((m) => m.content.trim().length > 0)

    if (body.studyNote && body.studyNote.trim()) {
      normalizedMaterials.push({ title: 'Ficha de estudo', content: body.studyNote, type: 'note' })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const targetDateStr = body.targetDate ?? body.examDate
    let daysAvailable = 10
    if (goal === 'exame' && targetDateStr) {
      const target = new Date(targetDateStr)
      target.setHours(0, 0, 0, 0)
      daysAvailable = Math.max(1, Math.ceil((target.getTime() - today.getTime()) / 86400000))
    }

    const isAdvanced = body.avancado === true
    const totalChars = normalizedMaterials.reduce((sum, m) => sum + m.content.length, 0)
    const regras = getRegras(daysAvailable, totalChars, isAdvanced)

    const MAX_PER_MATERIAL = 1500
    const materialsBlock = normalizedMaterials
      .map((m, i) => `[M${i}|${m.title}|${m.type}]\n${m.content.slice(0, MAX_PER_MATERIAL)}`)
      .join('\n---\n')

    const hasOwnMaterial = normalizedMaterials.length > 0
    const todayStr = today.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const targetStr = targetDateStr ? new Date(targetDateStr).toLocaleDateString('pt-PT') : ''

    const userPrompt = `${hasOwnMaterial ? `MATERIAIS:\n${materialsBlock}\n\n` : ''}TÍTULO: ${title}
TÓPICOS: ${topics || '(não especificado)'}
OBJETIVO: ${goal === 'exame' ? `Exame em ${daysAvailable} dias (${targetStr})` : 'Aprendizagem contínua'}
DATA DE HOJE (Dia 1): ${todayStr}
${subject ? `MATÉRIA: ${subject}\n` : ''}${year ? `NÍVEL: ${year}\n` : ''}${!hasOwnMaterial ? '\nNão há materiais fornecidos — gera o conteúdo base a partir dos tópicos.' : ''}`

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
        system: `És um tutor especializado em criar planos de estudo personalizados.

Cria APENAS a estrutura do plano — temas e resumos para cada dia. NÃO geres flashcards, quiz nem exercícios.

REGRAS:
- Dia 1 é HOJE (${todayStr})
- ${goal === 'exame' ? `O plano termina um dia antes do exame (total: ${daysAvailable} dias)` : `Plano contínuo — usa entre 5 e 10 dias consoante a quantidade de tópicos`}
- Distribui o conteúdo de forma equilibrada
- O último dia é SEMPRE revisão geral (tema deve incluir a palavra "revisão")
- Cada dia deve indicar em "fontes" os ÍNDICES dos materiais usados (0-based, array vazio se não usou nenhum)
- Se houver materiais, baseia-te neles antes de improvisar
- Escreve SEMPRE em Português de Portugal (PT-PT), NUNCA em Português do Brasil
- Usa terminologia PT-PT: "verbo principal" (não "verbo de ação"), "grave/aguda/esdrúxula" (não "paroxítona/oxítona/proparoxítona"), "complemento direto/indireto" (não "objeto direto/indireto"), "conjuntivo" (não "subjuntivo")
- Tratamento "tu/vós" (não "você"), vocabulário de Portugal (autocarro, telemóvel, etc.)
- Datas no formato DD/MM/AAAA

Devolve APENAS JSON válido:
{
  "resumo": "Plano de N dias — ritmo ${regras.intensidade}",
  "tempoEstimadoPorDia": ${regras.tempoEstimado},
  "avancado": ${isAdvanced},
  "regras": { "flashcards": ${regras.flashcards}, "quiz": ${regras.quiz}${isAdvanced ? `, "lacunas": ${regras.lacunas}, "classificacao": ${regras.classificacao}, "transformacao": ${regras.transformacao}, "identificacao": ${regras.identificacao}` : ''} },
  "dias": [
    { "dia": 1, "data": "DD/MM/AAAA", "tema": "tema do dia", "resumo": "2-3 frases sobre o que estudar", "fontes": [0, 1] }
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

    let plan: { resumo?: string; tempoEstimadoPorDia?: number; avancado?: boolean; regras?: Record<string, number>; dias?: PlanoDia[] } | null = null
    const stripped = text.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    try { plan = JSON.parse(stripped) } catch { /* continue */ }
    if (!plan) {
      const m = stripped.match(/\{[\s\S]*\}/)
      if (m) try { plan = JSON.parse(m[0]) } catch { /* continue */ }
    }

    if (!plan || !Array.isArray(plan.dias)) {
      return Response.json({ error: 'Formato inesperado da IA — tenta novamente' }, { status: 500, headers })
    }

    const errors = validatePlano(plan.dias, daysAvailable)
    if (errors.length > 0) {
      return Response.json({ error: 'Plano inválido', detail: errors.join('; ') }, { status: 502, headers })
    }

    plan.dias = applyRevisaoEspacada(plan.dias)

    if (!plan.tempoEstimadoPorDia) plan.tempoEstimadoPorDia = regras.tempoEstimado
    if (!plan.regras) plan.regras = regras as unknown as Record<string, number>
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
