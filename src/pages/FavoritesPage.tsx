import { Link } from 'react-router'
import { ItemGrid, Message } from '../components/ui'
import type { Catalog } from '../lib/catalog'
import { useFavorites } from '../lib/user'

export function FavoritesPage({ catalog }: { catalog: Catalog }) {
  const favorites = useFavorites()
  const items = favorites.ids.map((id) => catalog.byId.get(id)).filter((i) => i !== undefined)

  return (
    <div className="page">
      <h1 className="page-title">Favoritos</h1>
      {items.length === 0 ? (
        <Message
          title="Todavía no guardaste favoritos"
          action={
            <Link to="/" className="button">
              Buscar objetos
            </Link>
          }
        >
          Tocá el corazón de cualquier objeto para tenerlo a mano acá. Se guardan en este navegador.
        </Message>
      ) : (
        <ItemGrid items={items} />
      )}
    </div>
  )
}
