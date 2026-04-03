import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date, fmt: string): string {
  return format(new Date(date), fmt, { locale: pt })
}

export function getDaysUntilExam(examDate: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const exam = new Date(examDate)
  exam.setHours(0, 0, 0, 0)
  return Math.ceil((exam.getTime() - now.getTime()) / 86400000)
}

export function generateStudyPlan(
  totalLessons: number,
  completedLessons: number,
  examDate: Date
): { daysLeft: number; lessonsPerDay: number } {
  const daysLeft = Math.max(1, getDaysUntilExam(examDate))
  const remaining = totalLessons - completedLessons
  const lessonsPerDay = Math.ceil(remaining / daysLeft)
  return { daysLeft, lessonsPerDay }
}

export function getUrgencyColor(daysLeft: number): string {
  if (daysLeft <= 7) return '#ef4444'
  if (daysLeft <= 14) return '#f59e0b'
  return '#10b981'
}

export function getLevelFromXP(xp: number): { level: number; xpForNextLevel: number } {
  const level = Math.floor(xp / 500) + 1
  return { level, xpForNextLevel: level * 500 }
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
