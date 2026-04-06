interface Env {
  PINGO_CONTENT: KVNamespace
}

interface Student {
  id: string
  login: string
  name: string
  email: string
  school: string
  grade: string
  passwordHash: string
  createdAt: string
  isActive: boolean
  xp: number
  level: number
  streak: number
  lessonsCompleted: number
  totalStudyMinutes: number
  [key: string]: unknown
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const headers = corsHeaders()
  const raw = await env.PINGO_CONTENT.get('students')
  const students: Student[] = raw ? JSON.parse(raw) : []
  return Response.json(students, { headers })
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { login, name, school, grade, password } = await request.json() as {
      login: string; name: string; school: string; grade: string; password: string
    }

    const passwordHash = await hashPassword(password)
    const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).trim()

    const handle = login.toLowerCase().trim().split('@')[0]
    const student: Student = {
      id: crypto.randomUUID(),
      login: login.toLowerCase().trim(),
      name: titleCase(name),
      email: login.toLowerCase().trim(),
      school: titleCase(school),
      grade,
      passwordHash,
      createdAt: new Date().toISOString(),
      isActive: true,
      xp: 0,
      level: 1,
      streak: 0,
      lessonsCompleted: 0,
      totalStudyMinutes: 0,
      codigoConvite: `PING-${handle}`,
      convitesFeitos: [],
    }

    const raw = await env.PINGO_CONTENT.get('students')
    const students: Student[] = raw ? JSON.parse(raw) : []
    students.push(student)
    await env.PINGO_CONTENT.put('students', JSON.stringify(students))

    return Response.json(student, { status: 201, headers })
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500, headers })
  }
}

export const onRequestPut: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { id, ...data } = await request.json() as { id: string; [key: string]: unknown }

    const raw = await env.PINGO_CONTENT.get('students')
    const students: Student[] = raw ? JSON.parse(raw) : []
    const updated = students.map((s) => (s.id === id ? { ...s, ...data } : s))
    await env.PINGO_CONTENT.put('students', JSON.stringify(updated))

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

  const raw = await env.PINGO_CONTENT.get('students')
  const students: Student[] = raw ? JSON.parse(raw) : []
  const updated = students.filter((s) => s.id !== id)
  await env.PINGO_CONTENT.put('students', JSON.stringify(updated))

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
