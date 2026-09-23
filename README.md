# Arsenal de Tyria

Buscador de objetos de **Guild Wars 2**: recetas, precios del bazar y datos de tu cuenta.
Es la versión web del proyecto [AppGw2](https://github.com/But0o/AppGw2), que era una app Android.

Funciona en cualquier navegador y se puede **instalar** como app en la PC (Chrome/Edge) o en el
iPhone (Safari → Compartir → *Agregar a pantalla de inicio*).

## Qué hace

- **Buscar** entre los ~74.000 objetos del juego, al instante y sin importar tildes. Filtros por tipo y rareza.
- **Detalle del objeto**: características, atributos, receta con el costo de los ingredientes en el bazar,
  en qué recetas se usa y el enlace de chat para copiar en el juego.
- **Favoritos** guardados en el navegador.
- **Mi cuenta**: con una API key de GW2 muestra horas jugadas, expansiones, rango McM y oro.
- Funciona **sin conexión** para lo que ya se consultó (PWA con service worker).

## Cómo funciona

```
GitHub Actions (todos los días)
  └─ scripts/build-index.mjs ── descarga los 74k ítems de la API ──► public/data/items.json (~1,4 MB gzip)
                                                                      │
Navegador                                                             ▼
  ├─ búsqueda ── filtra el índice local (sin pedir nada a la red)
  └─ detalle / precios / cuenta ── consulta la API de GW2 en vivo (api.guildwars2.com)
```

La app anterior descargaba el catálogo entero en cada celular (unas 370 llamadas a la API). Acá el
índice se arma una sola vez por día en GitHub y la app lo baja en un único archivo.

No hay backend ni cuentas propias: favoritos y API key viven en `localStorage`.

## Desarrollo

Requisitos: Node.js 24+.

```bash
npm install
npm run index   # genera public/data/items.json (tarda ~2 minutos; hacelo una vez)
npm run dev     # http://localhost:5173
```

| Comando             | Qué hace                                                     |
| ------------------- | ------------------------------------------------------------ |
| `npm run dev`       | Servidor de desarrollo con recarga automática                |
| `npm run index`     | Vuelve a descargar el catálogo de ítems                      |
| `npm run build`     | Compila la versión de producción en `dist/`                  |
| `npm run preview`   | Sirve `dist/` para probar la versión compilada (y la PWA)    |
| `npm run typecheck` | Revisa los tipos de TypeScript                               |
| `npm run lint`      | Revisa el código con oxlint                                  |

### Estructura

```
scripts/build-index.mjs   genera el índice de ítems
src/
  App.tsx                 navegación y rutas
  lib/
    catalog.ts            carga y decodifica el índice
    gw2.ts                cliente de la API de GW2 + hook useAsync
    search.ts             búsqueda y orden por relevancia
    user.ts               favoritos y API key (localStorage)
    labels.ts             traducciones de los valores de la API
  pages/                  Buscar, Detalle, Favoritos, Mi cuenta
  components/             piezas de interfaz reutilizables
```

## Publicar

El workflow `.github/workflows/deploy.yml` compila y publica en **GitHub Pages** cada vez que se
hace push a `main`, y además todos los días para sumar los ítems nuevos del juego.

Una sola vez: en el repo de GitHub, **Settings → Pages → Source: GitHub Actions**.

---

Proyecto de fans, sin afiliación con ArenaNet. Guild Wars 2 y sus recursos son © ArenaNet, LLC.
Los datos vienen de la [API oficial](https://wiki.guildwars2.com/wiki/API:Main).
