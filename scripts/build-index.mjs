// Descarga el catálogo completo de ítems de la API de GW2 y genera un índice
// compacto en public/data/items.json para que la app no tenga que hacerlo.
//
// Uso: npm run index

import { mkdir, writeFile } from 'node:fs/promises'

const API = 'https://api.guildwars2.com/v2/items'
const LANG = 'es'
const PAGE_SIZE = 200
const CONCURRENCY = 6
const ICON_PREFIX = 'https://render.guildwars2.com/file/'
const OUT_DIR = new URL('../public/data/', import.meta.url)

// Flags que indican que el ítem no puede venderse en el bazar
const UNTRADEABLE = new Set(['AccountBound', 'SoulbindOnAcquire', 'NoSell'])

async function fetchPage(page, attempt = 1) {
  const res = await fetch(`${API}?page=${page}&page_size=${PAGE_SIZE}&lang=${LANG}`)
  if (res.ok) return { items: await res.json(), total: Number(res.headers.get('x-page-total')) }
  if (attempt >= 5) throw new Error(`Página ${page}: HTTP ${res.status}`)
  await new Promise((r) => setTimeout(r, 1000 * attempt))
  return fetchPage(page, attempt + 1)
}

function indexer() {
  const list = []
  const map = new Map()
  return {
    list,
    of(value) {
      if (!map.has(value)) {
        map.set(value, list.length)
        list.push(value)
      }
      return map.get(value)
    },
  }
}

const first = await fetchPage(0)
const pages = [first.items]
let next = 1
let done = 1

async function worker() {
  while (next < first.total) {
    const page = next++
    pages[page] = (await fetchPage(page)).items
    done++
    if (done % 25 === 0 || done === first.total) {
      process.stdout.write(`\r${done}/${first.total} páginas`)
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
process.stdout.write('\n')

const icons = indexer()
const types = indexer()
const subtypes = indexer()
const rarities = indexer()
subtypes.of('') // índice 0 = sin subtipo

const items = []
for (const item of pages.flat()) {
  // Algunos nombres traen marcado del juego (<c=#A594F7>…</c>)
  const name = item.name?.replace(/<[^>]*>/g, '').trim()
  if (!name) continue
  const icon = item.icon?.startsWith(ICON_PREFIX) ? item.icon.slice(ICON_PREFIX.length) : ''
  const tradeable = !(item.flags ?? []).some((f) => UNTRADEABLE.has(f))
  items.push([
    item.id,
    name,
    icon ? icons.of(icon) : -1,
    types.of(item.type),
    rarities.of(item.rarity),
    item.level ?? 0,
    subtypes.of(item.details?.type ?? ''),
    tradeable ? 1 : 0,
  ])
}
items.sort((a, b) => a[0] - b[0])

const index = {
  version: 1,
  lang: LANG,
  generatedAt: new Date().toISOString(),
  iconPrefix: ICON_PREFIX,
  fields: ['id', 'name', 'icon', 'type', 'rarity', 'level', 'subtype', 'tradeable'],
  icons: icons.list,
  types: types.list,
  subtypes: subtypes.list,
  rarities: rarities.list,
  items,
}

await mkdir(OUT_DIR, { recursive: true })
const json = JSON.stringify(index)
await writeFile(new URL('items.json', OUT_DIR), json)
console.log(`${items.length} ítems, ${icons.list.length} íconos, ${(json.length / 1e6).toFixed(1)} MB`)
