import { callLLM, LLMError, type LLMEnv } from '../_shared/llm'

interface Env extends LLMEnv {}

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

/**
 * Escala quantidade de exercícios por dia conforme a compressão do plano.
 * Baseline: 9 dias de conteúdo → 5 flashcards + 3 quiz/dia.
 * Menos dias → mais exercícios/dia para manter a cobertura total similar,
 * com tectos práticos para não sobrecarregar.
 */
function getRegras(contentDays: number, avancado: boolean) {
  const REFERENCE_DAYS = 9
  const BASE_FLASH = 5
  const BASE_QUIZ = 3
  const BASE_MINUTOS = 20

  const safeDays = Math.max(1, contentDays)
  const factor = REFERENCE_DAYS / safeDays

  const flashcards = Math.min(15, Math.max(BASE_FLASH, Math.round(BASE_FLASH * factor)))
  const quiz = Math.min(10, Math.max(BASE_QUIZ, Math.round(BASE_QUIZ * factor)))
  const tempoEstimado = Math.min(60, Math.max(BASE_MINUTOS, Math.round(BASE_MINUTOS * Math.sqrt(factor))))

  const intensidade = factor >= 4 ? 'Revisão intensiva'
    : factor >= 2 ? 'Consolidação'
    : factor > 1.1 ? 'Ritmo acelerado'
    : 'Ritmo linear'

  const base = { flashcards, quiz, intensidade, tempoEstimado }
  if (avancado) {
    return {
      ...base,
      flashcards: Math.max(3, Math.floor(flashcards * 0.7)),
      tempoEstimado: Math.min(75, tempoEstimado + 20),
      lacunas: 3,
      classificacao: 2,
      transformacao: 2,
      identificacao: 1,
    }
  }
  return base
}

function validatePlano(dias: PlanoDia[], expectedDays: number): string[] {
  const errors: string[] = []
  if (!Array.isArray(dias) || dias.length < 1) errors.push('Plano vazio')
  if (dias.length > expectedDays) errors.push(`${dias.length} dias gerados para ${expectedDays} esperados`)
  const lastTema = dias.at(-1)?.tema?.toLowerCase() ?? ''
  if (dias.length > 1 && !lastTema.includes('revis')) errors.push('Último dia não é revisão')
  return errors
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

    // A validação da chave é feita dentro de callLLM() conforme o provider escolhido.

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

    // Número de dias: exame usa daysAvailable; estudo contínuo usa heurística simples por tópicos.
    // Reservamos sempre o último dia para revisão geral.
    const topicCount = Math.max(1, (topics ?? '').split(/[,\n]/).map((t) => t.trim()).filter(Boolean).length)
    const plannedDays = goal === 'exame'
      ? daysAvailable
      : Math.min(14, Math.max(5, topicCount + 1))

    // Divide cada material em plannedDays-1 fatias lineares (último dia = revisão) e constrói o bloco de contexto.
    const contentDays = Math.max(1, plannedDays - 1)
    // Regras escalam com a compressão: plannos curtos têm mais flashcards/quiz por dia.
    const regras = getRegras(contentDays, isAdvanced)
    const MAX_PER_MATERIAL = 1500
    const materialsBlock = normalizedMaterials
      .map((m, i) => {
        const sliceSize = Math.ceil(m.content.length / contentDays)
        const slices = Array.from({ length: contentDays }, (_, d) =>
          m.content.slice(d * sliceSize, (d + 1) * sliceSize).slice(0, MAX_PER_MATERIAL),
        ).filter((s) => s.trim().length > 0)
        const header = `[M${i}|${m.title}|${m.type}] (dividido em ${slices.length} partes)`
        const body = slices.map((s, d) => `— Parte ${d + 1}/${slices.length}:\n${s}`).join('\n')
        return `${header}\n${body}`
      })
      .join('\n---\n')

    const hasOwnMaterial = normalizedMaterials.length > 0
    const todayStr = today.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const targetStr = targetDateStr ? new Date(targetDateStr).toLocaleDateString('pt-PT') : ''

    const userPrompt = `${hasOwnMaterial ? `MATERIAIS:\n${materialsBlock}\n\n` : ''}TÍTULO: ${title}
TÓPICOS: ${topics || '(não especificado)'}
OBJETIVO: ${goal === 'exame' ? `Exame em ${daysAvailable} dias (${targetStr})` : 'Aprendizagem contínua'}
DATA DE HOJE (Dia 1): ${todayStr}
${subject ? `MATÉRIA: ${subject}\n` : ''}${year ? `NÍVEL: ${year}\n` : ''}${!hasOwnMaterial ? '\nNão há materiais fornecidos — gera o conteúdo base a partir dos tópicos.' : ''}`

    const systemPrompt = `És um tutor especializado em criar planos de estudo personalizados.

Cria APENAS a estrutura do plano — temas e resumos para cada dia. NÃO geres flashcards, quiz nem exercícios.

REGRAS:
- Dia 1 é HOJE (${todayStr})
- Total de dias: EXACTAMENTE ${plannedDays} (último = revisão)
- **DIVISÃO LINEAR**: distribui os tópicos pela ordem que aparecem — dia 1 cobre o início, dia 2 o seguinte, e assim sucessivamente. Não saltes nem reordenes.
- Se houver materiais e estiverem pré-divididos em "Parte 1/N", "Parte 2/N"..., alinha cada dia com a parte correspondente.
- O último dia é SEMPRE revisão geral (tema deve incluir a palavra "revisão") e resume/consolida os anteriores.
- Cada dia deve indicar em "fontes" os ÍNDICES dos materiais usados (0-based, array vazio se não usou nenhum).
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
}`

    const llmOverride = new URL(request.url).searchParams.get('llm')
    let llmResult
    try {
      llmResult = await callLLM(env, {
        system: systemPrompt,
        user: userPrompt,
        maxTokens: 8192,
        model: 'deep',
      }, llmOverride)
    } catch (err) {
      if (err instanceof LLMError) {
        return Response.json({ error: `AI request failed (${err.status})`, provider: err.provider, detail: err.detail }, { status: 502, headers })
      }
      throw err
    }
    const text = llmResult.text

    let plan: { resumo?: string; tempoEstimadoPorDia?: number; avancado?: boolean; regras?: Record<string, number>; dias?: PlanoDia[] } | null = null
    const stripped = text.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    try { plan = JSON.parse(stripped) } catch { /* continue */ }
    if (!plan) {
      const m = stripped.match(/\{[\s\S]*\}/)
      if (m) try { plan = JSON.parse(m[0]) } catch { /* continue */ }
    }

    if (!plan || !Array.isArray(plan.dias)) {
      const truncated = llmResult.finishReason === 'max_tokens' || llmResult.finishReason === 'length'
      const detail = truncated ? 'Resposta truncada (max_tokens)' : 'JSON inválido'
      return Response.json({ error: 'Formato inesperado da IA — tenta novamente', detail, provider: llmResult.provider }, { status: 500, headers })
    }

    const errors = validatePlano(plan.dias, plannedDays)
    if (errors.length > 0) {
      return Response.json({ error: 'Plano inválido', detail: errors.join('; ') }, { status: 502, headers })
    }

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
