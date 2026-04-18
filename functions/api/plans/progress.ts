interface Env {
  PINGO_CONTENT: KVNamespace
}

type ProgressMap = Record<string, { diasEstudados: number[]; updatedAt: string }>

const KEY = (studentId: string) => `student:${studentId}:plan-progress`

async function readMap(env: Env, studentId: string): Promise<ProgressMap> {
  const raw = await env.PINGO_CONTENT.get(KEY(studentId))
  if (!raw) return {}
  try { return JSON.parse(raw) as ProgressMap } catch { return {} }
}

async function writeMap(env: Env, studentId: string, map: ProgressMap): Promise<void> {
  await env.PINGO_CONTENT.put(KEY(studentId), JSON.stringify(map))
}

// GET /api/plans/progress?studentId=&planId=
//   com planId  → { diasEstudados, updatedAt }
//   sem planId  → mapa completo
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const studentId = url.searchParams.get('studentId')
  const planId = url.searchParams.get('planId')

  if (!studentId) return Response.json({ error: 'Missing studentId' }, { status: 400, headers })

  const map = await readMap(env, studentId)
  if (planId) {
    return Response.json(map[planId] ?? { diasEstudados: [], updatedAt: null }, { headers })
  }
  return Response.json(map, { headers })
}

// POST /api/plans/progress body: { studentId, planId, diasEstudados }
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const body = await request.json() as { studentId?: string; planId?: string; diasEstudados?: number[] }
  if (!body.studentId || !body.planId || !Array.isArray(body.diasEstudados)) {
    return Response.json({ error: 'Missing fields' }, { status: 400, headers })
  }

  const map = await readMap(env, body.studentId)
  map[body.planId] = {
    diasEstudados: Array.from(new Set(body.diasEstudados)).sort((a, b) => a - b),
    updatedAt: new Date().toISOString(),
  }
  await writeMap(env, body.studentId, map)

  return Response.json(map[body.planId], { headers })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
