// Acceso a localStorage que nunca rompe la app (modo privado, almacenamiento bloqueado, etc.)

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Si no se puede guardar, el valor sigue vivo en memoria durante la sesión
  }
}

/**
 * Valor persistente observable, pensado para usarse con useSyncExternalStore.
 * Se sincroniza entre pestañas abiertas mediante el evento "storage".
 */
export function createStore<T>(key: string, fallback: T) {
  let value = readJson(key, fallback)
  const listeners = new Set<() => void>()
  const emit = () => listeners.forEach((l) => l())

  window.addEventListener('storage', (e) => {
    if (e.key === key) {
      value = readJson(key, fallback)
      emit()
    }
  })

  return {
    get: () => value,
    set(next: T) {
      value = next
      writeJson(key, next)
      emit()
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
