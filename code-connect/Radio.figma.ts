// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=7095-206&m=dev
// component=RadioGroup
import figma from 'figma'

const instance = figma.selectedInstance
const { array, object, renderProp, renderPropValue } = figma.helpers.react

function readText(layerName: string) {
  const layer = instance.findText(layerName, { traverseInstances: true })
  return layer.type === 'TEXT' ? layer.textContent : undefined
}

const state = instance.getPropertyValue('State')
const size = instance.getEnum('Size', {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
})
const variant = instance.getEnum('Type', {
  Default: 'default',
  Card: 'card',
})

const selected =
  state === 'Selected' ||
  state === 'Disabled Selected' ||
  state === 'Focused Selected'
const disabled = state === 'Disabled' || state === 'Disabled Selected'
const error = state === 'Error'
const initialValue = selected ? 'option-1' : ''

// Default radios have no text layers. Supply a meaningful label when using them.
const label = variant === 'card' ? readText('Title') ?? 'Option label' : 'Option label'
const description = variant === 'card' ? readText('Description') : undefined
const options = array([
  object({
    value: 'option-1',
    label,
    ...(description !== undefined ? { description } : {}),
  }),
])

// Figma represents one option; the public API exposes a controlled RadioGroup.
// Hover and focus are browser interactions, not RadioGroup props.
export default {
  example: figma.code`
    function RadioExample() {
      const [value, setValue] = useState(${renderPropValue(initialValue)})

      return (
        <RadioGroup
          label="Choose an option"
          value={value}
          onChange={setValue}${renderProp('options', options)}${renderProp(
            'size',
            size,
          )}${renderProp('variant', variant)}${renderProp(
            'disabled',
            disabled,
          )}${renderProp('error', error)}
        />
      )
    }
  `,
  imports: [
    'import { useState } from "react"',
    'import { RadioGroup } from "@acko/radio"',
    'import "@acko/css/radio.css"',
  ],
  id: 'acko-radio',
  metadata: {
    nestable: false,
    props: {
      options,
      size,
      variant,
      disabled,
      error,
    },
  },
}
