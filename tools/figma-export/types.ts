export type ExportAction =
  | { type: 'click'; selector: string }
  | { type: 'fill'; selector: string; value: string }
  | { type: 'press'; selector: string; key: string }
  | { type: 'wait'; milliseconds: number }

export interface ExportState {
  id: string
  name: string
  actions?: ExportAction[]
}

export interface ExportViewport {
  id: string
  width: number
  height: number
}

export interface ExportPage {
  id: string
  name: string
  route: string
  viewports: ExportViewport[]
  states: ExportState[]
}

export interface FigmaExportConfig {
  outputDirectory: string
  rootSelector: string
  layoutMode?: 'AUTO_LAYOUT' | 'FIXED'
  browserChannel?: 'chrome' | 'chromium'
  /** BCP 47 locale for the capture browser (dates, numbers in native
   *  controls). Defaults to the host's locale so exports match local Chrome. */
  locale?: string
  network: {
    allowedHosts: string[]
    failOnBlockedRequest: boolean
  }
  fonts: {
    requiredFamilies: string[]
    assumeAvailable: boolean
    familyAliases?: Record<string, string>
  }
  pages: ExportPage[]
}

export interface ComponentPropertyContract {
  figmaProperty?: string
  textLayer?: string
  values?: Record<string, string | boolean>
  trueValue?: string | boolean
  falseValue?: string | boolean
  /** Show a related value instead of the prop itself: find the item in the
   *  array prop `in` whose `match` field equals this prop, and use its `take`
   *  field (e.g. a Dropdown's selected option label from its value). */
  lookup?: { in: string; match: string; take: string }
  /** Spread an array prop over repeated text layers: item `take` fields fill
   *  same-named `layer`s in order (e.g. "Parent Link" #0, #1), and the last
   *  item fills `lastLayer` (e.g. "Current Page") when set. */
  listText?: { take: string; layer: string; lastLayer?: string }
  /** Pick the text layer by the other props (first matching rule wins;
   *  `textLayer: null` skips the text). Falls back to `textLayer`. */
  textLayerWhen?: Array<{
    when?: Record<string, string | number | boolean>
    whenPresent?: string[]
    textLayer: string | null
  }>
}

/** One rule for a Figma property computed from several React props (e.g. a
 *  Checkbox "State" from `checked` + `disabled` + `error`). Rules are tried in
 *  order; the first whose conditions all hold supplies the value. No match
 *  leaves the instance's default. */
export interface ComponentDerivedCase {
  /** Props that must equal these values. */
  when?: Record<string, string | number | boolean>
  /** Props that must be set (not undefined, null or ''). */
  whenPresent?: string[]
  value: string | boolean
}

/** Where a selector-matched component reads one prop from the rendered page. */
export type DomPropSource =
  | { hasClass: string }
  | { text: string }
  | { property: { selector: string; name: string } }
  | { closestClass: { closest: string; prefix: string; values: string[] } }
  | { closestHasClass: { closest: string; className: string } }

/** A component found by CSS selector instead of a React export: used for
 *  parts a package doesn't export, or whose state lives in context (an
 *  accordion item's open state, a radio group's options). */
export interface DomComponentMatch {
  selector: string
  props: Record<string, DomPropSource>
}

export interface ComponentContractEntry {
  /** Package + export instrumented at runtime. Omitted for `match` entries. */
  package?: string
  exportName?: string
  /** Find this component by selector and read its props from the DOM. */
  match?: DomComponentMatch
  /** Size the instance to the measured element width (height still hugs).
   *  A rule instead of `true` applies it only when the props match (e.g. only
   *  card radios: a Default radio centres its content, so stretching it
   *  shifts the circle and label away from the left edge). */
  matchWidth?: boolean | { when?: Record<string, string | number | boolean>; whenPresent?: string[] }
  /** Unhide the text layers the export overrides (e.g. a hidden label). */
  revealTextLayers?: boolean
  strategy: 'INSTANCE' | 'DOM'
  libraryName?: string
  sourceNodeId?: string
  reason?: string
  properties?: Record<string, ComponentPropertyContract>
  /** Figma property → rules computing it from several React props. */
  derived?: Record<string, ComponentDerivedCase[]>
  /** Mapping not yet verified against the library: the plugin reports a
   *  missing property, value or text layer as a warning instead of failing. */
  lenient?: boolean
}

export interface TokenContractEntry {
  reference: string
  libraryName: string
  /** Optional generated bindings retain a literal fallback when the library has no matching variable. */
  required?: boolean
}

export interface TextStyleContractEntry {
  reference: string
  libraryName: string
  /** A missing published text style leaves the measured text intact. */
  required?: boolean
}

export interface ComponentContract {
  schemaVersion: '1.0'
  components: Record<string, ComponentContractEntry>
  tokens: {
    colors: Record<string, TokenContractEntry>
    numbers?: {
      spacing: Record<string, TokenContractEntry>
      radius: Record<string, TokenContractEntry>
    }
  }
  textStyles?: Record<string, TextStyleContractEntry>
}

export interface RectSnapshot {
  x: number
  y: number
  width: number
  height: number
}

export interface StyleSnapshot {
  display: string
  position: string
  zIndex?: string
  flexDirection: string
  flexWrap: string
  flexGrow: number
  alignSelf: string
  justifyContent: string
  alignItems: string
  justifyItems: string
  gap: number
  rowGap: number
  columnGap: number
  padding: [number, number, number, number]
  margin: [number, number, number, number]
  hasAutoMargin: boolean
  backgroundColor: string
  color: string
  borderColor: string
  borderWidth: number
  borderWidths: [number, number, number, number]
  borderRadius: number
  opacity: number
  boxShadow: string
  overflowX: string
  overflowY: string
  fontFamily: string
  fontStyle: string
  fontWeight: number
  fontSize: number
  lineHeight: number
  letterSpacing: number
  textAlign: string
  /** Computed `text-decoration-line` (e.g. `none`, `underline`). */
  textDecoration: string
  /** Computed `text-transform` (e.g. `none`, `uppercase`). */
  textTransform: string
  /** Computed `text-wrap-style` (e.g. `auto`, `balance`, `pretty`). */
  textWrap?: string
  gridTemplateColumns: string
  gridTemplateRows: string
}

export interface CapturedComponent {
  name: string
  props: Record<string, unknown>
  sourceNodeId?: string
  strategy: 'INSTANCE' | 'DOM'
}

/** A run inside a merged rich-text layer whose inline formatting differs from
 *  the paragraph's own style. Offsets index into `CapturedNode.text`. */
export interface CapturedTextRange {
  start: number
  end: number
  fontWeight: number
  fontStyle: string
  color: string
  textDecoration: string
  textTransform: string
}

export interface CapturedNode {
  id: string
  kind: 'ELEMENT' | 'TEXT' | 'SVG'
  tagName: string
  name: string
  text?: string
  textLineCount?: number
  /** The text box spans its element's content width (a block heading or
   *  paragraph), so Figma should wrap within that width rather than size the
   *  layer to its glyphs. */
  textFillsWidth?: boolean
  /** Set on the synthesized value text of a form control. */
  inputText?: 'SINGLE_LINE' | 'MULTI_LINE'
  textRanges?: CapturedTextRange[]
  svg?: string
  rect: RectSnapshot
  style: StyleSnapshot
  component?: CapturedComponent
  children: CapturedNode[]
}

export interface CaptureWarning {
  code: string
  message: string
  nodeId?: string
}

export interface PageSnapshot {
  schemaVersion: '1.0'
  pageId: string
  pageName: string
  route: string
  stateId: string
  stateName: string
  viewport: ExportViewport
  documentSize: { width: number; height: number }
  /** Computed <body>/<html> background, painted onto the screen frame when the
   *  captured export root is itself transparent. Empty when neither is opaque. */
  documentBackground: string
  root: CapturedNode
  blockedRequests: string[]
  blockedFontRequests: string[]
  unavailableFonts: string[]
  warnings: CaptureWarning[]
}
