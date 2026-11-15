# ACKO JSON Layer Importer

A local Figma Design plugin that converts a versioned JSON manifest into native Figma layers, Auto Layout frames, design-system component instances, and variable bindings.

## Build

From the project root:

```bash
nvm use 22
npm run plugin:build
```

The generated plugin files are written to `figma-plugin/dist/`.

## Recommended Figma workflow

1. Open the Umbrella design-system source file in the Figma desktop app.
2. Open **Plugins → Development → Import plugin from manifest**.
3. Select `figma-plugin/manifest.json`.
4. Run **ACKO JSON Layer Importer**, then select **Scan this file**.
5. The plugin reads local component sets, variables, and text, paint, effect, and grid styles, then saves their published keys. A Figma-invalid component set is still registered, but its unavailable property definitions are recorded as a scan warning. The scan does not create, edit, publish, or remove anything in the library file.
6. Open the fresh consumer file, enable the published Umbrella library, and run the same development plugin.
7. Choose or paste a manifest, validate it, then select **Generate layers**.

The saved registry follows the plugin ID, so use the same imported development plugin in both files. Select **Copy** after scanning if you need to inspect or share the exact registry and component property definitions.

The manifest contains a development placeholder plugin ID. Replace it with the ID assigned by Figma before publishing or distributing the plugin.

## Import contract

The canonical schema is [import-manifest.schema.json](schema/import-manifest.schema.json). The initial format is intentionally strict and versioned as `1.0`.

```json
{
  "schemaVersion": "1.0",
  "name": "Product screens",
  "variables": {},
  "components": {},
  "screens": []
}
```

The included [starter-dashboard.json](examples/starter-dashboard.json) is intentionally small and is useful for verifying the plugin setup. The production, browser-measured dashboard export is generated at [`../figma-export-output/figma-import.json`](../figma-export-output/figma-import.json).

`examples/insurance-dashboard-full.json` and its generator are retained only as the earlier hand-authored prototype. Do not use them for new pages. Regenerate the production artifact without an LLM with:

```bash
nvm use 22
npm run figma:export
```

### Variable references

Every variable-bound value contains both its semantic reference and a resolved fallback:

```json
{
  "value": 20,
  "variable": "spacing/20"
}
```

For a fresh consumer file, use `libraryName`. The importer normalizes separators and casing, finds the matching entry in the saved registry, and imports its published key:

```json
{
  "variables": {
    "spacing/20": {
      "libraryName": "spacing20",
      "type": "FLOAT",
      "required": true
    }
  }
}
```

Resolution priority is `id`, `key`, `name`, then `libraryName`. `id` and `name` are useful only when the variable already exists locally. Published keys are imported only during generation. Missing or duplicate required library variables block generation; `required: false` permits the fallback and produces a warning.

### Component references

For a fresh consumer file, resolve components from the registry by library name:

```json
{
  "components": {
    "Button": {
      "libraryName": "Button",
      "propertyMappings": {
        "variant": {
          "figmaProperty": "Type",
          "values": { "primary": "Primary" }
        },
        "label": {
          "figmaProperty": "Label"
        }
      }
    }
  }
}
```

Local component/component-set node IDs and direct published keys are also supported. A node ID from the Umbrella source file is deliberately not reused in a different file because Figma node IDs are file-local. Duplicate normalized library names block validation instead of selecting an arbitrary component.

When the registry was captured from the source library, `sourceNodeId` can identify the saved registry entry without relying on its display name:

```json
{
  "components": {
    "Badge": {
      "sourceNodeId": "7814:342",
      "libraryName": "Badge"
    }
  }
}
```

`sourceNodeId` is used only to find the published key already stored in the registry. The importer does not open or resolve that node in the consumer file and does not modify the source file.

The importer creates a real instance and calls Figma's component-property API. It never silently detaches or draws a replacement when a mapped component or property is missing.

Text that is not exposed as a component property can be overridden by its exact nested Figma layer name:

```json
{
  "type": "COMPONENT_INSTANCE",
  "component": "Accordion",
  "textOverrides": {
    "Title Text": "How do I raise a claim?",
    "Body Text": "Choose the insured policy and tell us what happened."
  }
}
```

The importer loads every font used by the component before applying these overrides. A missing or renamed text layer blocks generation rather than silently changing the wrong content.

## Supported in schema 1.0

- Multiple desktop and mobile screens
- Stable screen and layer IDs
- Safe replacement of previously generated screens
- Frames, rectangles, ellipses, SVG, and text
- Horizontal, vertical, wrapping, and grid Auto Layout
- Fixed, hug, stretch, grow, and absolute child positioning
- Padding, gaps, width, height, min/max dimensions, opacity, strokes, and radii
- Solid colors and shadow effects
- Text content, fonts, sizing, line height, letter spacing, and alignment
- Local and published component instances with property/value translation
- Controlled nested text overrides for component content not exposed as properties
- Local and published variables with type validation
- Expected width/height checks with configurable tolerance

## Safety and limitations

- Validation runs before any canvas mutation.
- Library scanning is read-only; it stores a registry in plugin storage and never edits the design-system canvas.
- Regeneration is atomic: existing generated screens are removed only after all replacements succeed.
- The plugin has no network access.
- Grid tracks are currently equal flexible tracks; fixed/mixed tracks are not implemented yet.
- Images and prototype interactions are not part of schema `1.0`.
- Exact rendering still depends on the mapped Figma component variants and installed fonts.
- Browser CSS behavior such as sticky positioning has to be represented as static layout or prototype behavior in a later schema.
