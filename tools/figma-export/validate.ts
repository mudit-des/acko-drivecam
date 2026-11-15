import type { PageSnapshot } from './types'

type JsonRecord = Record<string, unknown>

export interface ValidationResult {
  ok: boolean
  errors: string[]
  warnings: string[]
  layerCount: number
}

export function validateExport(manifest: JsonRecord, snapshots: PageSnapshot[]): ValidationResult {
  const errors: string[] = []
  const warnings = snapshots.flatMap((snapshot) => snapshot.warnings.map((warning) =>
    `${snapshot.pageId}/${snapshot.stateId}/${snapshot.viewport.id}: ${warning.code} — ${warning.message}${warning.nodeId ? ` (${warning.nodeId})` : ''}`,
  ))
  const ids = new Set<string>()
  let layerCount = 0
  const components = (manifest.components ?? {}) as Record<string, unknown>
  const variables = (manifest.variables ?? {}) as Record<string, unknown>

  function walk(layer: unknown, path: string): void {
    if (!layer || typeof layer !== 'object' || Array.isArray(layer)) {
      errors.push(`${path} is not a layer object.`)
      return
    }
    const value = layer as JsonRecord
    layerCount += 1
    if (typeof value.id !== 'string' || !value.id) errors.push(`${path} has no stable id.`)
    else if (ids.has(value.id)) errors.push(`Duplicate layer id: ${value.id}`)
    else ids.add(value.id)
    // Instances own their geometry: either dimension may be omitted (a
    // `matchWidth` instance sets only its width and keeps its own height).
    const intrinsicComponent = value.type === 'COMPONENT_INSTANCE'
    for (const dimension of ['width', 'height']) {
      const number = value[dimension]
      if (intrinsicComponent && number === undefined) continue
      if (typeof number !== 'number' || !Number.isFinite(number) || number <= 0) errors.push(`${path}.${dimension} must be a positive finite number.`)
    }
    if (value.type === 'COMPONENT_INSTANCE' && (typeof value.component !== 'string' || !components[value.component])) {
      errors.push(`${path} references an unknown component: ${String(value.component)}`)
    }
    const layout = value.layout as JsonRecord | undefined
    if (layout?.mode === 'GRID') {
      const grid = layout.grid as JsonRecord | undefined
      const rows = grid?.rows
      const columns = grid?.columns
      if (!Number.isInteger(rows) || (rows as number) < 1 || !Number.isInteger(columns) || (columns as number) < 1) {
        errors.push(`${path} has invalid grid dimensions.`)
      } else if (Array.isArray(value.children)) {
        value.children.forEach((child, index) => {
          if (!child || typeof child !== 'object' || Array.isArray(child)) return
          const layoutChild = (child as JsonRecord).layoutChild as JsonRecord | undefined
          if (layoutChild?.positioning === 'ABSOLUTE') return
          const row = layoutChild?.row
          const column = layoutChild?.column
          if (row !== undefined && column !== undefined && (
            !Number.isInteger(row) || (row as number) < 0 || (row as number) >= (rows as number) ||
            !Number.isInteger(column) || (column as number) < 0 || (column as number) >= (columns as number)
          )) {
            errors.push(`${path}.children[${index}] has an out-of-bounds grid position (${String(row)}, ${String(column)}).`)
          }
        })
      }
    }
    const serialized = JSON.stringify(value)
    for (const match of serialized.matchAll(/"variable":"([^"]+)"/g)) {
      if (!variables[match[1]]) errors.push(`${path} references an unknown variable: ${match[1]}`)
    }
    if (Array.isArray(value.children)) value.children.forEach((child, index) => walk(child, `${path}.children[${index}]`))
  }

  const screens = manifest.screens
  if (!Array.isArray(screens) || screens.length === 0) errors.push('Manifest contains no screens.')
  else screens.forEach((screen, index) => {
    if (!screen || typeof screen !== 'object' || Array.isArray(screen)) errors.push(`screens[${index}] is invalid.`)
    else walk((screen as JsonRecord).root, `screens[${index}].root`)
  })
  return { ok: errors.length === 0, errors: [...new Set(errors)], warnings, layerCount }
}
