import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { BackIcon, CopyIcon } from '../components/icons'
import {
  Coins,
  FavoriteButton,
  ItemGrid,
  ItemIcon,
  Message,
  Panel,
  RarityName,
  Spinner,
} from '../components/ui'
import type { Catalog } from '../lib/catalog'
import { formatNumber, stripMarkup } from '../lib/format'
import {
  getItem,
  getPrice,
  getPrices,
  getRecipeIdsUsing,
  getRecipes,
  getRecipesFor,
  useAsync,
  type Item,
  type Recipe,
} from '../lib/gw2'
import { ATTRIBUTE_LABELS, DAMAGE_LABELS, DISCIPLINE_LABELS, GAME_TYPE_LABELS, itemKind, label } from '../lib/labels'

export function ItemPage({ catalog }: { catalog: Catalog }) {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const item = useAsync(() => getItem(id), [id])

  return (
    <div className="page">
      {/* Si se entró directo por un link, "Volver" lleva al buscador en vez de salir del sitio */}
      <button
        type="button"
        className="button ghost back"
        onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'))}
      >
        <BackIcon /> Volver
      </button>
      {item.status === 'loading' && <Spinner label="Cargando objeto…" />}
      {item.status === 'error' && (
        <Message tone="error" title="No se pudo cargar el objeto">
          {item.error}
        </Message>
      )}
      {item.status === 'ready' && <ItemDetail item={item.data} catalog={catalog} />}
    </div>
  )
}

function ItemDetail({ item, catalog }: { item: Item; catalog: Catalog }) {
  const summary = catalog.byId.get(item.id)
  const d = item.details
  const attributes = d?.infix_upgrade?.attributes ?? []
  const description = item.description ? stripMarkup(item.description) : ''
  const buff = d?.infix_upgrade?.buff?.description ?? d?.description

  return (
    <div className="detail">
      <header className="detail-header">
        <ItemIcon src={item.icon} rarity={item.rarity} size={88} alt={stripMarkup(item.name)} />
        <div className="detail-title">
          <h1 className={`rarity-text rarity-${item.rarity}`}>{stripMarkup(item.name)}</h1>
          <p className="muted">
            {itemKind({ type: item.type, subtype: d?.type })} · <RarityName rarity={item.rarity} />
            {item.level > 0 && ` · Nivel ${item.level}`}
          </p>
          <ChatLink code={item.chat_link} />
        </div>
        <FavoriteButton id={item.id} className="large" />
      </header>

      {description && <p className="description">{description}</p>}

      <div className="detail-columns">
        <div className="detail-main">
          <Recipes item={item} catalog={catalog} />
          <UsedIn itemId={item.id} catalog={catalog} />
        </div>

        <aside className="detail-side">
          <Panel title="Características">
            <dl className="stats">
              {d?.min_power !== undefined && d.max_power !== undefined && (
                <Stat name="Poder de arma" value={`${formatNumber(d.min_power)} – ${formatNumber(d.max_power)}`} />
              )}
              {d?.defense ? <Stat name="Defensa" value={formatNumber(d.defense)} /> : null}
              {d?.damage_type && <Stat name="Tipo de daño" value={label(DAMAGE_LABELS, d.damage_type)} />}
              {attributes.map((a) => (
                <Stat key={a.attribute} name={label(ATTRIBUTE_LABELS, a.attribute)} value={`+${a.modifier}`} />
              ))}
              {item.game_types.length > 0 && (
                <Stat
                  name="Modos de juego"
                  value={item.game_types.map((g) => label(GAME_TYPE_LABELS, g)).join(', ')}
                />
              )}
            </dl>
            {buff && <p className="buff">{stripMarkup(buff)}</p>}
            {d?.bonuses && d.bonuses.length > 0 && (
              <ol className="bonuses">
                {d.bonuses.map((b, i) => (
                  <li key={i}>{stripMarkup(b)}</li>
                ))}
              </ol>
            )}
          </Panel>

          <Panel title="Valor">
            <dl className="stats">
              <Stat name="Venta a mercader" value={item.vendor_value ? <Coins copper={item.vendor_value} /> : '—'} />
            </dl>
            {summary?.tradeable !== false && <TradingPost itemId={item.id} />}
          </Panel>

          {d?.recipe_id && <UnlocksRecipe recipeId={d.recipe_id} catalog={catalog} />}
        </aside>
      </div>
    </div>
  )
}

function Stat({ name, value }: { name: string; value: ReactNode }) {
  return (
    <div className="stat">
      <dt>{name}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function ChatLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="chat-link"
      title="Copiar el enlace para pegarlo en el chat del juego"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          // El navegador no permitió copiar; el código queda visible para copiarlo a mano
        }
      }}
    >
      <code>{code}</code>
      <CopyIcon />
      <span className="chat-link-status">{copied ? '¡Copiado!' : 'Copiar'}</span>
    </button>
  )
}

function TradingPost({ itemId }: { itemId: number }) {
  const price = useAsync(() => getPrice(itemId), [itemId])
  if (price.status === 'loading') return <p className="muted small">Consultando el bazar…</p>
  if (price.status === 'error') return <p className="muted small">No se pudo consultar el bazar.</p>
  if (!price.data) return <p className="muted small">No se comercia en el bazar.</p>
  const { buys, sells } = price.data
  return (
    <dl className="stats">
      <Stat
        name="Bazar · compra"
        value={buys.unit_price ? <Coins copper={buys.unit_price} /> : '—'}
      />
      <Stat
        name="Bazar · venta"
        value={sells.unit_price ? <Coins copper={sells.unit_price} /> : '—'}
      />
      <Stat name="En venta" value={formatNumber(sells.quantity)} />
    </dl>
  )
}

function Recipes({ item, catalog }: { item: Item; catalog: Catalog }) {
  const recipes = useAsync(() => getRecipesFor(item.id), [item.id])
  if (recipes.status === 'loading') return <Panel title="Receta"><Spinner label="Buscando recetas…" /></Panel>
  if (recipes.status === 'error') return null
  if (recipes.data.length === 0) return null
  return (
    <>
      {recipes.data.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} catalog={catalog} />
      ))}
    </>
  )
}

function RecipeCard({ recipe, catalog }: { recipe: Recipe; catalog: Catalog }) {
  const ids = recipe.ingredients.map((i) => i.item_id)
  const prices = useAsync(() => getPrices(ids), [recipe.id])
  const priced = prices.status === 'ready' ? prices.data : null

  const total = priced
    ? recipe.ingredients.reduce((sum, ing) => sum + (priced.get(ing.item_id)?.sells.unit_price ?? 0) * ing.count, 0)
    : 0
  const allPriced = priced ? recipe.ingredients.every((ing) => priced.get(ing.item_id)?.sells.unit_price) : false

  return (
    <Panel title={recipe.output_item_count > 1 ? `Receta (produce ${recipe.output_item_count})` : 'Receta'}>
      <p className="muted small">
        {recipe.disciplines.map((x) => label(DISCIPLINE_LABELS, x)).join(', ')}
        {recipe.min_rating > 0 && ` · Nivel de artesanía ${recipe.min_rating}`}
      </p>
      <ul className="ingredients">
        {recipe.ingredients.map((ing) => {
          const info = catalog.byId.get(ing.item_id)
          const price = priced?.get(ing.item_id)?.sells.unit_price
          return (
            <li key={ing.item_id}>
              <Link to={`/item/${ing.item_id}`} className="ingredient">
                <span className="ingredient-count">{ing.count}×</span>
                <ItemIcon src={info?.icon} rarity={info?.rarity ?? 'Basic'} size={36} />
                <span className={`rarity-text rarity-${info?.rarity ?? 'Basic'}`}>
                  {info?.name ?? `Objeto #${ing.item_id}`}
                </span>
                {price ? <Coins copper={price * ing.count} /> : null}
              </Link>
            </li>
          )
        })}
      </ul>
      {total > 0 && (
        <p className="recipe-total">
          {allPriced ? 'Costo de los ingredientes en el bazar:' : 'Costo parcial (algunos no se venden):'}{' '}
          <Coins copper={total} />
        </p>
      )}
    </Panel>
  )
}

function UsedIn({ itemId, catalog }: { itemId: number; catalog: Catalog }) {
  const outputs = useAsync(async () => {
    const ids = await getRecipeIdsUsing(itemId)
    if (!ids.length) return { total: 0, items: [] }
    const recipes = await getRecipes(ids.slice(0, 24))
    const items = [...new Set(recipes.map((r) => r.output_item_id))]
      .map((id) => catalog.byId.get(id))
      .filter((i) => i !== undefined)
    return { total: ids.length, items }
  }, [itemId])

  if (outputs.status !== 'ready' || outputs.data.items.length === 0) return null
  const { total, items } = outputs.data
  return (
    <Panel title={`Se usa para fabricar${total > items.length ? ` (${formatNumber(total)} recetas)` : ''}`}>
      <ItemGrid items={items} />
    </Panel>
  )
}

function UnlocksRecipe({ recipeId, catalog }: { recipeId: number; catalog: Catalog }) {
  const recipe = useAsync(() => getRecipes([recipeId]).then((r) => r[0]), [recipeId])
  if (recipe.status !== 'ready' || !recipe.data) return null
  const output = catalog.byId.get(recipe.data.output_item_id)
  if (!output) return null
  return (
    <Panel title="Enseña a fabricar">
      <ItemGrid items={[output]} />
    </Panel>
  )
}
