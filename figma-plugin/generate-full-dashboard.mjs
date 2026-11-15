import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const outputUrl = new URL('./examples/insurance-dashboard-full.json', import.meta.url)

const palette = {
  surfacePrimary: { value: '#FAFAFA', variable: 'surface/base/primary' },
  surfaceSecondary: { value: '#EFEFF0', variable: 'surface/base/secondary' },
  textPrimary: { value: '#0F0F10', variable: 'text/primary' },
  textSecondary: { value: '#474649', variable: 'text/secondary' },
  border: '#DCDCDC',
  brand: '#6841E6',
  brandStrong: '#795DEE',
  brandDark: '#5A1FD4',
  brandSubtle: '#EAE0FE',
  green: '#16803C',
  greenSubtle: '#DCFCE7',
  orange: '#B45309',
  orangeSubtle: '#FFE5CC',
  red: '#EF4444',
  blue: '#2563EB',
  white: '#FFFFFF',
}

const paint = (color, opacity) => ({ type: 'SOLID', color, ...(opacity === undefined ? {} : { opacity }) })
const padding = (top, right = top, bottom = top, left = right) => ({ top, right, bottom, left })
const vertical = (gap = 0, pad, primaryAxisAlign = 'MIN', counterAxisAlign = 'MIN') => ({
  mode: 'VERTICAL',
  primaryAxisSizing: 'FIXED',
  counterAxisSizing: 'FIXED',
  primaryAxisAlign,
  counterAxisAlign,
  ...(gap ? { gap } : {}),
  ...(pad ? { padding: pad } : {}),
})
const horizontal = (gap = 0, pad, primaryAxisAlign = 'MIN', counterAxisAlign = 'CENTER') => ({
  mode: 'HORIZONTAL',
  primaryAxisSizing: 'FIXED',
  counterAxisSizing: 'FIXED',
  primaryAxisAlign,
  counterAxisAlign,
  ...(gap ? { gap } : {}),
  ...(pad ? { padding: pad } : {}),
})

function frame(id, name, options = {}) {
  const { children = [], fills, strokes, strokeWeight, cornerRadius, effects, ...rest } = options
  const style = {
    ...(fills ? { fills: fills.map((color) => paint(color)) } : {}),
    ...(strokes ? { strokes: strokes.map((color) => paint(color)) } : {}),
    ...(strokeWeight === undefined ? {} : { strokeWeight }),
    ...(cornerRadius === undefined ? {} : { cornerRadius }),
    ...(effects ? { effects } : {}),
  }
  return {
    id,
    name,
    type: 'FRAME',
    ...rest,
    ...(Object.keys(style).length ? { style } : {}),
    children,
  }
}

function text(id, name, characters, options = {}) {
  const {
    size = 14,
    lineHeight = 18,
    fontStyle = 'Regular',
    color = palette.textPrimary,
    width,
    height,
    align = 'LEFT',
    autoResize = width ? 'HEIGHT' : 'WIDTH_AND_HEIGHT',
    ...rest
  } = options
  return {
    id,
    name,
    type: 'TEXT',
    characters,
    ...(width === undefined ? {} : { width }),
    ...(height === undefined ? {} : { height }),
    ...rest,
    typography: {
      fontFamily: 'Euclid Circular B',
      fontStyle,
      fontSize: size,
      lineHeight,
      textAlignHorizontal: align,
      textAutoResize: autoResize,
    },
    style: { fills: [paint(color)] },
  }
}

function rectangle(id, name, width, height, color, cornerRadius = 0, layoutChild) {
  return {
    id,
    name,
    type: 'RECTANGLE',
    width,
    height,
    ...(layoutChild ? { layoutChild } : {}),
    style: { fills: [paint(color)], ...(cornerRadius ? { cornerRadius } : {}) },
  }
}

function ellipse(id, name, width, height, color) {
  return { id, name, type: 'ELLIPSE', width, height, style: { fills: [paint(color)] } }
}

function component(id, name, componentName, properties, options = {}) {
  return {
    id,
    name,
    type: 'COMPONENT_INSTANCE',
    component: componentName,
    ...(properties ? { properties } : {}),
    ...options,
  }
}

const iconPaths = {
  home: '<path d="M3 10.5 10 4l7 6.5V18H6v-7.5Z"/><path d="M8.5 18v-5h3v5"/>',
  policies: '<rect x="4" y="3" width="12" height="14" rx="2"/><path d="M7 7h6M7 10h6M7 13h4"/>',
  claims: '<circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/>',
  help: '<circle cx="10" cy="10" r="7"/><path d="M8.3 8a2 2 0 1 1 2.8 1.8c-.8.4-1.1.8-1.1 1.7M10 14h.01"/>',
  bell: '<path d="M5 14h10l-1.3-2V8a3.7 3.7 0 0 0-7.4 0v4L5 14Z"/><path d="M8.5 16h3"/>',
  shield: '<path d="M10 2.5 16 5v4.7c0 3.8-2.5 6.3-6 7.8-3.5-1.5-6-4-6-7.8V5l6-2.5Z"/><path d="m7.5 10 1.7 1.7 3.6-3.8"/>',
  diamond: '<path d="m10 3 6 7-6 7-6-7 6-7Z"/><path d="m7 10 3 3 3-6"/>',
  clock: '<circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/>',
  car: '<path d="m4 12 1.5-4h9L16 12M3 12h14v4H3v-4Z"/><circle cx="6" cy="16" r="1"/><circle cx="14" cy="16" r="1"/>',
  health: '<path d="M8 3h4v5h5v4h-5v5H8v-5H3V8h5V3Z"/>',
  travel: '<path d="m3 11 14-7-5 13-2-5-7-1Z"/><path d="m10 12 7-8"/>',
  arrow: '<path d="M5 15 15 5M8 5h7v7"/>',
}

function svgIcon(id, name, icon, color = palette.textSecondary, size = 20) {
  return {
    id,
    name,
    type: 'SVG',
    width: size,
    height: size,
    svg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${iconPaths[icon]}</svg>`,
  }
}

function iconBox(id, icon, background, color = palette.textSecondary, size = 36) {
  return frame(`${id}-box`, 'Icon', {
    width: size,
    height: size,
    cornerRadius: 12,
    fills: [background],
    layout: horizontal(0, undefined, 'CENTER', 'CENTER'),
    children: [svgIcon(`${id}-svg`, 'Icon vector', icon, color, 20)],
  })
}

function logo(prefix, compact = false) {
  const size = compact ? 32 : 36
  return frame(`${prefix}-logo`, 'ACKO logo', {
    width: compact ? 96 : 112,
    height: size,
    layout: horizontal(8, undefined, 'MIN', 'CENTER'),
    children: [
      frame(`${prefix}-logo-mark`, 'ACKO mark', {
        width: size,
        height: size,
        cornerRadius: compact ? 8 : 12,
        fills: [palette.brandStrong],
        layout: horizontal(0, undefined, 'CENTER', 'CENTER'),
        children: [text(`${prefix}-logo-letter`, 'A', 'A', { size: compact ? 15 : 18, lineHeight: compact ? 18 : 22, fontStyle: 'Medium', color: palette.white })],
      }),
      text(`${prefix}-logo-word`, 'ACKO', 'ACKO', { size: compact ? 16 : 20, lineHeight: compact ? 20 : 24, fontStyle: 'Medium' }),
    ],
  })
}

function navItem(prefix, key, label, icon, active = false, badge = false) {
  const children = [
    svgIcon(`${prefix}-${key}-icon`, `${label} icon`, icon, active ? palette.brand : palette.textSecondary, 20),
    text(`${prefix}-${key}-label`, label, label, { size: 14, lineHeight: 18, fontStyle: active ? 'Medium' : 'Regular', color: active ? palette.brand : palette.textSecondary }),
  ]
  if (badge) {
    children.push(frame(`${prefix}-${key}-spacer`, 'Spacer', { width: 1, height: 1, layoutChild: { grow: 1 }, children: [] }))
    children.push(component(`${prefix}-${key}-count`, 'Policy count', 'CounterBadge', { color: 'purple', size: 'sm' }, {
      textOverrides: { Count: '3' },
    }))
  }
  return frame(`${prefix}-${key}`, label, {
    width: 216,
    height: 44,
    cornerRadius: 12,
    fills: active ? [palette.brandSubtle] : undefined,
    layout: horizontal(12, padding(12, 16), 'MIN', 'CENTER'),
    children,
  })
}

function button(prefix, label, variant = 'primary', size = 'sm', width, layoutChild) {
  return component(`${prefix}-button`, label, 'Button', { variant, size, label }, {
    ...(width ? { width } : {}),
    ...(layoutChild ? { layoutChild } : {}),
  })
}

function metricCard(prefix, label, value, caption, icon, iconBackground, captionColor = palette.textSecondary) {
  return frame(`${prefix}-card`, `${label} metric`, {
    height: 160,
    layoutChild: { grow: 1 },
    cornerRadius: 16,
    fills: [palette.surfacePrimary],
    strokes: [palette.border],
    strokeWeight: 1,
    layout: vertical(0, padding(20), 'SPACE_BETWEEN'),
    children: [
      frame(`${prefix}-top`, 'Metric heading', {
        height: 36,
        layoutChild: { align: 'STRETCH' },
        layout: horizontal(16, undefined, 'SPACE_BETWEEN', 'CENTER'),
        children: [
          text(`${prefix}-label`, 'Metric label', label, { size: 14, lineHeight: 18, color: palette.textSecondary }),
          iconBox(`${prefix}-icon`, icon, iconBackground, icon === 'shield' ? palette.brand : palette.textSecondary),
        ],
      }),
      frame(`${prefix}-value-group`, 'Metric value', {
        height: 54,
        layout: vertical(2),
        children: [
          text(`${prefix}-value`, 'Metric value', value, { size: 30, lineHeight: 36, fontStyle: 'Medium' }),
          text(`${prefix}-caption`, 'Metric caption', caption, { size: 12, lineHeight: 16, color: captionColor }),
        ],
      }),
    ],
  })
}

const policyData = [
  { key: 'car', type: 'Car insurance', title: 'Hyundai Creta', detail: 'KA 01 AB 1234', renewal: 'Renews 24 Sep 2026', premium: '₹12,480', status: 'Active', color: 'purple', icon: 'car' },
  { key: 'health', type: 'Health insurance', title: 'Platinum Health Plan', detail: '2 adults · ₹10L cover', renewal: 'Renews 08 Jan 2027', premium: '₹18,960', status: 'Active', color: 'green', icon: 'health' },
  { key: 'travel', type: 'Travel insurance', title: 'Europe Trip Cover', detail: '12 Oct – 26 Oct 2026', renewal: 'Single trip policy', premium: '₹2,140', status: 'Upcoming', color: 'blue', icon: 'travel' },
]

function policyCard(prefix, policy) {
  const id = `${prefix}-${policy.key}`
  return frame(`${id}-card`, policy.title, {
    height: 243,
    layoutChild: { grow: 1 },
    cornerRadius: 16,
    fills: [palette.surfacePrimary],
    strokes: [palette.border],
    strokeWeight: 1,
    layout: vertical(0, padding(20), 'SPACE_BETWEEN'),
    children: [
      frame(`${id}-top`, 'Policy status', {
        height: 48,
        layoutChild: { align: 'STRETCH' },
        layout: horizontal(16, undefined, 'SPACE_BETWEEN', 'MIN'),
        children: [
          iconBox(`${id}-icon`, policy.icon, '#F1F1F2', palette.textSecondary, 48),
          component(`${id}-status`, policy.status, 'Badge', { color: policy.color, size: 'sm', variant: 'outline' }, {
            textOverrides: { Label: policy.status },
          }),
        ],
      }),
      frame(`${id}-details`, 'Policy details', {
        height: 68,
        layout: vertical(3),
        children: [
          text(`${id}-type`, 'Policy type', policy.type, { size: 12, lineHeight: 16, color: palette.textSecondary }),
          text(`${id}-title`, 'Policy title', policy.title, { size: 18, lineHeight: 22, fontStyle: 'Medium' }),
          text(`${id}-detail`, 'Policy detail', policy.detail, { size: 14, lineHeight: 18, color: palette.textSecondary }),
        ],
      }),
      frame(`${id}-footer`, 'Renewal and action', {
        height: 60,
        layoutChild: { align: 'STRETCH' },
        layout: vertical(11),
        children: [
          rectangle(`${id}-separator`, 'Separator', 1, 1, palette.border, 0, { align: 'STRETCH' }),
          frame(`${id}-footer-row`, 'Policy footer', {
            height: 48,
            layoutChild: { align: 'STRETCH' },
            layout: horizontal(12, undefined, 'SPACE_BETWEEN', 'MAX'),
            children: [
              frame(`${id}-price`, 'Renewal and premium', {
                height: 43,
                layout: vertical(3),
                children: [
                  text(`${id}-renewal`, 'Renewal', policy.renewal, { size: 12, lineHeight: 16, color: palette.textSecondary }),
                  text(`${id}-premium`, 'Premium', policy.premium, { size: 16, lineHeight: 20, fontStyle: 'Medium' }),
                ],
              }),
              button(`${id}-view`, 'View details', 'secondary', 'sm'),
            ],
          }),
        ],
      }),
    ],
  })
}

function rawDropdown(prefix, width) {
  return frame(`${prefix}-dropdown`, 'Policy filter', {
    width,
    height: 62,
    layout: vertical(4),
    children: [
      text(`${prefix}-dropdown-label`, 'Filter label', 'Filter by', { size: 12, lineHeight: 18, fontStyle: 'Medium' }),
      frame(`${prefix}-dropdown-field`, 'All policies', {
        width,
        height: 40,
        cornerRadius: 10,
        fills: [palette.surfacePrimary],
        strokes: [palette.border],
        strokeWeight: 1,
        layout: horizontal(12, padding(10, 12), 'SPACE_BETWEEN', 'CENTER'),
        children: [
          text(`${prefix}-dropdown-value`, 'Selected option', 'All policies', { size: 14, lineHeight: 18 }),
          text(`${prefix}-dropdown-chevron`, 'Chevron', '⌄', { size: 16, lineHeight: 18, color: palette.textSecondary }),
        ],
      }),
    ],
  })
}

function policySection(prefix, mobile) {
  const width = mobile ? 350 : 1104
  const header = mobile
    ? frame(`${prefix}-policies-header`, 'Policies heading and filter', {
        width,
        height: 126,
        layout: vertical(16),
        children: [
          frame(`${prefix}-policies-heading`, 'Policies heading', {
            height: 48,
            layout: vertical(3),
            children: [
              text(`${prefix}-policies-title`, 'Section title', 'Your policies', { size: 24, lineHeight: 30, fontStyle: 'Medium' }),
              text(`${prefix}-policies-copy`, 'Section description', 'Manage coverage, renewals, and documents.', { size: 14, lineHeight: 18, color: palette.textSecondary }),
            ],
          }),
          rawDropdown(`${prefix}-policies`, width),
        ],
      })
    : frame(`${prefix}-policies-header`, 'Policies heading and filter', {
        width,
        height: 62,
        layout: horizontal(24, undefined, 'SPACE_BETWEEN', 'MAX'),
        children: [
          frame(`${prefix}-policies-heading`, 'Policies heading', {
            height: 52,
            layout: vertical(4),
            children: [
              text(`${prefix}-policies-title`, 'Section title', 'Your policies', { size: 24, lineHeight: 30, fontStyle: 'Medium' }),
              text(`${prefix}-policies-copy`, 'Section description', 'Manage coverage, renewals, and documents.', { size: 14, lineHeight: 18, color: palette.textSecondary }),
            ],
          }),
          rawDropdown(`${prefix}-policies`, 224),
        ],
      })
  return frame(`${prefix}-policies-section`, 'Your policies', {
    width,
    height: mobile ? 907 : 325,
    layout: vertical(20),
    children: [
      header,
      frame(`${prefix}-policy-cards`, 'Policy cards', {
        width,
        height: mobile ? 761 : 243,
        layout: mobile ? vertical(16) : horizontal(16),
        children: policyData.map((policy) => policyCard(`${prefix}-policy`, policy)),
      }),
    ],
  })
}

function sectionHeading(prefix, title, description, action) {
  return frame(`${prefix}-heading`, `${title} heading`, {
    height: 49,
    layoutChild: { align: 'STRETCH' },
    layout: horizontal(16, undefined, 'SPACE_BETWEEN', 'MIN'),
    children: [
      frame(`${prefix}-heading-copy`, 'Heading copy', {
        height: 49,
        layout: vertical(3),
        children: [
          text(`${prefix}-title`, 'Section title', title, { size: 24, lineHeight: 30, fontStyle: 'Medium' }),
          text(`${prefix}-description`, 'Section description', description, { size: 14, lineHeight: 18, color: palette.textSecondary }),
        ],
      }),
      ...(action ? [button(`${prefix}-action`, action, 'ghost', 'sm')] : []),
    ],
  })
}

function progressStep(prefix, label, active) {
  return frame(`${prefix}-step`, label, {
    height: 34,
    layoutChild: { grow: 1 },
    layout: vertical(8),
    children: [
      rectangle(`${prefix}-bar`, 'Progress bar', 1, 6, active ? palette.brandStrong : '#E4E4E6', 999, { align: 'STRETCH' }),
      text(`${prefix}-label`, 'Step label', label, { size: 12, lineHeight: 16, color: active ? palette.brand : palette.textSecondary }),
    ],
  })
}

function claimSection(prefix, mobile) {
  const width = mobile ? 350 : 621
  const cardHeight = mobile ? 301 : 243
  return frame(`${prefix}-claims-section`, 'Recent claim', {
    width,
    height: mobile ? 370 : 312,
    layout: vertical(20),
    children: [
      sectionHeading(`${prefix}-claims`, 'Recent claim', 'Follow your claim progress.', 'View all'),
      frame(`${prefix}-claim-card`, 'Car repair claim', {
        width,
        height: cardHeight,
        cornerRadius: 16,
        fills: [palette.surfacePrimary],
        strokes: [palette.border],
        strokeWeight: 1,
        layout: vertical(0, padding(mobile ? 20 : 24), 'SPACE_BETWEEN'),
        children: [
          frame(`${prefix}-claim-summary`, 'Claim summary', {
            height: mobile ? 82 : 48,
            layoutChild: { align: 'STRETCH' },
            layout: mobile ? vertical(12) : horizontal(16, undefined, 'SPACE_BETWEEN', 'MIN'),
            children: [
              frame(`${prefix}-claim-identification`, 'Claim identification', {
                height: 48,
                layout: horizontal(16, undefined, 'MIN', 'CENTER'),
                children: [
                  iconBox(`${prefix}-claim-icon`, 'arrow', palette.orangeSubtle, palette.orange, 48),
                  frame(`${prefix}-claim-copy`, 'Claim copy', {
                    height: 43,
                    layout: vertical(3),
                    children: [
                      text(`${prefix}-claim-title`, 'Claim title', 'Car repair claim', { size: 16, lineHeight: 20, fontStyle: 'Medium' }),
                      text(`${prefix}-claim-number`, 'Claim number', 'CLM-2408-1842 · Hyundai Creta', { size: 14, lineHeight: 18, color: palette.textSecondary }),
                    ],
                  }),
                ],
              }),
              component(`${prefix}-claim-status`, 'Under review', 'Badge', { color: 'orange', size: 'md', variant: 'solid' }, {
                textOverrides: { Label: 'Under review' },
              }),
            ],
          }),
          frame(`${prefix}-claim-progress`, 'Claim progress', {
            height: 34,
            layoutChild: { align: 'STRETCH' },
            layout: horizontal(8),
            children: [
              progressStep(`${prefix}-submitted`, 'Submitted', true),
              progressStep(`${prefix}-review`, 'Under review', true),
              progressStep(`${prefix}-settled`, 'Settled', false),
            ],
          }),
          frame(`${prefix}-claim-update`, 'Expected update', {
            height: mobile ? 80 : 56,
            cornerRadius: 12,
            fills: ['#F1F1F2'],
            layout: mobile
              ? vertical(10, padding(12, 16), 'MIN', 'MIN')
              : horizontal(12, padding(8, 16), 'SPACE_BETWEEN', 'CENTER'),
            children: [
              text(`${prefix}-claim-update-copy`, 'Expected update date', 'Expected update by 02 September 2026', { size: 14, lineHeight: 18, color: palette.textSecondary }),
              button(`${prefix}-track`, 'Track claim', 'secondary', 'sm'),
            ],
          }),
        ],
      }),
    ],
  })
}

const helpItems = [
  ['raise', 'How do I raise a claim?', 'Choose the insured policy, tell us what happened, and upload the requested documents.'],
  ['documents', 'Where can I download my policy documents?', 'Open a policy card and select View details. Your policy documents are available under Documents.'],
  ['renewal', 'Can I change my cover during renewal?', 'Yes. You can update your cover, add-ons, and personal details before completing renewal.'],
]

function helpSection(prefix, mobile) {
  const width = mobile ? 350 : 459
  return frame(`${prefix}-help-section`, 'Quick help', {
    width,
    height: mobile ? 250 : 312,
    layout: vertical(20),
    children: [
      sectionHeading(`${prefix}-help`, 'Quick help', 'Answers to common questions.'),
      frame(`${prefix}-help-card`, 'Common questions', {
        width,
        height: mobile ? 181 : 243,
        cornerRadius: 16,
        fills: [palette.surfacePrimary],
        strokes: [palette.border],
        strokeWeight: 1,
        layout: vertical(0, padding(mobile ? 12 : 16)),
        children: helpItems.map(([key, title, body]) => component(`${prefix}-help-${key}`, title, 'Accordion', { state: 'closed', size: 'sm' }, {
          height: mobile ? 52 : 69,
          layoutChild: { align: 'STRETCH' },
          textOverrides: { 'Title Text': title, 'Body Text': body },
        })),
      }),
    ],
  })
}

function hero(prefix, mobile) {
  const width = mobile ? 350 : 1104
  const copyWidth = mobile ? 350 : 720
  return frame(`${prefix}-overview`, 'Overview', {
    width,
    height: mobile ? 750 : 270,
    layout: vertical(32),
    children: [
      frame(`${prefix}-hero`, 'Dashboard introduction', {
        width,
        height: mobile ? 206 : 78,
        layout: mobile ? vertical(20) : horizontal(20, undefined, 'SPACE_BETWEEN', 'MAX'),
        children: [
          frame(`${prefix}-hero-copy`, 'Greeting', {
            width: copyWidth,
            height: mobile ? 146 : 78,
            layout: vertical(0),
            children: [
              text(`${prefix}-date`, 'Date', 'Monday, 31 August', { size: 14, lineHeight: 18, color: palette.textSecondary }),
              text(`${prefix}-greeting`, 'Greeting', 'Good morning, Sandeep', { width: copyWidth, size: 36, lineHeight: 40, fontStyle: 'Medium' }),
              text(`${prefix}-intro`, 'Introduction', 'Here’s everything about your protection in one place.', { width: copyWidth, size: 16, lineHeight: 20, color: palette.textSecondary }),
            ],
          }),
          button(`${prefix}-buy`, '+ Buy new insurance', 'primary', 'md', mobile ? undefined : undefined, mobile ? { align: 'INHERIT' } : undefined),
        ],
      }),
      frame(`${prefix}-metrics`, 'Protection metrics', {
        width,
        height: mobile ? 512 : 160,
        layout: mobile ? vertical(16) : horizontal(16),
        children: [
          metricCard(`${prefix}-active`, 'Active policies', '3', 'All policies are protected', 'shield', palette.brandSubtle, palette.green),
          metricCard(`${prefix}-cover`, 'Total cover', '₹25.4L', 'Across all your policies', 'diamond', palette.greenSubtle),
          metricCard(`${prefix}-open`, 'Open claims', '1', 'Last updated 2 hours ago', 'clock', palette.orangeSubtle, palette.brand),
        ],
      }),
    ],
  })
}

function breadcrumb(prefix) {
  return frame(`${prefix}-breadcrumb`, 'Breadcrumb', {
    height: 18,
    layout: horizontal(8),
    children: [
      text(`${prefix}-breadcrumb-home`, 'Home', 'Home', { size: 12, lineHeight: 18, color: palette.textSecondary }),
      text(`${prefix}-breadcrumb-separator`, 'Separator', '›', { size: 14, lineHeight: 18, color: palette.textSecondary }),
      text(`${prefix}-breadcrumb-current`, 'Overview', 'Overview', { size: 12, lineHeight: 18, fontStyle: 'Medium' }),
    ],
  })
}

function desktopSidebar() {
  return frame('d-sidebar', 'Sidebar', {
    width: 256,
    height: 1267,
    fills: [palette.surfacePrimary],
    strokes: [palette.border],
    strokeWeight: 1,
    layout: vertical(40, padding(24, 20)),
    children: [
      logo('d'),
      frame('d-navigation', 'Primary navigation', {
        width: 216,
        layoutChild: { grow: 1 },
        layout: vertical(8),
        children: [
          navItem('d-nav', 'overview', 'Overview', 'home', true),
          navItem('d-nav', 'policies', 'My policies', 'policies', false, true),
          navItem('d-nav', 'claims', 'Claims', 'claims'),
          navItem('d-nav', 'help', 'Help & support', 'help'),
        ],
      }),
      frame('d-plus-card', 'ACKO Plus', {
        width: 216,
        height: 142,
        cornerRadius: 16,
        fills: ['#F1F1F2'],
        layout: vertical(12, padding(16)),
        children: [
          component('d-plus-badge', 'ACKO PLUS', 'Badge', { color: 'purple', size: 'sm', variant: 'solid' }, {
            textOverrides: { Label: 'ACKO PLUS' },
          }),
          text('d-plus-copy', 'ACKO Plus description', 'Extra protection, less worry.', { width: 184, size: 14, lineHeight: 18, fontStyle: 'Medium' }),
          button('d-plus-explore', 'Explore benefits', 'secondary', 'sm', 184),
        ],
      }),
    ],
  })
}

function desktopHeader() {
  return frame('d-header', 'Header', {
    width: 1184,
    height: 73,
    fills: [palette.surfacePrimary],
    strokes: [palette.border],
    strokeWeight: 1,
    layout: horizontal(16, padding(16, 40), 'SPACE_BETWEEN', 'CENTER'),
    children: [
      component('d-search', 'Search policies', 'TextInput', { inputType: 'regular', state: 'default', size: 'sm', showLabel: false, showHelper: false }, {
        width: 448,
        textOverrides: { 'Placeholder Text': 'Search policies, claims, or documents' },
      }),
      frame('d-account', 'Account controls', {
        height: 40,
        layout: horizontal(12, undefined, 'MIN', 'CENTER'),
        children: [
          frame('d-notification', 'Notifications', {
            width: 40,
            height: 40,
            cornerRadius: 999,
            fills: [palette.surfacePrimary],
            strokes: [palette.border],
            strokeWeight: 1,
            layout: horizontal(0, undefined, 'CENTER', 'CENTER'),
            children: [svgIcon('d-notification-icon', 'Notification bell', 'bell', palette.textSecondary, 20), ellipse('d-notification-dot', 'Unread indicator', 8, 8, palette.red)],
          }),
          frame('d-avatar', 'Sandeep avatar', {
            width: 40,
            height: 40,
            cornerRadius: 999,
            fills: [palette.brandSubtle],
            layout: horizontal(0, undefined, 'CENTER', 'CENTER'),
            children: [text('d-avatar-initials', 'Initials', 'SP', { size: 14, lineHeight: 18, fontStyle: 'Medium', color: palette.brandDark })],
          }),
          frame('d-account-copy', 'Account name', {
            height: 38,
            layout: vertical(2),
            children: [
              text('d-account-name', 'Account holder', 'Sandeep', { size: 14, lineHeight: 18, fontStyle: 'Medium' }),
              text('d-account-type', 'Account type', 'Personal account', { size: 12, lineHeight: 16, color: palette.textSecondary }),
            ],
          }),
        ],
      }),
    ],
  })
}

function desktopMain() {
  return frame('d-main', 'Dashboard content', {
    width: 1184,
    height: 1129,
    fills: [palette.surfaceSecondary],
    layout: vertical(0, padding(40)),
    children: [
      breadcrumb('d'),
      frame('d-overview-offset', 'Overview spacing', {
        width: 1104,
        height: 298,
        layout: vertical(0, padding(28, 0, 0, 0)),
        children: [hero('d', false)],
      }),
      frame('d-policies-offset', 'Policies spacing', {
        width: 1104,
        height: 373,
        layout: vertical(0, padding(48, 0, 0, 0)),
        children: [policySection('d', false)],
      }),
      frame('d-lower-offset', 'Claims and help spacing', {
        width: 1104,
        height: 360,
        layout: vertical(0, padding(48, 0, 0, 0)),
        children: [
          frame('d-lower-grid', 'Claims and quick help', {
            width: 1104,
            height: 312,
            layout: horizontal(24),
            children: [claimSection('d', false), helpSection('d', false)],
          }),
        ],
      }),
    ],
  })
}

function footer(prefix, width, mobile) {
  return frame(`${prefix}-footer`, 'Footer', {
    width,
    height: mobile ? 93 : 65,
    fills: [palette.surfaceSecondary],
    strokes: [palette.border],
    strokeWeight: 1,
    layout: mobile
      ? vertical(12, padding(24, 20))
      : horizontal(12, padding(24, 40), 'SPACE_BETWEEN', 'CENTER'),
    children: [
      text(`${prefix}-copyright`, 'Copyright', '© 2026 ACKO General Insurance Limited', { size: 12, lineHeight: 16, color: palette.textSecondary }),
      text(`${prefix}-legal`, 'Legal links', 'Privacy · Terms · Security', { size: 12, lineHeight: 16, color: palette.textSecondary }),
    ],
  })
}

function desktopScreen() {
  return {
    id: 'insurance-dashboard-full-desktop',
    name: 'Insurance dashboard · Full desktop',
    viewport: { width: 1440, height: 1267 },
    root: frame('d-root', 'Insurance dashboard', {
      width: 1440,
      height: 1267,
      expectedBounds: { width: 1440, height: 1267, tolerance: 1 },
      fills: [palette.surfaceSecondary],
      layout: horizontal(0),
      children: [
        desktopSidebar(),
        frame('d-content', 'Page content', {
          width: 1184,
          height: 1267,
          layout: vertical(0),
          children: [desktopHeader(), desktopMain(), footer('d', 1184, false)],
        }),
      ],
    }),
  }
}

function mobileHeader() {
  return frame('m-header', 'Mobile header', {
    width: 390,
    height: 73,
    fills: [palette.surfacePrimary],
    strokes: [palette.border],
    strokeWeight: 1,
    layout: horizontal(12, padding(16, 20), 'SPACE_BETWEEN', 'CENTER'),
    children: [
      logo('m', true),
      frame('m-account', 'Account controls', {
        height: 40,
        layout: horizontal(12, undefined, 'MIN', 'CENTER'),
        children: [
          frame('m-notification', 'Notifications', {
            width: 40,
            height: 40,
            cornerRadius: 999,
            fills: [palette.surfacePrimary],
            strokes: [palette.border],
            strokeWeight: 1,
            layout: horizontal(0, undefined, 'CENTER', 'CENTER'),
            children: [svgIcon('m-notification-icon', 'Notification bell', 'bell', palette.textSecondary, 20), ellipse('m-notification-dot', 'Unread indicator', 8, 8, palette.red)],
          }),
          frame('m-avatar', 'Sandeep avatar', {
            width: 40,
            height: 40,
            cornerRadius: 999,
            fills: [palette.brandSubtle],
            layout: horizontal(0, undefined, 'CENTER', 'CENTER'),
            children: [text('m-avatar-initials', 'Initials', 'SP', { size: 14, lineHeight: 18, fontStyle: 'Medium', color: palette.brandDark })],
          }),
        ],
      }),
    ],
  })
}

function mobileMain() {
  return frame('m-main', 'Dashboard content', {
    width: 390,
    height: 2491,
    fills: [palette.surfaceSecondary],
    layout: vertical(0, padding(24, 20)),
    children: [
      breadcrumb('m'),
      frame('m-overview-offset', 'Overview spacing', {
        width: 350,
        height: 778,
        layout: vertical(0, padding(28, 0, 0, 0)),
        children: [hero('m', true)],
      }),
      frame('m-policies-offset', 'Policies spacing', {
        width: 350,
        height: 955,
        layout: vertical(0, padding(48, 0, 0, 0)),
        children: [policySection('m', true)],
      }),
      frame('m-lower-offset', 'Claims and help spacing', {
        width: 350,
        height: 692,
        layout: vertical(0, padding(48, 0, 0, 0)),
        children: [
          frame('m-lower-stack', 'Claims and quick help', {
            width: 350,
            height: 644,
            layout: vertical(24),
            children: [claimSection('m', true), helpSection('m', true)],
          }),
        ],
      }),
    ],
  })
}

function mobileScreen() {
  return {
    id: 'insurance-dashboard-full-mobile',
    name: 'Insurance dashboard · Full mobile',
    viewport: { width: 390, height: 2657 },
    root: frame('m-root', 'Insurance dashboard', {
      width: 390,
      height: 2657,
      expectedBounds: { width: 390, height: 2657, tolerance: 1 },
      fills: [palette.surfaceSecondary],
      layout: vertical(0),
      children: [mobileHeader(), mobileMain(), footer('m', 390, true)],
    }),
  }
}

const manifest = {
  schemaVersion: '1.0',
  name: 'ACKO insurance dashboard · Full responsive page',
  variables: {
    'surface/base/primary': { libraryName: 'surfacePagePrimary', type: 'COLOR', required: true },
    'surface/base/secondary': { libraryName: 'surfacePageSecondary', type: 'COLOR', required: true },
    'text/primary': { libraryName: 'textPrimary', type: 'COLOR', required: true },
    'text/secondary': { libraryName: 'textSecondary', type: 'COLOR', required: true },
  },
  components: {
    Button: {
      libraryName: 'Button',
      sourceNodeId: '11754:617',
      propertyMappings: {
        variant: { figmaProperty: 'Type', values: { primary: 'Primary', secondary: 'Secondary', ghost: 'Ghost' } },
        size: { figmaProperty: 'Size', values: { sm: 'SM', md: 'MD', lg: 'LG' } },
        label: { figmaProperty: 'Label' },
      },
    },
    Badge: {
      libraryName: 'Badge',
      sourceNodeId: '7814:342',
      propertyMappings: {
        color: { figmaProperty: 'Hue', values: { purple: 'Purple', green: 'Green', blue: 'Blue', orange: 'Orange' } },
        size: { figmaProperty: 'Size', values: { sm: 'SM', md: 'MD', lg: 'LG' } },
        variant: { figmaProperty: 'Style', values: { solid: 'Solid', outline: 'Outline' } },
      },
    },
    CounterBadge: {
      libraryName: 'CounterBadge',
      sourceNodeId: '7815:246',
      propertyMappings: {
        color: { figmaProperty: 'Hue', values: { purple: 'Purple', green: 'Green', blue: 'Blue' } },
        size: { figmaProperty: 'Size', values: { sm: 'Sm', md: 'Md' } },
      },
    },
    TextInput: {
      libraryName: 'TextInput',
      sourceNodeId: '7098:216',
      propertyMappings: {
        inputType: { figmaProperty: 'Type', values: { regular: 'Regular input field' } },
        state: { figmaProperty: 'State', values: { default: 'Default' } },
        size: { figmaProperty: 'Size', values: { sm: 'SM', md: 'MD', lg: 'LG' } },
        showLabel: { figmaProperty: 'ShowLabel' },
        showHelper: { figmaProperty: 'ShowHelper' },
      },
    },
    Accordion: {
      libraryName: 'Accordion',
      sourceNodeId: '7104:182',
      propertyMappings: {
        state: { figmaProperty: 'State', values: { closed: 'Close', open: 'Open', disabled: 'Disabled' } },
        size: { figmaProperty: 'Size', values: { sm: 'SM', md: 'MD', lg: 'LG' } },
      },
    },
  },
  screens: [desktopScreen(), mobileScreen()],
}

writeFileSync(outputUrl, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Generated ${fileURLToPath(outputUrl)}`)
