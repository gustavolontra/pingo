import { useState, useCallback } from 'react'
import { getLevelFromXP } from '@/lib/utils'

export function useXPGain(currentXP: number) {
  const [pendingXP, setPendingXP] = useState<number | null>(null)
  const [levelUp, setLevelUp] = useState<number | null>(null)

  const beforeLevel = getLevelFromXP(currentXP).level

  const gain = useCallback((amount: number) => {
    const afterLevel = getLevelFromXP(currentXP + amount).level
    setPendingXP(amount)
    if (afterLevel > beforeLevel) {
      setTimeout(() => setLevelUp(afterLevel), 2800)
    }
  }, [currentXP, beforeLevel])

  const clearXP = useCallback(() => setPendingXP(null), [])
  const clearLevelUp = useCallback(() => setLevelUp(null), [])

  return { pendingXP, levelUp, gain, clearXP, clearLevelUp }
}
