interface Env {
  ANTHROPIC_API_KEY: string
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { subject, year, tema, resumo, regras, materiais, avancado } = await request.json() as {
      subject: string
      year: string
      tema: string
      resumo: string
      regras: { flashcards: number; quiz: number; lacunas?: number; classificacao?: number; transformacao?: number; identificacao?: number }
      materiais: string
      avancado: boolean
    }

    if (!env.ANTHROPIC_API_KEY) {
      return Response.json({ error: 'API key not configured' }, { status: 500, headers })
    }

    const advancedBlock = avancado ? `
Também gera:
- ${regras.lacunas ?? 3} exercícios de lacunas: { "frase": "frase com ___", "resposta": "palavra", "opcoes": ["a","b","c","d"], "explicacao": "regra" }
- ${regras.classificacao ?? 2} exercícios de classificação: { "instrucao": "...", "colunas": ["Coluna A","Coluna B"], "itens": [{"palavra":"frase ou palavra OBRIGATÓRIO - NUNCA deixar vazio","coluna":"Coluna A"}], "explicacao": "..." } ATENÇÃO: o campo "palavra" de cada item DEVE conter o texto/frase a classificar
- ${regras.transformacao ?? 2} exercícios de transformação: { "instrucao": "...", "frase_original": "...", "resposta": "...", "dica": "...", "explicacao": "..." }
- ${regras.identificacao ?? 1} exercícios de identificação: { "instrucao": "...", "frase": "...", "constituintes": [{"texto":"...","funcao":"..."}], "explicacao": "..." }` : ''

    const advancedFormat = avancado ? `,
  "lacunas": [...],
  "classificacao": [{"instrucao":"...","colunas":["A","B"],"itens":[{"palavra":"texto da frase/palavra","coluna":"A"}],"explicacao":"..."}],
  "transformacao": [...],
  "identificacao": [...]` : ''

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: `Gera conteúdo de estudo para UM dia de um plano de estudo de ${subject} (${year}).

Tema do dia: ${tema}
Contexto: ${resumo}

IMPORTANTE: Escreve SEMPRE em Português de Portugal (PT-PT), NUNCA em Português do Brasil.

Formas de tratamento:
- Usa "tu" (singular) ou "vós" (plural), nunca "você" como forma geral
- Usa "o teu/a tua" e não "o seu/a sua" quando te referes ao aluno

Terminologia gramatical (PT-PT vs PT-BR — usar SEMPRE a forma da esquerda):
- "verbo principal" (não "verbo de ação")
- "grave", "aguda", "esdrúxula" (não "paroxítona", "oxítona", "proparoxítona")
- "complemento direto", "complemento indireto" (não "objeto direto", "objeto indireto")
- "predicado verbal", "predicado nominal" (mantém-se igual)
- "sujeito" (mantém-se)
- "determinante artigo" (não "artigo definido/indefinido" de forma isolada)
- "quantificador" (não "numeral" exclusivamente)
- "conjuntivo" (não "subjuntivo")
- "gerúndio" (mantém-se, mas pouco usado em PT-PT)
- "infinitivo pessoal" (mantém-se)
- "modo indicativo", "modo conjuntivo", "modo imperativo", "modo condicional"
- "oração subordinada" (não "cláusula")

Vocabulário:
- "autocarro" (não "ônibus"), "casa de banho" (não "banheiro")
- "telemóvel" (não "celular"), "frigorífico" (não "geladeira")
- "pequeno-almoço" (não "café da manhã"), "sumo" (não "suco")
- "comboio" (não "trem"), "carro" (e "automóvel", não "carro" brasileiro)
- "fato" (não "terno"), "calças de ganga" (não "jeans")

Ortografia:
- Usa acentuação portuguesa (ex: "económico" e não "econômico")
- "facto" e não "fato" (fato = roupa em PT-PT)
- "atual", "direto", "correto" (pós-acordo ortográfico é aceite mas vê o contexto)

Gera EXACTAMENTE:
- ${regras.flashcards} flashcards (frente/verso)
- ${regras.quiz} perguntas de quiz (4 opções, texto exacto da resposta correcta, explicação)
- 1 resumoActivo (pergunta aberta + pontos-chave esperados)${advancedBlock}

REGRAS OBRIGATÓRIAS para as opções do quiz:
- NUNCA adiciones prefixos como "A)", "B)", "C)", "D)" ao texto das opções
- Escreve apenas o texto puro da opção, sem letras nem números
- Exemplo CORRECTO: ["Duvido que tu venhas", "Espero que viesses", ...]
- Exemplo INCORRECTO: ["A) Duvido que tu venhas", "B) Espero que viesses", ...]
- O campo "correta" DEVE ser o TEXTO EXACTO (carácter por carácter) de UMA das opções em "opcoes" — NÃO um índice numérico
- A explicação tem de justificar porque essa opção é a correcta e ser consistente com o campo "correta"

Devolve APENAS JSON válido:
{
  "flashcards": [{ "frente": "...", "verso": "..." }],
  "quiz": [{ "pergunta": "...", "opcoes": ["opcao1","opcao2","opcao3","opcao4"], "correta": "texto exacto da opção correcta", "explicacao": "..." }],
  "resumoActivo": { "pergunta": "...", "respostaEsperada": "..." }${advancedFormat}
}`,
        messages: [{ role: 'user', content: materiais ? `Material de referência:\n${materiais.slice(0, 6000)}` : `Gera conteúdo genérico para o tema "${tema}" de ${subject} ${year}.` }],
      }),
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      return Response.json({ error: `AI failed (${res.status})`, detail: errBody.slice(0, 200) }, { status: 502, headers })
    }

    const data = await res.json() as { content: { type: string; text: string }[] }
    const text = data.content?.[0]?.text ?? ''

    let parsed: Record<string, unknown> | null = null
    const stripped = text.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    try { parsed = JSON.parse(stripped) } catch { /* continue */ }
    if (!parsed) {
      const m = stripped.match(/\{[\s\S]*\}/)
      if (m) try { parsed = JSON.parse(m[0]) } catch { /* continue */ }
    }

    if (!parsed) {
      return Response.json({ error: 'Formato inesperado — tenta novamente' }, { status: 500, headers })
    }

    const quiz = parsed.quiz
    if (Array.isArray(quiz)) {
      parsed.quiz = quiz.map((q) => {
        if (!q || typeof q !== 'object') return q
        const question = q as { opcoes?: unknown; correta?: unknown }
        const opcoes = Array.isArray(question.opcoes) ? question.opcoes.map(String) : []
        const raw = question.correta
        let index = 0
        if (typeof raw === 'string') {
          const norm = (s: string) => s.trim().toLowerCase()
          const found = opcoes.findIndex((opt) => norm(opt) === norm(raw))
          index = found >= 0 ? found : 0
        } else if (typeof raw === 'number' && raw >= 0 && raw < opcoes.length) {
          index = raw
        }
        return { ...question, opcoes, correta: index }
      })
    }

    return Response.json(parsed, { headers })
  } catch (e) {
    return Response.json({ error: 'Internal error', detail: String(e).slice(0, 200) }, { status: 500, headers })
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
