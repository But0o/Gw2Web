// Carga el índice local de ítems (public/data/items.json) generado por scripts/build-index.mjs.

import { useEffect, useState } from 'react'
import { normalize } from './format'

export interface ItemSummary {
  id: number
  name: string
  icon: string | null
  type: string
  subtype: string
  rarity: string
  level: number
  tradeable: boolean
  /** Nombre en minúsculas y sin tildes, para buscar */
  search: string
}

export interface Catalog {
  items: ItemSummary[]
  byId: Map<number, ItemSummary>
  types: string[]
  generatedAt: string
}

interface RawIndex {
  version: number
  generatedAt: string
  iconPrefix: string
  icons: string[]
  types: string[]
  subtypes: string[]
  rarities: string[]
  items: [number, string, number, number, number, number, number, number][]
}

let catalogPromise: Promise<Catalog> | null = null

export function loadCatalog(): Promise<Catalog> {
  catalogPromise ??= fetch(`${import.meta.env.BASE_URL}data/items.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`No se pudo cargar el catálogo (HTTP ${res.status})`)
      return res.json() as Promise<RawIndex>
    })
    .then((raw) => {
      const items = raw.items.map(
        ([id, name, icon, type, rarity, level, subtype, tradeable]): ItemSummary => ({
          id,
          name,
          icon: icon >= 0 ? raw.iconPrefix + raw.icons[icon] : null,
          type: raw.types[type],
          subtype: raw.subtypes[subtype],
          rarity: raw.rarities[rarity],
          level,
          tradeable: tradeable === 1,
          search: normalize(name),
        }),
      )
      return {
        items,
        byId: new Map(items.map((i) => [i.id, i])),
        types: [...raw.types].sort(),
        generatedAt: raw.generatedAt,
      }
    })
    .catch((err) => {
      catalogPromise = null // permite reintentar
      throw err
    })
  return catalogPromise
}

export type CatalogState =
  | { status: 'loading' }
  | { status: 'error'; error: string; retry: () => void }
  | { status: 'ready'; catalog: Catalog }

export function useCatalog(): CatalogState {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<CatalogState>({ status: 'loading' })

  useEffect(() => {
    let alive = true
    loadCatalog().then(
      (catalog) => alive && setState({ status: 'ready', catalog }),
      (err: Error) =>
        alive &&
        setState({
          status: 'error',
          error: err.message,
          retry: () => {
            setState({ status: 'loading' })
            setAttempt((a) => a + 1)
          },
        }),
    )
    return () => {
      alive = false
    }
  }, [attempt])

  return state
}
