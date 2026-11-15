import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import config from '../../figma-export.config'

/** Local API the Figma plugin talks to. `npm run dev` starts it next to Vite with
 *  `tsx watch`, so editing `figma-export.config.ts` restarts it and the plugin's
 *  next refresh sees the change. Must match `devAllowedDomains` in
 *  figma-plugin/manifest.json and `BRIDGE_URL` in figma-plugin/src/ui.html. */
const HOST = '127.0.0.1'
const PORT = 5180
const root = process.cwd()

const CORS_HEADERS = {
  // The plugin UI is an iframe with a `null` origin.
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Private-Network': 'true',
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

function listRoutes() {
  return config.pages.map((page) => ({
    id: page.id,
    name: page.name,
    route: page.route,
    viewports: page.viewports.map(({ id, width, height }) => ({ id, width, height })),
    states: page.states.map(({ id, name }) => ({ id, name })),
  }))
}

/** Runs `npm run figma:export -- --route a,b` and resolves with its output. */
function runExport(routes: string[]): Promise<{ ok: boolean; output: string }> {
  return new Promise((done) => {
    const child = spawn(resolve(root, 'node_modules/.bin/tsx'), ['tools/figma-export/cli.ts', '--route', routes.join(',')], { cwd: root })
    let output = ''
    child.stdout.on('data', (chunk) => { output += chunk })
    child.stderr.on('data', (chunk) => { output += chunk })
    child.on('error', (error) => done({ ok: false, output: `${output}${error.message}` }))
    child.on('close', (code) => done({ ok: code === 0, output }))
  })
}

// The exporter writes to one shared output folder, so only one run at a time.
let exportInProgress = false

async function handleExport(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await readBody(req).catch(() => null) as { routes?: unknown } | null
  const known = new Set(config.pages.map((page) => page.route))
  const routes = Array.isArray(body?.routes) ? body.routes.filter((route): route is string => typeof route === 'string') : []
  if (routes.length === 0) return sendJson(res, 400, { error: 'Select at least one route.' })
  const unknown = routes.filter((route) => !known.has(route))
  if (unknown.length) return sendJson(res, 400, { error: `Not in figma-export.config.ts: ${unknown.join(', ')}` })
  if (exportInProgress) return sendJson(res, 409, { error: 'An export is already running. Try again when it finishes.' })

  exportInProgress = true
  const startedAt = Date.now()
  console.log(`Exporting ${routes.join(', ')}…`)
  try {
    const result = await runExport(routes)
    const seconds = Math.round((Date.now() - startedAt) / 1000)
    if (!result.ok) {
      console.error(`Export failed after ${seconds}s:\n${result.output}`)
      return sendJson(res, 500, { error: result.output.trim() || 'The export command failed.' })
    }
    const outputDirectory = resolve(root, config.outputDirectory)
    const manifest = JSON.parse(await readFile(resolve(outputDirectory, 'figma-import.json'), 'utf8'))
    const report = JSON.parse(await readFile(resolve(outputDirectory, 'report.json'), 'utf8'))
    console.log(`Exported ${routes.length} route(s) in ${seconds}s.`)
    sendJson(res, 200, { manifest, screens: report.screens, layers: report.layers, warnings: report.warnings.length, seconds })
  } finally {
    exportInProgress = false
  }
}

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url ?? '/', `http://${HOST}`)
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS).end()
    return
  }
  if (req.method === 'GET' && pathname === '/routes') return sendJson(res, 200, { pages: listRoutes() })
  if (req.method === 'POST' && pathname === '/export') {
    handleExport(req, res).catch((error) => sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) }))
    return
  }
  sendJson(res, 404, { error: `No endpoint for ${req.method} ${pathname}` })
})

server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${PORT} is already in use. Stop the other figma bridge first.` : error)
  process.exit(1)
})

// Loopback only: nothing else on the network can reach it.
server.listen(PORT, HOST, () => console.log(`Figma bridge ready on http://localhost:${PORT}`))
