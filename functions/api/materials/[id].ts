interface Env {
  PINGO_CONTENT: KVNamespace
}

interface Material {
  id: string
  usageCount: number
  shared: boolean
  [k: string]: unknown
}

interface IndexEntry {
  id: string
  usageCount: number
  [k: string]: unknown
}

const INDEX_KEY = 'material:index'

export const onRequestGet: PagesFunction<Env, 'id'> = async ({ env, params }) => {
  const headers = corsHeaders()
  const id = typeof params.id === 'string' ? params.id : ''
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400, headers })

  const raw = await env.PINGO_CONTENT.get(`material:${id}`)
  if (!raw) return Response.json({ error: 'Not found' }, { status: 404, headers })

  return new Response(raw, { headers })
}

export const onRequestPatch: PagesFunction<Env, 'id'> = async ({ env, params }) => {
  const headers = corsHeaders()
  const id = typeof params.id === 'string' ? params.id : ''
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400, headers })

  const raw = await env.PINGO_CONTENT.get(`material:${id}`)
  if (!raw) return Response.json({ error: 'Not found' }, { status: 404, headers })

  const material = JSON.parse(raw) as Material
  material.usageCount = (material.usageCount ?? 0) + 1
  await env.PINGO_CONTENT.put(`material:${id}`, JSON.stringify(material))

  if (material.shared) {
    const indexRaw = await env.PINGO_CONTENT.get(INDEX_KEY)
    const index = indexRaw ? (JSON.parse(indexRaw) as IndexEntry[]) : []
    const updated = index.map((e) => (e.id === id ? { ...e, usageCount: material.usageCount } : e))
    await env.PINGO_CONTENT.put(INDEX_KEY, JSON.stringify(updated))
  }

  return Response.json({ usageCount: material.usageCount }, { headers })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
