interface Env {
  PINGO_CONTENT: KVNamespace
}

const SEED_STUDENTS = [
  {
    id: 'seed-marina', login: 'marinasarturiavila@gmail.com', name: 'Marina Sarturi Avila',
    email: 'marinasarturiavila@gmail.com', school: 'Escola Secundária Da Maia',
    grade: '7.º ano', passwordHash: '97c1b2425112be6676a52d66a11ecf55dd9fea89e39ef1b6f936c0b869094aad',
    createdAt: '2026-03-20T10:00:00Z', isActive: true,
    xp: 350, level: 3, streak: 5, lessonsCompleted: 12, totalStudyMinutes: 180,
    codigoConvite: 'PING-marinasarturiavila', convitesFeitos: [],
  },
  {
    id: 'seed-ana', login: 'anacosta@gmail.com', name: 'Ana Costa',
    email: 'anacosta@gmail.com', school: 'Escola Secundária Da Maia',
    grade: '7.º ano', passwordHash: 'e82827b00b2ca8620beb37f879778c082b292a52270390cff35b6fe3157f4e8b',
    createdAt: '2026-03-21T09:00:00Z', isActive: true,
    xp: 210, level: 2, streak: 3, lessonsCompleted: 8, totalStudyMinutes: 120,
    codigoConvite: 'PING-anacosta', convitesFeitos: [],
  },
  {
    id: 'seed-tiago', login: 'tiagosantos@gmail.com', name: 'Tiago Santos',
    email: 'tiagosantos@gmail.com', school: 'Escola Secundária Da Maia',
    grade: '8.º ano', passwordHash: 'c90dc61cae171669019bbabecad9c1c06aebb586cc1fb0b1a60efaa1594244dd',
    createdAt: '2026-03-22T11:00:00Z', isActive: true,
    xp: 150, level: 2, streak: 1, lessonsCompleted: 5, totalStudyMinutes: 75,
    codigoConvite: 'PING-tiagosantos', convitesFeitos: [],
  },
  {
    id: 'seed-sofia', login: 'sofiaferreira@gmail.com', name: 'Sofia Ferreira',
    email: 'sofiaferreira@gmail.com', school: 'Escola Secundária Da Maia',
    grade: '7.º ano', passwordHash: 'a3e1a8a3ccd08f006f9df0b36f7a83809aff603bcd0ad5504821592c85ed3b22',
    createdAt: '2026-03-23T08:30:00Z', isActive: true,
    xp: 420, level: 3, streak: 7, lessonsCompleted: 15, totalStudyMinutes: 210,
    codigoConvite: 'PING-sofiaferreira', convitesFeitos: [],
  },
]

const SEED_FEED = [
  {
    id: 'seed-feed-1', autorId: 'seed-ana', autorNome: 'Ana Costa', autorAt: 'anacosta',
    tipo: 'desafio', conteudo: 'quem lê 3 livros esse mês?',
    data: new Date(Date.now() - 48 * 60000).toISOString(), reacoes: {},
  },
]

export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  const headers = corsHeaders()
  try {
    const existing = await env.PINGO_CONTENT.get('students')
    if (existing) {
      return Response.json({ message: 'Already seeded' }, { headers })
    }

    await env.PINGO_CONTENT.put('students', JSON.stringify(SEED_STUDENTS))
    await env.PINGO_CONTENT.put('feed', JSON.stringify(SEED_FEED))

    return Response.json({ message: 'Seeded successfully', students: SEED_STUDENTS.length, feedItems: SEED_FEED.length }, { status: 201, headers })
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
