import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { ComponentContract, TokenContractEntry } from './types'

interface ParsedColor {
  hex: string
  opacity: number
}

function parseColor(value: string): ParsedColor | null {
  const source = value.trim().toLowerCase()
  const hex = source.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
  if (hex) {
    const expanded = hex[1].length <= 4 ? hex[1].split('').map((part) => part + part).join('') : hex[1]
    return {
      hex: `#${expanded.slice(0, 6)}`,
      opacity: expanded.length === 8 ? Number.parseInt(expanded.slice(6), 16) / 255 : 1,
    }
  }
  const rgba = source.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/)
  if (!rgba) return null
  const channel = (part: string) => Math.max(0, Math.min(255, Math.round(Number(part)))).toString(16).padStart(2, '0')
  return {
    hex: `#${channel(rgba[1])}${channel(rgba[2])}${channel(rgba[3])}`,
    opacity: Math.max(0, Math.min(1, rgba[4] === undefined ? 1 : Number(rgba[4]))),
  }
}

function colorKey(color: ParsedColor): string {
  const opacity = Math.round(color.opacity * 1_000) / 1_000
  return opacity === 1 ? color.hex.toLowerCase() : `${color.hex.toLowerCase()}@${opacity}`
}

function rootDeclarations(css: string): Map<string, string> {
  const declarations = new Map<string, string>()
  for (const root of css.matchAll(/:root\s*\{([\s\S]*?)\}/g)) {
    for (const match of root[1].matchAll(/--([A-Za-z0-9-]+)\s*:\s*([^;]+);/g)) {
      if (!declarations.has(match[1])) declarations.set(match[1], match[2].trim())
    }
  }
  return declarations
}

function resolveDeclaration(name: string, declarations: Map<string, string>, seen = new Set<string>()): string | null {
  if (seen.has(name)) return null
  seen.add(name)
  const value = declarations.get(name)?.trim()
  if (!value) return null
  const reference = value.match(/^var\(--([A-Za-z0-9-]+)\)$/)?.[1]
  return reference ? resolveDeclaration(reference, declarations, seen) : value
}

function parsePixels(value: string): number | null {
  const match = value.trim().match(/^(-?[\d.]+)(px|rem)?$/)
  if (!match) return null
  const number = Number(match[1])
  if (!Number.isFinite(number)) return null
  return match[2] === 'rem' ? number * 16 : number
}

function numberKey(value: number): string {
  return String(Math.round(value * 1_000) / 1_000)
}

function figmaColorName(name: string): string {
  const solid = name.match(/^solid([A-Z][a-z]+?)(\d+|White|Black)$/)
  if (solid) return `Colour / Solid / ${solid[1]} / ${solid[2]}`
  const alpha = name.match(/^alpha([A-Z][a-z]+A)(\d+)$/)
  if (alpha) return `Colour / Alpha / ${alpha[1]} / ${alpha[2]}`
  return name
}

/** The library names these `Spacing/space8` and `Radius/radiusFull` — the
 *  radius variable keeps its full token name, spacing swaps `spacing` for
 *  `space`. */
function figmaNumberName(name: string): string {
  if (name.startsWith('spacing')) return `Spacing / space${name.slice('spacing'.length)}`
  if (name.startsWith('radius')) return `Radius / ${name}`
  return name
}

/**
 * Adds the token package's primitive colour names as optional bindings. Explicit
 * semantic bindings in the contract always win; primitives provide a safe
 * fallback for all other resolved browser colours.
 */
export async function enrichColorTokens(root: string, contract: ComponentContract): Promise<ComponentContract> {
  const css = await readFile(resolve(root, 'node_modules/@acko/tokens/src/tokens.css'), 'utf8')
  const declarations = rootDeclarations(css)
  const colors = { ...contract.tokens.colors }
  const spacing = { ...contract.tokens.numbers?.spacing }
  const radius = { ...contract.tokens.numbers?.radius }

  for (const name of declarations.keys()) {
    if (!name.startsWith('solid') && !name.startsWith('alpha')) continue
    const resolved = resolveDeclaration(name, declarations)
    const color = resolved ? parseColor(resolved) : null
    if (!color) continue
    const key = colorKey(color)
    if (colors[key] || colors[color.hex.toLowerCase()]) continue
    const token: TokenContractEntry = {
      reference: `color/${name}`,
      libraryName: figmaColorName(name),
      required: false,
    }
    colors[key] = token
  }

  for (const [name] of declarations) {
    const group = name.startsWith('spacing') ? spacing : name.startsWith('radius') ? radius : null
    if (!group) continue
    const resolved = resolveDeclaration(name, declarations)
    const value = resolved ? parsePixels(resolved) : null
    if (value === null) continue
    const key = numberKey(value)
    if (group[key]) continue
    group[key] = {
      reference: `${name.startsWith('spacing') ? 'spacing' : 'radius'}/${name}`,
      libraryName: figmaNumberName(name),
      required: false,
    }
  }

  return {
    ...contract,
    tokens: {
      ...contract.tokens,
      colors,
      numbers: { spacing, radius },
    },
  }
}
