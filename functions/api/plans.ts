interface Env {
  PINGO_CONTENT: KVNamespace
}

interface StoredPlan {
  id: string
  ownerId: string
  title: string
  goal: 'estudo' | 'exame'
  topics: string
  subject?: string
  level?: string
  targetDate?: string
  materials: { id: string; title: string; type: string }[]
  /** Sticky: fica true assim que o plano é partilhado ao menos uma vez. */
  wasShared?: boolean
  plano: {
    resumo?: string
    tempoEstimadoPorDia?: number
    regras?: Record<string, number>
    dias: {
      dia: number
      data: string
      tema: string
      resumo: string
      fontes?: number[]
      flashcards?: unknown[]
      quiz?: unknown[]
      [k: string]: unknown
    }[]
    [k: string]: unknown
  }
  shared: boolean
  createdAt: string
  updatedAt: string
  diasEstudados: number[]
}

interface PlanIndexEntry {
  id: string
  title: string
  subject?: string
  level?: string
  goal: StoredPlan['goal']
  ownerId: string
  usageCount: number
  createdAt: string
  days: number
}

const PLAN_KEY = (id: string) => `plan:${id}`
const STUDENT_PLANS_KEY = (studentId: string) => `student:${studentId}:plans`
const FOLLOWED_KEY = (studentId: string) => `student:${studentId}:followed-plans`
const SHARED_INDEX_KEY = 'plans:index'

async function readJSON<T>(env: Env, key: string, fallback: T): Promise<T> {
  const raw = await env.PINGO_CONTENT.get(key)
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

async function writeJSON(env: Env, key: string, data: unknown): Promise<void> {
  await env.PINGO_CONTENT.put(key, JSON.stringify(data))
}

async function updateSharedIndex(env: Env, entry: PlanIndexEntry | { id: string; remove: true }): Promise<void> {
  const index = await readJSON<PlanIndexEntry[]>(env, SHARED_INDEX_KEY, [])
  const filtered = index.filter((e) => e.id !== entry.id)
  if (!('remove' in entry)) filtered.push(entry)
  await writeJSON(env, SHARED_INDEX_KEY, filtered)
}

function toIndexEntry(plan: StoredPlan): PlanIndexEntry {
  return {
    id: plan.id,
    title: plan.title,
    subject: plan.subject,
    level: plan.level,
    goal: plan.goal,
    ownerId: plan.ownerId,
    usageCount: 0,
    createdAt: plan.createdAt,
    days: plan.plano?.dias?.length ?? 0,
  }
}

// POST /api/plans — create
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const body = await request.json() as Partial<StoredPlan>

  if (!body.title || !body.goal || !body.ownerId || !body.plano) {
    return Response.json({ error: 'Missing required fields' }, { status: 400, headers })
  }

  const now = new Date().toISOString()
  const plan: StoredPlan = {
    id: crypto.randomUUID(),
    ownerId: body.ownerId,
    title: body.title,
    goal: body.goal,
    topics: body.topics ?? '',
    subject: body.subject,
    level: body.level,
    targetDate: body.targetDate,
    materials: body.materials ?? [],
    plano: body.plano,
    shared: body.shared ?? false,
    wasShared: Boolean(body.shared),
    createdAt: now,
    updatedAt: now,
    diasEstudados: body.diasEstudados ?? [],
  }

  await writeJSON(env, PLAN_KEY(plan.id), plan)

  const studentPlans = await readJSON<string[]>(env, STUDENT_PLANS_KEY(plan.ownerId), [])
  studentPlans.push(plan.id)
  await writeJSON(env, STUDENT_PLANS_KEY(plan.ownerId), studentPlans)

  if (plan.shared) await updateSharedIndex(env, toIndexEntry(plan))

  return Response.json(plan, { status: 201, headers })
}

// GET /api/plans?ownerId= → planos do aluno
// GET /api/plans?shared=1&q=&subject=&level=&goal= → comunidade
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const ownerId = url.searchParams.get('ownerId')
  const shared = url.searchParams.get('shared')

  if (ownerId && !shared) {
    const [ownedIds, followedIds] = await Promise.all([
      readJSON<string[]>(env, STUDENT_PLANS_KEY(ownerId), []),
      readJSON<string[]>(env, FOLLOWED_KEY(ownerId), []),
    ])
    const allIds = Array.from(new Set([...ownedIds, ...followedIds]))
    const plans = await Promise.all(allIds.map((id) => readJSON<StoredPlan | null>(env, PLAN_KEY(id), null)))
    return Response.json(plans.filter((p): p is StoredPlan => p !== null), { headers })
  }

  if (shared) {
    const q = url.searchParams.get('q')?.trim().toLowerCase() ?? ''
    const subject = url.searchParams.get('subject')?.trim().toLowerCase() ?? ''
    const level = url.searchParams.get('level')?.trim().toLowerCase() ?? ''
    const goal = url.searchParams.get('goal')?.trim().toLowerCase() ?? ''

    const index = await readJSON<PlanIndexEntry[]>(env, SHARED_INDEX_KEY, [])
    const filtered = index.filter((entry) => {
      if (q && !entry.title.toLowerCase().includes(q)) return false
      if (subject && (entry.subject ?? '').toLowerCase() !== subject) return false
      if (level && (entry.level ?? '').toLowerCase() !== level) return false
      if (goal && entry.goal !== goal) return false
      return true
    })
    return Response.json(filtered, { headers })
  }

  return Response.json({ error: 'Missing ownerId or shared query' }, { status: 400, headers })
}

// PATCH /api/plans?id=  — actualiza campos editáveis (diasEstudados, shared, plano dias...)
export const onRequestPatch: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400, headers })

  const existing = await readJSON<StoredPlan | null>(env, PLAN_KEY(id), null)
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404, headers })

  const patch = await request.json() as Partial<StoredPlan>
  const isCurrentlySharedBefore = existing.shared

  // wasShared é sticky: uma vez partilhado, fica true para sempre, mesmo após despartilhar.
  const willBeShared = patch.shared ?? existing.shared
  const stickyWasShared = Boolean(existing.wasShared) || isCurrentlySharedBefore || willBeShared

  const updated: StoredPlan = {
    ...existing,
    ...patch,
    id: existing.id,
    ownerId: existing.ownerId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
    wasShared: stickyWasShared,
  }

  await writeJSON(env, PLAN_KEY(id), updated)

  if (updated.shared && !isCurrentlySharedBefore) {
    await updateSharedIndex(env, toIndexEntry(updated))
  } else if (!updated.shared && isCurrentlySharedBefore) {
    await updateSharedIndex(env, { id, remove: true })
  } else if (updated.shared && isCurrentlySharedBefore) {
    // update metadata in index in case title/subject/level changed
    await updateSharedIndex(env, toIndexEntry(updated))
  }

  return Response.json(updated, { headers })
}

// DELETE /api/plans?id= — remove plano (só se nunca foi partilhado)
export const onRequestDelete: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400, headers })

  const existing = await readJSON<StoredPlan | null>(env, PLAN_KEY(id), null)
  if (!existing) return Response.json({ ok: true }, { headers })

  if (existing.wasShared || existing.shared) {
    return Response.json({
      error: 'Este plano já foi partilhado e não pode ser apagado. Podes despartilhar — quem já começou a estudar mantém acesso.',
    }, { status: 409, headers })
  }

  await env.PINGO_CONTENT.delete(PLAN_KEY(id))

  const studentPlans = await readJSON<string[]>(env, STUDENT_PLANS_KEY(existing.ownerId), [])
  await writeJSON(env, STUDENT_PLANS_KEY(existing.ownerId), studentPlans.filter((pid) => pid !== id))

  if (existing.shared) await updateSharedIndex(env, { id, remove: true })

  return Response.json({ ok: true }, { headers })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
