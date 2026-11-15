import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium, type Browser, type Page } from 'playwright'
import { createServer, type ViteDevServer } from 'vite'
import { applyState, collectPageSnapshot } from './collector'
import { emitFigmaManifest } from './emitter'
import { figmaComponentInstrumentation } from './instrumentation'
import { enrichColorTokens } from './token-colors'
import type { ComponentContract, FigmaExportConfig, PageSnapshot } from './types'
import { validateExport } from './validate'

const root = process.cwd()
const checkMode = process.argv.includes('--check')
const allowBlockedRequests = process.argv.includes('--allow-blocked-requests')

/** Restrict the export to the configured pages whose `route` matches. Accepts
 *  multiple routes — repeat the flag (`--route /travel/help --route /travel/cover`),
 *  pass a comma-separated list (`--route /travel/help,/travel/cover`), or the
 *  `--route=<path>` form. Omitted, every configured page is exported. */
function parseRouteFilter(argv: string[]): string[] {
  const routes: string[] = []
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg.startsWith('--route=')) routes.push(arg.slice('--route='.length))
    else if (arg === '--route' && index + 1 < argv.length) routes.push(argv[index + 1])
  }
  return routes.flatMap((value) => value.split(',')).map((value) => value.trim()).filter(Boolean)
}

const routeFilter = parseRouteFilter(process.argv)

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, 'utf8')) as T
}

async function loadConfig(): Promise<FigmaExportConfig> {
  const module = await import(pathToFileURL(resolve(root, 'figma-export.config.ts')).href)
  return module.default as FigmaExportConfig
}

function baseUrlFor(server: ViteDevServer): string {
  const address = server.httpServer?.address()
  if (!address || typeof address === 'string') throw new Error('The export server did not expose a local address.')
  return `http://127.0.0.1:${address.port}`
}

function isAllowedUrl(rawUrl: string, allowedHosts: Set<string>): boolean {
  const url = new URL(rawUrl)
  if (['data:', 'blob:', 'about:'].includes(url.protocol)) return true
  return ['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol) && allowedHosts.has(url.hostname)
}

async function configureNetwork(
  page: Page,
  allowedHosts: Set<string>,
  blockedRequests: string[],
  blockedFontRequests: string[],
): Promise<void> {
  await page.route('**/*', async (route) => {
    const request = route.request()
    const url = request.url()
    if (isAllowedUrl(url, allowedHosts)) await route.continue()
    else {
      if (request.resourceType() === 'font') blockedFontRequests.push(url)
      else blockedRequests.push(url)
      await route.abort('blockedbyclient')
    }
  })
}

async function waitForStableDocument(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined)
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.evaluate(() => Promise.race([
        document.fonts.ready,
        new Promise<void>((resolveFontWait) => window.setTimeout(resolveFontWait, 1_500)),
      ]))
      await page.waitForTimeout(100)
      return
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('Execution context was destroyed') || attempt === 2) throw error
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(150)
    }
  }
}

async function waitForVisualState(page: Page): Promise<void> {
  // Dropdown uses a body portal and positions the menu in a layout effect. A
  // fixed timeout can catch its initial 0×0/opacity-0 pass on a busy machine.
  await page.waitForFunction(() => [...document.querySelectorAll('.acko-dropdown-portal-layer .acko-dropdown-menu')]
    .every((menu) => {
      const rect = menu.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && rect.top > 0 && Number.parseFloat(getComputedStyle(menu).opacity) >= 0.999
    }))
  await page.evaluate(() => new Promise<void>((resolveFrame) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolveFrame()))
  }))
}

async function launchBrowser(config: FigmaExportConfig): Promise<Browser> {
  const common = {
    headless: true,
    args: [
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-domain-reliability',
      '--disable-sync',
      '--metrics-recording-only',
      '--no-default-browser-check',
      '--no-first-run',
    ],
  }
  return config.browserChannel === 'chrome'
    ? chromium.launch({ ...common, channel: 'chrome' })
    : chromium.launch(common)
}

async function captureAll(
  config: FigmaExportConfig,
  contract: ComponentContract,
  server: ViteDevServer,
  browser: Browser,
): Promise<PageSnapshot[]> {
  const snapshots: PageSnapshot[] = []
  const allowedHosts = new Set(config.network.allowedHosts)
  const baseUrl = baseUrlFor(server)
  for (const pageDefinition of config.pages) {
    for (const viewport of pageDefinition.viewports) {
      for (const state of pageDefinition.states) {
        const blockedRequests: string[] = []
        const blockedFontRequests: string[] = []
        // Export the final interaction state, never a browser's in-between
        // animation frame. ACKO components honour reduced motion in CSS.
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          reducedMotion: 'reduce',
          locale: config.locale ?? Intl.DateTimeFormat().resolvedOptions().locale,
        })
        const page = await context.newPage()
        try {
          await page.addInitScript({ content: 'globalThis.__name = (target) => target' })
          await configureNetwork(page, allowedHosts, blockedRequests, blockedFontRequests)
          await page.goto(new URL(pageDefinition.route, baseUrl).href, { waitUntil: 'domcontentloaded' })
          await waitForStableDocument(page)
          await applyState(page, state)
          await waitForVisualState(page)
          snapshots.push(await collectPageSnapshot(page, {
            rootSelector: config.rootSelector,
            page: pageDefinition,
            state,
            viewport,
            contract,
            blockedRequests,
            blockedFontRequests,
            requiredFonts: config.fonts.requiredFamilies,
          }))
        } finally {
          await context.close()
        }
      }
    }
  }
  return snapshots
}

async function writeOrCheck(file: string, value: unknown): Promise<void> {
  const serialized = `${JSON.stringify(value, null, 2)}\n`
  if (!checkMode) {
    await writeFile(file, serialized)
    return
  }
  let current = ''
  try { current = await readFile(file, 'utf8') } catch { /* handled by comparison */ }
  if (current !== serialized) throw new Error(`Generated artifact is stale: ${file}`)
}

async function main(): Promise<void> {
  const loadedConfig = await loadConfig()
  const requestedRoutes = new Set(routeFilter)
  const pages = requestedRoutes.size
    ? loadedConfig.pages.filter((page) => requestedRoutes.has(page.route))
    : loadedConfig.pages
  if (requestedRoutes.size) {
    const available = [...new Set(loadedConfig.pages.map((page) => page.route))]
    const unmatched = [...requestedRoutes].filter((route) => !available.includes(route))
    if (unmatched.length) {
      throw new Error(`No page in figma-export.config.ts has route ${unmatched.map((route) => `"${route}"`).join(', ')}. Available routes: ${available.join(', ') || '(none configured)'}`)
    }
  }
  const config: FigmaExportConfig = { ...loadedConfig, pages }
  const configuredContract = await readJson<ComponentContract>(resolve(root, 'figma-component-contract.json'))
  const contract = await enrichColorTokens(root, configuredContract)
  if (contract.schemaVersion !== '1.0') throw new Error('Unsupported component contract schema.')
  const outputDirectory = resolve(root, config.outputDirectory)
  await mkdir(resolve(outputDirectory, 'snapshots'), { recursive: true })

  let server: ViteDevServer | undefined
  let browser: Browser | undefined
  try {
    // Design-system packages must be served from source (via resolve.alias),
    // not Vite's pre-bundled deps — otherwise the instrumentation transform
    // never runs on them and no component instances are captured.
    const instrumentedPackages = [...new Set(Object.values(contract.components).flatMap((entry) => (entry.package ? [entry.package] : [])))]
    server = await createServer({
      root,
      configFile: resolve(root, 'vite.config.ts'),
      logLevel: 'error',
      plugins: [figmaComponentInstrumentation(contract)],
      optimizeDeps: { exclude: instrumentedPackages },
      server: { host: '127.0.0.1', port: 0, strictPort: false },
    })
    await server.listen()
    browser = await launchBrowser(config)
    const snapshots = await captureAll(config, contract, server, browser)
    for (const snapshot of snapshots) {
      await writeOrCheck(
        resolve(outputDirectory, 'snapshots', `${snapshot.pageId}-${snapshot.stateId}-${snapshot.viewport.id}.json`),
        snapshot,
      )
    }

    const blockedRequests = [...new Set(snapshots.flatMap((snapshot) => snapshot.blockedRequests))]
    const blockedFontRequests = [...new Set(snapshots.flatMap((snapshot) => snapshot.blockedFontRequests))]
    const unavailableFonts = [...new Set(snapshots.flatMap((snapshot) => snapshot.unavailableFonts))]
    const policyErrors = [
      ...(config.network.failOnBlockedRequest && !allowBlockedRequests && blockedRequests.length
        ? [`Blocked external requests were attempted:\n${blockedRequests.map((url) => `  - ${url}`).join('\n')}`]
        : []),
      ...(!config.fonts.assumeAvailable && unavailableFonts.length
        ? [`Required fonts are unavailable: ${unavailableFonts.join(', ')}`]
        : []),
    ]
    const manifest = emitFigmaManifest(snapshots, contract, config.fonts.familyAliases, config.layoutMode)
    const validation = validateExport(manifest, snapshots)
    const report = {
      ok: validation.ok && policyErrors.length === 0,
      diagnosticOverrides: { allowBlockedRequests },
      assumedFontFamilies: config.fonts.assumeAvailable ? config.fonts.requiredFamilies : [],
      screens: snapshots.length,
      layers: validation.layerCount,
      blockedRequests,
      blockedFontRequests,
      unavailableFonts,
      policyErrors,
      errors: validation.errors,
      warnings: validation.warnings,
    }
    await writeOrCheck(resolve(outputDirectory, 'report.json'), report)
    if (!validation.ok || policyErrors.length) {
      throw new Error([...policyErrors, ...validation.errors].join('\n\n'))
    }
    await writeOrCheck(resolve(outputDirectory, 'figma-import.json'), manifest)
    process.stdout.write(`Generated ${snapshots.length} screen(s), ${validation.layerCount} layers.\n`)
  } finally {
    await browser?.close()
    await server?.close()
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
