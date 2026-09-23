import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { ItemSummary } from '../lib/catalog'
import { splitCoins } from '../lib/format'
import { RARITY_LABELS, itemKind, label } from '../lib/labels'
import { useFavorites } from '../lib/user'
import { HeartIcon } from './icons'

export function ItemIcon({
  src,
  rarity,
  size = 48,
  alt = '',
}: {
  src: string | null | undefined
  rarity: string
  size?: number
  alt?: string
}) {
  return (
    <span className={`item-icon rarity-${rarity}`} style={{ width: size, height: size }}>
      {src ? <img src={src} alt={alt} width={size} height={size} loading="lazy" /> : null}
    </span>
  )
}

export function RarityName({ rarity }: { rarity: string }) {
  return <span className={`rarity-text rarity-${rarity}`}>{label(RARITY_LABELS, rarity)}</span>
}

export function FavoriteButton({ id, className = '' }: { id: number; className?: string }) {
  const favorites = useFavorites()
  const active = favorites.has(id)
  return (
    <button
      type="button"
      className={`fav-button ${active ? 'active' : ''} ${className}`}
      aria-pressed={active}
      aria-label={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      title={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        favorites.toggle(id)
      }}
    >
      <HeartIcon filled={active} />
    </button>
  )
}

export function ItemTile({ item }: { item: ItemSummary }) {
  return (
    <div className="item-tile">
      <Link to={`/item/${item.id}`} className="item-tile-link">
        <ItemIcon src={item.icon} rarity={item.rarity} size={52} />
        <span className="item-tile-text">
          <span className={`item-tile-name rarity-text rarity-${item.rarity}`}>{item.name}</span>
          <span className="item-tile-meta">
            {itemKind(item)}
            {item.level > 0 ? ` · Nv. ${item.level}` : ''}
          </span>
        </span>
      </Link>
      <FavoriteButton id={item.id} />
    </div>
  )
}

export function ItemGrid({ items }: { items: ItemSummary[] }) {
  return (
    <div className="item-grid">
      {items.map((item) => (
        <ItemTile key={item.id} item={item} />
      ))}
    </div>
  )
}

export function Coins({ copper }: { copper: number }) {
  const { gold, silver, copper: c } = splitCoins(copper)
  return (
    <span className="coins" aria-label={`${gold} oro, ${silver} plata, ${c} cobre`}>
      {gold > 0 && (
        <span className="coin coin-gold">{gold.toLocaleString('es-AR')}</span>
      )}
      {(gold > 0 || silver > 0) && <span className="coin coin-silver">{silver}</span>}
      <span className="coin coin-copper">{c}</span>
    </span>
  )
}

export function Panel({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="panel">
      {(title || actions) && (
        <header className="panel-header">
          {title && <h2>{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}

export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="state" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function Message({
  title,
  children,
  tone = 'neutral',
  action,
}: {
  title: string
  children?: ReactNode
  tone?: 'neutral' | 'error'
  action?: ReactNode
}) {
  return (
    <div className={`state state-${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      <strong>{title}</strong>
      {children && <span>{children}</span>}
      {action}
    </div>
  )
}
