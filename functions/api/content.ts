interface Env {
  PINGO_CONTENT: KVNamespace
}

interface ContentItem {
  id: string
  disciplineId: string
  topico: string
  titulo: string
  resumo: string
  palavrasChave: string[]
  flashcards: { frente: string; verso: string; exemplo?: string }[]
  quiz: {
    pergunta: string
    tipo: 'multiple-choice' | 'true-false'
    opcoes: string[]
    correta: number
    explicacao: string
  }[]
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

  const [contentList, synthList] = await Promise.all([
    env.PINGO_CONTENT.list({ prefix: 'content:' }),
    env.PINGO_CONTENT.list({ prefix: 'synthesis:' }),
  ])
  const all: ContentItem[] = []
  for (const key of contentList.keys) {
    const raw = await env.PINGO_CONTENT.get(key.name)
    if (raw) all.push(...JSON.parse(raw))
  }
  // Include synthesis entries as virtual content items so LandingPage suggestions get richer
  for (const key of synthList.keys) {
    const raw = await env.PINGO_CONTENT.get(key.name)
    if (!raw) continue
    const s = JSON.parse(raw) as { disciplineId: string; flashcards: ContentItem['flashcards']; quiz: ContentItem['quiz']; palavrasChave: string[]; updatedAt: string }
    all.push({
      id: `synth-${s.disciplineId}`,
      disciplineId: s.disciplineId,
      topico: 'Síntese',
      titulo: `Síntese — ${s.disciplineId}`,
      resumo: '',
      palavrasChave: s.palavrasChave ?? [],
      flashcards: s.flashcards ?? [],
      quiz: s.quiz ?? [],
      createdAt: s.updatedAt,
      updatedAt: s.updatedAt,
    })
  }
  return Response.json(all, { headers })
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const body = await request.json() as Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>

  const item: ContentItem = {
    ...body,
    flashcards: body.flashcards ?? [],
    quiz: body.quiz ?? [],
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

export const onRequestPut: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const updated = await request.json() as ContentItem

  const key = `content:${updated.disciplineId}`
  const existing: ContentItem[] = JSON.parse(await env.PINGO_CONTENT.get(key) ?? '[]')
  const newList = existing.map((c) =>
    c.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : c
  )
  await env.PINGO_CONTENT.put(key, JSON.stringify(newList))

  return Response.json({ ok: true }, { headers })
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const disciplineId = url.searchParams.get('disciplineId')

  if (!disciplineId) {
    return Response.json({ error: 'Missing disciplineId' }, { status: 400, headers })
  }

  const key = `content:${disciplineId}`

  // If id is __ALL__, delete all content for this discipline + synthesis
  if (id === '__ALL__') {
    await env.PINGO_CONTENT.delete(key)
    await env.PINGO_CONTENT.delete(`synthesis:${disciplineId}`)
    return Response.json({ ok: true }, { headers })
  }

  if (!id) {
    return Response.json({ error: 'Missing id' }, { status: 400, headers })
  }

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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
