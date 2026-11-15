// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=7102-296&m=dev
// component=Dropdown
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
const error = state === 'Error'
const success = state === 'Success'
const disabled = state === 'Disabled'
const defaultOpen = state === 'Active'
const label = readText('Field Label') ?? 'Choose an option'
const placeholder = readText('Placeholder Text')
const selectedLabel = readText('Value Text')
const initialValue = selectedLabel ? 'option-1' : ''
const helperText = error
  ? undefined
  : readText(success ? 'Success Message' : 'Helper Text')
const errorText = error ? readText('Error Message') : undefined

// The field component contains no menu options. Keep its selected text in a
// sample option; consumers must supply the application's real choices.
const options = array([
  object({ value: 'option-1', label: selectedLabel ?? 'Option label' }),
])

// Hover and focus are browser interactions. Active maps to the open menu.
export default {
  example: figma.code`
    function DropdownExample() {
      const [value, setValue] = useState<string | string[]>(${renderPropValue(initialValue)})

      // Replace the sample options with your application's choices.
      return (
        <Dropdown
          value={value}
          onChange={setValue}${renderProp('label', label)}${renderProp(
            'options',
            options,
          )}${renderProp('variant', 'single')}${renderProp('size', size)}${
            placeholder !== undefined ? renderProp('placeholder', placeholder) : ''
          }${helperText !== undefined ? renderProp('helperText', helperText) : ''}${
            errorText !== undefined ? renderProp('errorText', errorText) : ''
          }${renderProp('error', error)}${renderProp('success', success)}${renderProp(
            'disabled',
            disabled,
          )}${renderProp('defaultOpen', defaultOpen)}
        />
      )
    }
  `,
  imports: [
    'import { useState } from "react"',
    'import { Dropdown } from "@acko/dropdown"',
    'import "@acko/css/dropdown.css"',
    'import "@acko/css/drawer.css"',
  ],
  id: 'acko-dropdown',
  metadata: {
    nestable: false,
    props: {
      label,
      options,
      variant: 'single',
      size,
      placeholder,
      helperText,
      errorText,
      error,
      success,
      disabled,
      defaultOpen,
    },
  },
}
