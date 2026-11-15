// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=11270-585&m=dev
// source=node_modules/@acko/calendar/src/DateInput.tsx
// component=DateInput
import figma from 'figma'

const instance = figma.selectedInstance
const { identifier, renderProp } = figma.helpers.react

// Each State variant wraps a TextInput instance; its text layers hold the copy.
function readText(layerName: string) {
  const layer = instance.findText(layerName, { traverseInstances: true })
  return layer.type === 'TEXT' ? layer.textContent : undefined
}

// DateInput takes a Date; Figma shows the value as DD/MM/YYYY text.
function dateExpression(text: string | undefined) {
  const match = text?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  return match ? `new Date(${Number(match[3])}, ${Number(match[2]) - 1}, ${Number(match[1])})` : undefined
}

// DateInput's own placeholder and helper text; only emit Figma copy that differs.
const DATE_FORMAT = 'DD/MM/YYYY'

const state = instance.getEnum('State', {
  Default: 'default',
  Filled: 'filled',
  Error: 'error',
  Disabled: 'disabled',
})
const isError = state === 'error'
const isDisabled = state === 'disabled'

const label = readText('Field Label')
const value = state === 'filled' ? dateExpression(readText('Value Text')) : undefined
// In the Error variant the placeholder layer holds the invalid typed date, not a placeholder.
const placeholder = state === 'default' || state === 'disabled' ? readText('Placeholder Text') : undefined
const helperText = isError ? undefined : readText('Helper Text')
const errorText = isError ? readText('Error Message') : undefined

export default {
  example: figma.code`
    <DateInput mode="dob"${label ? renderProp('label', label) : ''}${
      value ? renderProp('defaultValue', identifier(value)) : ''
    }${placeholder && placeholder !== DATE_FORMAT ? renderProp('placeholder', placeholder) : ''}${
      helperText && helperText !== DATE_FORMAT ? renderProp('helperText', helperText) : ''
    }${errorText ? renderProp('errorText', errorText) : ''}${renderProp('error', isError)}${renderProp(
      'disabled',
      isDisabled,
    )} />
  `,
  imports: [
    'import { DateInput } from "@acko/calendar"',
    'import "@acko/css/calendar.css"',
    'import "@acko/css/drawer.css"',
  ],
  id: 'acko-dob-field',
  metadata: {
    nestable: true,
    props: {
      mode: 'dob',
      error: isError,
      disabled: isDisabled,
    },
  },
}
