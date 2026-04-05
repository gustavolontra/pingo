interface Env {
  PINGO_CONTENT: KVNamespace
}

interface Exam {
  id: string
  subject: string
  date: string
  studyNote: string
  [key: string]: unknown
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const studentId = url.searchParams.get('studentId')

  if (!studentId) {
    return Response.json({ error: 'Missing studentId' }, { status: 400, headers })
  }

  const raw = await env.PINGO_CONTENT.get(`student:${studentId}:exams`)
  const exams: Exam[] = raw ? JSON.parse(raw) : []
  return Response.json(exams, { headers })
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { studentId, subject, date } = await request.json() as {
      studentId: string; subject: string; date: string
    }

    const exam: Exam = {
      id: crypto.randomUUID(),
      subject,
      date,
      studyNote: '',
    }

    const raw = await env.PINGO_CONTENT.get(`student:${studentId}:exams`)
    const exams: Exam[] = raw ? JSON.parse(raw) : []
    exams.push(exam)
    await env.PINGO_CONTENT.put(`student:${studentId}:exams`, JSON.stringify(exams))

    return Response.json(exam, { status: 201, headers })
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500, headers })
  }
}

export const onRequestPut: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { studentId, examId, ...data } = await request.json() as {
      studentId: string; examId: string; [key: string]: unknown
    }

    const raw = await env.PINGO_CONTENT.get(`student:${studentId}:exams`)
    const exams: Exam[] = raw ? JSON.parse(raw) : []
    const updated = exams.map((e) => (e.id === examId ? { ...e, ...data } : e))
    await env.PINGO_CONTENT.put(`student:${studentId}:exams`, JSON.stringify(updated))

    return Response.json({ ok: true }, { headers })
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500, headers })
  }
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const studentId = url.searchParams.get('studentId')
  const examId = url.searchParams.get('examId')

  if (!studentId || !examId) {
    return Response.json({ error: 'Missing studentId or examId' }, { status: 400, headers })
  }

  const raw = await env.PINGO_CONTENT.get(`student:${studentId}:exams`)
  const exams: Exam[] = raw ? JSON.parse(raw) : []
  const updated = exams.filter((e) => e.id !== examId)
  await env.PINGO_CONTENT.put(`student:${studentId}:exams`, JSON.stringify(updated))

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
