interface Env {
  PINGO_CONTENT: KVNamespace
}

interface ContentItem {
  id: string
  disciplineId: string
  title: string
  body: string
  keyPoints: string[]
  createdAt: string
  updatedAt: string
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url)
  const disciplineId = url.searchParams.get('disciplineId')

  const headers = corsHeaders()

  if (disciplineId) {
    const raw = await env.PINGO_CONTENT.get(`content:${disciplineId}`)
    const items: ContentItem[] = raw ? JSON.parse(raw) : []
    return Response.json(items, { headers })
  }

  // Return all content keys
  const list = await env.PINGO_CONTENT.list({ prefix: 'content:' })
  const all: ContentItem[] = []
  for (const key of list.keys) {
    const raw = await env.PINGO_CONTENT.get(key.name)
    if (raw) all.push(...JSON.parse(raw))
  }
  return Response.json(all, { headers })
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const body = await request.json() as Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>

  const item: ContentItem = {
    ...body,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const key = `content:${item.disciplineId}`
  const existing: ContentItem[] = JSON.parse(await env.PINGO_CONTENT.get(key) ?? '[]')
  existing.push(item)
  await env.PINGO_CONTENT.put(key, JSON.stringify(existing))

  return Response.json(item, { status: 201, headers })
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const disciplineId = url.searchParams.get('disciplineId')

  if (!id || !disciplineId) {
    return Response.json({ error: 'Missing id or disciplineId' }, { status: 400, headers })
  }

  const key = `content:${disciplineId}`
  const existing: ContentItem[] = JSON.parse(await env.PINGO_CONTENT.get(key) ?? '[]')
  const updated = existing.filter((c) => c.id !== id)
  await env.PINGO_CONTENT.put(key, JSON.stringify(updated))

  return Response.json({ ok: true }, { headers })
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
