import { useState, type FormEvent, type ReactNode } from 'react'
import { Coins, Message, Panel, Spinner } from '../components/ui'
import { formatNumber } from '../lib/format'
import { getAccount, getTokenInfo, getWallet, useAsync } from '../lib/gw2'
import { ACCESS_LABELS, label } from '../lib/labels'
import { useApiKey } from '../lib/user'

const KEY_PATTERN = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{20}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i

export function ProfilePage() {
  const [apiKey, setApiKey] = useApiKey()
  return (
    <div className="page narrow">
      <h1 className="page-title">Mi cuenta</h1>
      {apiKey ? <AccountView apiKey={apiKey} onRemove={() => setApiKey('')} /> : <KeyForm onSave={setApiKey} />}
    </div>
  )
}

function KeyForm({ onSave }: { onSave: (key: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const key = value.trim()
    // Acepta el formato clásico y los tokens de subcuenta (JWT)
    if (!KEY_PATTERN.test(key) && key.split('.').length !== 3) {
      setError('Eso no parece una API key de Guild Wars 2. Copiala completa desde la web de ArenaNet.')
      return
    }
    setChecking(true)
    setError('')
    try {
      const info = await getTokenInfo(key)
      if (!info.permissions.includes('account')) {
        setError('La key no tiene el permiso "account". Creá una nueva marcándolo.')
      } else {
        onSave(key)
      }
    } catch (err) {
      setError((err as Error).message === 'Invalid access token' ? 'La API key no es válida.' : (err as Error).message)
    } finally {
      setChecking(false)
    }
  }

  return (
    <Panel title="Conectá tu cuenta de Guild Wars 2">
      <ol className="steps">
        <li>
          Entrá a{' '}
          <a href="https://account.arena.net/applications" target="_blank" rel="noreferrer">
            account.arena.net/applications
          </a>{' '}
          e iniciá sesión.
        </li>
        <li>
          Tocá <strong>New Key</strong>, poné un nombre y marcá al menos <strong>account</strong> (y{' '}
          <strong>wallet</strong> para ver tu oro).
        </li>
        <li>Copiá la key y pegala acá abajo.</li>
      </ol>
      <form className="key-form" onSubmit={submit}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXXXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
          aria-label="API key"
          spellCheck={false}
          autoComplete="off"
        />
        <button type="submit" className="button" disabled={checking || !value.trim()}>
          {checking ? 'Verificando…' : 'Guardar'}
        </button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      <p className="muted small">
        La key solo se guarda en este navegador y se usa únicamente para consultar la API oficial. Las keys son de
        solo lectura: no permiten modificar tu cuenta.
      </p>
    </Panel>
  )
}

function AccountView({ apiKey, onRemove }: { apiKey: string; onRemove: () => void }) {
  const data = useAsync(async () => {
    const [info, account] = await Promise.all([getTokenInfo(apiKey), getAccount(apiKey)])
    const wallet = info.permissions.includes('wallet') ? await getWallet(apiKey).catch(() => null) : null
    return { info, account, gold: wallet?.find((w) => w.id === 1)?.value ?? null }
  }, [apiKey])

  if (data.status === 'loading') return <Spinner label="Cargando tu cuenta…" />
  if (data.status === 'error') {
    return (
      <Message
        tone="error"
        title="No se pudo cargar la cuenta"
        action={
          <button type="button" className="button ghost" onClick={onRemove}>
            Usar otra API key
          </button>
        }
      >
        {data.error}
      </Message>
    )
  }

  const { info, account, gold } = data.data
  const wvwRank = account.wvw?.rank ?? account.wvw_rank
  const owned = new Set(account.access)
  const expansions = Object.keys(ACCESS_LABELS).filter((k) => k !== 'PlayForFree' && k !== 'GuildWars2')

  return (
    <>
      <Panel>
        <div className="account-header">
          <div className="avatar" aria-hidden="true">
            {account.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="account-name">{account.name}</h2>
            <p className="muted small">
              Cuenta creada el {new Date(account.created).toLocaleDateString('es-AR', { dateStyle: 'long' })}
              {account.commander && ' · Comandante'}
            </p>
          </div>
        </div>
        <div className="kpis">
          <Kpi label="Horas jugadas" value={formatNumber(Math.round(account.age / 3600))} />
          {wvwRank !== undefined && <Kpi label="Rango McM" value={formatNumber(wvwRank)} />}
          {account.fractal_level !== undefined && <Kpi label="Nivel de fractales" value={String(account.fractal_level)} />}
          {gold !== null && <Kpi label="Oro" value={<Coins copper={gold} />} />}
        </div>
      </Panel>

      <Panel title="Expansiones">
        <ul className="chips">
          {account.access.includes('PlayForFree') && !account.access.includes('GuildWars2') && (
            <li className="chip">{label(ACCESS_LABELS, 'PlayForFree')}</li>
          )}
          {expansions.map((k) => (
            <li key={k} className={`chip ${owned.has(k) ? 'owned' : 'missing'}`}>
              {owned.has(k) ? '✓ ' : ''}
              {label(ACCESS_LABELS, k)}
            </li>
          ))}
          {account.access
            .filter((k) => !(k in ACCESS_LABELS))
            .map((k) => (
              <li key={k} className="chip owned">
                ✓ {label(ACCESS_LABELS, k)}
              </li>
            ))}
        </ul>
      </Panel>

      <Panel title="API key">
        <p className="muted small">
          Usando la key “{info.name}” con permisos: {info.permissions.join(', ')}.
        </p>
        <button type="button" className="button ghost danger" onClick={onRemove}>
          Quitar API key
        </button>
      </Panel>
    </>
  )
}

function Kpi({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="kpi">
      <span className="kpi-value">{value}</span>
      <span className="kpi-label">{label}</span>
    </div>
  )
}
