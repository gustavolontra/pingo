interface Env {
  ANTHROPIC_API_KEY: string
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { content, subject, level } = await request.json() as {
      content: string
      subject?: string
      level?: string
    }

    if (!env.ANTHROPIC_API_KEY) {
      return Response.json({ error: 'API key not configured' }, { status: 500, headers })
    }
    if (!content || content.trim().length < 20) {
      return Response.json({ tags: [] }, { headers })
    }

    const excerpt = content.slice(0, 1500)
    const context = [
      subject ? `Matéria: ${subject}` : '',
      level ? `Nível: ${level}` : '',
    ].filter(Boolean).join('\n')

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: `Extrai entre 3 e 6 tags curtas (1-3 palavras) que descrevam o TEMA e o TIPO deste material de estudo. As tags devem ajudar outro aluno a perceber rapidamente se o material lhe serve.

Regras:
- Minúsculas, sem pontuação
- Em Português de Portugal
- Foca no conteúdo, não na forma (evita "apontamentos", "ficha")
- Inclui conceitos-chave, sub-tópicos, períodos históricos, fórmulas, etc.

Devolve APENAS JSON: {"tags": ["tag1","tag2",...]}`,
        messages: [{ role: 'user', content: `${context}\n\n---\n${excerpt}` }],
      }),
    })

    if (!res.ok) {
      return Response.json({ tags: [] }, { headers })
    }

    const data = await res.json() as { content: { type: string; text: string }[] }
    const text = data.content?.[0]?.text ?? ''
    const stripped = text.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()

    let parsed: { tags?: unknown } | null = null
    try { parsed = JSON.parse(stripped) } catch { /* fallthrough */ }
    if (!parsed) {
      const m = stripped.match(/\{[\s\S]*\}/)
      if (m) try { parsed = JSON.parse(m[0]) } catch { /* fallthrough */ }
    }

    const tags: string[] = Array.isArray(parsed?.tags)
      ? parsed.tags.filter((t): t is string => typeof t === 'string' && t.trim().length > 0).map((t) => t.trim().toLowerCase())
      : []

    return Response.json({ tags: tags.slice(0, 6) }, { headers })
  } catch (e) {
    return Response.json({ tags: [], error: String(e).slice(0, 200) }, { headers })
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
