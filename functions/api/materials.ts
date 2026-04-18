interface Env {
  PINGO_CONTENT: KVNamespace
}

type MaterialType = 'note' | 'text' | 'ai-generated'

interface Material {
  id: string
  title: string
  content: string
  type: MaterialType
  tags: string[]
  subject: string
  level?: string
  uploadedBy: string
  uploadedAt: string
  shared: boolean
  usageCount: number
}

interface IndexEntry {
  id: string
  title: string
  subject: string
  level?: string
  tags: string[]
  usageCount: number
  uploadedBy: string
  type: MaterialType
  shared: boolean
}

const INDEX_KEY = 'material:index'

async function readIndex(env: Env): Promise<IndexEntry[]> {
  const raw = await env.PINGO_CONTENT.get(INDEX_KEY)
  return raw ? (JSON.parse(raw) as IndexEntry[]) : []
}

async function writeIndex(env: Env, list: IndexEntry[]): Promise<void> {
  await env.PINGO_CONTENT.put(INDEX_KEY, JSON.stringify(list))
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const body = await request.json() as Partial<Material>

  if (!body.title || !body.content || !body.type || !body.subject) {
    return Response.json({ error: 'Missing required fields' }, { status: 400, headers })
  }

  const material: Material = {
    id: crypto.randomUUID(),
    title: body.title,
    content: body.content,
    type: body.type,
    tags: body.tags ?? [],
    subject: body.subject,
    level: body.level,
    uploadedBy: body.uploadedBy ?? 'anon',
    uploadedAt: new Date().toISOString(),
    shared: body.shared ?? false,
    usageCount: 0,
  }

  await env.PINGO_CONTENT.put(`material:${material.id}`, JSON.stringify(material))

  if (material.shared) {
    const index = await readIndex(env)
    index.push({
      id: material.id,
      title: material.title,
      subject: material.subject,
      level: material.level,
      tags: material.tags,
      usageCount: material.usageCount,
      uploadedBy: material.uploadedBy,
      type: material.type,
      shared: true,
    })
    await writeIndex(env, index)
  }

  return Response.json(material, { status: 201, headers })
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  const url = new URL(request.url)
  const q = url.searchParams.get('q')?.trim().toLowerCase() ?? ''
  const tagsParam = url.searchParams.get('tags')?.trim() ?? ''
  const subject = url.searchParams.get('subject')?.trim().toLowerCase() ?? ''
  const level = url.searchParams.get('level')?.trim().toLowerCase() ?? ''
  const wantedTags = tagsParam ? tagsParam.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) : []

  const index = await readIndex(env)
  const filtered = index.filter((entry) => {
    if (q && !entry.title.toLowerCase().includes(q)) return false
    if (subject && entry.subject.toLowerCase() !== subject) return false
    if (level && (entry.level ?? '').toLowerCase() !== level) return false
    if (wantedTags.length > 0) {
      const entryTags = entry.tags.map((t) => t.toLowerCase())
      if (!wantedTags.every((t) => entryTags.includes(t))) return false
    }
    return true
  })

  return Response.json(filtered, { headers })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}
