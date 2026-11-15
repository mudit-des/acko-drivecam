# AGENTS.md — Rules for building pages

Pages in this repo are exported to Figma: `npm run figma:export` renders each route
in a browser, reads computed styles, and emits `figma-export-output/figma-import.json`,
which the Figma plugin (`figma-plugin/`) turns into layers. Write every page so that
export produces **clean, editable Auto Layout** — not absolutely positioned boxes.

The rules below come from how `tools/figma-export/emitter.ts` and `collector.ts`
actually map CSS. Follow them exactly.

---

## 1. Styling: inline Tailwind classes only

- Style with Tailwind utility classes written inline in `className`.
- No CSS modules, no new `.css` files, no `style={{}}` objects, no `styled-*`.
  Only exception: a truly dynamic value (e.g. a computed width) may use `style`.
- No `@apply`. Don't extract class strings into constants unless reused 3+ times.
- `@acko/tokens/theme.css` sets the spacing unit to **1px**: utility numbers are
  pixels (`p-16` = 16px, `gap-12` = 12px, `size-40` = 40px). Don't use the stock
  Tailwind scale (`p-4` is 4px here, not 16px).
- Use token utilities from `theme.css`, never raw colors:
  - Surfaces: `bg-surface-page-primary`, `bg-surface-page-secondary`,
    `bg-surface-brand-strong`, `bg-surface-brand-subtle`, `bg-surface-card-default`
  - Text: `text-text-primary`, `text-text-secondary`, `text-text-brand-default`
  - Borders: `border-border-default-soft`, `border-border-default-medium`
  - Radius: `rounded-sm` … `rounded-9xl`, `rounded-full`, `rounded-brand-card`
  - Shadow: `shadow-xs`, `shadow-s`, `shadow-card`
  Values that match a token are bound to Figma variables on export; arbitrary
  one-off values (`p-[13px]`, `bg-[#3a3a3a]`) are not.
- For text, use `<Typography textStyle="..." color="...">` from `@acko/typography`
  rather than Tailwind font utilities.

## 2. Every container is flex (this is what becomes Auto Layout)

Only `flex`, `inline-flex`, and `grid` (with equal tracks) become Auto Layout.
**A `block` container exports as a fixed frame with children at absolute x/y.**

- Every element that has children must be `flex` or `inline-flex`.
  - Vertical stack → `flex flex-col`
  - Horizontal row → `flex flex-row` (or just `flex`)
- Never rely on normal block flow, `inline-block`, floats, or `<br>` for layout.
- Even a wrapper with a single child should be `flex`.

| CSS (Tailwind) | Figma |
| --- | --- |
| `flex` / `flex-row` | Horizontal auto layout |
| `flex-col` | Vertical auto layout |
| `gap-*` | Item spacing |
| `p-*`, `px-*`, `py-*` (+ border width) | Padding |
| `justify-start / center / end / between` | Primary align Min / Center / Max / Space between |
| `items-start / center / end / baseline` | Counter align Min / Center / Max / Baseline |
| `flex-wrap` (rows only) | Wrap, with `gap-y-*` → counter-axis spacing |
| `flex-1` / `grow` on a child | Fill container (main axis) |
| `self-stretch` on a child | Fill container (cross axis) |
| no fixed height on a column | Hug contents (height) |
| `absolute` / `fixed` child | Absolute-positioned child inside auto layout |
| `overflow-hidden` / `overflow-auto` | Clip content |
| `grid grid-cols-N` (equal tracks) | Figma grid layout |

## 3. Spacing: `gap` and `padding`, never `margin`

**If any child of a flex container has a non-zero margin or `auto` margin, the whole
container falls back to absolute positioning.**

- Use `gap-*` on the parent for space between siblings.
- Use `p-*` on the parent for inset.
- Banned on children: `m-*`, `mx-auto`, `mt-*`, `ml-auto`, `space-x-*`, `space-y-*`
  (space-* is implemented with margins).
- To push an item to the end, use `justify-between` on the parent or a `flex-1`
  spacer — not `ml-auto`.
- To center a page column, use a `flex flex-col items-center` parent — not `mx-auto`.

## 4. Sizing

- Let containers hug content: don't set `h-*` on stacks unless the design needs a
  fixed height (buttons, nav bars). A column whose height equals its content exports
  as Hug.
- Use `flex-1` for fill-width/height children, `self-stretch` for cross-axis fill.
- Use `w-full` / `max-w-*` on the page column; avoid fixed pixel widths on content
  that should flex.
- Mobile pages are captured at 390×844 — build mobile-first.
- Add `min-w-0` to `flex-1` children that contain inputs (TextInput, Dropdown, …).
  Inputs have a built-in minimum width, so without it the browser splits a row
  unequally while Figma's "fill container" always splits equally, and fields overflow.
- `DateInput` is at least 308px wide from `md` up (its calendar popover width): give it
  a fixed `md:w-[308px]` column instead of an equal half of a row.

## 5. Grids

- Only grids with **equal tracks** become Figma grids: `grid-cols-2`, `grid-cols-3`.
- Rows count too: a multi-column grid becomes a Figma grid only when **every row is
  the same height**. Cards with different amounts of text make unequal rows, and the
  whole grid is exported as fixed positions. For cards of varying height, use a
  `flex flex-col` of `flex md:flex-row` rows whose cards are `md:flex-1`.
- A **one-column** grid (`grid-cols-1`, e.g. the mobile form of `md:grid-cols-3`)
  exports as a vertical auto layout stack, so its rows may have different heights.
- Unequal tracks (`grid-cols-[2fr_1fr]`, `col-span-*`) are exported as fixed
  positions. Use nested `flex` rows with `flex-1` / fixed widths instead.
- A single centered item: `grid place-items-center` is fine (becomes centered
  auto layout) — but prefer `flex items-center justify-center`.

## 6. Text

- Put text directly in an element (`<p>`, `<span>`, `<h2>`) inside a flex parent.
  Don't mix bare text and element siblings in the same flex container; wrap the text.
- Inline formatting (`<strong>`, `<em>`, `<a>`, `<span>` with only color/weight
  changes) inside a paragraph is merged into one text layer with styled ranges —
  keep those spans `inline` with no background, border, or padding.
- Use `<Typography textStyle="...">` (`heading-md`, `body-sm-regular`,
  `label-lg-semibold`, …) for all text; it maps to Figma text styles. The font
  family is Euclid Circular B.
- On dark/brand surfaces use `color="static"` (white). **Don't use
  `color="invert"`**: it reads `--textInvert`, which doesn't exist in
  `@acko/tokens` (the token is `--textInverse`), so text falls back to black.
- `color="success"`, `color="error"` and `color="brand"` are broken the same way
  (they read `--statusSuccessText`, `--statusErrorText`, `--textBrand`). Use the real
  token as an important utility instead: `className="text-text-status-success!"`,
  `text-text-status-error!`, `text-text-brand-default!`. The `!` is needed because the
  design-system CSS isn't layered, so it beats normal Tailwind utilities.
- `line-clamp-*` is honored (only visible lines are exported).
- `Typography` carries text styling only (`textStyle`, `color`, `uppercase`, …).
  Never give it padding, a background, a border or a radius: it exports as a bare text
  layer and the box is lost. Put the box on a wrapping `flex` element instead
  (`<a className="flex rounded-lg bg-surface-brand-subtle px-12 py-8"><Typography …>`).

## 7. Things that don't export (avoid)

| Avoid | Why / use instead |
| --- | --- |
| `before:` / `after:` pseudo-elements | Not captured (`PSEUDO_ELEMENT` warning). Use a real element. |
| `<img>`, `<canvas>`, `<video>` | `UNSUPPORTED_MEDIA` warning. Use inline `<svg>` or `lucide-react` icons. |
| Background images / gradients (`bg-gradient-*`, `bg-[url()]`) | Not mapped. Use solid `bg-*` colors. |
| `transform`, `rotate-*`, `scale-*`, `translate-*` | Not mapped; layout uses measured boxes. |
| `display: contents` wrappers (except design-system components) | No box to export. |
| Margins of any kind | Breaks auto layout (see §3). |
| Uneven borders on a container (`border-b` only) | Exported as separate absolute rectangles — fine for dividers, but prefer `@acko/separator` or a 1px flex child. |

Supported and fine: `bg-*` solid colors, `border` (uniform), `rounded-*`,
`shadow-*` (including inset), `opacity-*`, `overflow-hidden`, `z-*` for overlaps.

Overlapping stacks (avatar groups): position the items `absolute` inside a sized
`relative flex` container — never negative margins. To keep earlier items on top,
give **every** item a descending `z-index` (including the last one, e.g. `z-0`); if any
item has none, Figma paints the later items on top instead.

## 8. Use design-system components

- Prefer `@acko/*` components (Button, Badge, Chip, TextInput, Checkbox, …). Those
  listed in `figma-component-contract.json` export as **real Figma component
  instances** with mapped props — use their props (`variant`, `size`, …) instead of
  restyling them with classes.
- Don't wrap a design-system component in an extra styled box just to add spacing;
  put spacing on the flex parent.
- In a **row**, put the component directly in the flex parent — never in a plain
  wrapper like `<div className="flex"><Button/></div>`. The wrapper is exported with
  the component's browser width as a fixed width, but the Figma instance keeps its
  own library size, so it overflows (or leaves a gap). To stop a component
  stretching in a column, use `items-start` on the parent, not a wrapper.
- On a dark or brand surface, use the on-dark variant (`primary-on-dark`,
  `secondary-on-dark`). The default `secondary` Button has brand-coloured text and
  disappears on `bg-surface-brand-strong`.
- Not every prop combination exists as a Figma variant. If the plugin reports
  `COMPONENT_PROPERTY_VALUES_UNSUPPORTED`, switch to a combination that exists —
  one such error aborts the whole import.
- Until the Umbrella DS library is republished, use only what the published
  version supports:
  - Button: no `white`, `translucent`, `destructive-*`, `ghost-on-dark`,
    `link-on-dark`, and no `loading`.
  - Avatar: `size`, `initials` and `online` only. No `layout`, `name`, `subtext`
    or `progress` — put text beside the Avatar with `Typography`. `size` must be one
    of 24, 32, 40, 48 or 64: any other number crashes the whole page.
  - OtpInput: `length={6}` only.
  - Breadcrumb: at most 3 items (2 parents + the current page). The Figma
    component has only two parent links; a fourth item aborts the import.
- Icon-only buttons (`<Button iconOnly>`) map to the Figma Button's `Content=Icon`
  variant. The currently published (older) Button has no `Content` property, so until
  it's republished they import as text buttons showing their hidden label — avoid
  them where that label is long.

## 9. Layer naming

Exported layers are named from `aria-label`, then `role`, then `id`, then tag name.

- Give every meaningful section an `aria-label` (e.g. `<section aria-label="Hero">`)
  so the Figma layers panel is readable.
- Add `data-figma-id="..."` on key nodes for stable IDs across exports.
- Use semantic tags (`header`, `main`, `section`, `nav`, `footer`).

## 10. Registering a page for export

Add a route, then add an entry to `pages` in `figma-export.config.ts`:

```ts
{
  id: 'my-page',
  name: 'My page',
  route: '/my-page',
  viewports: [{ id: 'mobile', width: 390, height: 844 }],
  states: [{ id: 'default', name: 'Default' }],
},
```

Then run `npm run figma:export:check` and fix every warning it reports.

---

## Example

See `src/pages/StayPage.jsx` for a full page.

```jsx
<main aria-label="Home" className="flex w-full flex-col items-center bg-surface-page-secondary">
  <div className="flex w-full max-w-[480px] flex-col gap-24 p-16">
    <header aria-label="Header" className="flex items-center justify-between">
      <Typography textStyle="heading-md" as="h1">Your trip</Typography>
      <Badge color="green" size="sm">Active</Badge>
    </header>

    <Card variant="primary" className="flex flex-col gap-12 p-16">
      <div className="flex items-center gap-12">
        <div className="flex size-40 items-center justify-center rounded-full bg-surface-brand-subtle text-text-brand-default">
          <Plane className="size-20" aria-hidden="true" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Typography textStyle="label-lg-semibold">Medical cover</Typography>
          <Typography textStyle="body-sm-regular" color="secondary">Up to <strong>$50,000</strong></Typography>
        </div>
      </div>
      <Button variant="primary" size="md">View details</Button>
    </Card>
  </div>
</main>
```

## Checklist before finishing a page

- [ ] Every element with children is `flex` / `flex-col` (or equal-track `grid`)
- [ ] No `m-*`, `mx-auto`, `ml-auto`, `space-*` anywhere
- [ ] Spacing comes from `gap-*` and `p-*` only
- [ ] No pseudo-elements, `<img>`, gradients, or transforms
- [ ] Multi-column grids have equal-height rows; otherwise use flex rows of `flex-1` cards
- [ ] `Typography` has no padding, background, border or radius — the box is on a wrapper
- [ ] Design-system components used where one exists, never in a plain wrapper inside a row
- [ ] Buttons on dark or brand surfaces use an on-dark variant
- [ ] Sections have `aria-label`
- [ ] Page is registered in `figma-export.config.ts` and `npm run figma:export:check` is clean
