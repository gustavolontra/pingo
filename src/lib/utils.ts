import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, format, isToday, isYesterday } from 'date-fns'
import { pt } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, pattern = 'dd MMM yyyy') {
  return format(new Date(date), pattern, { locale: pt })
}

export function getDaysUntilExam(examDate: Date): number {
  return Math.max(0, differenceInDays(new Date(examDate), new Date()))
}

export function getUrgencyColor(daysLeft: number): string {
  if (daysLeft <= 7) return '#ef4444'
  if (daysLeft <= 14) return '#f59e0b'
  return '#10b981'
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function formatRelativeDate(date: Date): string {
  if (isToday(date)) return 'Hoje'
  if (isYesterday(date)) return 'Ontem'
  return formatDate(date, 'dd MMM')
}

/**
 * XP formula: each level costs (level * 500) XP
 * Level 1: 500 XP, Level 2: 1000 XP, Level 3: 1500 XP, ...
 */
export function getLevelFromXP(xp: number): { level: number; progress: number; xpForNext: number; xpInLevel: number } {
  const base = 500
  let level = 1
  let totalXP = 0
  while (totalXP + base * level <= xp) {
    totalXP += base * level
    level++
  }
  const xpInLevel = xp - totalXP
  const xpForNext = base * level
  return { level, progress: Math.round((xpInLevel / xpForNext) * 100), xpForNext, xpInLevel }
}

export function generateStudyPlan(
  totalLessons: number,
  completedLessons: number,
  examDate: Date
): { lessonsPerDay: number; daysLeft: number } {
  const daysLeft = Math.max(1, getDaysUntilExam(examDate) - 1)
  const remaining = totalLessons - completedLessons
  const lessonsPerDay = Math.ceil(remaining / daysLeft)
  return { lessonsPerDay, daysLeft }
}
