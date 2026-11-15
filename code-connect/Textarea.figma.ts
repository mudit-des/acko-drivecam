// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=7100-296&m=dev
// component=Textarea
import figma from 'figma'

const instance = figma.selectedInstance
const { renderProp } = figma.helpers.react

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
const error = state === 'Error' || state === 'Error Filled'
const success = state === 'Success'
const disabled = state === 'Disabled'
const label = readText('Field Label')
const placeholder = readText('Placeholder Text')
const defaultValue = readText('Value Text')
const helperText = error
  ? undefined
  : readText(success ? 'Success Message' : 'Helper Text')
const errorText = error ? readText('Error Message') : undefined

// The maximum comes from the design; the live count follows the actual value.
const counter = readText('Character Counter')
const counterMatch = counter?.match(/^\s*\d+\s*\/\s*(\d+)\s*$/)
const parsedMaxLength = counterMatch ? Number(counterMatch[1]) : undefined
const maxLength =
  parsedMaxLength !== undefined && Number.isSafeInteger(parsedMaxLength)
    ? parsedMaxLength
    : undefined
const showCount = maxLength !== undefined

// Hover, Focused and Active follow browser interaction; defaultValue stays editable.
export default {
  example: figma.code`
    <Textarea${renderProp('size', size)}${
      label !== undefined ? renderProp('label', label) : ''
    }${placeholder !== undefined ? renderProp('placeholder', placeholder) : ''}${
      defaultValue !== undefined ? renderProp('defaultValue', defaultValue) : ''
    }${helperText !== undefined ? renderProp('helperText', helperText) : ''}${
      errorText !== undefined ? renderProp('errorText', errorText) : ''
    }${renderProp('error', error)}${renderProp('success', success)}${renderProp(
      'disabled',
      disabled,
    )}${renderProp('showCount', showCount)}${
      maxLength !== undefined ? renderProp('maxLength', maxLength) : ''
    } />
  `,
  imports: [
    'import { Textarea } from "@acko/textarea"',
    'import "@acko/css/textarea.css"',
  ],
  id: 'acko-textarea',
  metadata: {
    nestable: true,
    props: {
      size,
      label,
      placeholder,
      defaultValue,
      helperText,
      errorText,
      error,
      success,
      disabled,
      showCount,
      maxLength,
    },
  },
}
