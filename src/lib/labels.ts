// Traducciones al español de los valores que la API de GW2 devuelve en inglés.

export const TYPE_LABELS: Record<string, string> = {
  Armor: 'Armadura',
  Back: 'Espalda',
  Bag: 'Bolsa',
  Consumable: 'Consumible',
  Container: 'Contenedor',
  CraftingMaterial: 'Material de artesanía',
  Gathering: 'Herramienta de recolección',
  Gizmo: 'Artilugio',
  JadeTechModule: 'Módulo de tecnología de jade',
  Key: 'Llave',
  MiniPet: 'Minimascota',
  PowerCore: 'Núcleo de energía',
  Relic: 'Reliquia',
  Tool: 'Herramienta',
  Trinket: 'Abalorio',
  Trophy: 'Trofeo',
  UpgradeComponent: 'Mejora',
  Weapon: 'Arma',
}

export const RARITIES = [
  'Junk',
  'Basic',
  'Fine',
  'Masterwork',
  'Rare',
  'Exotic',
  'Ascended',
  'Legendary',
] as const

export const RARITY_LABELS: Record<string, string> = {
  Junk: 'Basura',
  Basic: 'Básico',
  Fine: 'Selecto',
  Masterwork: 'Obra maestra',
  Rare: 'Excepcional',
  Exotic: 'Exótico',
  Ascended: 'Ascendido',
  Legendary: 'Legendario',
}

export const SUBTYPE_LABELS: Record<string, string> = {
  // Armas
  Axe: 'Hacha',
  Dagger: 'Daga',
  Focus: 'Foco',
  Greatsword: 'Mandoble',
  Hammer: 'Martillo',
  Harpoon: 'Lanza',
  LargeBundle: 'Objeto grande',
  LongBow: 'Arco largo',
  Mace: 'Maza',
  Pistol: 'Pistola',
  Rifle: 'Rifle',
  Scepter: 'Cetro',
  Shield: 'Escudo',
  ShortBow: 'Arco corto',
  SmallBundle: 'Objeto pequeño',
  Speargun: 'Arpón',
  Staff: 'Báculo',
  Sword: 'Espada',
  Torch: 'Antorcha',
  Toy: 'Juguete',
  ToyTwoHanded: 'Juguete a dos manos',
  Trident: 'Tridente',
  Warhorn: 'Cuerno de guerra',
  // Armadura
  Boots: 'Botas',
  Coat: 'Pechera',
  Gloves: 'Guantes',
  Helm: 'Casco',
  HelmAquatic: 'Casco acuático',
  Leggings: 'Pantalones',
  Shoulders: 'Hombreras',
  // Abalorios
  Accessory: 'Accesorio',
  Amulet: 'Amuleto',
  Ring: 'Anillo',
  // Consumibles y otros
  Booze: 'Bebida alcohólica',
  Food: 'Comida',
  Generic: 'Genérico',
  Unlock: 'Desbloqueo',
  Utility: 'Utilidad',
  Transmutation: 'Transmutación',
  Immediate: 'Inmediato',
  GiftBox: 'Caja de regalo',
  Default: 'Estándar',
  Salvage: 'Kit de reciclaje',
  Foraging: 'Hoz',
  Logging: 'Hacha de leñador',
  Mining: 'Pico',
  Sigil: 'Sello',
  Rune: 'Runa',
  Gem: 'Joya',
  Currency: 'Divisa',
}

export const ATTRIBUTE_LABELS: Record<string, string> = {
  AgonyResistance: 'Resistencia a la agonía',
  BoonDuration: 'Concentración',
  ConditionDamage: 'Daño de condición',
  ConditionDuration: 'Pericia',
  CritDamage: 'Ferocidad',
  Healing: 'Poder de curación',
  Power: 'Potencia',
  Precision: 'Precisión',
  Toughness: 'Dureza',
  Vitality: 'Vitalidad',
}

export const DAMAGE_LABELS: Record<string, string> = {
  Physical: 'Físico',
  Fire: 'Fuego',
  Ice: 'Hielo',
  Lightning: 'Rayo',
  Choking: 'Asfixia',
}

export const GAME_TYPE_LABELS: Record<string, string> = {
  Activity: 'Actividades',
  Dungeon: 'Mazmorras',
  Pve: 'JcE',
  Pvp: 'JcJ',
  PvpLobby: 'Sala JcJ',
  Wvw: 'McM',
}

export const ACCESS_LABELS: Record<string, string> = {
  PlayForFree: 'Gratuita',
  GuildWars2: 'Guild Wars 2',
  HeartOfThorns: 'Heart of Thorns',
  PathOfFire: 'Path of Fire',
  EndOfDragons: 'End of Dragons',
  SecretsOfTheObscure: 'Secrets of the Obscure',
  JanthirWilds: 'Janthir Wilds',
  VisionsOfEternity: 'Visions of Eternity',
}

/** Devuelve la traducción o, si no existe, separa el CamelCase ("FooBar" → "Foo Bar"). */
export function label(map: Record<string, string>, value: string): string {
  return map[value] ?? value.replace(/([a-z])([A-Z])/g, '$1 $2')
}

export const DISCIPLINE_LABELS: Record<string, string> = {
  Armorsmith: 'Armero',
  Artificer: 'Artífice',
  Chef: 'Cocinero',
  Huntsman: 'Cazador',
  Jeweler: 'Joyero',
  Leatherworker: 'Peletero',
  Scribe: 'Escriba',
  Tailor: 'Sastre',
  Weaponsmith: 'Forjador de armas',
}

/** "Arma · Mandoble", "Material de artesanía"… */
export function itemKind(item: { type: string; subtype?: string }): string {
  const type = label(TYPE_LABELS, item.type)
  const sub = item.subtype && item.subtype !== 'Generic' && item.subtype !== 'Default'
  return sub ? `${type} · ${label(SUBTYPE_LABELS, item.subtype!)}` : type
}
