/**
 * Abstração sobre provedores LLM (Anthropic / DeepSeek).
 *
 * Uso típico num handler de Pages Function:
 *
 *   const { text, finishReason } = await callLLM(env, {
 *     system: '...',
 *     user: '...',
 *     maxTokens: 4096,
 *     model: 'deep',
 *   }, new URL(request.url).searchParams.get('llm'))
 *
 * Seleção do provider:
 *  1. Override via query string (`?llm=deepseek` ou `?llm=anthropic`)
 *  2. Env var `LLM_PROVIDER` no ambiente Cloudflare Pages
 *  3. Default: `anthropic`
 *
 * Secret obrigatória por provider:
 *  - anthropic: `ANTHROPIC_API_KEY`
 *  - deepseek:  `DEEPSEEK_API_KEY`
 */

export interface LLMEnv {
  ANTHROPIC_API_KEY?: string
  DEEPSEEK_API_KEY?: string
  LLM_PROVIDER?: string
}

export interface LLMCall {
  system: string
  user: string
  maxTokens: number
  /** 'deep' → Sonnet / reasoner. 'fast' → Haiku / chat. */
  model: 'deep' | 'fast'
}

export interface LLMResult {
  text: string
  finishReason?: string
  provider: 'anthropic' | 'deepseek'
}

export class LLMError extends Error {
  status: number
  detail: string
  provider: string
  constructor(provider: string, status: number, detail: string) {
    super(`${provider} failed (${status}): ${detail.slice(0, 200)}`)
    this.provider = provider
    this.status = status
    this.detail = detail.slice(0, 500)
  }
}

export async function callLLM(env: LLMEnv, call: LLMCall, override?: string | null): Promise<LLMResult> {
  const pick = (override?.toLowerCase() ?? env.LLM_PROVIDER?.toLowerCase() ?? 'anthropic')
  const provider = pick === 'deepseek' ? 'deepseek' : 'anthropic'
  return provider === 'deepseek' ? callDeepSeek(env, call) : callAnthropic(env, call)
}

async function callAnthropic(env: LLMEnv, call: LLMCall): Promise<LLMResult> {
  if (!env.ANTHROPIC_API_KEY) throw new LLMError('anthropic', 500, 'ANTHROPIC_API_KEY not configured')

  const model = call.model === 'deep' ? 'claude-sonnet-4-20250514' : 'claude-haiku-4-5-20251001'
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: call.maxTokens,
      system: call.system,
      messages: [{ role: 'user', content: call.user }],
    }),
  })

  if (!res.ok) throw new LLMError('anthropic', res.status, await res.text().catch(() => ''))

  const data = await res.json() as { content?: { type: string; text: string }[]; stop_reason?: string }
  const text = data.content?.[0]?.text ?? ''
  return { text, finishReason: data.stop_reason, provider: 'anthropic' }
}

async function callDeepSeek(env: LLMEnv, call: LLMCall): Promise<LLMResult> {
  if (!env.DEEPSEEK_API_KEY) throw new LLMError('deepseek', 500, 'DEEPSEEK_API_KEY not configured')

  const model = call.model === 'deep' ? 'deepseek-reasoner' : 'deepseek-chat'
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: call.maxTokens,
      messages: [
        { role: 'system', content: call.system },
        { role: 'user', content: call.user },
      ],
    }),
  })

  if (!res.ok) throw new LLMError('deepseek', res.status, await res.text().catch(() => ''))

  const data = await res.json() as {
    choices?: { message?: { content?: string }; finish_reason?: string }[]
  }
  const text = data.choices?.[0]?.message?.content ?? ''
  return { text, finishReason: data.choices?.[0]?.finish_reason, provider: 'deepseek' }
}
