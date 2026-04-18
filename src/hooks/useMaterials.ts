import { useCallback, useState } from 'react'
import type { Material, MaterialType } from '@/types'

export interface MaterialSearchResult {
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

export interface UploadMaterialInput {
  title: string
  content: string
  type: MaterialType
  tags: string[]
  subject: string
  level?: string
  shared: boolean
  uploadedBy?: string
}

const BASE = '/api/materials'

export function useMaterials() {
  const [results, setResults] = useState<MaterialSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchMaterials = useCallback(async (q?: string, tags?: string[], subject?: string, level?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (tags && tags.length) params.set('tags', tags.join(','))
      if (subject) params.set('subject', subject)
      if (level) params.set('level', level)
      const res = await fetch(`${BASE}?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as MaterialSearchResult[]
      setResults(data)
      return data
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro a procurar materiais')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadMaterial = useCallback(async (data: UploadMaterialInput): Promise<Material | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }
      return (await res.json()) as Material
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro a enviar material')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getMaterial = useCallback(async (id: string): Promise<Material | null> => {
    try {
      const res = await fetch(`${BASE}/${encodeURIComponent(id)}`)
      if (!res.ok) return null
      return (await res.json()) as Material
    } catch {
      return null
    }
  }, [])

  const incrementUsage = useCallback(async (id: string): Promise<number | null> => {
    try {
      const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, { method: 'PATCH' })
      if (!res.ok) return null
      const data = (await res.json()) as { usageCount: number }
      return data.usageCount
    } catch {
      return null
    }
  }, [])

  return { results, loading, error, searchMaterials, uploadMaterial, getMaterial, incrementUsage }
}
