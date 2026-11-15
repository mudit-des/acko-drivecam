type Severity = 'ERROR' | 'WARNING' | 'INFO'

interface Issue {
  severity: Severity
  code: string
  message: string
  path?: string
}

interface Report {
  ok: boolean
  issues: Issue[]
  summary: {
    screens: number
    layers: number
    components: number
    variables: number
    created: number
    updated: number
  }
}

interface NumberReference {
  value: number
  variable?: string
}

interface StringReference {
  value: string
  variable?: string
}

type NumberValue = number | NumberReference
type StringValue = string | StringReference

interface VariableDefinition {
  id?: string
  key?: string
  name?: string
  libraryName?: string
  type?: VariableResolvedDataType
  required?: boolean
}

interface TextStyleDefinition {
  id?: string
  key?: string
  name?: string
  libraryName?: string
  required?: boolean
}

interface PropertyMapping {
  figmaProperty: string
  values?: Record<string, string | boolean>
  trueValue?: string | boolean
  falseValue?: string | boolean
}

interface ComponentDefinition {
  nodeId?: string
  sourceNodeId?: string
  componentKey?: string
  componentSetKey?: string
  libraryName?: string
  propertyMappings?: Record<string, PropertyMapping>
  /** Mapping not yet verified against the library: a missing property, value
   *  or text layer is a warning (the instance keeps its default for it)
   *  instead of an error that stops the import. */
  lenient?: boolean
  /** Make overridden text layers visible (e.g. a label hidden by default). */
  revealTextLayers?: boolean
}

interface RegistryComponentProperty {
  type: ComponentPropertyType
  variantOptions?: readonly string[]
}

interface RegistryComponent {
  name: string
  normalizedName: string
  key: string
  nodeId: string
  kind: 'COMPONENT' | 'COMPONENT_SET'
  pageName: string
  publishStatus: PublishStatus
  properties: Record<string, RegistryComponentProperty>
}

interface RegistryVariable {
  name: string
  normalizedName: string
  key: string
  id: string
  collectionName: string
  type: VariableResolvedDataType
  publishStatus: PublishStatus
}

interface RegistryStyle {
  name: string
  normalizedName: string
  key: string
  id: string
  publishStatus: PublishStatus
}

interface RegistryScanWarning {
  code: 'COMPONENT_PROPERTY_DEFINITIONS_UNAVAILABLE'
  componentName: string
  componentNodeId: string
  message: string
}

interface LibraryRegistry {
  schemaVersion: '1.0'
  fileKey?: string
  capturedAt: string
  components: RegistryComponent[]
  variables: RegistryVariable[]
  textStyles?: RegistryStyle[]
  paintStyles?: RegistryStyle[]
  effectStyles?: RegistryStyle[]
  gridStyles?: RegistryStyle[]
  scanWarnings?: RegistryScanWarning[]
}

interface SolidPaintDefinition {
  type: 'SOLID'
  color: StringValue
  opacity?: number
}

interface ShadowDefinition {
  type: 'DROP_SHADOW' | 'INNER_SHADOW'
  color: StringValue
  offset: { x: NumberValue; y: NumberValue }
  radius: NumberValue
  spread?: NumberValue
  visible?: boolean
  blendMode?: BlendMode
}

interface LayerStyle {
  fills?: SolidPaintDefinition[]
  strokes?: SolidPaintDefinition[]
  strokeWeight?: NumberValue
  cornerRadius?: NumberValue
  corners?: {
    topLeft: NumberValue
    topRight: NumberValue
    bottomRight: NumberValue
    bottomLeft: NumberValue
  }
  opacity?: NumberValue
  effects?: ShadowDefinition[]
}

interface PaddingDefinition {
  top: NumberValue
  right: NumberValue
  bottom: NumberValue
  left: NumberValue
}

interface LayoutDefinition {
  mode: 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'GRID'
  primaryAxisSizing?: 'FIXED' | 'AUTO'
  counterAxisSizing?: 'FIXED' | 'AUTO'
  primaryAxisAlign?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN'
  counterAxisAlign?: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE'
  wrap?: 'NO_WRAP' | 'WRAP'
  strokesIncludedInLayout?: boolean
  padding?: PaddingDefinition
  gap?: NumberValue
  counterAxisGap?: NumberValue
  reverseZIndex?: boolean
  grid?: {
    rows: number
    columns: number
    rowGap?: NumberValue
    columnGap?: NumberValue
  }
}

interface LayoutChildDefinition {
  align?: 'INHERIT' | 'STRETCH'
  grow?: 0 | 1
  positioning?: 'AUTO' | 'ABSOLUTE'
  row?: number
  column?: number
}

interface ExpectedBounds {
  x?: number
  y?: number
  width: number
  height: number
  tolerance?: number
}

interface BaseLayerDefinition {
  id: string
  name: string
  type: 'FRAME' | 'TEXT' | 'RECTANGLE' | 'ELLIPSE' | 'SVG' | 'COMPONENT_INSTANCE'
  visible?: boolean
  x?: number
  y?: number
  width?: NumberValue
  height?: NumberValue
  minWidth?: NumberValue
  maxWidth?: NumberValue
  minHeight?: NumberValue
  maxHeight?: NumberValue
  constraints?: {
    horizontal: ConstraintType
    vertical: ConstraintType
  }
  layoutChild?: LayoutChildDefinition
  style?: LayerStyle
  expectedBounds?: ExpectedBounds
}

interface FrameLayerDefinition extends BaseLayerDefinition {
  type: 'FRAME'
  layout?: LayoutDefinition
  clipsContent?: boolean
  children?: LayerDefinition[]
}

interface TextLayerDefinition extends BaseLayerDefinition {
  type: 'TEXT'
  characters: StringValue
  typography?: {
    fontFamily?: StringValue
    fontStyle?: StringValue
    fontSize?: NumberValue
    fontWeight?: NumberValue
    lineHeight?: NumberValue | 'AUTO'
    letterSpacing?: NumberValue
    paragraphSpacing?: NumberValue
    textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
    textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM'
    textAutoResize?: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE'
    textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH'
    textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE'
    /** CSS `text-wrap: balance`: re-break lines to even widths (see balanceLines). */
    textWrap?: 'BALANCE'
    textStyle?: string
  }
  /** Styled runs over `characters` ([start, end) offsets); each overrides
   *  only what differs from the layer's own typography and fills. */
  ranges?: TextRangeDefinition[]
}

interface TextRangeDefinition {
  start: number
  end: number
  fontStyle?: string
  fills?: SolidPaintDefinition[]
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH'
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE'
}

interface RectangleLayerDefinition extends BaseLayerDefinition {
  type: 'RECTANGLE'
}

interface EllipseLayerDefinition extends BaseLayerDefinition {
  type: 'ELLIPSE'
}

interface SvgLayerDefinition extends BaseLayerDefinition {
  type: 'SVG'
  svg: string
}

type ComponentPropertyValue = string | boolean | StringReference

interface ComponentLayerDefinition extends BaseLayerDefinition {
  type: 'COMPONENT_INSTANCE'
  component: string
  properties?: Record<string, ComponentPropertyValue>
  textOverrides?: Record<string, string>
}

type LayerDefinition =
  | FrameLayerDefinition
  | TextLayerDefinition
  | RectangleLayerDefinition
  | EllipseLayerDefinition
  | SvgLayerDefinition
  | ComponentLayerDefinition

interface ScreenDefinition {
  id: string
  name: string
  viewport: { width: number; height: number }
  root: LayerDefinition
}

interface ImportDocument {
  schemaVersion: '1.0'
  name: string
  variables?: Record<string, VariableDefinition>
  textStyles?: Record<string, TextStyleDefinition>
  components?: Record<string, ComponentDefinition>
  screens: ScreenDefinition[]
}

interface ImportOptions {
  updateExisting: boolean
}

type UIMessage =
  | { type: 'validate'; document: unknown }
  | { type: 'import'; document: unknown; options: ImportOptions }
  | { type: 'get-registry' }
  | { type: 'export-registry' }
  | { type: 'close' }

type GeneratedNode = FrameNode | RectangleNode | EllipseNode | TextNode | InstanceNode
type FillableNode = GeneratedNode
type ShadowEffect = DropShadowEffect | InnerShadowEffect

const ROOT_PLUGIN_KEY = 'acko-json-import-screen-id'
const LAYER_PLUGIN_KEY = 'acko-json-import-layer-id'
const SCHEMA_PLUGIN_KEY = 'acko-json-import-schema'
const REGISTRY_STORAGE_KEY = 'acko-json-import-library-registry-v1'
/** Bump on every plugin change: shown in each report so a stale development
 *  build (Figma keeps the old code until the plugin is closed and re-run) is
 *  obvious. */
const PLUGIN_BUILD = '2026-10-09.8 indexed text overrides'

function emptyReport(): Report {
  return {
    ok: true,
    issues: [{ severity: 'INFO', code: 'PLUGIN_BUILD', message: `Plugin build ${PLUGIN_BUILD}` }],
    summary: {
      screens: 0,
      layers: 0,
      components: 0,
      variables: 0,
      created: 0,
      updated: 0,
    },
  }
}

function addIssue(
  report: Report,
  severity: Severity,
  code: string,
  message: string,
  path?: string,
): void {
  report.issues.push({ severity, code, message, path })
  if (severity === 'ERROR') report.ok = false
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validateDocument(value: unknown): { document?: ImportDocument; report: Report } {
  const report = emptyReport()
  if (!isRecord(value)) {
    addIssue(report, 'ERROR', 'INVALID_DOCUMENT', 'The JSON root must be an object.')
    return { report }
  }
  if (value.schemaVersion !== '1.0') {
    addIssue(report, 'ERROR', 'UNSUPPORTED_SCHEMA', 'schemaVersion must be "1.0".', 'schemaVersion')
  }
  if (typeof value.name !== 'string' || value.name.trim() === '') {
    addIssue(report, 'ERROR', 'INVALID_NAME', 'A non-empty document name is required.', 'name')
  }
  if (!Array.isArray(value.screens) || value.screens.length === 0) {
    addIssue(report, 'ERROR', 'INVALID_SCREENS', 'At least one screen is required.', 'screens')
    return { report }
  }

  const layerIds = new Set<string>()
  const screenIds = new Set<string>()
  const componentRefs = new Set<string>()
  const variableRefs = new Set<string>()
  const textStyleRefs = new Set<string>()

  function readValueReference(candidate: unknown): void {
    if (isRecord(candidate) && typeof candidate.variable === 'string') {
      variableRefs.add(candidate.variable)
    }
  }

  function inspectLayer(candidate: unknown, path: string): void {
    if (!isRecord(candidate)) {
      addIssue(report, 'ERROR', 'INVALID_LAYER', 'Layer must be an object.', path)
      return
    }
    const id = candidate.id
    const name = candidate.name
    const type = candidate.type
    if (typeof id !== 'string' || id.trim() === '') {
      addIssue(report, 'ERROR', 'INVALID_LAYER_ID', 'Layer id must be a non-empty string.', `${path}.id`)
    } else if (layerIds.has(id)) {
      addIssue(report, 'ERROR', 'DUPLICATE_LAYER_ID', `Duplicate layer id "${id}".`, `${path}.id`)
    } else {
      layerIds.add(id)
    }
    if (typeof name !== 'string' || name.trim() === '') {
      addIssue(report, 'ERROR', 'INVALID_LAYER_NAME', 'Layer name must be a non-empty string.', `${path}.name`)
    }
    const validTypes = ['FRAME', 'TEXT', 'RECTANGLE', 'ELLIPSE', 'SVG', 'COMPONENT_INSTANCE']
    if (typeof type !== 'string' || !validTypes.includes(type)) {
      addIssue(report, 'ERROR', 'INVALID_LAYER_TYPE', `Unsupported layer type "${String(type)}".`, `${path}.type`)
      return
    }
    report.summary.layers += 1

    ;['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'].forEach((field) =>
      readValueReference(candidate[field]),
    )

    if (isRecord(candidate.style)) {
      const style = candidate.style
      ;['strokeWeight', 'cornerRadius', 'opacity'].forEach((field) =>
        readValueReference(style[field]),
      )
      if (Array.isArray(style.fills)) {
        style.fills.forEach((paint) => {
          if (isRecord(paint)) readValueReference(paint.color)
        })
      }
      if (Array.isArray(style.strokes)) {
        style.strokes.forEach((paint) => {
          if (isRecord(paint)) readValueReference(paint.color)
        })
      }
    }

    if (type === 'COMPONENT_INSTANCE') {
      if (typeof candidate.component !== 'string') {
        addIssue(report, 'ERROR', 'MISSING_COMPONENT_REF', 'Component layer requires a component reference.', `${path}.component`)
      } else {
        componentRefs.add(candidate.component)
      }
      if (isRecord(candidate.properties)) {
        Object.values(candidate.properties).forEach(readValueReference)
      }
    }

    if (type === 'TEXT') {
      if (typeof candidate.characters !== 'string' && !isRecord(candidate.characters)) {
        addIssue(report, 'ERROR', 'INVALID_TEXT', 'Text layer requires characters.', `${path}.characters`)
      }
      readValueReference(candidate.characters)
      if (isRecord(candidate.typography)) {
        Object.values(candidate.typography).forEach(readValueReference)
        if (typeof candidate.typography.textStyle === 'string') textStyleRefs.add(candidate.typography.textStyle)
      }
      if (candidate.ranges !== undefined && !Array.isArray(candidate.ranges)) {
        addIssue(report, 'ERROR', 'INVALID_TEXT_RANGES', 'Text ranges must be an array.', `${path}.ranges`)
      } else if (Array.isArray(candidate.ranges)) {
        candidate.ranges.forEach((range, index) => {
          if (!isRecord(range) || typeof range.start !== 'number' || typeof range.end !== 'number') {
            addIssue(report, 'ERROR', 'INVALID_TEXT_RANGES', 'Text range requires numeric start and end.', `${path}.ranges[${index}]`)
            return
          }
          if (Array.isArray(range.fills)) {
            range.fills.forEach((paint) => {
              if (isRecord(paint)) readValueReference(paint.color)
            })
          }
        })
      }
    }

    if (type === 'SVG' && typeof candidate.svg !== 'string') {
      addIssue(report, 'ERROR', 'INVALID_SVG', 'SVG layer requires an svg string.', `${path}.svg`)
    }

    if (type === 'FRAME') {
      if (isRecord(candidate.layout)) {
        readValueReference(candidate.layout.gap)
        readValueReference(candidate.layout.counterAxisGap)
        if (isRecord(candidate.layout.padding)) {
          Object.values(candidate.layout.padding).forEach(readValueReference)
        }
        if (isRecord(candidate.layout.grid)) {
          readValueReference(candidate.layout.grid.rowGap)
          readValueReference(candidate.layout.grid.columnGap)
        }
      }
      if (candidate.children !== undefined && !Array.isArray(candidate.children)) {
        addIssue(report, 'ERROR', 'INVALID_CHILDREN', 'Frame children must be an array.', `${path}.children`)
      } else if (Array.isArray(candidate.children)) {
        candidate.children.forEach((child, index) => inspectLayer(child, `${path}.children[${index}]`))
      }
    }
  }

  value.screens.forEach((screen, index) => {
    const path = `screens[${index}]`
    if (!isRecord(screen)) {
      addIssue(report, 'ERROR', 'INVALID_SCREEN', 'Screen must be an object.', path)
      return
    }
    if (typeof screen.id !== 'string' || screen.id.trim() === '') {
      addIssue(report, 'ERROR', 'INVALID_SCREEN_ID', 'Screen id must be a non-empty string.', `${path}.id`)
    } else if (screenIds.has(screen.id)) {
      addIssue(report, 'ERROR', 'DUPLICATE_SCREEN_ID', `Duplicate screen id "${screen.id}".`, `${path}.id`)
    } else {
      screenIds.add(screen.id)
    }
    if (!isRecord(screen.viewport) || typeof screen.viewport.width !== 'number' || typeof screen.viewport.height !== 'number') {
      addIssue(report, 'ERROR', 'INVALID_VIEWPORT', 'Viewport requires numeric width and height.', `${path}.viewport`)
    }
    inspectLayer(screen.root, `${path}.root`)
  })

  const componentDefinitions = isRecord(value.components) ? value.components : {}
  componentRefs.forEach((reference) => {
    if (!isRecord(componentDefinitions[reference])) {
      addIssue(report, 'ERROR', 'UNKNOWN_COMPONENT', `No component mapping exists for "${reference}".`, `components.${reference}`)
    }
  })
  report.summary.components = componentRefs.size

  const variableDefinitions = isRecord(value.variables) ? value.variables : {}
  variableRefs.forEach((reference) => {
    if (!isRecord(variableDefinitions[reference])) {
      addIssue(report, 'ERROR', 'UNKNOWN_VARIABLE', `No variable mapping exists for "${reference}".`, `variables.${reference}`)
    }
  })
  report.summary.variables = variableRefs.size

  const textStyleDefinitions = isRecord(value.textStyles) ? value.textStyles : {}
  textStyleRefs.forEach((reference) => {
    if (!isRecord(textStyleDefinitions[reference])) {
      addIssue(report, 'ERROR', 'UNKNOWN_TEXT_STYLE', `No text-style mapping exists for "${reference}".`, `textStyles.${reference}`)
    }
  })
  report.summary.screens = value.screens.length

  return report.ok ? { document: value as unknown as ImportDocument, report } : { report }
}

function numberValue(value: NumberValue | undefined, fallback = 0): number {
  if (typeof value === 'number') return value
  return value?.value ?? fallback
}

function stringValue(value: StringValue | undefined, fallback = ''): string {
  if (typeof value === 'string') return value
  return value?.value ?? fallback
}

function variableReference(value: NumberValue | StringValue | undefined): string | undefined {
  return typeof value === 'object' && value !== null ? value.variable : undefined
}

function parseHexColor(value: string): { color: RGB; opacity: number } {
  const normalized = value.trim().replace('#', '')
  const expanded = normalized.length === 3 || normalized.length === 4
    ? normalized.split('').map((character) => character + character).join('')
    : normalized
  const safe = /^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(expanded) ? expanded : '000000'
  return {
    color: {
      r: Number.parseInt(safe.slice(0, 2), 16) / 255,
      g: Number.parseInt(safe.slice(2, 4), 16) / 255,
      b: Number.parseInt(safe.slice(4, 6), 16) / 255,
    },
    opacity: safe.length === 8 ? Number.parseInt(safe.slice(6, 8), 16) / 255 : 1,
  }
}

function normalizeRegistryName(value: string): string {
  return value.toLowerCase().replace(/colour/g, 'color').replace(/[^a-z0-9]/g, '')
}

class ImportContext {
  readonly report: Report
  readonly document: ImportDocument
  readonly registry: LibraryRegistry | null
  readonly createdNodes: GeneratedNode[] = []
  readonly layerNodes = new Map<string, GeneratedNode>()
  private localVariables?: Variable[]
  private localTextStyles?: TextStyle[]
  private readonly variableCache = new Map<string, Variable | null>()
  private readonly textStyleCache = new Map<string, TextStyle | null>()
  private readonly componentCache = new Map<string, ComponentNode | ComponentSetNode | null>()
  private readonly reportedVariableProblems = new Set<string>()
  private readonly reportedTextStyleProblems = new Set<string>()
  private readonly reportedComponentProblems = new Set<string>()

  constructor(document: ImportDocument, report: Report, registry: LibraryRegistry | null) {
    this.document = document
    this.report = report
    this.registry = registry
  }

  register(node: GeneratedNode, layer: BaseLayerDefinition): void {
    this.createdNodes.push(node)
    this.layerNodes.set(layer.id, node)
    node.setPluginData(LAYER_PLUGIN_KEY, layer.id)
    node.setPluginData(SCHEMA_PLUGIN_KEY, this.document.schemaVersion)
  }

  async resolveVariable(reference: string, allowRemote: boolean): Promise<Variable | null> {
    if (this.variableCache.has(reference)) return this.variableCache.get(reference) ?? null
    const definition = this.document.variables?.[reference]
    if (!definition) return null
    this.localVariables ??= await figma.variables.getLocalVariablesAsync()

    let variable: Variable | null = null
    if (definition.id) variable = await figma.variables.getVariableByIdAsync(definition.id)
    if (!variable && definition.key) {
      variable = this.localVariables.find((candidate) => candidate.key === definition.key) ?? null
      if (!variable && allowRemote) {
        try {
          variable = await figma.variables.importVariableByKeyAsync(definition.key)
        } catch {
          variable = null
        }
      }
    }
    if (!variable && definition.name) {
      variable = this.localVariables.find((candidate) => candidate.name === definition.name) ?? null
    }
    if (!variable && definition.libraryName && allowRemote) {
      const matches = this.registry?.variables.filter(
        (candidate) =>
          candidate.normalizedName === normalizeRegistryName(definition.libraryName ?? '')
          && (!definition.type || candidate.type === definition.type)
          && candidate.publishStatus !== 'UNPUBLISHED',
      ) ?? []
      if (matches.length === 1) {
        try {
          variable = await figma.variables.importVariableByKeyAsync(matches[0].key)
        } catch {
          variable = null
        }
      } else if (matches.length > 1) {
        addIssue(this.report, 'ERROR', 'AMBIGUOUS_LIBRARY_VARIABLE', `Library variable "${definition.libraryName}" matches multiple published variables.`)
      }
    }

    if (!variable && !allowRemote && definition.libraryName) {
      const matches = this.registry?.variables.filter(
        (candidate) =>
          candidate.normalizedName === normalizeRegistryName(definition.libraryName ?? '')
          && (!definition.type || candidate.type === definition.type)
          && candidate.publishStatus !== 'UNPUBLISHED',
      ) ?? []
      if (matches.length === 1) {
        addIssue(this.report, 'INFO', 'LIBRARY_VARIABLE_READY', `Library variable "${definition.libraryName}" is available for import.`)
      } else if (matches.length > 1) {
        const severity: Severity = definition.required === false ? 'WARNING' : 'ERROR'
        addIssue(this.report, severity, 'AMBIGUOUS_LIBRARY_VARIABLE', `Library variable "${definition.libraryName}" matches multiple published variables.`)
      } else {
        const severity: Severity = definition.required === false ? 'WARNING' : 'ERROR'
        addIssue(this.report, severity, 'LIBRARY_VARIABLE_NOT_REGISTERED', `Library variable "${definition.libraryName}" is missing from the saved registry.`)
      }
      return null
    }

    const remoteDeferred = !variable && !allowRemote && Boolean(definition.key)
    if (remoteDeferred) {
      addIssue(this.report, 'INFO', 'REMOTE_VARIABLE_DEFERRED', `Remote variable "${reference}" will be resolved during import.`)
      return null
    }

    this.variableCache.set(reference, variable)
    if (!variable && !this.reportedVariableProblems.has(reference)) {
      const severity: Severity = definition.required === false ? 'WARNING' : 'ERROR'
      addIssue(this.report, severity, 'VARIABLE_NOT_FOUND', `Variable "${reference}" could not be resolved.`)
      this.reportedVariableProblems.add(reference)
    } else if (variable && definition.type && variable.resolvedType !== definition.type) {
      addIssue(this.report, 'ERROR', 'VARIABLE_TYPE_MISMATCH', `Variable "${reference}" is ${variable.resolvedType}, expected ${definition.type}.`)
    }
    return variable
  }

  async resolveTextStyle(reference: string, allowRemote: boolean): Promise<TextStyle | null> {
    if (this.textStyleCache.has(reference)) return this.textStyleCache.get(reference) ?? null
    const definition = this.document.textStyles?.[reference]
    if (!definition) return null
    this.localTextStyles ??= await figma.getLocalTextStylesAsync()

    let style: TextStyle | null = null
    if (definition.id) style = this.localTextStyles.find((candidate) => candidate.id === definition.id) ?? null
    if (!style && definition.key) {
      style = this.localTextStyles.find((candidate) => candidate.key === definition.key) ?? null
      if (!style && allowRemote) {
        try {
          const imported = await figma.importStyleByKeyAsync(definition.key)
          style = imported.type === 'TEXT' ? imported : null
        } catch {
          style = null
        }
      }
    }
    if (!style && definition.name) {
      style = this.localTextStyles.find((candidate) => candidate.name === definition.name) ?? null
    }
    if (!style && definition.libraryName && allowRemote) {
      const matches = this.registry?.textStyles?.filter(
        (candidate) =>
          candidate.normalizedName === normalizeRegistryName(definition.libraryName ?? '')
          && candidate.publishStatus !== 'UNPUBLISHED',
      ) ?? []
      if (matches.length === 1) {
        try {
          const imported = await figma.importStyleByKeyAsync(matches[0].key)
          style = imported.type === 'TEXT' ? imported : null
        } catch {
          style = null
        }
      } else if (matches.length > 1) {
        addIssue(this.report, 'ERROR', 'AMBIGUOUS_LIBRARY_TEXT_STYLE', `Library text style "${definition.libraryName}" matches multiple published styles.`)
      }
    }

    if (!style && !allowRemote && definition.libraryName) {
      const matches = this.registry?.textStyles?.filter(
        (candidate) =>
          candidate.normalizedName === normalizeRegistryName(definition.libraryName ?? '')
          && candidate.publishStatus !== 'UNPUBLISHED',
      ) ?? []
      if (matches.length === 1) {
        addIssue(this.report, 'INFO', 'LIBRARY_TEXT_STYLE_READY', `Library text style "${definition.libraryName}" is available for import.`)
      } else if (matches.length > 1) {
        addIssue(this.report, 'ERROR', 'AMBIGUOUS_LIBRARY_TEXT_STYLE', `Library text style "${definition.libraryName}" matches multiple published styles.`)
      } else if (!this.reportedTextStyleProblems.has(reference)) {
        addIssue(this.report, 'WARNING', 'TEXT_STYLE_NOT_REGISTERED', `Library text style "${definition.libraryName}" is missing from the saved registry.`)
        this.reportedTextStyleProblems.add(reference)
      }
      return null
    }

    this.textStyleCache.set(reference, style)
    if (!style && !this.reportedTextStyleProblems.has(reference)) {
      const severity: Severity = definition.required === false ? 'WARNING' : 'ERROR'
      addIssue(this.report, severity, 'TEXT_STYLE_NOT_FOUND', `Text style "${reference}" could not be resolved.`)
      this.reportedTextStyleProblems.add(reference)
    }
    return style
  }

  async resolveComponent(reference: string, allowRemote: boolean): Promise<ComponentNode | ComponentSetNode | null> {
    if (this.componentCache.has(reference)) return this.componentCache.get(reference) ?? null
    const definition = this.document.components?.[reference]
    if (!definition) return null

    let component: ComponentNode | ComponentSetNode | null = null
    if (definition.nodeId) {
      const node = await figma.getNodeByIdAsync(definition.nodeId)
      if (node?.type === 'COMPONENT' || node?.type === 'COMPONENT_SET') component = node
    }
    // Source node IDs are file-local. Verify the registry key before using a
    // local node so an ID collision in a destination file cannot select it.
    // A live local source includes edits not yet present in the published copy.
    if (!component) {
      const candidates = this.registry?.components.filter((candidate) => {
        if (definition.componentKey) return candidate.key === definition.componentKey
        if (definition.componentSetKey) return candidate.key === definition.componentSetKey
        if (definition.sourceNodeId) return candidate.nodeId === definition.sourceNodeId
        return Boolean(definition.libraryName)
          && candidate.normalizedName === normalizeRegistryName(definition.libraryName ?? '')
      }) ?? []
      if (candidates.length === 1) {
        const candidate = candidates[0]
        const node = await figma.getNodeByIdAsync(candidate.nodeId)
        if ((node?.type === 'COMPONENT' || node?.type === 'COMPONENT_SET')
          && !node.remote && node.type === candidate.kind && node.key === candidate.key) {
          component = node
        }
      }
    }
    if (!component && allowRemote && definition.componentKey) {
      try {
        component = await figma.importComponentByKeyAsync(definition.componentKey)
      } catch {
        component = null
      }
    }
    if (!component && allowRemote && definition.componentSetKey) {
      try {
        component = await figma.importComponentSetByKeyAsync(definition.componentSetKey)
      } catch {
        component = null
      }
    }
    if (!component && allowRemote && (definition.sourceNodeId || definition.libraryName)) {
      const sourceMatches = definition.sourceNodeId
        ? this.registry?.components.filter(
            (candidate) => candidate.nodeId === definition.sourceNodeId && candidate.publishStatus !== 'UNPUBLISHED',
          ) ?? []
        : []
      const matches = sourceMatches.length > 0
        ? sourceMatches
        : this.registry?.components.filter(
            (candidate) =>
              candidate.normalizedName === normalizeRegistryName(definition.libraryName ?? '')
              && candidate.publishStatus !== 'UNPUBLISHED',
          ) ?? []
      if (matches.length === 1) {
        try {
          component = matches[0].kind === 'COMPONENT_SET'
            ? await figma.importComponentSetByKeyAsync(matches[0].key)
            : await figma.importComponentByKeyAsync(matches[0].key)
        } catch {
          component = null
        }
      } else if (matches.length > 1) {
        addIssue(this.report, 'ERROR', 'AMBIGUOUS_LIBRARY_COMPONENT', `Library component "${definition.libraryName}" matches multiple published components.`)
      }
    }

    if (!component && !allowRemote && (definition.sourceNodeId || definition.libraryName)) {
      const sourceMatches = definition.sourceNodeId
        ? this.registry?.components.filter(
            (candidate) => candidate.nodeId === definition.sourceNodeId && candidate.publishStatus !== 'UNPUBLISHED',
          ) ?? []
        : []
      const matches = sourceMatches.length > 0
        ? sourceMatches
        : this.registry?.components.filter(
            (candidate) =>
              candidate.normalizedName === normalizeRegistryName(definition.libraryName ?? '')
              && candidate.publishStatus !== 'UNPUBLISHED',
          ) ?? []
      const registryReference = definition.sourceNodeId
        ? `source node ${definition.sourceNodeId}`
        : `name "${definition.libraryName}"`
      if (matches.length === 1) {
        addIssue(this.report, 'INFO', 'LIBRARY_COMPONENT_READY', `Library component matched by ${registryReference} is available for import.`)
      } else if (matches.length > 1) {
        addIssue(this.report, 'ERROR', 'AMBIGUOUS_LIBRARY_COMPONENT', `Library component ${registryReference} matches multiple published components.`)
      } else {
        addIssue(this.report, 'ERROR', 'LIBRARY_COMPONENT_NOT_REGISTERED', `Library component ${registryReference} is missing from the saved registry.`)
      }
      return null
    }

    const remoteDeferred = !component && !allowRemote && Boolean(
      definition.componentKey || definition.componentSetKey,
    )
    if (remoteDeferred) {
      addIssue(this.report, 'INFO', 'REMOTE_COMPONENT_DEFERRED', `Remote component "${reference}" will be resolved during import.`)
      return null
    }

    if (component) {
      addIssue(this.report, 'INFO', 'COMPONENT_RESOLVED',
        `${reference} resolved to ${component.remote ? 'published library' : 'local'} ${component.type} "${component.name}" (node ${component.id}, key ${component.key}).`)
      const registered = this.registry?.components.find((candidate) => candidate.key === component.key)
      const missingOptions = Object.entries(registered?.properties ?? {}).flatMap(([name, property]) => {
        if (property.type !== 'VARIANT') return []
        const actual = component.componentPropertyDefinitions[name]
        return (property.variantOptions ?? [])
          .filter((value) => actual?.type !== 'VARIANT' || !actual.variantOptions?.includes(value))
          .map((value) => `${name}=${JSON.stringify(value)}`)
      })
      if (missingOptions.length) {
        addIssue(this.report, 'WARNING', 'COMPONENT_LIBRARY_VERSION_MISMATCH',
          `${reference} is missing variants recorded in the source registry: ${missingOptions.join('; ')}. If importing across files, publish the updated source and accept its library update in the destination, then refresh the registry.`)
      }
    }
    this.componentCache.set(reference, component)
    if (!component && !this.reportedComponentProblems.has(reference)) {
      addIssue(this.report, 'ERROR', 'COMPONENT_NOT_FOUND', `Component "${reference}" could not be resolved.`)
      this.reportedComponentProblems.add(reference)
    }
    return component
  }
}

async function bindNumber(
  node: GeneratedNode,
  field: VariableBindableNodeField | VariableBindableTextField,
  value: NumberValue | undefined,
  context: ImportContext,
): Promise<void> {
  const reference = variableReference(value)
  if (!reference) return
  const variable = await context.resolveVariable(reference, true)
  if (variable && variable.resolvedType === 'FLOAT') node.setBoundVariable(field, variable)
}

async function createPaint(
  definition: SolidPaintDefinition,
  context: ImportContext,
): Promise<SolidPaint> {
  const parsed = parseHexColor(stringValue(definition.color, '#000000'))
  let paint: SolidPaint = {
    type: 'SOLID',
    color: parsed.color,
    opacity: (definition.opacity ?? 1) * parsed.opacity,
  }
  const reference = variableReference(definition.color)
  if (reference) {
    const variable = await context.resolveVariable(reference, true)
    if (variable && variable.resolvedType === 'COLOR') {
      paint = figma.variables.setBoundVariableForPaint(paint, 'color', variable)
    }
  }
  return paint
}

async function applyStyle(node: FillableNode, style: LayerStyle | undefined, context: ImportContext): Promise<void> {
  if (!style) return
  if (style.fills) node.fills = await Promise.all(style.fills.map((paint) => createPaint(paint, context)))
  if (style.strokes) node.strokes = await Promise.all(style.strokes.map((paint) => createPaint(paint, context)))
  if (style.strokeWeight !== undefined) {
    node.strokeWeight = numberValue(style.strokeWeight)
    await bindNumber(node, 'strokeWeight', style.strokeWeight, context)
  }
  if (style.cornerRadius !== undefined && 'cornerRadius' in node) {
    node.cornerRadius = numberValue(style.cornerRadius)
    await bindNumber(node, 'cornerRadius', style.cornerRadius, context)
  }
  if (
    style.corners
    && 'topLeftRadius' in node
    && 'topRightRadius' in node
    && 'bottomRightRadius' in node
    && 'bottomLeftRadius' in node
  ) {
    node.topLeftRadius = numberValue(style.corners.topLeft)
    node.topRightRadius = numberValue(style.corners.topRight)
    node.bottomRightRadius = numberValue(style.corners.bottomRight)
    node.bottomLeftRadius = numberValue(style.corners.bottomLeft)
    await bindNumber(node, 'topLeftRadius', style.corners.topLeft, context)
    await bindNumber(node, 'topRightRadius', style.corners.topRight, context)
    await bindNumber(node, 'bottomRightRadius', style.corners.bottomRight, context)
    await bindNumber(node, 'bottomLeftRadius', style.corners.bottomLeft, context)
  }
  if (style.opacity !== undefined) {
    node.opacity = numberValue(style.opacity, 1)
    await bindNumber(node, 'opacity', style.opacity, context)
  }
  if (style.effects) node.effects = await Promise.all(style.effects.map((effect) => createEffect(effect, context)))
}

async function createEffect(definition: ShadowDefinition, context: ImportContext): Promise<ShadowEffect> {
  const parsed = parseHexColor(stringValue(definition.color, '#00000040'))
  let effect: ShadowEffect = {
    type: definition.type,
    color: { ...parsed.color, a: parsed.opacity },
    offset: { x: numberValue(definition.offset.x), y: numberValue(definition.offset.y) },
    radius: numberValue(definition.radius),
    spread: numberValue(definition.spread),
    visible: definition.visible ?? true,
    blendMode: definition.blendMode ?? 'NORMAL',
  }
  const colorRef = variableReference(definition.color)
  if (colorRef) {
    const variable = await context.resolveVariable(colorRef, true)
    if (variable?.resolvedType === 'COLOR') effect = figma.variables.setBoundVariableForEffect(effect, 'color', variable) as ShadowEffect
  }
  const numericFields: Array<['radius' | 'spread' | 'offsetX' | 'offsetY', NumberValue | undefined]> = [
    ['radius', definition.radius],
    ['spread', definition.spread],
    ['offsetX', definition.offset.x],
    ['offsetY', definition.offset.y],
  ]
  for (const [field, value] of numericFields) {
    const reference = variableReference(value)
    if (!reference) continue
    const variable = await context.resolveVariable(reference, true)
    if (variable?.resolvedType === 'FLOAT') effect = figma.variables.setBoundVariableForEffect(effect, field, variable) as ShadowEffect
  }
  return effect
}

async function applyDimensions(node: GeneratedNode, layer: BaseLayerDefinition, context: ImportContext): Promise<void> {
  const width = layer.width === undefined ? node.width : Math.max(0.01, numberValue(layer.width))
  const height = layer.height === undefined ? node.height : Math.max(0.01, numberValue(layer.height))
  const autoWidthText = node.type === 'TEXT' && node.textAutoResize === 'WIDTH_AND_HEIGHT'
  if (!autoWidthText && (layer.width !== undefined || layer.height !== undefined)) node.resize(width, height)
  if (!autoWidthText) {
    await bindNumber(node, 'width', layer.width, context)
    await bindNumber(node, 'height', layer.height, context)
  }

  const minMaxFields: Array<['minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight', NumberValue | undefined]> = [
    ['minWidth', layer.minWidth],
    ['maxWidth', layer.maxWidth],
    ['minHeight', layer.minHeight],
    ['maxHeight', layer.maxHeight],
  ]
  for (const [field, value] of minMaxFields) {
    if (value === undefined) continue
    node[field] = numberValue(value)
    await bindNumber(node, field, value, context)
  }
}

async function configureFrame(frame: FrameNode, layer: FrameLayerDefinition, context: ImportContext): Promise<void> {
  const layout = layer.layout
  frame.clipsContent = layer.clipsContent ?? false
  frame.fills = []
  if (!layout) return
  frame.layoutMode = layout.mode
  // For a uniform border the emitter keeps the CSS padding (so it stays bound to
  // its spacing token) and asks Figma to inset the children by the stroke.
  // Otherwise it has already folded the border width into the padding, so keep
  // Figma from insetting the children a second time.
  if (layout.mode !== 'NONE') frame.strokesIncludedInLayout = layout.strokesIncludedInLayout ?? false
  if (layout.mode !== 'NONE' && layout.padding) {
    frame.paddingTop = numberValue(layout.padding.top)
    frame.paddingRight = numberValue(layout.padding.right)
    frame.paddingBottom = numberValue(layout.padding.bottom)
    frame.paddingLeft = numberValue(layout.padding.left)
    await bindNumber(frame, 'paddingTop', layout.padding.top, context)
    await bindNumber(frame, 'paddingRight', layout.padding.right, context)
    await bindNumber(frame, 'paddingBottom', layout.padding.bottom, context)
    await bindNumber(frame, 'paddingLeft', layout.padding.left, context)
  }
  if (layout.mode === 'HORIZONTAL' || layout.mode === 'VERTICAL') {
    frame.primaryAxisSizingMode = layout.primaryAxisSizing ?? 'FIXED'
    frame.counterAxisSizingMode = layout.counterAxisSizing ?? 'FIXED'
    frame.primaryAxisAlignItems = layout.primaryAxisAlign ?? 'MIN'
    frame.counterAxisAlignItems = layout.counterAxisAlign ?? 'MIN'
    frame.layoutWrap = layout.wrap ?? 'NO_WRAP'
    if (layout.gap !== undefined) {
      frame.itemSpacing = numberValue(layout.gap)
      await bindNumber(frame, 'itemSpacing', layout.gap, context)
    }
    if (layout.counterAxisGap !== undefined) {
      frame.counterAxisSpacing = numberValue(layout.counterAxisGap)
      await bindNumber(frame, 'counterAxisSpacing', layout.counterAxisGap, context)
    }
    if (layout.reverseZIndex) frame.itemReverseZIndex = true
  }
  if (layout.mode === 'GRID' && layout.grid) {
    frame.gridRowCount = Math.max(1, layout.grid.rows)
    frame.gridColumnCount = Math.max(1, layout.grid.columns)
    if (layout.grid.rowGap !== undefined) {
      frame.gridRowGap = numberValue(layout.grid.rowGap)
      await bindNumber(frame, 'gridRowGap', layout.grid.rowGap, context)
    }
    if (layout.grid.columnGap !== undefined) {
      frame.gridColumnGap = numberValue(layout.grid.columnGap)
      await bindNumber(frame, 'gridColumnGap', layout.grid.columnGap, context)
    }
  }
}

function applyBaseProperties(node: GeneratedNode, layer: BaseLayerDefinition): void {
  node.name = layer.name
  node.visible = layer.visible ?? true
  if (layer.x !== undefined) node.x = layer.x
  if (layer.y !== undefined) node.y = layer.y
}

function applyChildLayout(node: GeneratedNode, layer: BaseLayerDefinition): void {
  const child = layer.layoutChild
  if (!child) return
  node.layoutAlign = child.align ?? 'INHERIT'
  node.layoutGrow = child.grow ?? 0
  node.layoutPositioning = child.positioning ?? 'AUTO'
  if (child.positioning === 'ABSOLUTE') {
    node.x = layer.x ?? 0
    node.y = layer.y ?? 0
  }
  if (child.positioning !== 'ABSOLUTE' && child.row !== undefined && child.column !== undefined) {
    node.setGridChildPosition(child.row, child.column)
  }
}

async function createTextLayer(layer: TextLayerDefinition, context: ImportContext): Promise<TextNode> {
  const node = figma.createText()
  context.register(node, layer)
  const typography = layer.typography
  const family = stringValue(typography?.fontFamily, 'Inter')
  const style = stringValue(typography?.fontStyle, 'Regular')
  const fontName: FontName = { family, style }
  try {
    await figma.loadFontAsync(fontName)
    node.fontName = fontName
  } catch {
    addIssue(context.report, 'ERROR', 'FONT_NOT_FOUND', `Font ${family} ${style} could not be loaded.`, layer.id)
    const fallback: FontName = { family: 'Inter', style: 'Regular' }
    await figma.loadFontAsync(fallback)
    node.fontName = fallback
  }
  node.characters = stringValue(layer.characters)
  const characterRef = variableReference(layer.characters)
  if (characterRef) {
    const variable = await context.resolveVariable(characterRef, true)
    if (variable?.resolvedType === 'STRING') node.setBoundVariable('characters', variable)
  }
  if (typography?.fontSize !== undefined) {
    node.fontSize = numberValue(typography.fontSize)
    await bindNumber(node, 'fontSize', typography.fontSize, context)
  }
  if (typography?.fontWeight !== undefined) await bindNumber(node, 'fontWeight', typography.fontWeight, context)
  if (typography?.lineHeight === 'AUTO') node.lineHeight = { unit: 'AUTO' }
  else if (typography?.lineHeight !== undefined) {
    node.lineHeight = { unit: 'PIXELS', value: numberValue(typography.lineHeight) }
    await bindNumber(node, 'lineHeight', typography.lineHeight, context)
  }
  if (typography?.letterSpacing !== undefined) {
    node.letterSpacing = { unit: 'PIXELS', value: numberValue(typography.letterSpacing) }
    await bindNumber(node, 'letterSpacing', typography.letterSpacing, context)
  }
  if (typography?.paragraphSpacing !== undefined) {
    node.paragraphSpacing = numberValue(typography.paragraphSpacing)
    await bindNumber(node, 'paragraphSpacing', typography.paragraphSpacing, context)
  }
  node.textAlignHorizontal = typography?.textAlignHorizontal ?? 'LEFT'
  node.textAlignVertical = typography?.textAlignVertical ?? 'TOP'
  node.textAutoResize = typography?.textAutoResize ?? 'WIDTH_AND_HEIGHT'
  if (typography?.textStyle) {
    const textStyle = await context.resolveTextStyle(typography.textStyle, true)
    if (textStyle) {
      await node.setTextStyleIdAsync(textStyle.id)
      // The style may switch the font; load it before further text edits.
      await Promise.all(node.getRangeAllFontNames(0, node.characters.length).map((font) => figma.loadFontAsync(font)))
    }
  }
  // A text style carries its own decoration and case, so these overrides go
  // after it is applied (as CSS text-transform / text-decoration sit on top).
  if (typography?.textDecoration) node.textDecoration = typography.textDecoration
  if (typography?.textCase) node.textCase = typography.textCase
  return node
}

/** Applied after the layer's own fills, which would otherwise overwrite the
 *  per-range fills. A missing italic/weight for a run falls back to the
 *  upright face of that weight, then to the layer font, with a warning —
 *  one decorative run should not fail the whole import. */
async function applyTextRanges(node: TextNode, layer: TextLayerDefinition, context: ImportContext): Promise<void> {
  const length = node.characters.length
  const baseFont = node.fontName === figma.mixed ? undefined : node.fontName
  for (const range of layer.ranges ?? []) {
    const start = Math.max(0, Math.min(range.start, length))
    const end = Math.max(start, Math.min(range.end, length))
    if (start === end) continue
    if (range.fontStyle && baseFont) {
      const candidates = [range.fontStyle, range.fontStyle.replace(/\s*Italic$/, '') || 'Regular']
      let applied = false
      for (const style of [...new Set(candidates)]) {
        const font: FontName = { family: baseFont.family, style }
        try {
          await figma.loadFontAsync(font)
          node.setRangeFontName(start, end, font)
          applied = true
          if (style !== range.fontStyle) {
            addIssue(context.report, 'WARNING', 'FONT_STYLE_FALLBACK', `Font ${baseFont.family} ${range.fontStyle} is not available; used ${style} for characters ${start}–${end}.`, layer.id)
          }
          break
        } catch {
          // try the next candidate
        }
      }
      if (!applied) {
        addIssue(context.report, 'WARNING', 'FONT_STYLE_FALLBACK', `Font ${baseFont.family} ${range.fontStyle} is not available; kept ${baseFont.style} for characters ${start}–${end}.`, layer.id)
      }
    }
    if (range.fills) node.setRangeFills(start, end, await Promise.all(range.fills.map((paint) => createPaint(paint, context))))
    if (range.textDecoration) node.setRangeTextDecoration(start, end, range.textDecoration)
    if (range.textCase) node.setRangeTextCase(start, end, range.textCase)
  }
}

function resolvePropertyKey(instance: InstanceNode, requested: string): string | undefined {
  const keys = Object.keys(instance.componentProperties)
  return keys.find((key) => key === requested) ?? keys.find((key) => key.split('#')[0] === requested)
}

function resolvePropertyDefinitionKey(
  source: ComponentNode | ComponentSetNode,
  requested: string,
): string | undefined {
  const keys = Object.keys(source.componentPropertyDefinitions)
  return keys.find((key) => key === requested) ?? keys.find((key) => key.split('#')[0] === requested)
}

function resolveVariantValue(
  source: ComponentNode | ComponentSetNode,
  propertyName: string,
  requestedValue: string | boolean,
  layer: ComponentLayerDefinition,
  context: ImportContext,
): string | boolean {
  if (typeof requestedValue !== 'string') return requestedValue
  const definitionKey = resolvePropertyDefinitionKey(source, propertyName)
  const definition = definitionKey ? source.componentPropertyDefinitions[definitionKey] : undefined
  if (!definition || definition.type !== 'VARIANT') return requestedValue

  const options = [...(definition.variantOptions ?? [])]
  if (options.includes(requestedValue)) return requestedValue
  const requestedName = normalizeRegistryName(requestedValue)
  const normalizedMatch = options.find((option) => normalizeRegistryName(option) === requestedName)
  if (normalizedMatch) return normalizedMatch

  const safeAliases: Record<string, string[]> = {
    closed: ['close', 'default'],
    close: ['closed', 'default'],
    default: ['closed', 'close'],
  }
  const aliasNames = safeAliases[requestedName] ?? []
  const aliasMatch = options.find((option) => aliasNames.includes(normalizeRegistryName(option)))
  if (aliasMatch) {
    addIssue(
      context.report,
      'INFO',
      'COMPONENT_VARIANT_VALUE_ALIASED',
      `${layer.component} ${propertyName} mapped "${requestedValue}" to its available variant "${aliasMatch}".`,
      layer.id,
    )
    return aliasMatch
  }
  return requestedValue
}

async function applyComponentProperties(
  instance: InstanceNode,
  source: ComponentNode | ComponentSetNode,
  layer: ComponentLayerDefinition,
  context: ImportContext,
): Promise<void> {
  const definition = context.document.components?.[layer.component]
  const updates: Record<string, string | boolean | VariableAlias> = {}
  for (const [sourceName, sourceValue] of Object.entries(layer.properties ?? {})) {
    const mapping = definition?.propertyMappings?.[sourceName]
    const targetName = mapping?.figmaProperty ?? sourceName
    const propertyKey = resolvePropertyKey(instance, targetName)
    if (!propertyKey) {
      addIssue(context.report, definition?.lenient ? 'WARNING' : 'ERROR', 'COMPONENT_PROPERTY_NOT_FOUND', `Property "${targetName}" does not exist on ${layer.component}.`, layer.id)
      continue
    }
    const rawValue = typeof sourceValue === 'object' ? sourceValue.value : sourceValue
    const mappedPropertyValue = mapping?.values?.[String(rawValue)]
      ?? (typeof rawValue === 'boolean'
        ? rawValue ? mapping?.trueValue ?? rawValue : mapping?.falseValue ?? rawValue
        : rawValue)
    const mappedValue = resolveVariantValue(
      source,
      targetName,
      mappedPropertyValue,
      layer,
      context,
    )
    const reference = typeof sourceValue === 'object' ? sourceValue.variable : undefined
    if (reference) {
      const variable = await context.resolveVariable(reference, true)
      if (variable && (variable.resolvedType === 'STRING' || variable.resolvedType === 'BOOLEAN')) {
        updates[propertyKey] = figma.variables.createVariableAlias(variable)
      }
    } else {
      updates[propertyKey] = mappedValue
    }
  }
  if (Object.keys(updates).length === 0) return
  try {
    instance.setProperties(updates)
  } catch (error) {
    if (definition?.lenient) {
      // Apply what the component accepts; report each rejected property.
      for (const [propertyKey, value] of Object.entries(updates)) {
        try {
          instance.setProperties({ [propertyKey]: value })
        } catch {
          const definitionKey = resolvePropertyDefinitionKey(source, propertyKey)
          const propertyDefinition = definitionKey ? source.componentPropertyDefinitions[definitionKey] : undefined
          const options = propertyDefinition?.type === 'VARIANT' ? ` Available: ${propertyDefinition.variantOptions?.join(', ') ?? 'none'}.` : ''
          addIssue(context.report, 'WARNING', 'COMPONENT_PROPERTY_VALUE_SKIPPED', `${layer.component} ${propertyKey} = ${String(value)} was not accepted; kept the default.${options}`, layer.id)
        }
      }
      return
    }
    const requestedVariants: string[] = []
    const unsupportedVariants: string[] = []
    const availableOptions = Object.keys(updates).flatMap((propertyKey) => {
      const definitionKey = resolvePropertyDefinitionKey(source, propertyKey)
      const propertyDefinition = definitionKey ? source.componentPropertyDefinitions[definitionKey] : undefined
      if (propertyDefinition?.type === 'VARIANT') {
        const value = updates[propertyKey]
        requestedVariants.push(`${propertyKey}=${typeof value === 'object' ? `variable(${value.id})` : JSON.stringify(value)}`)
        if (typeof value === 'string' && !propertyDefinition.variantOptions?.includes(value)) {
          unsupportedVariants.push(`${propertyKey}=${JSON.stringify(value)}`)
        }
      }
      return propertyDefinition?.type === 'VARIANT'
        ? [`${propertyKey}: ${propertyDefinition.variantOptions?.join(', ') ?? 'none'}`]
        : []
    })
    addIssue(
      context.report,
      'ERROR',
      'COMPONENT_PROPERTY_VALUES_UNSUPPORTED',
      `${layer.component} rejected the requested property combination.${requestedVariants.length ? ` Requested variants — ${requestedVariants.join('; ')}.` : ''}${availableOptions.length ? ` Available options — ${availableOptions.join('; ')}.` : ''}${unsupportedVariants.length ? ` Unsupported values — ${unsupportedVariants.join('; ')}. Check the export property mappings and the version of the imported Figma library component.` : ''} ${error instanceof Error ? error.message : String(error)}`,
      layer.id,
    )
    throw error
  }
}

function applyComponentTextOverrides(
  instance: InstanceNode,
  layer: ComponentLayerDefinition,
  context: ImportContext,
): void {
  const textNodes = instance.findAllWithCriteria({ types: ['TEXT'] })
  for (const [layerName, characters] of Object.entries(layer.textOverrides ?? {})) {
    // "Name#n" targets the n-th text layer named "Name" (repeated layers such
    // as a breadcrumb's "Parent Link"); plain names target every match.
    const indexed = layerName.match(/^(.*)#(\d+)$/)
    const baseName = indexed ? indexed[1] : layerName
    let matches = textNodes.filter((textNode) => textNode.name === baseName)
    if (indexed) matches = matches.slice(Number(indexed[2]), Number(indexed[2]) + 1)
    if (matches.length === 0) {
      const visibleTextNodes = textNodes.filter((textNode) => textNode.visible)
      if (visibleTextNodes.length === 1) {
        matches = visibleTextNodes
        addIssue(
          context.report,
          'INFO',
          'COMPONENT_TEXT_LAYER_INFERRED',
          `Text override "${layerName}" was applied to the only visible text layer on ${layer.component}.`,
          layer.id,
        )
      }
    }
    if (matches.length === 0) {
      addIssue(
        context.report,
        context.document.components?.[layer.component]?.lenient ? 'WARNING' : 'ERROR',
        'COMPONENT_TEXT_LAYER_NOT_FOUND',
        `Text layer "${layerName}" does not exist on ${layer.component}.`,
        layer.id,
      )
      continue
    }
    const reveal = context.document.components?.[layer.component]?.revealTextLayers
    for (const textNode of matches) {
      textNode.characters = characters
      if (reveal) textNode.visible = true
    }
  }
}

async function loadComponentFonts(
  source: ComponentNode | ComponentSetNode,
  layer: ComponentLayerDefinition,
  context: ImportContext,
): Promise<void> {
  const fonts = new Map<string, FontName>()
  const textNodes = source.findAllWithCriteria({ types: ['TEXT'] })

  for (const textNode of textNodes) {
    const nodeFonts = textNode.characters.length > 0
      ? textNode.getRangeAllFontNames(0, textNode.characters.length)
      : textNode.fontName === figma.mixed
        ? []
        : [textNode.fontName]
    nodeFonts.forEach((font) => fonts.set(`${font.family}/${font.style}`, font))
  }

  for (const font of fonts.values()) {
    try {
      await figma.loadFontAsync(font)
    } catch {
      addIssue(
        context.report,
        'ERROR',
        'COMPONENT_FONT_NOT_FOUND',
        `Component ${layer.component} requires font ${font.family} ${font.style}, but it could not be loaded.`,
        layer.id,
      )
      throw new Error(`Could not load font ${font.family} ${font.style} for component ${layer.component}.`)
    }
  }
}

async function createComponentLayer(layer: ComponentLayerDefinition, context: ImportContext): Promise<InstanceNode> {
  const source = await context.resolveComponent(layer.component, true)
  if (!source) throw new Error(`Component ${layer.component} could not be resolved.`)
  await loadComponentFonts(source, layer, context)
  const component = source.type === 'COMPONENT_SET'
    ? source.children.find((child): child is ComponentNode => child.type === 'COMPONENT')
    : source
  if (!component) throw new Error(`Component set ${layer.component} has no variants.`)
  const instance = component.createInstance()
  context.register(instance, layer)
  await applyComponentProperties(instance, source, layer, context)
  applyComponentTextOverrides(instance, layer, context)
  return instance
}

async function buildLayer(layer: LayerDefinition, context: ImportContext): Promise<GeneratedNode> {
  let node: GeneratedNode
  const builtChildren: Array<[GeneratedNode, LayerDefinition]> = []
  if (layer.type === 'FRAME') {
    const frame = figma.createFrame()
    context.register(frame, layer)
    await configureFrame(frame, layer, context)
    node = frame
    for (const childDefinition of layer.children ?? []) {
      const child = await buildLayer(childDefinition, context)
      frame.appendChild(child)
      applyChildLayout(child, childDefinition)
      builtChildren.push([child, childDefinition])
    }
  } else if (layer.type === 'TEXT') {
    node = await createTextLayer(layer, context)
  } else if (layer.type === 'RECTANGLE') {
    const rectangle = figma.createRectangle()
    rectangle.fills = []
    context.register(rectangle, layer)
    node = rectangle
  } else if (layer.type === 'ELLIPSE') {
    const ellipse = figma.createEllipse()
    ellipse.fills = []
    context.register(ellipse, layer)
    node = ellipse
  } else if (layer.type === 'SVG') {
    const svg = figma.createNodeFromSvg(layer.svg)
    context.register(svg, layer)
    node = svg
  } else {
    node = await createComponentLayer(layer, context)
  }

  applyBaseProperties(node, layer)
  if (node.type === 'INSTANCE' && layer.width !== undefined) {
    // Match the measured width; keep the component's own height sizing.
    // resize() pins both axes to FIXED, so restore the height axis to what the
    // variant defines: a hugging checkbox keeps growing with its text, while a
    // fixed-height button (e.g. LG = 56px) must not collapse to hug its label.
    const heightAxis = node.layoutMode === 'VERTICAL' ? 'primary' : node.layoutMode === 'HORIZONTAL' ? 'counter' : null
    const heightSizing = heightAxis === 'primary' ? node.primaryAxisSizingMode : heightAxis === 'counter' ? node.counterAxisSizingMode : null
    node.resize(Math.max(0.01, numberValue(layer.width)), node.height)
    if (heightAxis === 'primary' && heightSizing) node.primaryAxisSizingMode = heightSizing
    if (heightAxis === 'counter' && heightSizing) node.counterAxisSizingMode = heightSizing
  }
  if (node.type !== 'INSTANCE') {
    await applyDimensions(node, layer, context)
    await applyStyle(node as FillableNode, layer.style, context)
  }
  // resize() turns an auto-height text box into a fixed one; restore it so
  // Figma can wrap the text and grow the layer.
  if (layer.type === 'TEXT' && node.type === 'TEXT' && layer.typography?.textAutoResize === 'HEIGHT') node.textAutoResize = 'HEIGHT'
  // A frame starts at Figma's default 100×100 and is resized to its real size
  // only after its children are appended, so constraints set any earlier
  // would stretch children by that resize (a 1152px border becoming 2204px).
  // Apply them now — at the real size, before hug sizing lets the frame grow
  // and the constraints carry edge-pinned children (borders) along.
  for (const [child, childDefinition] of builtChildren) {
    if (childDefinition.constraints && 'constraints' in child) child.constraints = childDefinition.constraints
  }
  // resize() pins both axes to FIXED; restore hug sizing so content-sized
  // frames grow with their children (e.g. a heading Figma wraps onto 2 lines).
  if (layer.type === 'FRAME' && node.type === 'FRAME' && (layer.layout?.mode === 'HORIZONTAL' || layer.layout?.mode === 'VERTICAL')) {
    if (layer.layout.primaryAxisSizing === 'AUTO') node.primaryAxisSizingMode = 'AUTO'
    if (layer.layout.counterAxisSizing === 'AUTO') node.counterAxisSizingMode = 'AUTO'
  }
  if (layer.type === 'TEXT' && node.type === 'TEXT') {
    await applyTextRanges(node, layer, context)
    if (layer.typography?.textWrap === 'BALANCE') balanceLines(node)
  }
  return node
}

/** CSS `text-wrap: balance`, computed with Figma's own font metrics: keep
 *  the number of lines greedy wrapping needs at the layer's width, but use
 *  the narrowest width that still fits in that many lines, so the lines come
 *  out even ("Dinner, in / black & white." rather than "Dinner, in black & /
 *  white."). The chosen breaks become explicit line breaks; the layer keeps
 *  its width. Like Chrome, only text of 2–6 lines is balanced. */
function balanceLines(node: TextNode): void {
  const text = node.characters
  if (text.includes('\n') || text.includes('\u2028')) return
  const spaces: number[] = []
  for (let index = 0; index < text.length; index += 1) if (text[index] === ' ') spaces.push(index)
  if (!spaces.length) return

  // Width of characters [start, end) on one line, measured on a clone so the
  // run keeps its exact per-character styling (weight, letter case, etc.).
  const widths = new Map<string, number>()
  const widthOf = (start: number, end: number): number => {
    const key = `${start}:${end}`
    const cached = widths.get(key)
    if (cached !== undefined) return cached
    const probe = node.clone()
    figma.currentPage.appendChild(probe)
    probe.textAutoResize = 'WIDTH_AND_HEIGHT'
    if (end < text.length) probe.deleteCharacters(end, text.length)
    if (start > 0) probe.deleteCharacters(0, start)
    const width = probe.width
    probe.remove()
    widths.set(key, width)
    return width
  }
  // Greedy line breaking at a given width: returns the break spaces.
  const greedy = (maxWidth: number): number[] => {
    const breaks: number[] = []
    let start = 0
    while (widthOf(start, text.length) > maxWidth + 0.01) {
      let fit = -1
      for (const space of spaces) {
        if (space <= start) continue
        if (widthOf(start, space) <= maxWidth + 0.01) fit = space
        else break
      }
      if (fit < 0) fit = spaces.find((space) => space > start) ?? -1
      if (fit < 0) break
      breaks.push(fit)
      start = fit + 1
    }
    return breaks
  }

  const lineCount = greedy(node.width).length + 1
  if (lineCount < 2 || lineCount > 6) return
  let low = 0
  let high = node.width
  for (let step = 0; step < 14; step += 1) {
    const mid = (low + high) / 2
    if (greedy(mid).length + 1 <= lineCount) high = mid
    else low = mid
  }
  // Same length in and out (space → newline), so styled ranges are kept.
  for (const index of greedy(high)) {
    node.deleteCharacters(index, index + 1)
    node.insertCharacters(index, '\n', 'BEFORE')
  }
}

async function preflight(
  document: ImportDocument,
  report: Report,
  registry: LibraryRegistry | null,
): Promise<ImportContext> {
  const context = new ImportContext(document, report, registry)
  const usedComponents = new Set<string>()
  const usedVariables = new Set<string>()
  const usedTextStyles = new Set<string>()
  const fonts = new Map<string, FontName>()

  function collect(layer: LayerDefinition): void {
    if (layer.type === 'COMPONENT_INSTANCE') usedComponents.add(layer.component)
    if (layer.type === 'TEXT') {
      const font: FontName = {
        family: stringValue(layer.typography?.fontFamily, 'Inter'),
        style: stringValue(layer.typography?.fontStyle, 'Regular'),
      }
      fonts.set(`${font.family}/${font.style}`, font)
      if (layer.typography?.textStyle) usedTextStyles.add(layer.typography.textStyle)
    }
    const serialized = JSON.stringify(layer)
    const variablePattern = /"variable"\s*:\s*"([^"]+)"/g
    let match: RegExpExecArray | null
    while ((match = variablePattern.exec(serialized))) usedVariables.add(match[1])
    if (layer.type === 'FRAME') layer.children?.forEach(collect)
  }
  document.screens.forEach((screen) => collect(screen.root))

  await Promise.all([...usedComponents].map((reference) => context.resolveComponent(reference, false)))
  await Promise.all([...usedVariables].map((reference) => context.resolveVariable(reference, false)))
  await Promise.all([...usedTextStyles].map((reference) => context.resolveTextStyle(reference, false)))
  await Promise.all([...fonts.values()].map(async (font) => {
    try {
      await figma.loadFontAsync(font)
    } catch {
      addIssue(report, 'ERROR', 'FONT_NOT_FOUND', `Font ${font.family} ${font.style} could not be loaded.`)
    }
  }))
  return context
}

function validateExpectedBounds(context: ImportContext): void {
  function inspect(layer: LayerDefinition): void {
    const expected = layer.expectedBounds
    const node = context.layerNodes.get(layer.id)
    if (expected && node) {
      const tolerance = expected.tolerance ?? 0.5
      const widthDelta = Math.abs(node.width - expected.width)
      const heightDelta = Math.abs(node.height - expected.height)
      if (widthDelta > tolerance || heightDelta > tolerance) {
        addIssue(
          context.report,
          'WARNING',
          'BOUNDS_MISMATCH',
          `${layer.name} rendered ${node.width.toFixed(1)}×${node.height.toFixed(1)}, expected ${expected.width}×${expected.height}.`,
          layer.id,
        )
      }
    }
    if (layer.type === 'FRAME') layer.children?.forEach(inspect)
  }
  context.document.screens.forEach((screen) => inspect(screen.root))
}

function isGeneratedNode(node: SceneNode): node is GeneratedNode {
  return ['FRAME', 'RECTANGLE', 'ELLIPSE', 'TEXT', 'INSTANCE'].includes(node.type)
}

function findExistingScreen(screenId: string): GeneratedNode | null {
  const node = figma.currentPage.findOne((candidate) => candidate.getPluginData(ROOT_PLUGIN_KEY) === screenId)
  return node && isGeneratedNode(node) ? node : null
}

function serializeComponentProperties(
  definitions: ComponentPropertyDefinitions,
): Record<string, RegistryComponentProperty> {
  const serialized: Record<string, RegistryComponentProperty> = {}
  for (const [name, definition] of Object.entries(definitions)) {
    serialized[name] = {
      type: definition.type,
      ...('variantOptions' in definition ? { variantOptions: definition.variantOptions } : {}),
    }
  }
  return serialized
}

async function exportLibraryRegistry(): Promise<LibraryRegistry> {
  await figma.loadAllPagesAsync()
  const componentNodes: Array<{ node: ComponentNode | ComponentSetNode; pageName: string }> = []

  for (const page of figma.root.children) {
    const nodes = page.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] })
    for (const node of nodes) {
      if (node.type === 'COMPONENT' && node.parent?.type === 'COMPONENT_SET') continue
      componentNodes.push({ node, pageName: page.name })
    }
  }

  const components: RegistryComponent[] = []
  const scanWarnings: RegistryScanWarning[] = []
  for (const { node, pageName } of componentNodes) {
    let properties: Record<string, RegistryComponentProperty> = {}
    try {
      properties = serializeComponentProperties(node.componentPropertyDefinitions)
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      scanWarnings.push({
        code: 'COMPONENT_PROPERTY_DEFINITIONS_UNAVAILABLE',
        componentName: node.name,
        componentNodeId: node.id,
        message: `Component "${node.name}" was registered, but its property definitions could not be read: ${detail}`,
      })
    }
    components.push({
      name: node.name,
      normalizedName: normalizeRegistryName(node.name),
      key: node.key,
      nodeId: node.id,
      kind: node.type,
      pageName,
      publishStatus: await node.getPublishStatusAsync(),
      properties,
    })
  }

  const collections = await figma.variables.getLocalVariableCollectionsAsync()
  const collectionNames = new Map(collections.map((collection) => [collection.id, collection.name]))
  const localVariables = await figma.variables.getLocalVariablesAsync()
  const variables: RegistryVariable[] = []
  for (const variable of localVariables) {
    variables.push({
      name: variable.name,
      normalizedName: normalizeRegistryName(variable.name),
      key: variable.key,
      id: variable.id,
      collectionName: collectionNames.get(variable.variableCollectionId) ?? 'Unknown collection',
      type: variable.resolvedType,
      publishStatus: await variable.getPublishStatusAsync(),
    })
  }

  const serializeStyles = async (styles: ReadonlyArray<TextStyle | PaintStyle | EffectStyle | GridStyle>): Promise<RegistryStyle[]> => {
    const registryStyles: RegistryStyle[] = []
    for (const style of styles) {
      registryStyles.push({
      name: style.name,
      normalizedName: normalizeRegistryName(style.name),
      key: style.key,
      id: style.id,
      publishStatus: await style.getPublishStatusAsync(),
      })
    }
    return registryStyles.sort((a, b) => a.name.localeCompare(b.name))
  }

  const [textStyles, paintStyles, effectStyles, gridStyles] = await Promise.all([
    figma.getLocalTextStylesAsync().then(serializeStyles),
    figma.getLocalPaintStylesAsync().then(serializeStyles),
    figma.getLocalEffectStylesAsync().then(serializeStyles),
    figma.getLocalGridStylesAsync().then(serializeStyles),
  ])

  const registry: LibraryRegistry = {
    schemaVersion: '1.0',
    fileKey: figma.fileKey,
    capturedAt: new Date().toISOString(),
    components: components.sort((a, b) => a.name.localeCompare(b.name)),
    variables: variables.sort((a, b) => a.name.localeCompare(b.name)),
    textStyles,
    paintStyles,
    effectStyles,
    gridStyles,
    ...(scanWarnings.length ? { scanWarnings } : {}),
  }
  await figma.clientStorage.setAsync(REGISTRY_STORAGE_KEY, registry)
  return registry
}

async function loadStoredRegistry(): Promise<LibraryRegistry | null> {
  const stored: unknown = await figma.clientStorage.getAsync(REGISTRY_STORAGE_KEY)
  if (!isRecord(stored) || stored.schemaVersion !== '1.0') return null
  if (!Array.isArray(stored.components) || !Array.isArray(stored.variables)) return null
  return stored as unknown as LibraryRegistry
}

async function importDocument(
  document: ImportDocument,
  report: Report,
  options: ImportOptions,
  registry: LibraryRegistry | null,
): Promise<void> {
  const context = await preflight(document, report, registry)
  if (!report.ok) return

  const completedRoots: GeneratedNode[] = []
  const replacements: Array<{ existing: GeneratedNode | null; root: GeneratedNode }> = []
  let nextX = figma.viewport.center.x
  const baselineY = figma.viewport.center.y

  try {
    for (const screen of document.screens) {
      const existing = options.updateExisting ? findExistingScreen(screen.id) : null
      const root = await buildLayer(screen.root, context)
      root.setPluginData(ROOT_PLUGIN_KEY, screen.id)
      root.name = screen.name
      root.x = existing?.x ?? nextX
      root.y = existing?.y ?? baselineY
      figma.currentPage.appendChild(root)
      completedRoots.push(root)
      replacements.push({ existing, root })
      nextX = root.x + root.width + 120
      if (!report.ok) throw new Error(`Screen "${screen.name}" contains unresolved mappings.`)
    }
    validateExpectedBounds(context)
    replacements.forEach(({ existing }) => {
      if (existing) {
        existing.remove()
        report.summary.updated += 1
      } else {
        report.summary.created += 1
      }
    })
    figma.currentPage.selection = completedRoots
    figma.viewport.scrollAndZoomIntoView(completedRoots)
  } catch (error) {
    context.createdNodes.forEach((node) => {
      if (!node.removed) node.remove()
    })
    addIssue(report, 'ERROR', 'IMPORT_FAILED', error instanceof Error ? error.message : String(error))
  }
}

async function handleMessage(message: UIMessage): Promise<void> {
  if (message.type === 'close') {
    figma.closePlugin()
    return
  }

  figma.ui.postMessage({ type: 'busy', busy: true })
  if (message.type === 'get-registry') {
    const registry = await loadStoredRegistry()
    figma.ui.postMessage({ type: 'registry-result', registry })
    figma.ui.postMessage({ type: 'busy', busy: false })
    return
  }
  if (message.type === 'export-registry') {
    const registry = await exportLibraryRegistry()
    figma.ui.postMessage({ type: 'registry-result', registry })
    figma.ui.postMessage({ type: 'busy', busy: false })
    return
  }

  const registry = await loadStoredRegistry()
  const validation = validateDocument(message.document)

  if (message.type === 'validate' && validation.document) {
    await preflight(validation.document, validation.report, registry)
  }

  if (message.type === 'validate' || !validation.document || !validation.report.ok) {
    figma.ui.postMessage({ type: 'validation-result', report: validation.report })
    figma.ui.postMessage({ type: 'busy', busy: false })
    return
  }

  const report = validation.report
  await importDocument(validation.document, report, message.options, registry)
  figma.ui.postMessage({ type: 'import-result', report })
  figma.ui.postMessage({ type: 'busy', busy: false })
}

figma.showUI(__html__, { width: 480, height: 680, themeColors: true })
figma.ui.onmessage = (message: UIMessage) => {
  handleMessage(message).catch((error) => {
    const report = emptyReport()
    addIssue(report, 'ERROR', 'UNEXPECTED_ERROR', error instanceof Error ? error.message : String(error))
    figma.ui.postMessage({ type: 'import-result', report })
    figma.ui.postMessage({ type: 'busy', busy: false })
  })
}
