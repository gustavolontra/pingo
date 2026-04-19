import { callLLM, LLMError, type LLMEnv } from '../_shared/llm'

interface Env extends LLMEnv {}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { content, subject, level } = await request.json() as {
      content: string
      subject?: string
      level?: string
    }

    if (!content || content.trim().length < 20) {
      return Response.json({ tags: [] }, { headers })
    }

    const excerpt = content.slice(0, 1500)
    const context = [
      subject ? `Matéria: ${subject}` : '',
      level ? `Nível: ${level}` : '',
    ].filter(Boolean).join('\n')

    const systemPrompt = `Extrai entre 3 e 6 tags curtas (1-3 palavras) que descrevam o TEMA e o TIPO deste material de estudo. As tags devem ajudar outro aluno a perceber rapidamente se o material lhe serve.

Regras:
- Minúsculas, sem pontuação
- Em Português de Portugal
- Foca no conteúdo, não na forma (evita "apontamentos", "ficha")
- Inclui conceitos-chave, sub-tópicos, períodos históricos, fórmulas, etc.

Devolve APENAS JSON: {"tags": ["tag1","tag2",...]}`

    const llmOverride = new URL(request.url).searchParams.get('llm')
    let text = ''
    try {
      const llmResult = await callLLM(env, {
        system: systemPrompt,
        user: `${context}\n\n---\n${excerpt}`,
        maxTokens: 200,
        model: 'fast',
      }, llmOverride)
      text = llmResult.text
    } catch (err) {
      if (err instanceof LLMError) return Response.json({ tags: [] }, { headers })
      throw err
    }

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
