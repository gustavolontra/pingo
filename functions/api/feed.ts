interface Env {
  PINGO_CONTENT: KVNamespace
}

interface FeedItem {
  id: string
  autorId: string
  autorNome: string
  autorAt: string
  tipo: string
  conteudo: string
  data: string
  reacoes: Record<string, string[]>
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const headers = corsHeaders()
  const raw = await env.PINGO_CONTENT.get('feed')
  const items: FeedItem[] = raw ? JSON.parse(raw) : []
  return Response.json(items, { headers })
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const body = await request.json() as {
      autorId: string; autorNome: string; autorAt: string; tipo: string; conteudo: string
    }

    const item: FeedItem = {
      ...body,
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
      reacoes: {},
    }

    const raw = await env.PINGO_CONTENT.get('feed')
    const items: FeedItem[] = raw ? JSON.parse(raw) : []
    items.unshift(item)
    await env.PINGO_CONTENT.put('feed', JSON.stringify(items))

    return Response.json(item, { status: 201, headers })
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500, headers })
  }
}

export const onRequestPut: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { id, tipo, studentId } = await request.json() as {
      id: string; tipo: string; studentId: string
    }

    const raw = await env.PINGO_CONTENT.get('feed')
    const items: FeedItem[] = raw ? JSON.parse(raw) : []

    const updated = items.map((f) => {
      if (f.id !== id) return f
      const prev = f.reacoes[tipo] ?? []
      const already = prev.includes(studentId)
      return {
        ...f,
        reacoes: {
          ...f.reacoes,
          [tipo]: already ? prev.filter((s) => s !== studentId) : [...prev, studentId],
        },
      }
    })

    await env.PINGO_CONTENT.put('feed', JSON.stringify(updated))
    return Response.json({ ok: true }, { headers })
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500, headers })
  }
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return Response.json({ error: 'Missing id' }, { status: 400, headers })
  }

  const raw = await env.PINGO_CONTENT.get('feed')
  const items: FeedItem[] = raw ? JSON.parse(raw) : []
  const updated = items.filter((f) => f.id !== id)
  await env.PINGO_CONTENT.put('feed', JSON.stringify(updated))

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
