interface Env {
  PINGO_CONTENT: KVNamespace
}

interface Progress {
  lessons: Record<string, { score: number; completedAt: string }>
  examDates: Record<string, string>
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const studentId = url.searchParams.get('studentId')

  if (!studentId) {
    return Response.json({ error: 'Missing studentId' }, { status: 400, headers })
  }

  const raw = await env.PINGO_CONTENT.get(`student:${studentId}:progress`)
  const progress: Progress = raw ? JSON.parse(raw) : { lessons: {}, examDates: {} }
  return Response.json(progress, { headers })
}

export const onRequestPut: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const body = await request.json() as {
      studentId: string
      lessonId?: string
      score?: number
      completedAt?: string
      disciplineId?: string
      examDate?: string
    }

    const { studentId } = body
    const key = `student:${studentId}:progress`
    const raw = await env.PINGO_CONTENT.get(key)
    const progress: Progress = raw ? JSON.parse(raw) : { lessons: {}, examDates: {} }

    if (body.lessonId) {
      progress.lessons[body.lessonId] = {
        score: body.score ?? 0,
        completedAt: body.completedAt ?? new Date().toISOString(),
      }
    }

    if (body.disciplineId && body.examDate) {
      progress.examDates[body.disciplineId] = body.examDate
    }

    await env.PINGO_CONTENT.put(key, JSON.stringify(progress))
    return Response.json({ ok: true }, { headers })
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
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
