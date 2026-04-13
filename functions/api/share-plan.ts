interface Env {
  PINGO_CONTENT: KVNamespace
}

interface Exam {
  id: string
  subject: string
  date: string
  studyNote: string
  materiais?: unknown[]
  planoEstudo?: { dias: { diasEstudados?: unknown }[]; diasEstudados?: number[]; [key: string]: unknown }
  [key: string]: unknown
}

// POST: share an exam's plan with friends (creates copies in their accounts)
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const headers = corsHeaders()
  try {
    const { fromStudentId, examId, friendIds } = await request.json() as {
      fromStudentId: string
      examId: string
      friendIds: string[]
    }

    if (!fromStudentId || !examId || !Array.isArray(friendIds) || friendIds.length === 0) {
      return Response.json({ error: 'Missing fromStudentId, examId or friendIds' }, { status: 400, headers })
    }

    // Fetch source exam
    const rawExams = await env.PINGO_CONTENT.get(`student:${fromStudentId}:exams`)
    const exams: Exam[] = rawExams ? JSON.parse(rawExams) : []
    const sourceExam = exams.find((e) => e.id === examId)
    if (!sourceExam) {
      return Response.json({ error: 'Exam not found' }, { status: 404, headers })
    }

    // Reset plan progress if exists
    const resetPlan = sourceExam.planoEstudo ? {
      ...sourceExam.planoEstudo,
      diasEstudados: [],
      dias: (sourceExam.planoEstudo.dias ?? []).map((d: Record<string, unknown>) => {
        const { diasEstudados: _, ...rest } = d
        return rest
      }),
    } : undefined

    // Copy to each friend
    const results: { friendId: string; success: boolean }[] = []
    for (const friendId of friendIds) {
      try {
        const rawFriendExams = await env.PINGO_CONTENT.get(`student:${friendId}:exams`)
        const friendExams: Exam[] = rawFriendExams ? JSON.parse(rawFriendExams) : []

        const newExam: Exam = {
          id: crypto.randomUUID(),
          subject: sourceExam.subject,
          date: sourceExam.date,
          studyNote: sourceExam.studyNote ?? '',
          materiais: sourceExam.materiais ?? [],
          planoEstudo: resetPlan,
          sharedBy: fromStudentId,
          sharedAt: new Date().toISOString(),
        }

        friendExams.push(newExam)
        await env.PINGO_CONTENT.put(`student:${friendId}:exams`, JSON.stringify(friendExams))
        results.push({ friendId, success: true })
      } catch {
        results.push({ friendId, success: false })
      }
    }

    return Response.json({ ok: true, shared: results.filter((r) => r.success).length, total: friendIds.length }, { headers })
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
