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
  codigoConvite: string
  convitesFeitos: string[]
  convidadoPor?: string
  [key: string]: unknown
}

interface PedidoConvite {
  id: string
  nome: string
  escola: string
  ano: string
  email: string
  codigoConvite: string
  convidadoPor: string
  estado: 'pendente' | 'aprovado' | 'recusado'
  criadoEm: string
  termosAceites: boolean
  dataAceite: string
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function generatePassword(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
  let pw = ''
  for (let i = 0; i < 8; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)]
  }
  return pw
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).trim()
}

// GET: ?code=X → lookup inviter by code; no params → list all pedidos
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (code) {
    // Lookup inviter by invite code
    const raw = await env.PINGO_CONTENT.get('students')
    const students: Student[] = raw ? JSON.parse(raw) : []
    const inviter = students.find((s) => s.codigoConvite === code)
    if (!inviter) {
      return Response.json({ inviter: null }, { headers })
    }
    return Response.json({ inviter: { name: inviter.name, handle: inviter.email.split('@')[0] } }, { headers })
  }

  // List all pedidos
  const raw = await env.PINGO_CONTENT.get('pedidos_convite')
  const pedidos: PedidoConvite[] = raw ? JSON.parse(raw) : []
  return Response.json(pedidos, { headers })
}

// POST: submit a new invite request
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { nome, escola, ano, email, codigoConvite, termosAceites, dataAceite } = await request.json() as {
      nome: string; escola: string; ano: string; email: string; codigoConvite: string
      termosAceites?: boolean; dataAceite?: string
    }

    // Validate invite code exists
    const rawStudents = await env.PINGO_CONTENT.get('students')
    const students: Student[] = rawStudents ? JSON.parse(rawStudents) : []
    const inviter = students.find((s) => s.codigoConvite === codigoConvite)
    if (!inviter) {
      return Response.json({ error: 'Invalid invite code' }, { status: 400, headers })
    }

    // Check if email already registered
    if (students.some((s) => s.login === email.toLowerCase().trim())) {
      return Response.json({ error: 'Email already registered' }, { status: 409, headers })
    }

    const pedido: PedidoConvite = {
      id: crypto.randomUUID(),
      nome: titleCase(nome),
      escola: titleCase(escola),
      ano,
      email: email.toLowerCase().trim(),
      codigoConvite,
      convidadoPor: inviter.id,
      estado: 'pendente',
      criadoEm: new Date().toISOString(),
      termosAceites: termosAceites ?? false,
      dataAceite: dataAceite ?? new Date().toISOString(),
    }

    const rawPedidos = await env.PINGO_CONTENT.get('pedidos_convite')
    const pedidos: PedidoConvite[] = rawPedidos ? JSON.parse(rawPedidos) : []
    pedidos.unshift(pedido)
    await env.PINGO_CONTENT.put('pedidos_convite', JSON.stringify(pedidos))

    return Response.json(pedido, { status: 201, headers })
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500, headers })
  }
}

// PUT: approve or reject a pedido
export const onRequestPut: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { id, action } = await request.json() as { id: string; action: 'aprovar' | 'recusar' }

    const rawPedidos = await env.PINGO_CONTENT.get('pedidos_convite')
    const pedidos: PedidoConvite[] = rawPedidos ? JSON.parse(rawPedidos) : []
    const pedido = pedidos.find((p) => p.id === id)
    if (!pedido) {
      return Response.json({ error: 'Pedido not found' }, { status: 404, headers })
    }

    if (action === 'recusar') {
      pedido.estado = 'recusado'
      await env.PINGO_CONTENT.put('pedidos_convite', JSON.stringify(pedidos))
      return Response.json({ ok: true }, { headers })
    }

    // Approve: create student account
    const password = generatePassword()
    const passwordHash = await hashPassword(password)
    const login = pedido.email
    const handle = login.split('@')[0]

    const newStudent: Student = {
      id: crypto.randomUUID(),
      login,
      name: pedido.nome,
      email: login,
      school: pedido.escola,
      grade: pedido.ano,
      passwordHash,
      createdAt: new Date().toISOString(),
      isActive: true,
      xp: 0, level: 1, streak: 0, lessonsCompleted: 0, totalStudyMinutes: 0,
      codigoConvite: `PING-${handle}`,
      convidadoPor: pedido.convidadoPor,
      convitesFeitos: [],
    }

    // Add student
    const rawStudents = await env.PINGO_CONTENT.get('students')
    const students: Student[] = rawStudents ? JSON.parse(rawStudents) : []
    students.push(newStudent)

    // Update inviter's convitesFeitos
    const inviter = students.find((s) => s.id === pedido.convidadoPor)
    if (inviter) {
      inviter.convitesFeitos = [...(inviter.convitesFeitos ?? []), newStudent.id]
    }

    await env.PINGO_CONTENT.put('students', JSON.stringify(students))

    // Update pedido
    pedido.estado = 'aprovado'
    await env.PINGO_CONTENT.put('pedidos_convite', JSON.stringify(pedidos))

    // Auto-add as friends (inviter + new student)
    if (inviter) {
      const rawFriendsA = await env.PINGO_CONTENT.get(`student:${inviter.id}:friends`)
      const friendsA: string[] = rawFriendsA ? JSON.parse(rawFriendsA) : []
      if (!friendsA.includes(newStudent.id)) friendsA.push(newStudent.id)
      await env.PINGO_CONTENT.put(`student:${inviter.id}:friends`, JSON.stringify(friendsA))

      await env.PINGO_CONTENT.put(`student:${newStudent.id}:friends`, JSON.stringify([inviter.id]))
    }

    return Response.json({ login, password }, { headers })
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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
