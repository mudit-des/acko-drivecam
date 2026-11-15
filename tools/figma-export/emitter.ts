import type {
  CapturedNode,
  ComponentContract,
  ComponentContractEntry,
  PageSnapshot,
  StyleSnapshot,
  TextStyleContractEntry,
  TokenContractEntry,
} from './types'

type JsonRecord = Record<string, unknown>

interface EmitContext {
  contract: ComponentContract
  fontFamilyAliases: Record<string, string>
  layoutMode: 'AUTO_LAYOUT' | 'FIXED'
  canvasHeight: number
  viewportHeight: number
  usedComponents: Set<string>
  usedVariables: Set<string>
  usedTextStyles: Map<string, TextStyleContractEntry>
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

// A browser clips overflow for every value except `visible`. `auto`/`scroll`
// containers (e.g. horizontal card rows) show only what fits and scroll the
// rest; in a static export that maps to a clipped Figma frame, otherwise the
// off-screen children spill outside the frame.
function clipsOverflow(value: string): boolean {
  return value === 'hidden' || value === 'clip' || value === 'scroll' || value === 'auto'
}

function parseCssColor(value: string): { hex: string; opacity: number } | null {
  const normalized = value.trim().toLowerCase()
  if (!normalized || normalized === 'transparent') return null
  const hexMatch = normalized.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
  if (hexMatch) {
    const expanded = hexMatch[1].length <= 4
      ? hexMatch[1].split('').map((channel) => channel + channel).join('')
      : hexMatch[1]
    return {
      hex: `#${expanded.slice(0, 6)}`,
      opacity: expanded.length === 8 ? Number.parseInt(expanded.slice(6), 16) / 255 : 1,
    }
  }
  const match = normalized.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/)
  if (!match) return null
  const alpha = Math.max(0, Math.min(1, match[4] === undefined ? 1 : Number(match[4])))
  if (alpha === 0) return null
  const channel = (input: string) => Math.max(0, Math.min(255, Math.round(Number(input)))).toString(16).padStart(2, '0')
  return { hex: `#${channel(match[1])}${channel(match[2])}${channel(match[3])}`, opacity: alpha }
}

function colorKey(color: { hex: string; opacity: number }): string {
  const opacity = round(color.opacity)
  return opacity === 1 ? color.hex.toLowerCase() : `${color.hex.toLowerCase()}@${opacity}`
}

function numberKey(value: number): string {
  return String(round(value))
}

function numberValue(
  value: number,
  tokens: Record<string, TokenContractEntry> | undefined,
  context: EmitContext,
): number | JsonRecord {
  const rounded = round(value)
  const token = tokens?.[numberKey(rounded)]
  if (!token) return rounded
  context.usedVariables.add(token.reference)
  return { value: rounded, variable: token.reference }
}

function colorValue(value: string, context: EmitContext): string | JsonRecord | null {
  const parsed = parseCssColor(value)
  if (!parsed) return null
  const token = context.contract.tokens.colors[colorKey(parsed)] ?? context.contract.tokens.colors[parsed.hex.toLowerCase()]
  if (!token) return parsed.hex
  context.usedVariables.add(token.reference)
  return { value: parsed.hex, variable: token.reference }
}

function paint(value: string, context: EmitContext): JsonRecord | null {
  const color = colorValue(value, context)
  const parsed = parseCssColor(value)
  return color && parsed ? { type: 'SOLID', color, ...(parsed.opacity < 1 ? { opacity: parsed.opacity } : {}) } : null
}

function splitCssShadows(value: string): string[] {
  const shadows: string[] = []
  let start = 0
  let depth = 0
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '(') depth += 1
    if (value[index] === ')') depth -= 1
    if (value[index] === ',' && depth === 0) {
      shadows.push(value.slice(start, index).trim())
      start = index + 1
    }
  }
  shadows.push(value.slice(start).trim())
  return shadows.filter(Boolean)
}

function shadowEffects(value: string): JsonRecord[] {
  if (!value || value === 'none') return []
  return splitCssShadows(value).flatMap((shadow) => {
    const colorMatch = shadow.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/i)
    const parsed = colorMatch ? parseCssColor(colorMatch[0]) : null
    const values = shadow
      .replace(colorMatch?.[0] ?? '', '')
      .replace(/\binset\b/i, '')
      .match(/-?[\d.]+(?:px)?/g)
      ?.map((valuePart) => Number.parseFloat(valuePart)) ?? []
    if (!parsed || values.length < 2 || values.some((number) => !Number.isFinite(number))) return []
    const color = `${parsed.hex}${Math.round(parsed.opacity * 255).toString(16).padStart(2, '0')}`
    return [{
      type: /\binset\b/i.test(shadow) ? 'INNER_SHADOW' : 'DROP_SHADOW',
      color,
      offset: { x: round(values[0]), y: round(values[1]) },
      radius: round(values[2] ?? 0),
      ...(values[3] === undefined ? {} : { spread: round(values[3]) }),
    }]
  // CSS paints the first shadow on top; Figma paints the last effect on top.
  }).reverse()
}

// A uniform, painted border is emitted as a Figma stroke; uneven ones become
// separate rectangles (see borderLayers).
function uniformStroke(style: StyleSnapshot, context: EmitContext): JsonRecord | null {
  const borderWidths = style.borderWidths ?? [style.borderWidth, style.borderWidth, style.borderWidth, style.borderWidth]
  const hasUniformBorder = borderWidths.every((width) => width === borderWidths[0])
  return hasUniformBorder && style.borderWidth > 0 ? paint(style.borderColor, context) : null
}

function visibleStyle(style: StyleSnapshot, context: EmitContext): JsonRecord | undefined {
  const fills = paint(style.backgroundColor, context)
  const strokes = uniformStroke(style, context)
  const effects = shadowEffects(style.boxShadow)
  const result: JsonRecord = {
    ...(fills ? { fills: [fills] } : {}),
    ...(strokes ? { strokes: [strokes], strokeWeight: round(style.borderWidth) } : {}),
    ...(style.borderRadius > 0 ? { cornerRadius: numberValue(style.borderRadius, context.contract.tokens.numbers?.radius, context) } : {}),
    ...(style.opacity < 1 ? { opacity: style.opacity } : {}),
    ...(effects.length ? { effects } : {}),
  }
  return Object.keys(result).length ? result : undefined
}

function borderLayers(node: CapturedNode, context: EmitContext, screenId: string): JsonRecord[] {
  const [top, right, bottom, left] = node.style.borderWidths ?? [node.style.borderWidth, node.style.borderWidth, node.style.borderWidth, node.style.borderWidth]
  const widths = [top, right, bottom, left]
  if (widths.every((width) => width === widths[0])) return []
  const fill = paint(node.style.borderColor, context)
  if (!fill) return []
  const layers: JsonRecord[] = []
  // Pin each side to its edge so the line follows the frame when it hugs
  // content and grows in Figma (a bottom border must stay at the bottom).
  const constraints: Record<string, JsonRecord> = {
    top: { horizontal: 'STRETCH', vertical: 'MIN' },
    right: { horizontal: 'MAX', vertical: 'STRETCH' },
    bottom: { horizontal: 'STRETCH', vertical: 'MAX' },
    left: { horizontal: 'MIN', vertical: 'STRETCH' },
  }
  const add = (side: string, x: number, y: number, width: number, height: number) => {
    if (width <= 0 || height <= 0) return
    layers.push({
      id: `${screenId}/${node.id}::border-${side}`,
      name: `Border ${side}`,
      type: 'RECTANGLE',
      x: round(x),
      y: round(y),
      width: round(width),
      height: round(height),
      constraints: constraints[side],
      style: { fills: [fill] },
      ...(frameLayout(node, context).mode === 'NONE' ? {} : { layoutChild: { positioning: 'ABSOLUTE' } }),
    })
  }
  add('top', 0, 0, node.rect.width, top)
  add('right', node.rect.width - right, 0, right, node.rect.height)
  add('bottom', 0, node.rect.height - bottom, node.rect.width, bottom)
  add('left', 0, 0, left, node.rect.height)
  return layers
}

function alignValue(value: string): string {
  if (value === 'center') return 'CENTER'
  if (value === 'flex-end' || value === 'end') return 'MAX'
  if (value === 'space-between') return 'SPACE_BETWEEN'
  if (value === 'baseline') return 'BASELINE'
  return 'MIN'
}

function requiresAutoLayoutInFixedMode(node: CapturedNode): boolean {
  if (node.style.display !== 'flex' && node.style.display !== 'inline-flex') return false
  return node.style.justifyContent === 'space-between' || node.children.some((child) => child.style.flexGrow > 0)
}

function hasUniformGridTracks(serializedTracks: string): boolean {
  const tracks = serializedTracks
    .split(' ')
    .map((track) => Number.parseFloat(track))
    .filter((track) => Number.isFinite(track))
  // A browser distributes fractional pixels across otherwise equal tracks
  // (for example 357.328px, 357.344px). Treat those rounding residues as
  // equal, while retaining genuinely unequal CSS grids as fixed geometry.
  return tracks.length < 2 || tracks.every((track) => Math.abs(track - tracks[0]) < 0.1)
}

function isSingleCenteredGrid(node: CapturedNode): boolean {
  if (node.style.display !== 'grid' && node.style.display !== 'inline-grid') return false
  const normalChildCount = node.children.filter((child) => child.style.position !== 'absolute').length
  return normalChildCount === 1 && node.style.alignItems === 'center' && node.style.justifyItems === 'center'
}

// A one-column grid (e.g. `grid-cols-1` on mobile before `md:grid-cols-3`) is a
// vertical stack: each item is its own row, so unequal row heights are normal
// and must not force fixed positions. Exported as vertical auto layout.
function isSingleColumnGrid(node: CapturedNode): boolean {
  if (node.style.display !== 'grid' && node.style.display !== 'inline-grid') return false
  return gridColumnCount(node) === 1
}

// CSS grid items stretch across their column unless `justify-items` says
// otherwise; in Figma that is "fill container" on the counter axis.
function gridItemsStretch(node: CapturedNode): boolean {
  return ['normal', 'stretch', 'legacy'].includes(node.style.justifyItems)
}

function supportsAutoLayout(node: CapturedNode): boolean {
  if (!['flex', 'inline-flex', 'grid', 'inline-grid'].includes(node.style.display)) return false
  if ((node.style.display === 'grid' || node.style.display === 'inline-grid') && !isSingleColumnGrid(node)) {
    // The importer supports only equal Figma grid tracks. CSS tracks such as
    // 1.15fr 0.85fr must retain their measured positions or they overlap.
    if (!hasUniformGridTracks(node.style.gridTemplateColumns) || !hasUniformGridTracks(node.style.gridTemplateRows)) return false
  }
  return !node.children.some((child) =>
    child.style.hasAutoMargin || child.style.margin.some((margin) => margin !== 0),
  )
}

// Figma auto layout paints later children on top. Overlapping stacks (e.g.
// avatar groups) often give earlier items a higher z-index instead, which
// maps to Figma's "first on top" canvas stacking.
function firstChildStacksOnTop(node: CapturedNode): boolean {
  const zIndexes = node.children.map((child) => Number.parseInt(child.style.zIndex ?? '', 10))
  return zIndexes.length > 1
    && zIndexes.every(Number.isFinite)
    && zIndexes.every((value, index) => index === 0 || value < zIndexes[index - 1])
}

// True when the frame's measured height is exactly its in-flow content plus
// padding, gaps and borders — i.e. CSS `height: auto`. Such frames hug their
// content in Figma, so when Figma renders text taller or wraps it onto another
// line, the frame (and everything after it) grows as it does in the browser,
// instead of a fixed box the text overflows. An explicit or stretched height
// (a 48px button, a 64px nav bar, a grown flex child) doesn't match and stays
// fixed. Multi-column grids are left fixed; one-column grids are stacks.
function verticalInsets(node: CapturedNode): number {
  const style = node.style
  const [borderTop, , borderBottom] = style.borderWidths ?? [style.borderWidth, style.borderWidth, style.borderWidth, style.borderWidth]
  return style.padding[0] + style.padding[2] + borderTop + borderBottom
}

function flexMode(node: CapturedNode): 'HORIZONTAL' | 'VERTICAL' | null {
  if (node.style.display !== 'flex' && node.style.display !== 'inline-flex') return null
  return node.style.flexDirection.startsWith('column') ? 'VERTICAL' : 'HORIZONTAL'
}

// `flex-grow` in a column only matters when the column has spare height.
// A responsive layout often keeps `flex: 1` from its row (desktop) form when
// it stacks into a content-sized column (mobile), where it grows nothing. A
// child whose measured height is exactly its own content didn't grow, so
// its grow is ignored — otherwise Figma would make the child fill whatever
// is left of a fixed column and squeeze it below its content.
function growIsIdleVertically(child: CapturedNode): boolean {
  const mode = flexMode(child)
  return mode !== null && hugsContentHeight(child, mode, verticalInsets(child))
}

function hugsContentHeight(node: CapturedNode, mode: 'HORIZONTAL' | 'VERTICAL', verticalInsets: number): boolean {
  const inFlow = node.children.filter((child) => child.style.position !== 'absolute' && child.style.position !== 'fixed')
  if (!inFlow.length) return false
  const style = node.style
  let content: number
  if (mode === 'VERTICAL') {
    // A growing child fills the main axis, which a hugging parent can't offer.
    if (inFlow.some((child) => child.style.flexGrow > 0 && !growIsIdleVertically(child))) return false
    // Measure the stack's extent rather than summing child heights: a
    // component can report a box taller than the space it takes in flow
    // (e.g. a 1px separator that occupies 0px), which would otherwise push
    // the sum past the tolerance and leave the frame at a fixed height.
    content = Math.max(...inFlow.map((child) => child.rect.y + child.rect.height)) - Math.min(...inFlow.map((child) => child.rect.y))
  } else {
    if (inFlow.some((child) => child.style.alignSelf === 'stretch')) return false
    // A wrapping row stacks flex lines; items share a line when their vertical
    // spans overlap (cross-axis alignment can give them different tops).
    const lines: Array<{ top: number; bottom: number }> = []
    for (const child of [...inFlow].sort((a, b) => a.rect.y - b.rect.y)) {
      const line = lines[lines.length - 1]
      if (line && child.rect.y < line.bottom - 0.5) line.bottom = Math.max(line.bottom, child.rect.y + child.rect.height)
      else lines.push({ top: child.rect.y, bottom: child.rect.y + child.rect.height })
    }
    const wraps = style.flexWrap === 'wrap' || style.flexWrap === 'wrap-reverse'
    content = wraps
      ? lines.reduce((sum, line) => sum + (line.bottom - line.top), 0) + style.rowGap * (lines.length - 1)
      : Math.max(...inFlow.map((child) => child.rect.height))
  }
  return Math.abs(node.rect.height - (content + verticalInsets)) <= 0.75
}

function frameLayout(node: CapturedNode, context: EmitContext): JsonRecord {
  const wantsAutoLayout = context.layoutMode === 'AUTO_LAYOUT' || requiresAutoLayoutInFixedMode(node)
  if (!wantsAutoLayout || !supportsAutoLayout(node)) return { mode: 'NONE' }
  const style = node.style
  // A Figma stroke included in layout insets the children by its weight, so the
  // padding stays the CSS value (and keeps its spacing token). Otherwise fold
  // the border into the padding to keep children where CSS put them.
  const strokesIncludedInLayout = uniformStroke(style, context) !== null
  const [borderTop, borderRight, borderBottom, borderLeft] = strokesIncludedInLayout
    ? [0, 0, 0, 0]
    : style.borderWidths ?? [style.borderWidth, style.borderWidth, style.borderWidth, style.borderWidth]
  const [top, right, bottom, left] = [
    style.padding[0] + borderTop,
    style.padding[1] + borderRight,
    style.padding[2] + borderBottom,
    style.padding[3] + borderLeft,
  ].map(round) as [number, number, number, number]
  const spacingTokens = context.contract.tokens.numbers?.spacing
  const base = {
    primaryAxisSizing: 'FIXED',
    counterAxisSizing: 'FIXED',
    ...(strokesIncludedInLayout ? { strokesIncludedInLayout: true } : {}),
    ...(top || right || bottom || left ? {
      padding: {
        top: numberValue(top, spacingTokens, context),
        right: numberValue(right, spacingTokens, context),
        bottom: numberValue(bottom, spacingTokens, context),
        left: numberValue(left, spacingTokens, context),
      },
    } : {}),
  }
  // Figma grid does not expose CSS's per-cell place-items alignment. A
  // one-item `grid place-items-center` is semantically a centred icon/avatar
  // container, so emit centred auto layout and retain any absolute overlay.
  if (isSingleCenteredGrid(node)) {
    return {
      mode: 'HORIZONTAL',
      ...base,
      primaryAxisAlign: 'CENTER',
      counterAxisAlign: 'CENTER',
    }
  }
  if (style.display === 'flex' || style.display === 'inline-flex') {
    const mode = style.flexDirection.startsWith('column') ? 'VERTICAL' : 'HORIZONTAL'
    const hugs = hugsContentHeight(node, mode, top + bottom)
    // Figma wraps only horizontal auto layout; a wrapping column has no
    // equivalent and stays NO_WRAP. When wrapping, the row gap is the
    // counter-axis spacing even if it equals the main gap — Figma defaults it
    // to 0, which would stack wrapped rows flush.
    const wraps = mode === 'HORIZONTAL' && (style.flexWrap === 'wrap' || style.flexWrap === 'wrap-reverse')
    const columnGap = style.columnGap || style.gap
    return {
      mode,
      ...base,
      ...(hugs ? (mode === 'VERTICAL' ? { primaryAxisSizing: 'AUTO' } : { counterAxisSizing: 'AUTO' }) : {}),
      // A column sized to its content has no spare height, so CSS
      // `space-between` just leaves the gap (common when a desktop row stacks
      // on mobile). Figma's SPACE_BETWEEN ignores item spacing, which would
      // collapse the gap to 0 in a hugging frame — stack from the top instead.
      primaryAxisAlign: hugs && mode === 'VERTICAL' && style.justifyContent === 'space-between'
        ? 'MIN'
        : alignValue(style.justifyContent),
      counterAxisAlign: alignValue(style.alignItems),
      ...(wraps ? { wrap: 'WRAP' } : {}),
      ...(wraps
        ? {
          ...(columnGap > 0 ? { gap: numberValue(columnGap, spacingTokens, context) } : {}),
          ...(style.rowGap > 0 ? { counterAxisGap: numberValue(style.rowGap, spacingTokens, context) } : {}),
        }
        : {
          ...(style.gap > 0 ? { gap: numberValue(style.gap, spacingTokens, context) } : {}),
          ...(style.rowGap > 0 && style.rowGap !== style.gap ? { counterAxisGap: numberValue(style.rowGap, spacingTokens, context) } : {}),
        }),
      ...(firstChildStacksOnTop(node) ? { reverseZIndex: true } : {}),
    }
  }
  if (isSingleColumnGrid(node)) {
    const hugs = hugsContentHeight(node, 'VERTICAL', top + bottom)
    const rowGap = style.rowGap || style.gap
    return {
      mode: 'VERTICAL',
      ...base,
      ...(hugs ? { primaryAxisSizing: 'AUTO' } : {}),
      primaryAxisAlign: 'MIN',
      // `justify-items` places items across the column (stretched items are
      // handled per child as STRETCH).
      counterAxisAlign: alignValue(style.justifyItems),
      ...(rowGap > 0 ? { gap: numberValue(rowGap, spacingTokens, context) } : {}),
    }
  }
  if (style.display === 'grid' || style.display === 'inline-grid') {
    const columns = gridColumnCount(node)
    const rows = gridRowCount(node, columns)
    return {
      mode: 'GRID',
      ...base,
      grid: {
        rows,
        columns,
        ...(style.rowGap > 0 ? { rowGap: numberValue(style.rowGap, spacingTokens, context) } : {}),
        ...(style.columnGap > 0 ? { columnGap: numberValue(style.columnGap, spacingTokens, context) } : {}),
      },
    }
  }
  return { mode: 'NONE', ...base }
}

function fontStyle(weight: number, italic: string): string {
  const suffix = italic === 'italic' ? ' Italic' : ''
  if (weight >= 700) return `Bold${suffix}`
  if (weight >= 600) return `Semibold${suffix}`
  if (weight >= 500) return `Medium${suffix}`
  return `Regular${suffix}`
}

function fontFamily(value: string, context: EmitContext): string {
  const family = value.split(',')[0]?.replace(/["']/g, '').trim() || 'Inter'
  return context.fontFamilyAliases[family] ?? family
}

function textDecoration(value: string | undefined): 'UNDERLINE' | 'STRIKETHROUGH' | undefined {
  if (value?.includes('underline')) return 'UNDERLINE'
  if (value?.includes('line-through')) return 'STRIKETHROUGH'
  return undefined
}

/** CSS `text-transform` → Figma text case. The source string stays in
 *  `characters` (as in the DOM) and Figma applies the case, like CSS does. */
function textCase(value: string | undefined): 'UPPER' | 'LOWER' | 'TITLE' | undefined {
  if (value === 'uppercase') return 'UPPER'
  if (value === 'lowercase') return 'LOWER'
  if (value === 'capitalize') return 'TITLE'
  return undefined
}

/** Styled runs of a merged rich-text layer. Each carries only what differs
 *  from the layer's own typography, so unchanged runs need no extra font. */
function textRanges(node: CapturedNode, context: EmitContext): JsonRecord[] {
  const baseFontStyle = fontStyle(node.style.fontWeight, node.style.fontStyle)
  const baseDecoration = textDecoration(node.style.textDecoration) ?? 'NONE'
  const baseCase = textCase(node.style.textTransform) ?? 'ORIGINAL'
  return (node.textRanges ?? []).flatMap((range) => {
    const runFontStyle = fontStyle(range.fontWeight, range.fontStyle)
    const runDecoration = textDecoration(range.textDecoration) ?? 'NONE'
    const runCase = textCase(range.textTransform) ?? 'ORIGINAL'
    const runFill = range.color !== node.style.color ? paint(range.color, context) : null
    const result: JsonRecord = {
      start: range.start,
      end: range.end,
      ...(runFontStyle !== baseFontStyle ? { fontStyle: runFontStyle } : {}),
      ...(runFill ? { fills: [runFill] } : {}),
      ...(runDecoration !== baseDecoration ? { textDecoration: runDecoration } : {}),
      ...(runCase !== baseCase ? { textCase: runCase } : {}),
    }
    return Object.keys(result).length > 2 ? [result] : []
  })
}

function textLayer(node: CapturedNode, context: EmitContext, id = node.id, textStyle?: string): JsonRecord {
  const decoration = textDecoration(node.style.textDecoration)
  const letterCase = textCase(node.style.textTransform)
  const ranges = textRanges(node, context)
  // Form-control text keeps the control's content box: centred vertically in
  // a single-line field, top-aligned in a textarea.
  const textAutoResize = node.inputText
    ? 'NONE'
    // A single line stays content-sized (WIDTH+HEIGHT) unless it sits in a
    // wider block: then it keeps the block's width and wraps there if Figma
    // renders it wider, instead of overflowing the column.
    : node.textLineCount === 1 && !node.textFillsWidth
      ? 'WIDTH_AND_HEIGHT'
      : context.layoutMode === 'FIXED' ? 'NONE' : 'HEIGHT'
  return {
    id,
    name: node.name || 'Text',
    type: 'TEXT',
    characters: node.text ?? '',
    width: Math.max(0.01, round(node.rect.width)),
    height: Math.max(0.01, round(node.rect.height)),
    typography: {
      fontFamily: fontFamily(node.style.fontFamily, context),
      fontStyle: fontStyle(node.style.fontWeight, node.style.fontStyle),
      fontSize: round(node.style.fontSize),
      lineHeight: round(node.style.lineHeight),
      letterSpacing: round(node.style.letterSpacing),
      textAlignHorizontal: node.style.textAlign === 'center' ? 'CENTER' : node.style.textAlign === 'right' ? 'RIGHT' : 'LEFT',
      ...(node.inputText ? { textAlignVertical: node.inputText === 'SINGLE_LINE' ? 'CENTER' : 'TOP' } : {}),
      textAutoResize,
      ...(decoration ? { textDecoration: decoration } : {}),
      ...(letterCase ? { textCase: letterCase } : {}),
      // Balanced wrapping depends on exact line widths, so the plugin
      // computes it with Figma's own metrics rather than us baking in breaks
      // measured by the capture browser.
      ...(textAutoResize === 'HEIGHT' && /balance/.test(node.style.textWrap ?? '') ? { textWrap: 'BALANCE' } : {}),
      ...(textStyle ? { textStyle } : {}),
    },
    ...(ranges.length ? { ranges } : {}),
    style: { fills: [paint(node.style.color, context)].filter(Boolean) },
  }
}

function primitiveComponentValue(value: unknown): string | boolean | undefined {
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') return String(value)
  if (Array.isArray(value) && value.every((item) => ['string', 'number'].includes(typeof item))) return value.join('')
  return undefined
}

/** A contract rule's conditions: props equal to `when`, and `whenPresent`
 *  props set (not undefined, null or ''). */
function matchesCase(
  props: Record<string, unknown>,
  rule: { when?: Record<string, string | number | boolean>; whenPresent?: string[] },
): boolean {
  const isPresent = (value: unknown) => value !== undefined && value !== null && value !== ''
  return Object.entries(rule.when ?? {}).every(([prop, expected]) => props[prop] === expected)
    && (rule.whenPresent ?? []).every((prop) => isPresent(props[prop]))
}

function componentLayer(node: CapturedNode, entry: ComponentContractEntry, context: EmitContext): JsonRecord {
  const componentName = node.component?.name ?? entry.exportName ?? 'Component'
  context.usedComponents.add(componentName)
  const properties: Record<string, string | boolean> = {}
  const textOverrides: Record<string, string> = {}
  for (const [sourceName, mapping] of Object.entries(entry.properties ?? {})) {
    if (mapping.listText) {
      const items = node.component?.props[sourceName]
      if (Array.isArray(items)) {
        const labels = items.map((item) => (item as Record<string, unknown>)?.[mapping.listText!.take]).map((label) => String(label ?? ''))
        const last = mapping.listText.lastLayer ? labels.pop() : undefined
        // "Layer#n" addresses the n-th text layer with that name (see plugin).
        labels.forEach((label, index) => { textOverrides[`${mapping.listText!.layer}#${index}`] = label })
        if (last !== undefined && mapping.listText.lastLayer) textOverrides[mapping.listText.lastLayer] = last
      }
      continue
    }
    const sourceValue = primitiveComponentValue(node.component?.props[sourceName])
    const isBooleanPresenceMapping = mapping.trueValue !== undefined && mapping.falseValue !== undefined
    if (mapping.figmaProperty && isBooleanPresenceMapping) {
      properties[sourceName] = sourceValue === undefined || sourceValue === null || sourceValue === '' ? false : true
    } else if (sourceValue !== undefined && mapping.figmaProperty) {
      properties[sourceName] = sourceValue
    }
    if (sourceValue !== undefined && (mapping.textLayer || mapping.textLayerWhen)) {
      const props = node.component?.props ?? {}
      let text: string | undefined = String(sourceValue)
      if (mapping.lookup) {
        const items = props[mapping.lookup.in]
        const item = Array.isArray(items)
          ? items.find((candidate) => (candidate as Record<string, unknown>)?.[mapping.lookup!.match] === sourceValue) as Record<string, unknown> | undefined
          : undefined
        text = item?.[mapping.lookup.take] === undefined ? undefined : String(item[mapping.lookup.take])
      }
      const rule = mapping.textLayerWhen?.find((candidate) => matchesCase(props, candidate))
      const layer = rule ? rule.textLayer : mapping.textLayer
      if (text !== undefined && text !== '' && layer) textOverrides[layer] = text
    }
  }
  const props = node.component?.props ?? {}
  for (const [figmaProperty, cases] of Object.entries(entry.derived ?? {})) {
    const match = cases.find((rule) => matchesCase(props, rule))
    if (match) properties[figmaProperty] = match.value
  }
  return {
    id: node.id,
    name: node.name || componentName,
    type: 'COMPONENT_INSTANCE',
    component: componentName,
    // Component instances own their internal geometry in the Figma library.
    // DOM dimensions would resize the instance and indirectly override its
    // padding, gap, and layout rules, so only mapped properties are emitted.
    ...(Object.keys(properties).length ? { properties } : {}),
    ...(Object.keys(textOverrides).length ? { textOverrides } : {}),
    // Fill the measured width (an accordion item or radio card spans its
    // column); the instance keeps its own height.
    ...(entry.matchWidth === true || (typeof entry.matchWidth === 'object' && matchesCase(node.component?.props ?? {}, entry.matchWidth))
      ? { width: Math.max(0.01, round(node.rect.width)) }
      : {}),
  }
}

function isPlainTextElement(node: CapturedNode, context: EmitContext): boolean {
  if (node.component || node.children.length !== 1 || node.children[0].kind !== 'TEXT') return false
  return !visibleStyle(node.style, context) && !['input', 'textarea', 'select'].includes(node.tagName)
}

/** `body-md-regular` → `Body/MD/Regular`, `heading-xl` → `Heading/XL/Semibold`:
 *  the library's own text-style naming. Display and heading styles only
 *  ship in Semibold, so their v5 `textStyle` values carry no weight. */
function libraryTextStyleName(textStyle: string): string {
  const [group, size, weight] = textStyle.split('-')
  const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
  return `${capitalize(group)}/${size.toUpperCase()}/${capitalize(weight ?? 'semibold')}`
}

function typographyTextStyle(node: CapturedNode, context: EmitContext): string | undefined {
  if (node.component?.name !== 'Typography') return undefined
  const textStyle = node.component.props.textStyle
  if (typeof textStyle !== 'string') return undefined
  const contractName = context.contract.components.Typography?.properties?.textStyle?.values?.[textStyle]
  const entry = context.contract.textStyles?.[textStyle] ?? {
    reference: `textStyle/${textStyle}`,
    libraryName: typeof contractName === 'string' ? contractName : libraryTextStyleName(textStyle),
    required: false,
  }
  context.usedTextStyles.set(entry.reference, entry)
  return entry.reference
}

function isTypographyTextElement(node: CapturedNode): boolean {
  return node.component?.name === 'Typography' && node.children.length === 1 && node.children[0].kind === 'TEXT'
}

function gridColumnCount(node: CapturedNode): number {
  return node.style.gridTemplateColumns.split(' ').filter(Boolean).length || 1
}

function gridRowCount(node: CapturedNode, columns: number): number {
  const explicitRows = node.style.gridTemplateRows.split(' ').filter(Boolean).length
  const gridChildCount = node.children.filter((candidate) => candidate.style.position !== 'absolute').length
  // Computed CSS can report only explicit tracks. Figma needs implicit tracks
  // as well, otherwise a later DOM child can fall outside the imported grid.
  return Math.max(1, explicitRows, Math.ceil(gridChildCount / columns))
}

function childGridPosition(parent: CapturedNode, child: CapturedNode): { row: number; column: number } {
  const gridChildren = parent.children.filter((candidate) => candidate.style.position !== 'absolute')
  const index = Math.max(0, gridChildren.indexOf(child))
  const columns = gridColumnCount(parent)
  // Top/left edges are not grid coordinates: cross-axis alignment (for
  // example, align-items:center) moves cards within the same grid row.
  // Preserve browser grid's default row-major placement instead.
  return {
    row: Math.floor(index / columns),
    column: index % columns,
  }
}

// Figma only renders shadow spread on frames that have a fill and clip their
// content; otherwise the shadow is cast from the children and spread is
// ignored. CSS ring shadows (`0 0 0 2px …`) often sit on an unfilled wrapper
// around a filled element of the same size (e.g. Avatar), so hand them down.
function moveSpreadShadowsToFilledChild(frame: JsonRecord): void {
  const style = frame.style as JsonRecord | undefined
  const effects = style?.effects as JsonRecord[] | undefined
  const children = frame.children as JsonRecord[]
  if (!style || !effects?.some((effect) => Number(effect.spread) > 0) || style.fills) return
  if (children.length !== 1) return
  const [child] = children
  const childStyle = child.style as JsonRecord | undefined
  const sameSize = Math.abs(Number(child.width) - Number(frame.width)) < 0.5
    && Math.abs(Number(child.height) - Number(frame.height)) < 0.5
  if (child.type !== 'FRAME' || !child.clipsContent || !childStyle?.fills || childStyle.effects || !sameSize) return
  child.style = { ...childStyle, effects }
  delete style.effects
  if (!Object.keys(style).length) delete frame.style
}

function emitNode(
  node: CapturedNode,
  parent: CapturedNode | null,
  context: EmitContext,
  screenId: string,
): JsonRecord {
  const entry = node.component ? context.contract.components[node.component.name] : undefined
  let result: JsonRecord
  if (node.component?.strategy === 'INSTANCE' && entry?.strategy === 'INSTANCE') {
    result = componentLayer(node, entry, context)
  } else if (node.kind === 'SVG' && node.svg) {
    result = {
      id: node.id,
      name: node.name || 'SVG',
      type: 'SVG',
      svg: node.svg,
      width: Math.max(0.01, round(node.rect.width)),
      height: Math.max(0.01, round(node.rect.height)),
    }
  } else if (node.kind === 'TEXT') {
    result = textLayer(node, context)
  } else if (isTypographyTextElement(node)) {
    result = textLayer(
      { ...node.children[0], id: node.id, rect: node.rect },
      context,
      node.id,
      typographyTextStyle(node, context),
    )
  } else if (isPlainTextElement(node, context)) {
    result = textLayer({ ...node.children[0], id: node.id, rect: node.rect }, context)
  } else {
    result = {
      id: node.id,
      name: node.component?.name ?? node.name ?? node.tagName,
      type: 'FRAME',
      width: Math.max(0.01, round(node.rect.width)),
      height: Math.max(0.01, round(node.rect.height)),
      layout: frameLayout(node, context),
      clipsContent: clipsOverflow(node.style.overflowX) || clipsOverflow(node.style.overflowY),
      ...(visibleStyle(node.style, context) ? { style: visibleStyle(node.style, context) } : {}),
      children: [
        ...node.children.map((child) => emitNode(child, node, context, screenId)),
        ...borderLayers(node, context, screenId),
      ],
    }
    moveSpreadShadowsToFilledChild(result)
    // Absolutely positioned frames stack by layer order (last on top), so emit
    // descending-z-index siblings in paint order.
    if ((result.layout as JsonRecord).mode === 'NONE' && firstChildStacksOnTop(node)) {
      const children = result.children as JsonRecord[]
      const emittedChildren = children.splice(0, node.children.length).reverse()
      children.unshift(...emittedChildren)
    }
  }

  result.id = `${screenId}/${String(result.id)}`
  if (
    result.type !== 'COMPONENT_INSTANCE' &&
    node.style.position === 'fixed' &&
    node.rect.height >= context.viewportHeight - 1
  ) {
    result.height = Math.max(result.height as number, round(context.canvasHeight - node.rect.y))
  }

  if (parent) {
    const parentLayout = frameLayout(parent, context)
    // `fixed` is as out-of-flow as `absolute`: Figma has no fixed positioning,
    // so both must be placed by coordinate rather than folded into the parent's
    // auto layout (otherwise a fixed header/badge lands at the end of the flow).
    const isAbsolute = node.style.position === 'absolute' || node.style.position === 'fixed'
    if (parentLayout.mode === 'NONE' || isAbsolute) {
      result.x = round(node.rect.x - parent.rect.x)
      result.y = round(node.rect.y - parent.rect.y)
    }
    if (parentLayout.mode !== 'NONE') {
      const layoutChild: JsonRecord = {
        ...(node.style.flexGrow > 0 && !(parentLayout.mode === 'VERTICAL' && growIsIdleVertically(node)) ? { grow: 1 } : {}),
        ...(node.style.alignSelf === 'stretch' || (!isAbsolute && isSingleColumnGrid(parent) && gridItemsStretch(parent)) ? { align: 'STRETCH' } : {}),
        ...(isAbsolute ? { positioning: 'ABSOLUTE' } : {}),
        ...(parentLayout.mode === 'GRID' && !isAbsolute ? childGridPosition(parent, node) : {}),
      }
      if (Object.keys(layoutChild).length) result.layoutChild = layoutChild
    }
  }
  return result
}

function componentDefinition(name: string, entry: ComponentContractEntry): JsonRecord {
  const propertyMappings: Record<string, JsonRecord> = {}
  for (const [sourceName, mapping] of Object.entries(entry.properties ?? {})) {
    if (!mapping.figmaProperty) continue
    propertyMappings[sourceName] = {
      figmaProperty: mapping.figmaProperty,
      ...(mapping.values ? { values: mapping.values } : {}),
      ...(mapping.trueValue !== undefined && mapping.falseValue !== undefined
        ? { values: { true: mapping.trueValue, false: mapping.falseValue } }
        : {}),
    }
  }
  for (const figmaProperty of Object.keys(entry.derived ?? {})) {
    propertyMappings[figmaProperty] = { figmaProperty }
  }
  return {
    ...(entry.libraryName ? { libraryName: entry.libraryName } : {}),
    ...(entry.sourceNodeId ? { sourceNodeId: entry.sourceNodeId } : {}),
    ...(Object.keys(propertyMappings).length ? { propertyMappings } : {}),
    ...(entry.lenient ? { lenient: true } : {}),
    ...(entry.revealTextLayers ? { revealTextLayers: true } : {}),
  }
}

export function emitFigmaManifest(
  snapshots: PageSnapshot[],
  contract: ComponentContract,
  fontFamilyAliases: Record<string, string> = {},
  layoutMode: 'AUTO_LAYOUT' | 'FIXED' = 'AUTO_LAYOUT',
): JsonRecord {
  const context: EmitContext = {
    contract,
    fontFamilyAliases,
    layoutMode,
    canvasHeight: 0,
    viewportHeight: 0,
    usedComponents: new Set(),
    usedVariables: new Set(),
    usedTextStyles: new Map(),
  }
  const screens = snapshots.map((snapshot) => {
    context.canvasHeight = snapshot.documentSize.height
    context.viewportHeight = snapshot.viewport.height
    const screenId = `${snapshot.pageId}-${snapshot.stateId}-${snapshot.viewport.id}`
    const root = emitNode(snapshot.root, null, context, screenId)
    // Paint the page background onto the screen frame when the captured root is
    // transparent (the real background sits on <body>, outside the export root).
    const backgroundPaint = snapshot.documentBackground ? paint(snapshot.documentBackground, context) : null
    if (backgroundPaint) {
      const existingStyle = (root.style as JsonRecord | undefined) ?? {}
      if (!('fills' in existingStyle)) root.style = { ...existingStyle, fills: [backgroundPaint] }
    }
    root.width = snapshot.documentSize.width
    root.height = snapshot.documentSize.height
    root.expectedBounds = { width: snapshot.documentSize.width, height: snapshot.documentSize.height, tolerance: 1 }
    return {
      id: screenId,
      name: `${snapshot.pageName} · ${snapshot.stateName} · ${snapshot.viewport.id}`,
      viewport: { width: snapshot.documentSize.width, height: snapshot.documentSize.height },
      root,
    }
  })
  const components = Object.fromEntries(
    [...context.usedComponents].sort().map((name) => [name, componentDefinition(name, contract.components[name])]),
  )
  const tokenEntries = [
    ...Object.values(contract.tokens.colors),
    ...Object.values(contract.tokens.numbers?.spacing ?? {}),
    ...Object.values(contract.tokens.numbers?.radius ?? {}),
  ]
  const variables = Object.fromEntries(
    [...context.usedVariables].sort().map((reference) => {
      const token = tokenEntries.find((candidate) => candidate.reference === reference)
      const type = Object.values(contract.tokens.colors).some((candidate) => candidate.reference === reference)
        ? 'COLOR'
        : 'FLOAT'
      return [reference, { libraryName: token?.libraryName ?? reference, type, required: token?.required ?? true }]
    }),
  )
  const textStyles = Object.fromEntries(
    [...context.usedTextStyles.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([reference, style]) => [reference, {
      libraryName: style.libraryName,
      required: style.required ?? true,
    }]),
  )
  return {
    schemaVersion: '1.0',
    name: 'Deterministic browser export',
    variables,
    ...(Object.keys(textStyles).length ? { textStyles } : {}),
    components,
    screens,
  }
}
