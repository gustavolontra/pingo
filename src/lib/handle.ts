/**
 * Derivação client-side de @handle a partir do nome.
 * Mantém a mesma regra do servidor (functions/_shared/handle.ts):
 * primeira letra do primeiro nome + último apelido, minúsculas, sem acentos.
 * Não faz dedup — isso é responsabilidade do servidor. Aqui serve só para preview.
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
  if (parts.length === 0) return ''
  const firstLetter = slugify(parts[0]).charAt(0) || ''
  const lastSlug = parts.length > 1 ? slugify(parts[parts.length - 1]) : ''
  return firstLetter + lastSlug
}
