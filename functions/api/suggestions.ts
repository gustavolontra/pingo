interface Env {
  PINGO_CONTENT: KVNamespace
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const studentId = url.searchParams.get('studentId')

  if (!studentId) {
    return Response.json({ error: 'Missing studentId' }, { status: 400, headers })
  }

  const raw = await env.PINGO_CONTENT.get(`student:${studentId}:ignored`)
  const ignored: string[] = raw ? JSON.parse(raw) : []
  return Response.json(ignored, { headers })
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { studentId, ignoredId } = await request.json() as { studentId: string; ignoredId: string }

    const raw = await env.PINGO_CONTENT.get(`student:${studentId}:ignored`)
    const ignored: string[] = raw ? JSON.parse(raw) : []
    if (!ignored.includes(ignoredId)) ignored.push(ignoredId)
    await env.PINGO_CONTENT.put(`student:${studentId}:ignored`, JSON.stringify(ignored))

    return Response.json({ ok: true }, { status: 201, headers })
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
