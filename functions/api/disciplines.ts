interface Env {
  PINGO_CONTENT: KVNamespace
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const headers = corsHeaders()
  const raw = await env.PINGO_CONTENT.get('disciplines')
  const disciplines = raw ? JSON.parse(raw) : []
  return Response.json(disciplines, { headers })
}

export const onRequestPut: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const disciplines = await request.json()
  await env.PINGO_CONTENT.put('disciplines', JSON.stringify(disciplines))
  return Response.json({ ok: true }, { headers })
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
