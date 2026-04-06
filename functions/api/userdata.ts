interface Env {
  PINGO_CONTENT: KVNamespace
}

// GET: fetch user data (stats, sessions, dailyStats)
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const studentId = url.searchParams.get('studentId')

  if (!studentId) {
    return Response.json({ error: 'Missing studentId' }, { status: 400, headers })
  }

  const raw = await env.PINGO_CONTENT.get(`student:${studentId}:userdata`)
  if (!raw) {
    return Response.json({ user: null, sessions: [], dailyStats: [] }, { headers })
  }
  return Response.json(JSON.parse(raw), { headers })
}

// PUT: save user data
export const onRequestPut: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { studentId, ...data } = await request.json() as { studentId: string; [key: string]: unknown }

    const raw = await env.PINGO_CONTENT.get(`student:${studentId}:userdata`)
    const existing = raw ? JSON.parse(raw) : {}
    const merged = { ...existing, ...data }
    await env.PINGO_CONTENT.put(`student:${studentId}:userdata`, JSON.stringify(merged))

    return Response.json({ ok: true }, { headers })
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
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
