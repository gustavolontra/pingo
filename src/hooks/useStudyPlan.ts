import { useMemo } from 'react'
import type { Discipline } from '@/types'
import { getDaysUntilExam } from '@/lib/utils'

export function useStudyPlan(discipline: Discipline) {
  return useMemo(() => {
    if (!discipline.examDate) return null
    const daysLeft = Math.max(1, getDaysUntilExam(new Date(discipline.examDate)) - 1)
    const remaining = discipline.totalLessons - discipline.completedLessons
    const lessonsPerDay = Math.ceil(remaining / daysLeft)
    const progressPct = Math.round((discipline.completedLessons / discipline.totalLessons) * 100)
    const isOnTrack = discipline.completedLessons >= lessonsPerDay
    return { daysLeft, remaining, lessonsPerDay, progressPct, isOnTrack }
  }, [discipline])
}
