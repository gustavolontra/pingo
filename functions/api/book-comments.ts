interface Env {
  PINGO_CONTENT: KVNamespace
}

interface BookComment {
  id: string
  threadKey: string
  autorId: string
  autorNome: string
  autorAt: string
  conteudo: string
  data: string
}

const KV_KEY = 'book-comments'

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const threadKey = url.searchParams.get('threadKey')

  const raw = await env.PINGO_CONTENT.get(KV_KEY)
  const all: BookComment[] = raw ? JSON.parse(raw) : []
  const filtered = threadKey ? all.filter((c) => c.threadKey === threadKey) : all

  // Garante ordenação cronológica ascendente (mais antigos primeiro).
  filtered.sort((a, b) => a.data.localeCompare(b.data))

  return Response.json(filtered, { headers })
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const body = await request.json() as {
      threadKey: string
      autorId: string
      autorNome: string
      autorAt: string
      conteudo: string
    }

    if (!body.threadKey || !body.conteudo?.trim() || !body.autorId) {
      return Response.json({ error: 'Missing fields' }, { status: 400, headers })
    }

    const comment: BookComment = {
      id: crypto.randomUUID(),
      threadKey: body.threadKey,
      autorId: body.autorId,
      autorNome: body.autorNome,
      autorAt: body.autorAt,
      conteudo: body.conteudo.trim(),
      data: new Date().toISOString(),
    }

    const raw = await env.PINGO_CONTENT.get(KV_KEY)
    const all: BookComment[] = raw ? JSON.parse(raw) : []
    all.push(comment)
    await env.PINGO_CONTENT.put(KV_KEY, JSON.stringify(all))

    return Response.json(comment, { status: 201, headers })
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

  const raw = await env.PINGO_CONTENT.get(KV_KEY)
  const all: BookComment[] = raw ? JSON.parse(raw) : []
  const next = all.filter((c) => c.id !== id)
  await env.PINGO_CONTENT.put(KV_KEY, JSON.stringify(next))

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
