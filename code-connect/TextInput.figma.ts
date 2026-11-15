// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=7098-216&m=dev
// component=TextInput
import figma from 'figma'

const instance = figma.selectedInstance
const { renderProp } = figma.helpers.react

function readText(layerName: string) {
  const layer = instance.findText(layerName, { traverseInstances: true })
  return layer.type === 'TEXT' ? layer.textContent : undefined
}

const figmaType = instance.getPropertyValue('Type')
const state = instance.getPropertyValue('State')

const inputType = instance.getEnum('Type', {
  'Regular input field': 'text',
  'Phone number': 'phone',
  'Registration number': 'registrationNumber',
})
const size = instance.getEnum('Size', {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
})

const isError = state === 'Error' || state === 'Errorfilled'
const isFilled = state === 'Filled' || state === 'Errorfilled'
const isSuccess = state === 'Success'
const isDisabled = state === 'Disabled'

const showLabel = instance.getBoolean('ShowLabel')
const showHelper = instance.getBoolean('ShowHelper')
const label = showLabel ? readText('Field Label') : undefined
const placeholder = isFilled ? undefined : readText('Placeholder Text')
const defaultValue = isFilled ? readText('Value Text') : undefined
const helperText = showHelper && !isError ? readText('Helper Text') : undefined
const errorText = showHelper && isError ? readText('Error Message') : undefined
const prefix = figmaType === 'Phone number' ? readText('Prefix') : undefined

const supportsIcons = figmaType === 'Regular input field'
const showLeadingIcon = supportsIcons && instance.getBoolean('Leading icon')
const showTrailingIcon = supportsIcons && instance.getBoolean('Trailing icon')
const leadingIcon = showLeadingIcon
  ? instance.findInstance('Leading icon').executeTemplate().example
  : undefined
const trailingIcon = showTrailingIcon
  ? instance.findInstance('Trailing icon').executeTemplate().example
  : undefined

const textInputExample = figma.code`
  <TextInput${renderProp('inputType', inputType)}${renderProp('size', size)}${
    label ? renderProp('label', label) : ''
  }${placeholder ? renderProp('placeholder', placeholder) : ''}${
    defaultValue ? renderProp('defaultValue', defaultValue) : ''
  }${helperText ? renderProp('helperText', helperText) : ''}${
    errorText ? renderProp('errorText', errorText) : ''
  }${prefix ? renderProp('prefix', prefix) : ''}${renderProp('error', isError)}${renderProp(
    'success',
    isSuccess,
  )}${renderProp('disabled', isDisabled)}${
    leadingIcon ? renderProp('leftIcon', leadingIcon) : ''
  }${trailingIcon ? renderProp('rightIcon', trailingIcon) : ''} />
`

export default {
  example: textInputExample,
  imports: ['import { TextInput } from "@acko/text-input"'],
  id: 'acko-text-input',
  metadata: {
    nestable: true,
    props: {
      inputType,
      size,
      error: isError,
      success: isSuccess,
      disabled: isDisabled,
    },
  },
}
