interface Env {
  PINGO_CONTENT: KVNamespace
}

type ReportContext = 'plan' | 'day' | 'app'
type ReportStatus = 'aberto' | 'resolvido' | 'ignorado'

interface Report {
  id: string
  studentId: string
  studentName?: string
  studentHandle?: string
  context: ReportContext
  planId?: string
  planTitle?: string
  diaNumber?: number
  diaTitle?: string
  description: string
  createdAt: string
  status: ReportStatus
  resolvedAt?: string
}

const KEY = 'reports'

async function readAll(env: Env): Promise<Report[]> {
  const raw = await env.PINGO_CONTENT.get(KEY)
  if (!raw) return []
  try { return JSON.parse(raw) as Report[] } catch { return [] }
}

async function writeAll(env: Env, list: Report[]): Promise<void> {
  await env.PINGO_CONTENT.put(KEY, JSON.stringify(list))
}

// POST /api/reports — aluno submete um report
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const body = await request.json() as Partial<Report>

  if (!body.studentId || !body.description || !body.description.trim() || !body.context) {
    return Response.json({ error: 'Missing fields' }, { status: 400, headers })
  }

  const report: Report = {
    id: crypto.randomUUID(),
    studentId: body.studentId,
    studentName: body.studentName,
    studentHandle: body.studentHandle,
    context: body.context,
    planId: body.planId,
    planTitle: body.planTitle,
    diaNumber: body.diaNumber,
    diaTitle: body.diaTitle,
    description: body.description.trim(),
    createdAt: new Date().toISOString(),
    status: 'aberto',
  }

  const list = await readAll(env)
  list.unshift(report)
  await writeAll(env, list)

  return Response.json(report, { status: 201, headers })
}

// GET /api/reports — admin lista todos
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const headers = corsHeaders()
  const list = await readAll(env)
  return Response.json(list, { headers })
}

// PATCH /api/reports?id= — admin actualiza status
export const onRequestPatch: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400, headers })

  const patch = await request.json() as { status?: ReportStatus }
  if (!patch.status) return Response.json({ error: 'Missing status' }, { status: 400, headers })

  const list = await readAll(env)
  let updated: Report | null = null
  const next = list.map((r) => {
    if (r.id !== id) return r
    const u: Report = {
      ...r,
      status: patch.status!,
      resolvedAt: patch.status === 'aberto' ? undefined : new Date().toISOString(),
    }
    updated = u
    return u
  })
  if (!updated) return Response.json({ error: 'Not found' }, { status: 404, headers })
  await writeAll(env, next)
  return Response.json(updated, { headers })
}

// DELETE /api/reports?id=
export const onRequestDelete: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400, headers })

  const list = await readAll(env)
  await writeAll(env, list.filter((r) => r.id !== id))
  return Response.json({ ok: true }, { headers })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
