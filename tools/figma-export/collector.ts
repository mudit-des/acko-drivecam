import type { Page } from 'playwright'
import type {
  ComponentContract,
  ExportPage,
  ExportState,
  ExportViewport,
  PageSnapshot,
} from './types'

interface CaptureOptions {
  rootSelector: string
  page: ExportPage
  state: ExportState
  viewport: ExportViewport
  contract: ComponentContract
  blockedRequests: string[]
  blockedFontRequests: string[]
  requiredFonts: string[]
}

export async function applyState(page: Page, state: ExportState): Promise<void> {
  for (const action of state.actions ?? []) {
    if (action.type === 'click') await page.locator(action.selector).click()
    if (action.type === 'fill') await page.locator(action.selector).fill(action.value)
    if (action.type === 'press') await page.locator(action.selector).press(action.key)
    if (action.type === 'wait') await page.waitForTimeout(action.milliseconds)
  }
}

export async function collectPageSnapshot(browserPage: Page, options: CaptureOptions): Promise<PageSnapshot> {
  const input = {
    rootSelector: options.rootSelector,
    nativeComponents: Object.fromEntries(
      Object.entries(options.contract.components).map(([name, entry]) => [name, entry.strategy]),
    ),
    domMatchers: Object.entries(options.contract.components).flatMap(([name, entry]) =>
      entry.match ? [{ name, strategy: entry.strategy, selector: entry.match.selector, props: entry.match.props }] : []),
    requiredFonts: options.requiredFonts,
  }
  const captured = await browserPage.evaluate((captureInput) => {
    const warnings: Array<{ code: string; message: string; nodeId?: string }> = []
    const parseNumber = (value: string): number => {
      const parsed = Number.parseFloat(value)
      return Number.isFinite(parsed) ? parsed : 0
    }
    const round = (value: number): number => Math.round(value * 100) / 100
    const rectFor = (rect: DOMRect) => ({
      x: round(rect.x + window.scrollX),
      y: round(rect.y + window.scrollY),
      width: round(rect.width),
      height: round(rect.height),
    })
    const styleFor = (style: CSSStyleDeclaration) => ({
      display: style.display,
      position: style.position,
      zIndex: style.zIndex,
      flexDirection: style.flexDirection,
      flexWrap: style.flexWrap,
      flexGrow: parseNumber(style.flexGrow),
      alignSelf: style.alignSelf,
      justifyContent: style.justifyContent,
      alignItems: style.alignItems,
      justifyItems: style.justifyItems,
      gap: parseNumber(style.gap),
      rowGap: parseNumber(style.rowGap),
      columnGap: parseNumber(style.columnGap),
      padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(parseNumber) as [number, number, number, number],
      margin: [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft].map(parseNumber) as [number, number, number, number],
      hasAutoMargin: [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft].includes('auto'),
      backgroundColor: toRgb(style.backgroundColor),
      color: toRgb(style.color),
      borderColor: style.borderColor,
      borderWidth: Math.max(parseNumber(style.borderTopWidth), parseNumber(style.borderRightWidth), parseNumber(style.borderBottomWidth), parseNumber(style.borderLeftWidth)),
      borderWidths: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].map(parseNumber) as [number, number, number, number],
      borderRadius: Math.max(parseNumber(style.borderTopLeftRadius), parseNumber(style.borderTopRightRadius), parseNumber(style.borderBottomRightRadius), parseNumber(style.borderBottomLeftRadius)),
      opacity: parseNumber(style.opacity),
      boxShadow: style.boxShadow,
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      fontFamily: style.fontFamily,
      fontStyle: style.fontStyle,
      fontWeight: parseNumber(style.fontWeight),
      fontSize: parseNumber(style.fontSize),
      lineHeight: parseNumber(style.lineHeight) || parseNumber(style.fontSize) * 1.2,
      letterSpacing: parseNumber(style.letterSpacing),
      textAlign: style.textAlign,
      textDecoration: style.textDecorationLine,
      textTransform: style.textTransform,
      textWrap: style.getPropertyValue('text-wrap-style') || style.getPropertyValue('text-wrap') || 'auto',
      gridTemplateColumns: style.gridTemplateColumns,
      gridTemplateRows: style.gridTemplateRows,
    })
    // Modern computed colors (Tailwind v4's color-mix → `oklab(…)`, `oklch(…)`,
    // `color(…)`) aren't rgb()/hex, which the emitter parses. Paint the color
    // into a 1×1 canvas and read it back as sRGB.
    const colorProbe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    const toRgb = (value: string): string => {
      if (!colorProbe || !value || /^(rgba?\(|#|transparent$)/i.test(value)) return value
      colorProbe.clearRect(0, 0, 1, 1)
      colorProbe.fillStyle = value
      colorProbe.fillRect(0, 0, 1, 1)
      const [red, green, blue, alpha] = colorProbe.getImageData(0, 0, 1, 1).data
      return alpha === 255 ? `rgb(${red}, ${green}, ${blue})` : `rgba(${red}, ${green}, ${blue}, ${Math.round((alpha / 255) * 1000) / 1000})`
    }
    const pathSegment = (element: Element): string => {
      if (element.id) return `#${element.id}`
      const parent = element.parentElement
      const index = parent ? [...parent.children].indexOf(element) : 0
      return `${element.tagName.toLowerCase()}-${index + 1}`
    }
    const nodeIdFor = (element: Element, parentId?: string): string => {
      const explicit = element.getAttribute('data-figma-id')
      if (explicit) return explicit
      return parentId ? `${parentId}/${pathSegment(element)}` : pathSegment(element)
    }
    const visible = (element: Element, style: CSSStyleDeclaration, rect: DOMRect): boolean =>
      style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
    const renderedDescendants = (element: Element): Element[] => [...element.querySelectorAll('*')].filter((descendant) => {
      const descendantStyle = getComputedStyle(descendant)
      const descendantRect = descendant.getBoundingClientRect()
      return descendantStyle.display !== 'none' && descendantStyle.display !== 'contents' &&
        descendantStyle.visibility !== 'hidden' && descendantRect.width > 0 && descendantRect.height > 0
    })
    const componentBounds = (element: Element, descendants: Element[]): DOMRect => {
      if (!descendants.length) return element.getBoundingClientRect()
      const rects = descendants.map((descendant) => descendant.getBoundingClientRect())
      const left = Math.min(...rects.map((rect) => rect.left))
      const top = Math.min(...rects.map((rect) => rect.top))
      const right = Math.max(...rects.map((rect) => rect.right))
      const bottom = Math.max(...rects.map((rect) => rect.bottom))
      return new DOMRect(left, top, right - left, bottom - top)
    }
    // Figma's createNodeFromSvg has no CSS, so `currentColor` (used by lucide icons)
    // would import as black. Replace it with each element's computed text color.
    const svgMarkup = (svg: Element): string => {
      const clone = svg.cloneNode(true) as Element
      const originals = [svg, ...svg.querySelectorAll('*')]
      const clones = [clone, ...clone.querySelectorAll('*')]
      originals.forEach((original, index) => {
        const target = clones[index]
        const color = getComputedStyle(original).color
        for (const attribute of [...target.attributes]) {
          if (/currentcolor/i.test(attribute.value)) target.setAttribute(attribute.name, attribute.value.replace(/currentcolor/gi, color))
        }
      })
      return clone.outerHTML
    }
    const componentFor = (element: Element) => {
      const name = element.getAttribute('data-figma-component')
      if (!name) return undefined
      let props: Record<string, unknown> = {}
      try { props = JSON.parse(element.getAttribute('data-figma-props') || '{}') as Record<string, unknown> } catch {
        warnings.push({ code: 'INVALID_COMPONENT_PROPS', message: `Could not parse captured props for ${name}.` })
      }
      const strategy = captureInput.nativeComponents[name] ?? element.getAttribute('data-figma-component-strategy') ?? 'DOM'
      return {
        name,
        props,
        sourceNodeId: element.getAttribute('data-figma-source-node-id') || undefined,
        strategy: strategy === 'INSTANCE' ? 'INSTANCE' as const : 'DOM' as const,
      }
    }
    const captureDirectTextNode = (
      child: Node,
      parentId: string,
      style: CSSStyleDeclaration,
      textIndex: number,
    ): Record<string, unknown> | null => {
      if (child.nodeType !== Node.TEXT_NODE || !child.textContent?.trim()) return null
      const range = document.createRange()
      range.selectNodeContents(child)
      const rect = range.getBoundingClientRect()
      const lineCount = [...range.getClientRects()].filter((lineRect) => lineRect.width > 0 && lineRect.height > 0).length
      if (rect.width <= 0 || rect.height <= 0) return null
      return {
        id: `${parentId}/text-${textIndex}`,
        kind: 'TEXT',
        tagName: '#text',
        name: child.textContent.trim().slice(0, 80),
        text: child.textContent.trim(),
        textLineCount: lineCount,
        rect: rectFor(rect),
        style: styleFor(style),
        children: [],
      }
    }
    // Count visual lines, not client rects: a range spanning several text
    // nodes returns one rect per node *per line*, so "Divya Narayan" (three
    // text nodes on one line) would otherwise read as 3 lines and be pinned
    // to a fixed width — which then wraps in Figma. Dedupe by vertical top.
    const visualLineCount = (range: Range): number => new Set(
      [...range.getClientRects()]
        .filter((lineRect) => lineRect.width > 0 && lineRect.height > 0)
        .map((lineRect) => Math.round(lineRect.top)),
    ).size
    // A text box measured from the glyphs is exactly as wide as its longest
    // line. Figma's glyph metrics differ by a few pixels, so reflowing inside
    // that tight width breaks lines (even mid-word) where the browser did not.
    // Use the element's content-box width instead — the width the browser
    // actually wraps against — while keeping the text's own vertical extent.
    // That also applies to a single line inside a wider block (a heading in a
    // column): `fillsWidth` tells the emitter to keep that width and let Figma
    // wrap, instead of an auto-width layer that overflows the column whenever
    // Figma's rendering is wider than the browser's.
    const paragraphBox = (
      element: Element,
      style: CSSStyleDeclaration,
      textRect: DOMRect,
      lineCount: number,
    ): { rect: DOMRect; fillsWidth: boolean } => {
      if (style.display.startsWith('inline')) return { rect: textRect, fillsWidth: false }
      const box = element.getBoundingClientRect()
      const left = box.left + parseNumber(style.borderLeftWidth) + parseNumber(style.paddingLeft)
      const right = box.right - parseNumber(style.borderRightWidth) - parseNumber(style.paddingRight)
      const slack = right - left - textRect.width
      if (slack < 0 || (lineCount <= 1 && slack <= 1)) return { rect: textRect, fillsWidth: false }
      return { rect: new DOMRect(left, textRect.top, right - left, textRect.height), fillsWidth: true }
    }
    // `text-wrap: pretty` lets the browser re-break the last lines (avoiding a
    // lone last word). Figma only fills each line greedily, so the same text
    // in the same width can break elsewhere. Read where the browser broke each
    // line and turn the space at each break into an explicit line break. A
    // space and a newline are one character each, so styled-range offsets are
    // unchanged. (`balance` is re-computed by the plugin with Figma's own
    // font metrics instead: its breaks depend on exact line widths, which the
    // capture browser can't reproduce when it renders a fallback font.)
    const withBrowserLineBreaks = (element: Element, style: CSSStyleDeclaration, text: string, lineCount: number): string => {
      const wrapStyle = style.getPropertyValue('text-wrap-style') || style.getPropertyValue('text-wrap')
      if (lineCount <= 1 || !/pretty/.test(wrapStyle)) return text
      // Rebuild the collapsed string (same rules as the capture) while
      // remembering which DOM character produced each output character.
      let built = ''
      const sources: Array<{ node: Text; offset: number } | null> = []
      const walk = (parent: Node) => {
        for (const child of parent.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            const raw = child.textContent ?? ''
            for (let offset = 0; offset < raw.length; offset += 1) {
              const isSpace = /\s/.test(raw[offset])
              if (isSpace && (!built || /\s$/.test(built))) continue
              built += isSpace ? ' ' : raw[offset]
              sources.push({ node: child as Text, offset })
            }
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            if ((child as Element).tagName.toLowerCase() === 'br') {
              if (built.endsWith(' ')) { built = built.slice(0, -1); sources.pop() }
              built += '\n'
              sources.push(null)
            } else {
              walk(child)
            }
          }
        }
      }
      walk(element)
      built = built.replace(/\s+$/, '')
      if (built !== text) return text
      const probe = document.createRange()
      const topOf = (index: number): number | null => {
        const source = sources[index]
        if (!source) return null
        probe.setStart(source.node, source.offset)
        probe.setEnd(source.node, source.offset + 1)
        const rect = probe.getClientRects()[0]
        return rect ? rect.top : null
      }
      const threshold = Math.max(2, (parseNumber(style.lineHeight) || parseNumber(style.fontSize)) / 2)
      const characters = text.split('')
      for (let index = 1; index < characters.length - 1; index += 1) {
        if (characters[index] !== ' ') continue
        const before = topOf(index - 1)
        const after = topOf(index + 1)
        if (before !== null && after !== null && after - before > threshold) characters[index] = '\n'
      }
      return characters.join('')
    }
    // An element whose only children are text nodes is one paragraph. Capturing
    // each text node by its own multi-line range makes them overlap (every
    // range's box starts at the element's left edge and shares the line where
    // one run ends and the next begins), so merge them into a single text layer
    // that Figma wraps as one flow. Also honours `-webkit-line-clamp`: the
    // browser hides overflow lines, so only the visible text is captured.
    const captureMergedText = (
      element: Element,
      parentId: string,
      style: CSSStyleDeclaration,
    ): Record<string, unknown> | null => {
      const textNodes = [...element.childNodes].filter(
        (child) => child.nodeType === Node.TEXT_NODE && (child.textContent ?? '').trim().length > 0,
      )
      const contentsRange = document.createRange()
      contentsRange.selectNodeContents(element)
      let rect = contentsRange.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return null
      let text = (element.textContent ?? '').replace(/\s+/g, ' ').trim()
      if (!text) return null
      let lineCount = visualLineCount(contentsRange)
      const paragraph = paragraphBox(element, style, rect, lineCount)
      rect = paragraph.rect
      let fillsWidth = paragraph.fillsWidth

      const clampRaw = style.getPropertyValue('-webkit-line-clamp')
      const clampLines = Number.parseInt(clampRaw, 10)
      if (clampRaw && clampRaw !== 'none' && Number.isFinite(clampLines) && clampLines > 0 && lineCount > clampLines && textNodes.length === 1) {
        // Binary-search the last character that still renders within the clamped
        // box, so the exported text matches what the reader actually sees.
        const textNode = textNodes[0]
        const full = textNode.textContent ?? ''
        const maxBottom = element.getBoundingClientRect().bottom + 0.5
        const probe = document.createRange()
        let low = 0
        let high = full.length
        let best = 0
        while (low <= high) {
          const mid = (low + high) >> 1
          probe.setStart(textNode, 0)
          probe.setEnd(textNode, mid)
          if (probe.getBoundingClientRect().bottom <= maxBottom) {
            best = mid
            low = mid + 1
          } else {
            high = mid - 1
          }
        }
        text = full.slice(0, best).replace(/\s+/g, ' ').trim()
        lineCount = clampLines
        rect = element.getBoundingClientRect()
        fillsWidth = true
      }
      text = withBrowserLineBreaks(element, style, text, lineCount)

      return {
        id: `${parentId}/text-1`,
        kind: 'TEXT',
        tagName: '#text',
        name: text.slice(0, 80),
        text,
        textLineCount: lineCount,
        ...(fillsWidth ? { textFillsWidth: true } : {}),
        rect: rectFor(rect),
        style: styleFor(style),
        children: [],
      }
    }
    // Phrasing tags that only restyle a run of text. A paragraph built solely
    // from text and these (e.g. `Dinner, in <em>black</em> & white.`) is one
    // text flow: capturing each run as its own layer makes multi-line runs
    // overlap their neighbours, so it is merged into one layer with styled
    // ranges instead. Anything that paints a box, is a component, or is not
    // `display: inline` keeps per-node capture so it stays its own layer.
    const richInlineTags = new Set(['a', 'abbr', 'b', 'br', 'cite', 'code', 'em', 'i', 'mark', 'q', 's', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u'])
    const isFormattingOnlyInline = (element: Element): boolean => {
      const tagName = element.tagName.toLowerCase()
      if (!richInlineTags.has(tagName)) return false
      if (element.hasAttribute('data-figma-component') || element.hasAttribute('data-figma-id')) return false
      const inlineStyle = getComputedStyle(element)
      if (tagName !== 'br' && inlineStyle.display !== 'inline') return false
      const background = inlineStyle.backgroundColor.replace(/\s/g, '')
      if (background !== 'transparent' && background !== 'rgba(0,0,0,0)') return false
      if (['top', 'right', 'bottom', 'left'].some((side) => parseNumber(inlineStyle.getPropertyValue(`border-${side}-width`)) > 0)) return false
      if (getComputedStyle(element, '::before').content !== 'none' || getComputedStyle(element, '::after').content !== 'none') return false
      return [...element.children].every(isFormattingOnlyInline)
    }
    const captureRichText = (
      element: Element,
      parentId: string,
      style: CSSStyleDeclaration,
    ): Record<string, unknown> | null => {
      // `text-decoration-line` is not inherited in computed style, though the
      // browser paints it through descendants — so union it up to the paragraph.
      const decorationFor = (from: Element): string => {
        const lines = new Set<string>()
        for (let current: Element | null = from; current; current = current.parentElement) {
          getComputedStyle(current).textDecorationLine.split(' ').filter((line) => line !== 'none').forEach((line) => lines.add(line))
          if (current === element) break
        }
        return lines.size ? [...lines].sort().join(' ') : 'none'
      }
      const baseDecoration = decorationFor(element)
      const ranges: Array<{ start: number; end: number; fontWeight: number; fontStyle: string; color: string; textDecoration: string; textTransform: string }> = []
      let text = ''
      const walk = (node: Node) => {
        for (const child of node.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            let segment = (child.textContent ?? '').replace(/\s+/g, ' ')
            // Collapse whitespace across run boundaries the way the browser does.
            if (!text || /\s$/.test(text)) segment = segment.replace(/^ /, '')
            if (!segment) continue
            const start = text.length
            text += segment
            const owner = child.parentElement ?? element
            const ownerStyle = getComputedStyle(owner)
            const run = {
              start,
              end: text.length,
              fontWeight: parseNumber(ownerStyle.fontWeight),
              fontStyle: ownerStyle.fontStyle,
              color: toRgb(ownerStyle.color),
              textDecoration: decorationFor(owner),
              textTransform: ownerStyle.textTransform,
            }
            const differs = run.fontWeight !== parseNumber(style.fontWeight)
              || run.fontStyle !== style.fontStyle
              || run.color !== toRgb(style.color)
              || run.textDecoration !== baseDecoration
              || run.textTransform !== style.textTransform
            if (!differs) continue
            const previous = ranges[ranges.length - 1]
            if (previous && previous.end === start && previous.fontWeight === run.fontWeight && previous.fontStyle === run.fontStyle
              && previous.color === run.color && previous.textDecoration === run.textDecoration && previous.textTransform === run.textTransform) {
              previous.end = run.end
            } else {
              ranges.push(run)
            }
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            if ((child as Element).tagName.toLowerCase() === 'br') text = `${text.replace(/ $/, '')}\n`
            else walk(child)
          }
        }
      }
      walk(element)
      text = text.replace(/\s+$/, '')
      if (!text) return null
      const contentsRange = document.createRange()
      contentsRange.selectNodeContents(element)
      const textRect = contentsRange.getBoundingClientRect()
      if (textRect.width <= 0 || textRect.height <= 0) return null
      const lineCount = visualLineCount(contentsRange)
      text = withBrowserLineBreaks(element, style, text, lineCount)
      const textRanges = ranges
        .map((range) => ({ ...range, end: Math.min(range.end, text.length) }))
        .filter((range) => range.start < range.end)
      const paragraph = paragraphBox(element, style, textRect, lineCount)
      return {
        id: `${parentId}/text-1`,
        kind: 'TEXT',
        tagName: '#text',
        name: text.slice(0, 80),
        text,
        textLineCount: lineCount,
        ...(paragraph.fillsWidth ? { textFillsWidth: true } : {}),
        ...(textRanges.length ? { textRanges } : {}),
        rect: rectFor(paragraph.rect),
        style: { ...styleFor(style), textDecoration: baseDecoration },
        children: [],
      }
    }
    const captureElement =(element: Element, parentId?: string): Record<string, unknown> | null => {
      const rawStyle = getComputedStyle(element)
      const isComponentBoundary = element.hasAttribute('data-figma-component') && rawStyle.display === 'contents'
      const descendants = isComponentBoundary ? renderedDescendants(element) : []
      const style = isComponentBoundary && descendants[0] ? getComputedStyle(descendants[0]) : rawStyle
      const rect = isComponentBoundary ? componentBounds(element, descendants) : element.getBoundingClientRect()
      if (!visible(element, style, rect)) return null
      const id = nodeIdFor(element, parentId)
      const component = componentFor(element)
      const tagName = element.tagName.toLowerCase()
      if (isComponentBoundary && component?.strategy === 'DOM') {
        const renderedRoot = element.children[0]
        if (!renderedRoot) return null
        const capturedRoot = captureElement(renderedRoot, id)
        if (!capturedRoot) return null
        return { ...capturedRoot, id, name: component.name, component }
      }
      if (tagName === 'img' || tagName === 'canvas' || tagName === 'video') {
        warnings.push({ code: 'UNSUPPORTED_MEDIA', message: `${tagName} requires an explicit asset policy.`, nodeId: id })
      }
      if (getComputedStyle(element, '::before').content !== 'none' || getComputedStyle(element, '::after').content !== 'none') {
        warnings.push({ code: 'PSEUDO_ELEMENT', message: 'Pseudo-element content requires explicit capture support.', nodeId: id })
      }
      const base = {
        id,
        kind: tagName === 'svg' ? 'SVG' : 'ELEMENT',
        tagName,
        name: element.getAttribute('aria-label') || element.getAttribute('role') || element.id || tagName,
        ...(tagName === 'svg' ? { svg: svgMarkup(element) } : {}),
        rect: rectFor(rect),
        style: styleFor(style),
        ...(component ? { component } : {}),
      }
      if (component?.strategy === 'INSTANCE' || tagName === 'svg') return { ...base, children: [] }
      // Selector-matched components: read the props from the rendered DOM.
      const domMatcher = captureInput.domMatchers.find((matcher) => element.matches(matcher.selector))
      if (domMatcher) {
        const props: Record<string, unknown> = {}
        for (const [prop, source] of Object.entries(domMatcher.props) as Array<[string, Record<string, any>]>) {
          if ('hasClass' in source) props[prop] = element.classList.contains(source.hasClass)
          else if ('text' in source) {
            const text = element.querySelector(source.text)?.textContent?.replace(/\s+/g, ' ').trim()
            if (text) props[prop] = text
          } else if ('property' in source) {
            const target = element.querySelector(source.property.selector) as Record<string, unknown> | null
            if (target) props[prop] = target[source.property.name]
          } else if ('closestClass' in source) {
            const host = element.closest(source.closestClass.closest)
            const found = (source.closestClass.values as string[]).find((value) => host?.classList.contains(`${source.closestClass.prefix}${value}`))
            if (found) props[prop] = found
          } else if ('closestHasClass' in source) {
            props[prop] = Boolean(element.closest(source.closestHasClass.closest)?.classList.contains(source.closestHasClass.className))
          }
        }
        return {
          ...base,
          name: domMatcher.name,
          component: { name: domMatcher.name, props, strategy: domMatcher.strategy === 'INSTANCE' ? 'INSTANCE' : 'DOM' },
          children: [],
        }
      }
      const children: Array<Record<string, unknown>> = []
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        // Form controls render their text natively, so rebuild what the reader
        // sees: the selected option's label for a <select>, a date in the
        // browser's display format (not the ISO value), and the placeholder in
        // its own ::placeholder color when the field is empty.
        let value = ''
        let color = style.color
        if (element instanceof HTMLSelectElement) {
          value = element.selectedOptions[0]?.text ?? ''
        } else if (element.value) {
          value = element instanceof HTMLInputElement && element.type === 'date' && element.valueAsDate
            ? element.valueAsDate.toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' })
            : element.value
        } else if (element.placeholder) {
          value = element.placeholder
          color = toRgb(getComputedStyle(element, '::placeholder').color)
        }
        if (value) {
          // The text sits in the content box (inside border + padding); a
          // single-line control centres it vertically, a textarea starts at
          // the top of its content box.
          const multiline = element instanceof HTMLTextAreaElement
          const left = rect.left + parseNumber(style.borderLeftWidth) + parseNumber(style.paddingLeft)
          const right = rect.right - parseNumber(style.borderRightWidth) - parseNumber(style.paddingRight)
          const top = rect.top + parseNumber(style.borderTopWidth) + (multiline ? parseNumber(style.paddingTop) : 0)
          const bottom = rect.bottom - parseNumber(style.borderBottomWidth) - (multiline ? parseNumber(style.paddingBottom) : 0)
          children.push({
            id: `${id}/input-value`,
            kind: 'TEXT',
            tagName: '#text',
            name: 'Input value',
            text: value,
            inputText: multiline ? 'MULTI_LINE' : 'SINGLE_LINE',
            rect: rectFor(new DOMRect(left, top, Math.max(0, right - left), Math.max(0, bottom - top))),
            style: { ...styleFor(style), color },
            children: [],
          })
        }
      } else {
        const hasElementChild = [...element.childNodes].some((child) => child.nodeType === Node.ELEMENT_NODE)
        const textNodeCount = [...element.childNodes].filter(
          (child) => child.nodeType === Node.TEXT_NODE && (child.textContent ?? '').trim().length > 0,
        ).length
        // A pure-text element (one or more adjacent text runs, no element
        // children) becomes a single wrapping text layer; so does text mixed
        // only with formatting inlines (as styled ranges). Other mixed content
        // keeps per-node capture so element children stay addressable.
        if (!hasElementChild && textNodeCount > 0) {
          const mergedText = captureMergedText(element, id, style)
          if (mergedText) children.push(mergedText)
        } else if (
          hasElementChild
          && (element.textContent ?? '').trim()
          && [...element.children].every(isFormattingOnlyInline)
        ) {
          const richText = captureRichText(element, id, style)
          if (richText) children.push(richText)
        } else {
          let textIndex = 0
          for (const child of element.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
              const capturedText = captureDirectTextNode(child, id, style, textIndex + 1)
              if (capturedText) {
                textIndex += 1
                children.push(capturedText)
              }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const capturedChild = captureElement(child as Element, id)
              if (capturedChild) children.push(capturedChild)
            }
          }
        }
      }
      return { ...base, children }
    }

    const root = document.querySelector(captureInput.rootSelector)
    if (!root) throw new Error(`Export root not found: ${captureInput.rootSelector}`)
    const rootCapture = captureElement(root)
    if (!rootCapture) throw new Error(`Export root is not visible: ${captureInput.rootSelector}`)
    // Floating Dropdown menus are rendered through a React portal under body.
    // Treat the rendered menu as an absolute child of the export root so an
    // interaction-state screen contains the thing the interaction revealed.
    for (const overlay of document.querySelectorAll('.acko-dropdown-portal-layer > *')) {
      const capturedOverlay = captureElement(overlay, String(rootCapture.id))
      if (capturedOverlay) (rootCapture.children as Array<Record<string, unknown>>).push(capturedOverlay)
    }
    const unavailableFonts = captureInput.requiredFonts.filter((family) => !document.fonts.check(`16px "${family}"`))
    const documentElement = document.documentElement
    // The page background lives on <body>/<html>, not on the captured export
    // root, so surface it separately for the emitter to paint onto the frame.
    const opaque = (color: string): boolean => color !== '' && color !== 'transparent' && !/^rgba?\([^)]*,\s*0\s*\)$/.test(color)
    const bodyBackground = getComputedStyle(document.body).backgroundColor
    const htmlBackground = getComputedStyle(documentElement).backgroundColor
    const documentBackground = opaque(bodyBackground) ? bodyBackground : opaque(htmlBackground) ? htmlBackground : ''
    return {
      root: rootCapture,
      documentSize: { width: documentElement.scrollWidth, height: documentElement.scrollHeight },
      documentBackground,
      unavailableFonts,
      warnings,
    }
  }, input)

  return {
    schemaVersion: '1.0',
    pageId: options.page.id,
    pageName: options.page.name,
    route: options.page.route,
    stateId: options.state.id,
    stateName: options.state.name,
    viewport: options.viewport,
    documentSize: captured.documentSize,
    documentBackground: captured.documentBackground,
    root: captured.root as unknown as PageSnapshot['root'],
    blockedRequests: [...new Set(options.blockedRequests)].sort(),
    blockedFontRequests: [...new Set(options.blockedFontRequests)].sort(),
    unavailableFonts: captured.unavailableFonts,
    warnings: captured.warnings,
  }
}
