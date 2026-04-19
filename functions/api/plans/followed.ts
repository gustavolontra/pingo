interface Env {
  PINGO_CONTENT: KVNamespace
}

const KEY = (studentId: string) => `student:${studentId}:followed-plans`

async function readList(env: Env, studentId: string): Promise<string[]> {
  const raw = await env.PINGO_CONTENT.get(KEY(studentId))
  if (!raw) return []
  try { return JSON.parse(raw) as string[] } catch { return [] }
}

async function writeList(env: Env, studentId: string, ids: string[]): Promise<void> {
  await env.PINGO_CONTENT.put(KEY(studentId), JSON.stringify(ids))
}

// GET /api/plans/followed?studentId=X → lista de IDs
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const studentId = url.searchParams.get('studentId')
  if (!studentId) return Response.json({ error: 'Missing studentId' }, { status: 400, headers })
  const ids = await readList(env, studentId)
  return Response.json(ids, { headers })
}

// POST /api/plans/followed body { studentId, planId }
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const body = await request.json() as { studentId?: string; planId?: string }
  if (!body.studentId || !body.planId) {
    return Response.json({ error: 'Missing studentId or planId' }, { status: 400, headers })
  }
  const ids = await readList(env, body.studentId)
  if (!ids.includes(body.planId)) {
    ids.push(body.planId)
    await writeList(env, body.studentId, ids)
  }
  return Response.json({ ok: true, ids }, { headers })
}

// DELETE /api/plans/followed?studentId=X&planId=Y
export const onRequestDelete: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const studentId = url.searchParams.get('studentId')
  const planId = url.searchParams.get('planId')
  if (!studentId || !planId) {
    return Response.json({ error: 'Missing studentId or planId' }, { status: 400, headers })
  }
  const ids = await readList(env, studentId)
  const filtered = ids.filter((id) => id !== planId)
  await writeList(env, studentId, filtered)
  return Response.json({ ok: true, ids: filtered }, { headers })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
