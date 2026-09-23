// Íconos SVG simples (trazo de 2px, heredan el color del texto).

const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function SearchIcon() {
  return (
    <svg {...base}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg {...base} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
    </svg>
  )
}

export function UserIcon() {
  return (
    <svg {...base}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

export function BackIcon() {
  return (
    <svg {...base}>
      <path d="M15 18 9 12l6-6" />
    </svg>
  )
}

export function CopyIcon() {
  return (
    <svg {...base} width={18} height={18}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}

export function ShuffleIcon() {
  return (
    <svg {...base} width={18} height={18}>
      <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  )
}

export function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 4 56 16v18c0 13-10 22-24 26C18 56 8 47 8 34V16Z" fill="var(--accent)" />
      <path d="M32 14 46 21v12c0 8-6 14-14 17-8-3-14-9-14-17V21Z" fill="var(--bg)" />
      <path d="M32 22 38 26v7c0 4-3 7-6 8-3-1-6-4-6-8v-7Z" fill="var(--accent)" />
    </svg>
  )
}
