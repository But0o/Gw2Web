/** Minúsculas y sin tildes: "Pegote de Ectoplasma" → "pegote de ectoplasma" */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/** Quita el marcado de GW2 (<c=@flavor>…</c>, <br>) y devuelve texto plano con saltos de línea. */
export function stripMarkup(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?c(=[^>]*)?>/gi, '')
    .trim()
}

/** Separa un valor en cobre en oro / plata / cobre. */
export function splitCoins(copper: number) {
  return {
    gold: Math.floor(copper / 10000),
    silver: Math.floor((copper % 10000) / 100),
    copper: copper % 100,
  }
}

export function formatNumber(n: number): string {
  return n.toLocaleString('es-AR')
}
