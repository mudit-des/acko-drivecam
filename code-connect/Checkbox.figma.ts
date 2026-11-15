// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=7094-218&m=dev
// component=Checkbox
import figma from 'figma'

const instance = figma.selectedInstance
const { renderProp, renderPropValue } = figma.helpers.react

function readText(layerName: string) {
  const layer = instance.findText(layerName, { traverseInstances: true })
  return layer.type === 'TEXT' ? layer.textContent : undefined
}

const state = instance.getPropertyValue('State')
const isCard = instance.getPropertyValue('Type') === 'Card'
const size = instance.getEnum('Size', {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
})
const initialChecked =
  state === 'Checked' ||
  state === 'Disabled Checked' ||
  state === 'Focused Checked'
const indeterminate = state === 'Indeterminate'
const disabled = state === 'Disabled' || state === 'Disabled Checked'
const error = state === 'Error'

// Default checkboxes have no text layers. Replace this accessible label in use.
const label = isCard ? readText('Title') ?? 'Option label' : 'Option label'
const description = isCard ? readText('Description') : undefined

// Card uses label + description, not a variant prop. Hover/focus are native.
// Clear the mixed state on interaction so the example can become checked.
export default {
  example: figma.code`
    function CheckboxExample() {
      const [checked, setChecked] = useState(${renderPropValue(initialChecked)})
      ${
        indeterminate
          ? 'const [indeterminate, setIndeterminate] = useState(true)'
          : ''
      }

      return (
        <Checkbox
          checked={checked}
          ${
            indeterminate
              ? `indeterminate={indeterminate}
          onChange={(nextChecked) => {
            setChecked(nextChecked)
            setIndeterminate(false)
          }}`
              : 'onChange={setChecked}'
          }${renderProp('label', label)}${
            description !== undefined ? renderProp('description', description) : ''
          }${renderProp('size', size)}${renderProp(
            'disabled',
            disabled,
          )}${renderProp('error', error)}
        />
      )
    }
  `,
  imports: [
    'import { useState } from "react"',
    'import { Checkbox } from "@acko/checkbox"',
    'import "@acko/css/checkbox.css"',
  ],
  id: 'acko-checkbox',
  metadata: {
    nestable: false,
    props: {
      label,
      description,
      size,
      checked: initialChecked,
      indeterminate,
      disabled,
      error,
    },
  },
}
