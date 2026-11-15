// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=7101-374&m=dev
// component=OtpInput
import figma from 'figma'

const instance = figma.selectedInstance
const { renderProp, renderPropValue } = figma.helpers.react

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
const length = instance.getEnum('Cells', {
  '4': 4,
  '6': 6,
})
const error = state === 'Error'
const success = state === 'Success'
const disabled = state === 'Disabled'
const errorText = error ? readText('Error Message') : undefined
const successText = success ? readText('Success Message') : undefined
const initialValue = instance
  .findLayers(
    (layer) => layer.type === 'TEXT' && layer.name === 'Digit Text',
    { traverseInstances: true },
  )
  .flatMap((layer) => (layer.type === 'TEXT' ? [layer.textContent] : []))
  .join('')
  .replace(/\D/g, '')
  .slice(0, length ?? 6)

const resend = !success && !disabled ? instance.findInstance('Resend') : undefined
const timeLayer = resend?.type === 'INSTANCE' ? resend.findText('Time') : undefined
const resendIn = timeLayer?.type === 'TEXT' ? timeLayer.textContent : undefined
const showResendLink = resend?.type === 'INSTANCE' && !resendIn

// Active follows browser focus; partial/filled digits come from the design.
export default {
  example: figma.code`
    function OtpInputExample() {
      const [value, setValue] = useState(${renderPropValue(initialValue)})
      ${resendIn ? '// Drive resendIn from your countdown; clear it when the timer expires.' : ''}

      return (
        <OtpInput
          value={value}
          onChange={setValue}${renderProp('length', length)}${renderProp(
            'size',
            size,
          )}${renderProp('disabled', disabled)}${renderProp('error', error)}${
            errorText !== undefined ? renderProp('errorText', errorText) : ''
          }${renderProp('success', success)}${
            successText !== undefined ? renderProp('successText', successText) : ''
          }${resendIn ? renderProp('resendIn', resendIn) : ''}${
            showResendLink || resendIn
              ? '\n          onResend={() => { /* TODO: request a new OTP and restart your countdown. */ }}'
              : ''
          }
        />
      )
    }
  `,
  imports: [
    'import { useState } from "react"',
    'import { OtpInput } from "@acko/otp-input"',
    'import "@acko/css/otp-input.css"',
  ],
  id: 'acko-otp-input',
  metadata: {
    nestable: false,
    props: {
      size,
      length,
      error,
      errorText,
      success,
      successText,
      disabled,
      resendIn,
    },
  },
}
