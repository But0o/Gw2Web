import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ItemGrid, Message, Panel } from '../components/ui'
import { SearchIcon, ShuffleIcon } from '../components/icons'
import type { Catalog } from '../lib/catalog'
import { formatNumber } from '../lib/format'
import { RARITIES, RARITY_LABELS, TYPE_LABELS, label } from '../lib/labels'
import { pickFeatured, searchItems } from '../lib/search'
import { useFavorites } from '../lib/user'

const PAGE = 60

export function SearchPage({ catalog }: { catalog: Catalog }) {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const type = params.get('tipo') ?? ''
  const rarity = params.get('rareza') ?? ''
  const [limit, setLimit] = useState(PAGE)
  const inputRef = useRef<HTMLInputElement>(null)

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
    setLimit(PAGE)
  }

  // Atajos: "/" o Ctrl+K enfocan la búsqueda
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest('input, textarea, select')
      if ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Diferir la búsqueda mantiene fluido el tipeo aunque filtre ~74.000 ítems
  const deferredQuery = useDeferredValue(query)
  const results = useMemo(
    () => searchItems(catalog.items, { query: deferredQuery, type, rarity }),
    [catalog, deferredQuery, type, rarity],
  )
  const searching = Boolean(query.trim() || type || rarity)

  return (
    <div className="page">
      <div className="search-bar">
        <label className="search-input">
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => update('q', e.target.value)}
            placeholder={`Buscar entre ${formatNumber(catalog.items.length)} objetos…`}
            aria-label="Buscar objetos"
          />
          <kbd className="hint">/</kbd>
        </label>
        <select value={type} onChange={(e) => update('tipo', e.target.value)} aria-label="Tipo">
          <option value="">Todos los tipos</option>
          {catalog.types.map((t) => (
            <option key={t} value={t}>
              {label(TYPE_LABELS, t)}
            </option>
          ))}
        </select>
        <select value={rarity} onChange={(e) => update('rareza', e.target.value)} aria-label="Rareza">
          <option value="">Todas las rarezas</option>
          {RARITIES.map((r) => (
            <option key={r} value={r}>
              {RARITY_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      {searching ? (
        results.length === 0 ? (
          <Message title="Sin resultados">
            No encontramos objetos{query && ` para “${query}”`}. Probá con otra palabra o sacá algún filtro.
          </Message>
        ) : (
          <>
            <p className="result-count">
              {formatNumber(results.length)} {results.length === 1 ? 'resultado' : 'resultados'}
            </p>
            <ItemGrid items={results.slice(0, limit)} />
            {results.length > limit && (
              <button type="button" className="button more" onClick={() => setLimit((l) => l + PAGE)}>
                Mostrar más ({formatNumber(results.length - limit)} restantes)
              </button>
            )}
          </>
        )
      ) : (
        <Home catalog={catalog} />
      )}
    </div>
  )
}

function Home({ catalog }: { catalog: Catalog }) {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9))
  const featured = useMemo(() => pickFeatured(catalog.items, 12, seed), [catalog, seed])
  const favorites = useFavorites()
  const favItems = favorites.ids
    .map((id) => catalog.byId.get(id))
    .filter((i) => i !== undefined)
    .slice(0, 6)

  return (
    <>
      {favItems.length > 0 && (
        <Panel title="Tus favoritos">
          <ItemGrid items={favItems} />
        </Panel>
      )}
      <Panel
        title="Equipo destacado"
        actions={
          <button type="button" className="button ghost" onClick={() => setSeed((s) => s + 7919)}>
            <ShuffleIcon /> Otra tanda
          </button>
        }
      >
        <ItemGrid items={featured} />
      </Panel>
      <p className="footnote">
        Catálogo actualizado el{' '}
        {new Date(catalog.generatedAt).toLocaleDateString('es-AR', { dateStyle: 'long' })}.
      </p>
    </>
  )
}
