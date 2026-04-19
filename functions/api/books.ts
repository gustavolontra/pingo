interface Env {
  PINGO_CONTENT: KVNamespace
}

interface Book {
  id: string
  titulo: string
  autor: string
  capa?: string
  dataInicio: string
  dataFim?: string
  status: string
  partilhado: boolean
  [key: string]: unknown
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const studentId = url.searchParams.get('studentId')

  if (!studentId) {
    return Response.json({ error: 'Missing studentId' }, { status: 400, headers })
  }

  const raw = await env.PINGO_CONTENT.get(`student:${studentId}:books`)
  const books: Book[] = raw ? JSON.parse(raw) : []
  return Response.json(books, { headers })
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { studentId, titulo, autor, capa } = await request.json() as {
      studentId: string; titulo: string; autor: string; capa?: string
    }

    const book: Book = {
      id: crypto.randomUUID(),
      titulo,
      autor,
      capa,
      dataInicio: new Date().toISOString().split('T')[0],
      status: 'lendo',
      partilhado: false,
    }

    const raw = await env.PINGO_CONTENT.get(`student:${studentId}:books`)
    const books: Book[] = raw ? JSON.parse(raw) : []
    books.push(book)
    await env.PINGO_CONTENT.put(`student:${studentId}:books`, JSON.stringify(books))

    return Response.json(book, { status: 201, headers })
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500, headers })
  }
}

export const onRequestPut: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { studentId, bookId, ...data } = await request.json() as {
      studentId: string; bookId: string; [key: string]: unknown
    }

    const raw = await env.PINGO_CONTENT.get(`student:${studentId}:books`)
    const books: Book[] = raw ? JSON.parse(raw) : []
    const updated = books.map((b) => (b.id === bookId ? { ...b, ...data } : b))
    await env.PINGO_CONTENT.put(`student:${studentId}:books`, JSON.stringify(updated))

    return Response.json({ ok: true }, { headers })
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500, headers })
  }
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const studentId = url.searchParams.get('studentId')
  const bookId = url.searchParams.get('bookId')

  if (!studentId || !bookId) {
    return Response.json({ error: 'Missing studentId or bookId' }, { status: 400, headers })
  }

  const raw = await env.PINGO_CONTENT.get(`student:${studentId}:books`)
  const books: Book[] = raw ? JSON.parse(raw) : []
  const deleted = books.find((b) => b.id === bookId)
  const updated = books.filter((b) => b.id !== bookId)
  await env.PINGO_CONTENT.put(`student:${studentId}:books`, JSON.stringify(updated))

  // Cascade: remove do feed os posts associados a este livro. Usa bookId
  // directamente, e para posts antigos sem bookId cai no fallback de
  // procurar o título entre aspas no conteúdo (só dos posts do próprio).
  const feedRaw = await env.PINGO_CONTENT.get('feed')
  if (feedRaw) {
    try {
      const items = JSON.parse(feedRaw) as { id: string; autorId: string; bookId?: string; tipo?: string; conteudo?: string }[]
      const title = deleted?.titulo ?? ''
      const needle = title ? `"${title}"` : ''
      const cleaned = items.filter((f) => {
        if (f.bookId === bookId) return false
        if (needle && f.autorId === studentId && typeof f.conteudo === 'string' && f.conteudo.includes(needle)) return false
        return true
      })
      if (cleaned.length !== items.length) {
        await env.PINGO_CONTENT.put('feed', JSON.stringify(cleaned))
      }
    } catch { /* feed corrompido? deixa estar */ }
  }

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
