import { baseHandleFromName, makeUniqueHandle } from '../_shared/handle'

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
  /** Handle público único — gerado a partir do nome (1ª letra do primeiro + último apelido). */
  handle?: string
  [key: string]: unknown
}

function backfillHandles(students: Student[]): { changed: boolean; students: Student[] } {
  const taken = new Set<string>()
  // Primeiro recolhe handles já atribuídos, para as colisões ficarem estáveis.
  for (const s of students) {
    if (typeof s.handle === 'string' && s.handle.length > 0) taken.add(s.handle)
  }
  let changed = false
  const result = students.map((s) => {
    if (typeof s.handle === 'string' && s.handle.length > 0) return s
    const base = baseHandleFromName(s.name ?? '')
    const unique = makeUniqueHandle(base, taken)
    taken.add(unique)
    changed = true
    return { ...s, handle: unique }
  })
  return { changed, students: result }
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
  // Migração idempotente: gera handles para alunos antigos que ainda não têm.
  const { changed, students: migrated } = backfillHandles(students)
  if (changed) {
    await env.PINGO_CONTENT.put('students', JSON.stringify(migrated))
  }
  return Response.json(migrated, { headers })
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { login, name, school, grade, password } = await request.json() as {
      login: string; name: string; school: string; grade: string; password: string
    }

    const passwordHash = await hashPassword(password)
    const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).trim()

    const raw = await env.PINGO_CONTENT.get('students')
    const { students } = backfillHandles(raw ? JSON.parse(raw) : [])
    const taken = new Set<string>(
      students.map((s) => s.handle).filter((h): h is string => typeof h === 'string'),
    )
    const nameForHandle = titleCase(name)
    const handle = makeUniqueHandle(baseHandleFromName(nameForHandle), taken)

    const student: Student = {
      id: crypto.randomUUID(),
      login: login.toLowerCase().trim(),
      name: nameForHandle,
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
      handle,
      codigoConvite: `PING-${handle}`,
      convitesFeitos: [],
    }

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
    const { id, newPassword, ...data } = await request.json() as { id: string; newPassword?: string; [key: string]: unknown }

    // If newPassword is provided, hash it and set passwordHash + clear mustChangePassword
    if (newPassword) {
      data.passwordHash = await hashPassword(newPassword)
      data.mustChangePassword = false
    }

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
