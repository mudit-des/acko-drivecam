import type { Plugin } from 'vite'
import type { ComponentContract } from './types'

const runtimeId = 'virtual:acko-figma-export-runtime'
const resolvedRuntimeId = `\0${runtimeId}`

function runtimeSource(): string {
  return `
    import React from 'react'

    function serializable(value, depth = 0, seen = new WeakSet()) {
      if (depth > 5 || value === undefined || typeof value === 'function' || typeof value === 'symbol') return undefined
      if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
      if (typeof value === 'bigint') return String(value)
      if (React.isValidElement(value)) return undefined
      if (Array.isArray(value)) {
        return value.map((item) => serializable(item, depth + 1, seen)).filter((item) => item !== undefined)
      }
      if (typeof value === 'object') {
        if (seen.has(value)) return undefined
        seen.add(value)
        const result = {}
        for (const [key, child] of Object.entries(value)) {
          const next = serializable(child, depth + 1, seen)
          if (next !== undefined) result[key] = next
        }
        return result
      }
      return undefined
    }

    function serializedProps(props) {
      const cleaned = serializable(props)
      try { return JSON.stringify(cleaned ?? {}) } catch { return '{}' }
    }

    export function instrumentComponent(Component, metadata) {
      const InstrumentedComponent = React.forwardRef(function InstrumentedComponent(props, ref) {
        const componentProps = ref == null ? props : { ...props, ref }
        return React.createElement('span', {
          'data-figma-component': metadata.name,
          'data-figma-component-strategy': metadata.strategy,
          'data-figma-source-node-id': metadata.sourceNodeId || undefined,
          'data-figma-props': serializedProps(props),
          style: { display: 'contents' },
        }, React.createElement(Component, componentProps))
      })
      InstrumentedComponent.displayName = 'FigmaExport(' + metadata.name + ')'
      for (const key of Object.keys(Component)) {
        if (!['$$typeof', 'render', 'compare', 'type', 'displayName', 'name', 'length', 'prototype'].includes(key)) {
          InstrumentedComponent[key] = Component[key]
        }
      }
      return InstrumentedComponent
    }
  `
}

export function figmaComponentInstrumentation(contract: ComponentContract): Plugin {
  // Contract components keyed by their package's entry module, then by the name
  // each is exported under, so we can wrap only the exports we have metadata for.
  const exportsByPackage = new Map<string, Map<string, { name: string; strategy: string; sourceNodeId?: string }>>()
  for (const [name, entry] of Object.entries(contract.components)) {
    if (!entry.package || !entry.exportName) continue
    const current = exportsByPackage.get(entry.package) ?? new Map()
    current.set(entry.exportName, { name, strategy: entry.strategy, sourceNodeId: entry.sourceNodeId })
    exportsByPackage.set(entry.package, current)
  }

  // `resolve.alias` in vite.config.ts rewrites `@acko/<pkg>` to
  // `.../@acko/<pkg>/src/index.ts` before this plugin's resolveId ever sees the
  // bare specifier, so import interception cannot catch it. Instead we transform
  // the entry module itself: rewrite each `export { Component } from "./mod"`
  // into a wrapped export that tags the component for the DOM capture. This is
  // independent of how the import resolved.
  const valueReExport = /export\s*\{([^}]*)\}\s*from\s*(['"])([^'"]+)\2\s*;?/g

  return {
    name: 'acko-figma-component-instrumentation',
    enforce: 'pre',
    resolveId(source) {
      if (source === runtimeId) return resolvedRuntimeId
      return null
    },
    load(id) {
      if (id === resolvedRuntimeId) return runtimeSource()
      return null
    },
    transform(code, id) {
      const filePath = id.split('?')[0]
      const match = filePath.match(/[/\\]@acko[/\\]([^/\\]+)[/\\]src[/\\]index\.ts$/)
      if (!match) return null
      const wrappers = exportsByPackage.get(`@acko/${match[1]}`)
      if (!wrappers) return null

      let changed = false
      const transformed = code.replace(valueReExport, (statement, names: string, quote: string, modulePath: string) => {
        const exported = names.split(',').map((part) => part.trim()).filter(Boolean)
        const wrap = exported.filter((name) => wrappers.has(name))
        if (wrap.length === 0) return statement
        changed = true
        const keep = exported.filter((name) => !wrappers.has(name))
        const importLine = `import { ${wrap.map((name) => `${name} as __figOriginal_${name}`).join(', ')} } from ${quote}${modulePath}${quote};`
        const wrapLines = wrap
          .map((name) => `export const ${name} = __figInstrument(__figOriginal_${name}, ${JSON.stringify(wrappers.get(name))});`)
          .join('\n')
        const keepLine = keep.length ? `\nexport { ${keep.join(', ')} } from ${quote}${modulePath}${quote};` : ''
        return `${importLine}\n${wrapLines}${keepLine}`
      })
      if (!changed) return null
      return {
        code: `import { instrumentComponent as __figInstrument } from ${JSON.stringify(runtimeId)};\n${transformed}`,
        map: null,
      }
    },
  }
}
