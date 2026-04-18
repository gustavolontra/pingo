interface Env {
  PINGO_CONTENT: KVNamespace
}

export const onRequestGet: PagesFunction<Env, 'id'> = async ({ env, params }) => {
  const headers = corsHeaders()
  const id = typeof params.id === 'string' ? params.id : ''
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400, headers })

  const raw = await env.PINGO_CONTENT.get(`plan:${id}`)
  if (!raw) return Response.json({ error: 'Not found' }, { status: 404, headers })

  return new Response(raw, { headers })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
