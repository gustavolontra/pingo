interface Env {
  PINGO_CONTENT: KVNamespace
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const studentId = url.searchParams.get('studentId')

  if (!studentId) {
    return Response.json({ error: 'Missing studentId' }, { status: 400, headers })
  }

  const raw = await env.PINGO_CONTENT.get(`student:${studentId}:friends`)
  const friends: string[] = raw ? JSON.parse(raw) : []
  return Response.json(friends, { headers })
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { studentId, friendId } = await request.json() as { studentId: string; friendId: string }

    // Add friendId to student's friends
    const rawA = await env.PINGO_CONTENT.get(`student:${studentId}:friends`)
    const friendsA: string[] = rawA ? JSON.parse(rawA) : []
    if (!friendsA.includes(friendId)) friendsA.push(friendId)
    await env.PINGO_CONTENT.put(`student:${studentId}:friends`, JSON.stringify(friendsA))

    // Add studentId to friend's friends (mutual)
    const rawB = await env.PINGO_CONTENT.get(`student:${friendId}:friends`)
    const friendsB: string[] = rawB ? JSON.parse(rawB) : []
    if (!friendsB.includes(studentId)) friendsB.push(studentId)
    await env.PINGO_CONTENT.put(`student:${friendId}:friends`, JSON.stringify(friendsB))

    // Remove from ignored on both sides
    const rawIgnA = await env.PINGO_CONTENT.get(`student:${studentId}:ignored`)
    const ignoredA: string[] = rawIgnA ? JSON.parse(rawIgnA) : []
    await env.PINGO_CONTENT.put(`student:${studentId}:ignored`, JSON.stringify(ignoredA.filter((id) => id !== friendId)))

    const rawIgnB = await env.PINGO_CONTENT.get(`student:${friendId}:ignored`)
    const ignoredB: string[] = rawIgnB ? JSON.parse(rawIgnB) : []
    await env.PINGO_CONTENT.put(`student:${friendId}:ignored`, JSON.stringify(ignoredB.filter((id) => id !== studentId)))

    return Response.json({ ok: true }, { status: 201, headers })
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500, headers })
  }
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const studentId = url.searchParams.get('studentId')
  const friendId = url.searchParams.get('friendId')

  if (!studentId || !friendId) {
    return Response.json({ error: 'Missing studentId or friendId' }, { status: 400, headers })
  }

  // Remove from student's friends
  const rawA = await env.PINGO_CONTENT.get(`student:${studentId}:friends`)
  const friendsA: string[] = rawA ? JSON.parse(rawA) : []
  await env.PINGO_CONTENT.put(`student:${studentId}:friends`, JSON.stringify(friendsA.filter((id) => id !== friendId)))

  // Remove from friend's friends (mutual)
  const rawB = await env.PINGO_CONTENT.get(`student:${friendId}:friends`)
  const friendsB: string[] = rawB ? JSON.parse(rawB) : []
  await env.PINGO_CONTENT.put(`student:${friendId}:friends`, JSON.stringify(friendsB.filter((id) => id !== studentId)))

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
