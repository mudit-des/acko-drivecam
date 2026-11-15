# Code → Figma coverage plan

Goal: gain confidence in the export pipeline (`tools/figma-export` → `figma-import.json`
→ `figma-plugin`) by building a **small, deliberately chosen** set of pages that together
exercise every Code Connect component, layout pattern and content stress case — instead
of many random pages that repeat the same patterns.

Target: **11 pages**, mobile-first (390×844), with desktop (1440×900) on 3 of them.
Stop adding pages when new pages stop finding new pipeline issues (see §5).

---

## 1. Coverage dimensions

### A. Components in scope

Only the **16 components with a Code Connect file** (`code-connect/*.figma.ts`) are tested.
Other `@acko/*` packages are out of scope and must not be used on these pages.

| Component | Export (contract) | Notes |
| --- | --- | --- |
| Button | Instance | `matchWidth` when `fullWidth`; White×SM has no Figma variant |
| Badge, CounterBadge | Instance | |
| TextInput, Dropdown | Instance | `matchWidth` |
| Textarea, Checkbox | Instance | `matchWidth`, lenient |
| Avatar, Chip, Switch, OtpInput | Instance | lenient — failures are only warnings |
| Separator, Breadcrumb | Instance | |
| Accordion | DOM wrapper → **AccordionItem** instances | `matchWidth` on items |
| Radio (`RadioGroup`) | DOM wrapper → **RadioOption** instances | `matchWidth` on card variant, lenient |
| Calendar | **DOM only** | No Figma instance is created; exported as plain frames |

Calendar is in Code Connect but the contract exports it as plain layers, so it tests
layout capture, not component mapping. Decide during the work whether it should become
an instance.

**Scaffolding (allowed, not under test):** `Card` and `Typography` (exported as frames and
text with library text styles), and `lucide-react` icons (SVG). Every page needs them;
issues they cause are still logged, but they aren't coverage targets.

Variant axes per component: every `variant`/`type`, every `size`, and `disabled` /
`error` / `success` / `selected` / `checked` / `loading` states where they exist.
Only include combinations that **exist as Figma variants** (check the plugin registry):
some code combinations have no Figma variant (e.g. Button `white` × `sm`), and including
them makes the gallery fail for a known, uninteresting reason.

### B. Layout patterns

| # | Pattern | Why it's risky |
| --- | --- | --- |
| L1 | Vertical stack (hug) | Hug detection; fixed vs auto height |
| L2 | Horizontal row with `justify-between` | Space-between → Figma alignment |
| L3 | Row with `flex-1` fill + fixed siblings | Grow → Fill container |
| L4 | `flex-wrap` rows (chips, badges) | Counter-axis gap, wrapped line height |
| L5 | Equal grid (`grid-cols-2/3/4`) | Figma grid import |
| L6 | Unequal grid / `col-span` | Falls back to fixed positions |
| L7 | Absolute overlay (badge on avatar or card) | Absolute child inside auto layout |
| L8 | Sticky / fixed header and bottom bar | No fixed positioning in Figma |
| L9 | Horizontal scroll (carousel), `overflow-auto` | Clipping, content wider than frame |
| L10 | Nested cards 3+ levels deep | Accumulated padding/border rounding |
| L11 | Dividers (uneven borders, Separator) | Separate border rectangles, 1px rounding |
| L12 | Overlapping stack (avatar group, z-index) | Paint order |
| L13 | Centered column (`max-w` + `items-center`) | Page shell |
| L14 | Two-column desktop → stacked mobile | Responsive; idle `flex-1` in column |
| L15 | Instance width inside layouts (`fullWidth`, inputs in rows, side-by-side buttons) | `matchWidth` and instance height modes |

### C. Content stress

| # | Case |
| --- | --- |
| C1 | Long text that wraps 2–3 lines inside a fill-width cell |
| C2 | Truncation (`truncate`, `line-clamp`) |
| C3 | Rich inline text (bold/link/colour runs inside a paragraph) |
| C4 | Empty states (no items) and single-item lists |
| C5 | Numbers/currency, `₹`, `×`, emoji, non-Latin text (Hindi) |
| C6 | Very long single words / URLs / policy numbers |
| C7 | Icon-only controls and icon + label combinations |
| C8 | Disabled / loading / error / success states |
| C9 | Dynamic values (dates, countdowns) — must be fixed for deterministic export |
| C10 | Long text *inside* component instances (long Button label, Badge, Chip, Checkbox description, Accordion title) |

### D. Viewports and states

- Mobile 390×844 on every page; desktop 1440×900 on pages marked 🖥.
  Today's pages are a single column capped at 480px, so a desktop export of them is just
  a narrow column on a wide canvas. Desktop pages need a real desktop layout (multi-column,
  wider max width) or the desktop viewport tests nothing.
- Interaction states via the export config `states`. The exporter supports `click`,
  `fill`, `press` and `wait` actions (`tools/figma-export/types.ts`), which is enough for
  an open Dropdown, open Accordion items, shown validation errors and a filled OTP.

### E. Tokens and styles

Variable and style binding fails separately from layout, so track it as its own axis:

| # | Case | Seen so far |
| --- | --- | --- |
| T1 | Semantic colour tokens (`surface-*`, `text-*`, `border-*`) bind to variables | Working |
| T2 | Primitive colours (`solid-*`, `alpha-*`) bind to variables | **Failing**: `LIBRARY_VARIABLE_NOT_REGISTERED` / `VARIABLE_NOT_FOUND` for Purple 600, Grey White, etc. |
| T3 | Spacing and radius values bind to `Spacing / *` and `Radius / *` | Working |
| T4 | `Typography` text styles map to library text styles | Working |
| T5 | Non-token values (arbitrary px, raw hex) stay unbound without errors | Untested |

---

## 2. Page plan (11 pages)

Each page is a realistic insurance screen so it "makes sense", but is chosen to fill
specific cells of the matrix above. Pages use only the 16 in-scope components plus
scaffolding.

| # | Page | Route | Components | Layout / content / tokens |
| --- | --- | --- | --- | --- |
| 1 | **Home** (exists) | `/` | Button, Badge | L1 L2 L3 L13, C7, T1 |
| 2 | **File a claim** (exists) | `/claim` | All 16 | L11 L15, C8 C9 |
| 3 | **Component gallery** 🖥 | `/gallery` | All 16 × every Figma-existing variant, size and state | L4 L5, C8 C10 — the regression page |
| 4 | **Plans comparison** 🖥 | `/plans` | Button, Badge, Chip (filters), Accordion (plan details), Separator, CounterBadge | L5 (3-col cards), L14, C1 C10 |
| 5 | **Policy details** 🖥 | `/policy` | Breadcrumb, Avatar, Badge, Accordion (multiple, items open), Separator, Button | L10, C3 C6, open-accordion state |
| 6 | **Get a quote** | `/quote` | TextInput (phone, email, pincode, registrationNumber, currency), Dropdown, Radio (default + card, horizontal), Checkbox, Switch, Calendar, Button | L3 L15, C8 (validation-error state), open-dropdown state |
| 7 | **Garages near you** | `/garages` | Chip (filters), Badge, Avatar, Button | L4, L7 badge overlays, L9 carousel, C4 empty state |
| 8 | **Claims tracker** | `/claims` | CounterBadge, Badge (all colours), Separator, Avatar, Button | L11 timeline, L2, C9 |
| 9 | **Profile & settings** | `/profile` | Avatar (all sizes, both layouts), Switch, Checkbox, Separator, OtpInput (verify new number), TextInput | L12 avatar group, C5 Hindi + long names, C7, T2, filled-OTP state |
| 10 | **Payment summary** | `/payment` | TextInput (coupon, success state), Checkbox, Badge, Button (loading, disabled), Separator | L8 sticky bottom bar, L2 price rows, C5 currency |
| 11 | **Help centre** 🖥 | `/help` | Breadcrumb, TextInput (search), Accordion, Dropdown, Textarea, Button | L6 unequal grid, L14, C2 truncation |

Coverage check (verified row by row):

- Every component in §1 A appears in the gallery plus at least two real pages
  (OtpInput and Calendar: pages 2 + 9 and pages 2 + 6 respectively).
- Every row in §1 B, C and E is hit by at least one page (T5 is exercised wherever a
  page uses an arbitrary value, e.g. `max-w-[480px]`).
- No out-of-scope `@acko/*` component is used on any page.

---

## 3. Authoring rules for these pages

- Follow `AGENTS.md` strictly — the point is to test the pipeline, not to find
  authoring mistakes we already know about.
- Use only the 16 in-scope components, plus `Card`, `Typography` and `lucide-react`.
- No live/random data: fixed dates, fixed timers, fixed lists, so exports are
  deterministic and diffs mean something. The exporter does **not** freeze the clock,
  so this is the page's job. **Page 2 currently breaks this rule**: `ClaimPage.jsx`
  uses `new Date()` for the calendar (selected day, month, `maxDate`) and a live OTP
  countdown, so its export changes from day to day and with capture timing. Fix it
  (fixed date, static `resendIn`) before taking the baseline.
- One realistic purpose per page; don't stuff unrelated components in (except the
  gallery, which is intentionally exhaustive).
- Add every page to `figma-export.config.ts` with `aria-label`s on sections so
  Figma layers and report messages are traceable.

---

## 4. Issue triage — fix at the right layer

Every issue found in Figma gets logged with its layer before anything is fixed:

| Layer | Example from this project | Fix goes in |
| --- | --- | --- |
| Authoring rule | Margins break auto layout | `AGENTS.md` |
| Design-system bug | `color="invert"` reads a missing token | Report to DS team; workaround in `AGENTS.md` |
| Library drift | Avatar `Layout`/`Show Text`, OTP `Cells` unpublished | Publish library; not our code |
| Contract mapping | Missing `matchWidth`, wrong text-layer names | `figma-component-contract.json` |
| Code Connect mapping | Code Connect file reads the wrong layer/property | `code-connect/*.figma.ts` |
| Exporter rule | Hug detection off by 1px with Separator | `tools/figma-export/emitter.ts` |
| Plugin rule | Instance height forced to hug | `figma-plugin/src/code.ts` |

**Overfitting guard:** a fix must be statable as a general rule about CSS, Figma or a
component ("a column's content extent is first-top to last-bottom"), never about a
specific page ("subtract 1px in the claim card"). If it can't, it's a workaround —
log it, don't merge it.

Suggested issue log columns: page · Figma node · symptom · layer · root cause ·
general rule · status.

### Issue log

| # | Page | Symptom | Layer | Root cause / general rule | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | claim, gallery | Avatar name/subtext missing, stacked | Library drift | Published Avatar lacks `Layout`, `Show Text`, `Show Progress` | Waiting on library publish |
| 2 | claim, gallery | OTP cell count ignored | Library drift | Published OTP Input lacks `Cells` | Waiting on library publish |
| 3 | gallery | OTP resend link vs timer not reflected | Contract mapping | Contract maps no property for the resend type (Figma OTP Resend `Type=Link/Timer`) | Open |
| 4 | gallery | TextInput error / success / disabled not reflected | Contract mapping | TextInput has no `State` mapping (others derive it) | Open — confirm on import |
| 5 | gallery | Calendar range band missing (`PSEUDO_ELEMENT` ×5 per viewport) | Exporter rule | Range highlight is drawn with `::before/::after`, which the exporter doesn't capture | Open |
| 6 | gallery | Avatar long text overflows its container (browser) | Design-system behaviour | Avatar text neither wraps nor truncates | Logged; gallery uses shorter text |
| 7 | gallery | OTP 6 cells at md/lg wider than a 390px card (browser) | Authoring rule | Use `sm` for 6 cells on phones, or a scrolling row | Logged; gallery row scrolls |
| 8 | all | Button labels serif where Euclid isn't installed (browser only) | Design-system bug | Button `font-family` has no fallback | Logged; no Figma impact |
| 9 | claim | Card fixed height → wrong bottom padding | Exporter rule | Column content extent = first top → last bottom | Fixed (`emitter.ts`) |
| 10 | claim | Inputs / full-width button not full width | Contract mapping | `matchWidth` for fields and `fullWidth` buttons | Fixed (contract) |
| 11 | claim | Button squashed after width match | Plugin rule | Keep the instance's own height sizing after resize | Fixed (`code.ts`) |
| 12 | gallery | Import aborted: Button `White` × `MD` (and `SM`) has no variant | Library drift | Published Button lists `White`/`Translucent` but no matching variant at the sizes tried; one ERROR aborts the whole import | Removed from pages until republish |
| 13 | claim, gallery | Avatar `Show Text` / `Show Progress` warnings even when unused | Contract mapping | Exporter always sends mapped booleans (`false`); old library lacks them → lenient warnings | Expected until republish |
| 14 | gallery (mobile) | Some component instances overflow the frame in Figma | Design-system component | Fix inside the Figma components (owner: design system) | Ignored for now; re-check after DS fix |
| 15 | all | Text 3–4px taller and up to ~20% wider in Figma than measured; extra wrapping (Badge, Accordion on mobile); screens taller (claim +85px, gallery +112/+196px) | Exporter environment | Euclid is loaded from an external host that the exporter blocks (`blockedFontRequests`), so text is measured in a fallback font; `assumeAvailable: true` hides it (`unavailableFonts: Euclid Circular B`). Rule: export must measure in the real font | Open — highest impact |
| 16 | gallery | TextInput: every label reads "Label"; `defaultValue` not shown (placeholder instead); error/success/disabled look default; no error message | Contract mapping | TextInput maps `label` only to visibility, not text; no mapping for value, `errorText` or state (confirms #4) | Open |
| 17 | gallery | Checkbox labels missing — only the boxes render | Contract mapping | Default-type checkboxes have a hidden `Field Label` layer, but the label was mapped to `Title` (Card type only). Now `Field Label` by default, `Title` when a description is set, with `revealTextLayers` — same pattern as RadioOption | Fixed (contract); confirm on import |
| 18 | gallery | Dropdown, Textarea, OTP show "Helper Text" (and Textarea "Character Counter", OTP "Verification Code" label) when code has none; +20–52px | Contract mapping | Text layers are mapped but their visibility isn't switched off when the prop is absent | Open |
| 19 | gallery | Default-style Radio: description dropped, option 83px wide instead of 280px | Contract mapping / DS | Figma Default radio has only a label layer; `matchWidth` only applies to the Card style | Open |
| 20 | gallery | Calendar range: only start and end days highlighted, no band between (confirms #5) | Exporter rule | `::before/::after` not captured | Open |
| 21 | gallery | Link buttons 16–28px tall in Figma vs 32–64px in code | Design-system mismatch | Code gives Link buttons full button height; Figma Link type hugs its text. Looks fine visually | Logged; DS decision |
| 22 | plans (mobile) | Plans grid exported as fixed positions | Exporter rule | `grid-cols-1` with unequal row heights fails the equal-tracks check. Rule: a one-column grid is a vertical stack (row gap → spacing, items fill width per `justify-items`, hugs when content-sized) | Fixed (`emitter.ts`); confirm on import |
| 23 | plans, gallery | Chips ~20px wider in Figma, add-on chips wrap to an extra line (+48px on mobile) | Contract mapping | Figma Chip `Show Icon` is on by default and unmapped, so an icon slot (16px + 4px gap) shows. Icons are React elements and aren't serialized, so the exporter can't tell when a chip has one | Fixed (contract: `Show Icon` always off); chips *with* icons lose them until DOM icon detection is added — confirm on import |
| 24 | plans | AccordionItem "Divider Line" 400px wide inside a 356px item | Design-system component | Fix inside the Figma component (see §4a) | Deferred to DS owner |
| 26 | policy | Open accordion items show a down chevron in Figma (body visible, so `State=Open` applied) | Design-system component | The Figma Accordion's Open variant draws the chevron down; code shows it up (see §4a) | Deferred to DS owner |
| 27 | policy | People covered: name/role text layers ~11px wider than their column | Exporter rule | Badges render wider in Figma (font, #15), so the `flex-1` column shrinks, but text layers keep their measured fixed width instead of filling the column | Open |
| 30 | quote | Plain checkbox (no description) shifted 16.5px right in the summary card | Contract mapping | Default-type Checkbox centres its content, so `matchWidth` stretching moved box and label. Rule: stretch only the Card type (`whenPresent: description`), as RadioOption does | Fixed (contract); confirm on import |
| 25 | policy (also claim, home, gallery) | Icon-only Buttons export as text buttons showing their hidden screen-reader label; on Policy the label is a long file name, so the Documents rows break | Contract mapping | Button `iconOnly` isn't mapped. Fix: map `iconOnly` → Figma `Content` (`Icon` / `Text`), as `code-connect/Button.figma.ts` does. **Verify first** that the published Button has `Content=Icon` for each Type × Size used — a missing combination aborts the whole import | **Fixed (contract)** — `Content` is now always sent: `Icon` for `iconOnly`, else `Text`. Verified in Umbrella 11754:617: all 520 Type × State × Size × Content variants exist. Also fixes #31. The published (older) Button has no `Content` property: until it's republished, imports log a non-fatal `COMPONENT_PROPERTY_NOT_FOUND` per Button |
| 32 | profile | Switches without a visible label show the placeholder "Label" in Figma; the switch is 85px instead of 36px, so the Notifications text column shrinks and the text overflows (see #27) | Design-system component | The Figma Switch has no show/hide property for its `Field Label`, so the contract can't turn it off (the plugin can reveal text layers, not hide them) | Deferred to DS owner (see §4a) — add a `Show Label` property; then map it in the contract |
| 31 | garages (imported into the Umbrella file) | Every Button rendered icon-only — just an arrow, no label | Contract mapping | The plugin starts each instance from the set's first variant (`Content=Icon`), and `Content` was never sent. Same root cause as #25 | Fixed with #25 |

Status updates from the plans re-import: #23 chips **confirmed fixed** (widths match the
browser, Add-ons back to 168px on mobile). #22 cards are stacked with correct gaps and
widths; confirm "Auto layout, vertical, gap 16" on the Plans frame in Figma.

### 4a. Design-system changes — deferred, for the DS owner

We don't own Umbrella DS, so all design-system changes are collected here and handed over
at the end of the work instead of being fixed one by one. None of them need a change in
this repo; where a workaround exists in our pages it is listed.

**Figma library (Umbrella DS 2.0)**

| # | Component | Change needed | Why | Our workaround until then |
| --- | --- | --- | --- | --- |
| 1 | Avatar | Publish the version with `Layout`, `Show Text`, `Show Progress` | Published Avatar lacks them; name/subtext can't be shown | Text placed beside the Avatar with `Typography` |
| 2 | OTP Input | Publish the version with `Cells` (4 / 6) | Published OTP Input has a fixed cell count | Pages use 6 cells only |
| 12 | Button | Publish `White` / `Translucent` variants at every size, and `Destructive-*`, `Ghost-onDark`, `Link-onDark` | Requested combinations don't exist; one missing variant aborts the whole import | Pages don't use these types |
| 14 | Several | Fix components that overflow their frame on mobile | Content spills outside the component bounds | None — visible in Figma |
| 24 | Accordion | Set `Divider Line` to stretch with the item (width **Fill container** in auto layout, or horizontal constraint **Left & right**) in every variant | The line is fixed at 400px: it overhangs narrower items (44px past a 356px item on mobile) and stops short on wider ones (400 of 710px on desktop); instance sublayers can't be resized from outside the component | None — visible in Figma |
| 26 | Accordion | Open variants: chevron should point up, matching the code | Open items show a down chevron | None |
| 28 | Radio (`@acko/radio`) | Group label is fixed at 18px (`label-xl`) at every `size`, while TextInput / Dropdown / DateInput labels are 14px | A radio question next to a text field looks out of scale | Quote page uses larger section titles so the hierarchy still holds |
| 34 | Breadcrumb (Figma) | Support more levels: add parent links beyond `Parent Link#0` and `#1` (or a level-count variant) | A 4-level breadcrumb has no layer for its third parent: the import aborts | Pages use at most 3 items |
| 32 | Switch (Figma) | Add a boolean property (e.g. `Show Label`) that shows/hides the `Field Label` layer | Switches used with only an `aria-label` show the placeholder "Label" and are much wider than in code | Contract will map `label` present → `Show Label` once it exists |
| 29 | Date input / DOB field (Figma) | Trailing icon is a magnifying glass; code shows a calendar button | Icon mismatch between design and code | None |
| T2 | Variables | Publish the primitive colour variables (e.g. `Colour / Solid / Purple / 600`, `Grey / White`, `Alpha / PurpleA / 100`) | `LIBRARY_VARIABLE_NOT_REGISTERED` / `VARIABLE_NOT_FOUND`: those layers keep the right colour but aren't linked to the variable | None needed for visuals |
| 21 | Button (Link) | Decide whether code or Figma is right: code gives Link buttons full button height, Figma's Link type hugs its text | Heights differ (32–64px vs 16–28px) | None — looks fine visually |

**Code library (`@acko/*` packages)**

| # | Package | Change needed | Why | Our workaround until then |
| --- | --- | --- | --- | --- |
| — | `@acko/typography` | `color="invert"` reads `--textInvert`; the token is `--textInverse` | Text meant to be light renders black | Use `color="static"` on dark surfaces (in `AGENTS.md`) |
| 33 | `@acko/typography` | `color="success"` / `"error"` / `"brand"` read `--statusSuccessText` / `--statusErrorText` / `--textBrand`; the tokens are `--textStatusSuccess` / `--textStatusError` / `--textBrandDefault` | Success, error and brand text render black | `className="text-text-status-success!"` etc. (in `AGENTS.md`) |
| 8 | `@acko/button` | Add a fallback to the Button `font-family` | Labels render serif where Euclid isn't installed | None needed in Figma |
| 6 | `@acko/avatar` | Let Avatar text wrap or truncate | Long names/subtext overflow the container | Pages keep Avatar text short |
| — | `@acko/accordion` | Pass `inert` as a string (or `""`), not `true` | React 18 logs a warning on every accordion | None needed |

After the owner ships these: republish the library, accept the update in the target file,
re-scan the plugin registry, then re-import the gallery and close the matching rows above.

---

## 5. Regression and exit criteria

**Regression baseline.** The export is deterministic (once §3's rules hold), and
`npm run figma:export:check` fails when the generated output differs from what's on
disk in `figma-export-output/`. That folder is the baseline: after any change to the
exporter, plugin or contract, run the check first. If it fails, look at what changed —
expected → run `npm run figma:export` to accept it as the new baseline; unexpected → a
regression.

> **Single-route exports overwrite the full manifest.** `figma:export -- --route /x`
> writes `figma-import.json` and `report.json` containing only that page. Use it for a
> quick look, but always run the full export before `figma:export:check` or committing,
> or the baseline loses every other page.

**Gallery re-import.** After any library publish or contract change, re-import page 3
(the gallery) into a fresh Figma file and compare it against the previous import.

**Exit criteria** — the pipeline is "stable" when:

1. Three consecutive new pages produce **no new exporter/plugin/contract issues**
   (only drift or authoring issues), and
2. The gallery imports with **zero ERROR** entries and **zero `COMPONENT_*` or
   `VARIABLE_*` warnings** in the plugin log. Informational entries (`*_READY`,
   `*_RESOLVED`) and `BOUNDS_MISMATCH` are reviewed but don't block.

If page 11 is reached and new pipeline issues are still appearing, the problem is not
page count — revisit the triage log for a recurring root cause.

---

## 6. Order of work

1. Make page 2 deterministic (§3) and run a full `npm run figma:export` as the baseline.
   (Publishing the Umbrella DS library — Avatar, OTP Input, Button — is scheduled
   separately; until then, expect those library-drift warnings and don't triage them.)
2. Build page 3 (component gallery) first — it finds contract/drift issues fastest.
3. Build pages 4–11 in order; export + import after each; triage before fixing.
4. Batch fixes per layer; re-run `figma:export:check` and the gallery import after each batch.
5. In parallel: contract-vs-registry checker (needs the plugin's registry JSON from **Copy**).
