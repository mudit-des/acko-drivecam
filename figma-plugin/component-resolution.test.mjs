import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

// Exercise the actual resolver without starting the Figma plugin runtime.
const source = ts.createSourceFile('code.ts', readFileSync(new URL('./src/code.ts', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true)
const contextClass = source.statements.find((node) => ts.isClassDeclaration(node) && node.name.text === 'ImportContext')
const code = ts.transpile(contextClass.getText(source), { target: ts.ScriptTarget.ES2020 })

function setup({ localKey = 'button-key', local = true, published = true, explicit = false } = {}) {
  const issues = []
  let imports = 0
  const properties = (types) => ({ Type: { type: 'VARIANT', variantOptions: types } })
  const current = { id: '11754:617', key: localKey, type: 'COMPONENT_SET', name: 'Button', remote: false, componentPropertyDefinitions: properties(['Primary', 'Destructive-Low']) }
  const remote = { ...current, key: 'button-key', id: 'remote:1', remote: true, componentPropertyDefinitions: properties(['Primary', 'Danger']) }
  const sandbox = {
    figma: {
      getNodeByIdAsync: async () => local ? current : null,
      importComponentSetByKeyAsync: async () => { imports++; return remote },
    },
    normalizeRegistryName: (name) => name.toLowerCase(),
    addIssue: (_report, severity, code, message) => issues.push({ severity, code, message }),
  }
  vm.runInNewContext(`${code}\nthis.Context = ImportContext`, sandbox)
  const registry = { components: [{ nodeId: '11754:617', key: 'button-key', kind: 'COMPONENT_SET', normalizedName: 'button', publishStatus: published ? 'PUBLISHED' : 'UNPUBLISHED', properties: current.componentPropertyDefinitions }] }
  const definition = explicit ? { nodeId: '11754:617' } : { sourceNodeId: '11754:617', libraryName: 'Button' }
  const context = new sandbox.Context({ components: { Button: definition } }, {}, registry)
  return { context, current, remote, issues, imports: () => imports }
}

test('uses the verified live local source during preflight and import, including unpublished edits', async () => {
  const run = setup({ published: false })
  assert.equal(await run.context.resolveComponent('Button', false), run.current)
  assert.equal(await run.context.resolveComponent('Button', true), run.current)
  assert.equal(run.imports(), 0)
  assert.ok(run.issues.some((issue) => issue.code === 'COMPONENT_RESOLVED' && issue.message.includes('local COMPONENT_SET')))
})

test('rejects a same-ID local component with a different key', async () => {
  const run = setup({ localKey: 'unrelated-key' })
  assert.equal(await run.context.resolveComponent('Button', false), null)
  assert.equal(await run.context.resolveComponent('Button', true), run.remote)
  assert.equal(run.imports(), 1)
})

test('cross-file import reports a published version missing source variants', async () => {
  const run = setup({ local: false })
  assert.equal(await run.context.resolveComponent('Button', true), run.remote)
  assert.ok(run.issues.some((issue) => issue.code === 'COMPONENT_LIBRARY_VERSION_MISMATCH' && issue.message.includes('Destructive-Low')))
  assert.ok(run.issues.some((issue) => issue.code === 'COMPONENT_RESOLVED' && issue.message.includes('remote:1')))
})

test('preserves an explicit local node override', async () => {
  const run = setup({ explicit: true, localKey: 'explicit-key' })
  assert.equal(await run.context.resolveComponent('Button', true), run.current)
  assert.equal(run.imports(), 0)
})
