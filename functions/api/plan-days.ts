interface Env {
  PINGO_CONTENT: KVNamespace
}

interface DiaPlano {
  dia: number
  data: string
  tema: string
  resumo: string
  fontes?: number[]
  flashcards?: unknown[]
  quiz?: unknown[]
  resumoActivo?: unknown
  lacunas?: unknown[]
  classificacao?: unknown[]
  transformacao?: unknown[]
  identificacao?: unknown[]
  [k: string]: unknown
}

interface StoredPlan {
  id: string
  plano: {
    dias: DiaPlano[]
    [k: string]: unknown
  }
  [k: string]: unknown
}

// POST /api/plan-days body: { planId, dia, content }
// Faz um merge atómico: read → find day → merge content fields → write.
// Só aceita os campos de conteúdo (flashcards, quiz, resumoActivo, exercícios avançados).
// Se o dia já tiver flashcards+quiz, recusa (409) para evitar regeneração desperdiçada.
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const body = await request.json() as {
    planId?: string
    dia?: number
    content?: Partial<DiaPlano>
    force?: boolean
  }

  if (!body.planId || typeof body.dia !== 'number' || !body.content) {
    return Response.json({ error: 'Missing planId, dia or content' }, { status: 400, headers })
  }

  const key = `plan:${body.planId}`
  const raw = await env.PINGO_CONTENT.get(key)
  if (!raw) return Response.json({ error: 'Plan not found' }, { status: 404, headers })

  const plan = JSON.parse(raw) as StoredPlan
  const diaIdx = plan.plano.dias.findIndex((d) => d.dia === body.dia)
  if (diaIdx < 0) return Response.json({ error: 'Day not found' }, { status: 404, headers })

  const current = plan.plano.dias[diaIdx]
  const alreadyHasContent = Array.isArray(current.flashcards) && current.flashcards.length > 0
    && Array.isArray(current.quiz) && current.quiz.length > 0

  if (alreadyHasContent && !body.force) {
    return Response.json({ error: 'Day already has content', dia: current }, { status: 409, headers })
  }

  const allowed: (keyof DiaPlano)[] = ['flashcards', 'quiz', 'resumoActivo', 'lacunas', 'classificacao', 'transformacao', 'identificacao']
  const sanitized: Partial<DiaPlano> = {}
  for (const k of allowed) {
    if (k in body.content) sanitized[k] = body.content[k]
  }

  plan.plano.dias[diaIdx] = { ...current, ...sanitized }
  plan.updatedAt = new Date().toISOString()

  await env.PINGO_CONTENT.put(key, JSON.stringify(plan))

  return Response.json(plan.plano.dias[diaIdx], { headers })
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
