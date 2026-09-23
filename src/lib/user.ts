// Datos del usuario guardados en el navegador: favoritos y API key.

import { useSyncExternalStore } from 'react'
import { createStore } from './storage'

const favoritesStore = createStore<number[]>('gw2.favorites', [])
const apiKeyStore = createStore<string>('gw2.apiKey', '')

export function useFavorites() {
  const ids = useSyncExternalStore(favoritesStore.subscribe, favoritesStore.get)
  return {
    ids,
    has: (id: number) => ids.includes(id),
    toggle(id: number) {
      const current = favoritesStore.get()
      favoritesStore.set(
        current.includes(id) ? current.filter((x) => x !== id) : [id, ...current],
      )
    },
  }
}

export function useApiKey() {
  const key = useSyncExternalStore(apiKeyStore.subscribe, apiKeyStore.get)
  return [key, apiKeyStore.set] as const
}
