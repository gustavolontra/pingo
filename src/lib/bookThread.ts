function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Chave determinística para a thread de comentários de um livro.
 * Combina título + autor normalizados para que membros do clube a ler
 * "Príncipe Cruel" de "Holly Black" partilhem o mesmo thread,
 * independentemente de acentos, maiúsculas ou espaços.
 */
export function bookThreadKey(titulo: string, autor: string): string {
  return `${slugify(titulo)}__${slugify(autor)}`
}
