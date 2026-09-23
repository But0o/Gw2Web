import { useEffect } from 'react'
import { HashRouter, NavLink, Route, Routes, useLocation } from 'react-router'
import { HeartIcon, Logo, SearchIcon, UserIcon } from './components/icons'
import { Message, Spinner } from './components/ui'
import { useCatalog } from './lib/catalog'
import { useFavorites } from './lib/user'
import { FavoritesPage } from './pages/FavoritesPage'
import { ItemPage } from './pages/ItemPage'
import { ProfilePage } from './pages/ProfilePage'
import { SearchPage } from './pages/SearchPage'

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}

function Shell() {
  const catalog = useCatalog()
  const favorites = useFavorites()
  const { pathname } = useLocation()

  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <div className="shell">
      <nav className="nav" aria-label="Principal">
        <div className="brand">
          <Logo />
          <span>Arsenal de Tyria</span>
        </div>
        <NavLink to="/" end className="nav-link">
          <SearchIcon />
          <span>Buscar</span>
        </NavLink>
        <NavLink to="/favoritos" className="nav-link">
          <HeartIcon />
          <span>Favoritos</span>
          {favorites.ids.length > 0 && <span className="badge">{favorites.ids.length}</span>}
        </NavLink>
        <NavLink to="/cuenta" className="nav-link">
          <UserIcon />
          <span>Mi cuenta</span>
        </NavLink>
        <p className="nav-footer">
          Datos de la API oficial de Guild Wars 2. Proyecto de fans, sin afiliación con ArenaNet.
        </p>
      </nav>

      <main className="main">
        {catalog.status === 'loading' && <Spinner label="Cargando catálogo de objetos…" />}
        {catalog.status === 'error' && (
          <Message
            tone="error"
            title="No se pudo cargar el catálogo"
            action={
              <button type="button" className="button" onClick={catalog.retry}>
                Reintentar
              </button>
            }
          >
            {catalog.error}
          </Message>
        )}
        {catalog.status === 'ready' && (
          <Routes>
            <Route path="/" element={<SearchPage catalog={catalog.catalog} />} />
            <Route path="/item/:id" element={<ItemPage catalog={catalog.catalog} />} />
            <Route path="/favoritos" element={<FavoritesPage catalog={catalog.catalog} />} />
            <Route path="/cuenta" element={<ProfilePage />} />
            <Route path="*" element={<Message title="Página no encontrada" />} />
          </Routes>
        )}
      </main>
    </div>
  )
}
