import type { ItemSummary } from './catalog'
import { normalize } from './format'
import { RARITIES } from './labels'

export interface SearchFilters {
  query: string
  type: string
  rarity: string
}

const rarityRank = (r: string) => RARITIES.indexOf(r as (typeof RARITIES)[number])

/**
 * Busca por nombre (sin distinguir tildes ni mayúsculas) y ordena por relevancia:
 * coincidencia exacta → empieza con la búsqueda → alguna palabra empieza con ella → la contiene.
 */
export function searchItems(items: ItemSummary[], { query, type, rarity }: SearchFilters): ItemSummary[] {
  const q = normalize(query.trim())
  const words = q.split(/\s+/).filter(Boolean)
  if (!words.length && !type && !rarity) return []

  const scored: { item: ItemSummary; score: number }[] = []
  for (const item of items) {
    if (type && item.type !== type) continue
    if (rarity && item.rarity !== rarity) continue
    if (!words.every((w) => item.search.includes(w))) continue

    let score = 3
    if (q) {
      if (item.search === q) score = 0
      else if (item.search.startsWith(q)) score = 1
      else if (item.search.includes(` ${words[0]}`)) score = 2
    }
    scored.push({ item, score })
  }

  scored.sort(
    (a, b) =>
      a.score - b.score ||
      rarityRank(b.item.rarity) - rarityRank(a.item.rarity) ||
      b.item.level - a.item.level ||
      a.item.name.length - b.item.name.length,
  )
  return scored.map((s) => s.item)
}

const FEATURED_TYPES = new Set(['Weapon', 'Armor', 'Back', 'Trinket'])
const FEATURED_RARITIES = new Set(['Exotic', 'Ascended', 'Legendary'])

/** Selección al azar de equipo de alto nivel para la portada. */
export function pickFeatured(items: ItemSummary[], count: number, seed: number): ItemSummary[] {
  const pool = items.filter(
    (i) => FEATURED_TYPES.has(i.type) && FEATURED_RARITIES.has(i.rarity) && i.level === 80 && i.icon,
  )
  // Generador pseudoaleatorio simple para que la selección sea estable por semilla
  let s = seed || 1
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const picked = new Map<string, ItemSummary>()
  for (let tries = 0; picked.size < count && tries < count * 20; tries++) {
    const item = pool[Math.floor(rand() * pool.length)]
    if (item && !picked.has(item.name)) picked.set(item.name, item)
  }
  return [...picked.values()]
}
