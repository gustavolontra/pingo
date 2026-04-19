/**
 * Gera um handle único para um aluno baseado no nome completo.
 * Regra: primeira letra do primeiro nome + último apelido, minúsculas, sem acentos.
 * Ex: "João Silva" → "jsilva"; "Ana Maria Santos" → "asantos".
 * Se já existir, acrescenta "2", "3", etc.
 */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export function baseHandleFromName(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'aluno'
  const firstLetter = slugify(parts[0]).charAt(0) || 'a'
  const lastSlug = parts.length > 1 ? slugify(parts[parts.length - 1]) : ''
  const base = `${firstLetter}${lastSlug}` || slugify(parts[0]) || 'aluno'
  return base
}

export function makeUniqueHandle(base: string, takenHandles: Set<string>, ignoreHandle?: string): string {
  const taken = new Set(takenHandles)
  if (ignoreHandle) taken.delete(ignoreHandle)
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}${n}`)) n++
  return `${base}${n}`
}

/** Valida que o nome tem pelo menos 2 palavras (primeiro nome + apelido). */
export function hasFullName(name: string): boolean {
  const parts = (name ?? '').trim().split(/\s+/).filter((p) => p.length > 0)
  return parts.length >= 2
}
