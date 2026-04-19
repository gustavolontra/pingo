interface Env {
  PINGO_CONTENT: KVNamespace
}

interface Student {
  id: string
  login: string
  name: string
  email: string
  passwordHash: string
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

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { email, password } = await request.json() as { email: string; password: string }
    const passwordHash = await hashPassword(password)

    const raw = await env.PINGO_CONTENT.get('students')
    const students: Student[] = raw ? JSON.parse(raw) : []

    const student = students.find(
      (s) => s.login === email.toLowerCase().trim() && s.passwordHash === passwordHash
    )

    if (!student) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401, headers })
    }

    const token = crypto.randomUUID()
    const handle = typeof student.handle === 'string' && student.handle.length > 0
      ? student.handle
      : student.email.split('@')[0]
    const session = {
      studentId: student.id,
      name: student.name,
      email: student.email,
      handle,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
    await env.PINGO_CONTENT.put(`session:${token}`, JSON.stringify(session))

    return Response.json({ studentId: student.id, name: student.name, email: student.email, handle, token, mustChangePassword: student.mustChangePassword ?? false }, { headers })
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
