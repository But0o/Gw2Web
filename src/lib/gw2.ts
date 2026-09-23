// Cliente mínimo de la API oficial de Guild Wars 2 (https://wiki.guildwars2.com/wiki/API:Main)

import { useEffect, useState } from 'react'

const BASE = 'https://api.guildwars2.com/v2'
const LANG = 'es'

export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function get<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(BASE + path)
  url.searchParams.set('lang', LANG)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))

  let res: Response
  try {
    res = await fetch(url)
  } catch {
    throw new ApiError(0, 'No hay conexión con la API de Guild Wars 2.')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { text?: string } | null
    throw new ApiError(res.status, body?.text ?? `Error HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ——— Tipos ———————————————————————————————————————————————

export interface ItemAttribute {
  attribute: string
  modifier: number
}

export interface Item {
  id: number
  name: string
  description?: string
  type: string
  level: number
  rarity: string
  vendor_value: number
  icon?: string
  chat_link: string
  game_types: string[]
  flags: string[]
  details?: {
    type?: string
    damage_type?: string
    min_power?: number
    max_power?: number
    defense?: number
    description?: string
    duration_ms?: number
    recipe_id?: number
    bonuses?: string[]
    infix_upgrade?: {
      attributes: ItemAttribute[]
      buff?: { description?: string }
    }
  }
}

export interface Recipe {
  id: number
  type: string
  output_item_id: number
  output_item_count: number
  min_rating: number
  disciplines: string[]
  ingredients: { item_id: number; count: number }[]
}

export interface Price {
  id: number
  buys: { quantity: number; unit_price: number }
  sells: { quantity: number; unit_price: number }
}

export interface Account {
  id: string
  name: string
  age: number
  created: string
  access: string[]
  commander: boolean
  fractal_level?: number
  wvw_rank?: number
  wvw?: { rank?: number }
}

export interface TokenInfo {
  name: string
  permissions: string[]
}

export interface WalletEntry {
  id: number
  value: number
}

// ——— Endpoints ———————————————————————————————————————————

const itemCache = new Map<number, Promise<Item>>()

export function getItem(id: number): Promise<Item> {
  if (!itemCache.has(id)) {
    const p = get<Item>(`/items/${id}`)
    p.catch(() => itemCache.delete(id))
    itemCache.set(id, p)
  }
  return itemCache.get(id)!
}

/** Recetas que producen este ítem. */
export async function getRecipesFor(itemId: number): Promise<Recipe[]> {
  const ids = await get<number[]>('/recipes/search', { output: itemId })
  return ids.length ? getRecipes(ids) : []
}

/** IDs de recetas que usan este ítem como ingrediente. */
export function getRecipeIdsUsing(itemId: number): Promise<number[]> {
  return get<number[]>('/recipes/search', { input: itemId })
}

export function getRecipes(ids: number[]): Promise<Recipe[]> {
  return get<Recipe[]>('/recipes', { ids: ids.slice(0, 200).join(',') })
}

/** Precio en el bazar; null si el ítem no se comercia. */
export async function getPrice(itemId: number): Promise<Price | null> {
  try {
    return await get<Price>(`/commerce/prices/${itemId}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

/** Precios de varios ítems a la vez; los que no se comercian no aparecen. */
export async function getPrices(ids: number[]): Promise<Map<number, Price>> {
  if (!ids.length) return new Map()
  try {
    const prices = await get<Price[]>('/commerce/prices', { ids: ids.slice(0, 200).join(',') })
    return new Map(prices.map((p) => [p.id, p]))
  } catch (e) {
    // La API responde 404 si ninguno de los ítems se comercia
    if (e instanceof ApiError && e.status === 404) return new Map()
    throw e
  }
}

export function getTokenInfo(key: string) {
  return get<TokenInfo>('/tokeninfo', { access_token: key })
}

export function getAccount(key: string) {
  return get<Account>('/account', { access_token: key })
}

export function getWallet(key: string) {
  return get<WalletEntry[]>('/account/wallet', { access_token: key })
}

// ——— Hook para pedidos asíncronos ————————————————————————

export type Async<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: T }

/** Ejecuta `fn` cada vez que cambian `deps` y expone su estado. */
export function useAsync<T>(fn: () => Promise<T>, deps: readonly unknown[]): Async<T> {
  const [state, setState] = useState<Async<T>>({ status: 'loading' })

  // Las dependencias las define quien llama al hook
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let alive = true
    setState({ status: 'loading' })
    fn().then(
      (data) => alive && setState({ status: 'ready', data }),
      (err: Error) => alive && setState({ status: 'error', error: err.message }),
    )
    return () => {
      alive = false
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
