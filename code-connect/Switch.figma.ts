// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=7099-176&m=dev
// component=Switch
import figma from 'figma'

const instance = figma.selectedInstance
const { renderProp, renderPropValue } = figma.helpers.react

const state = instance.getPropertyValue('State')
const size = instance.getEnum('Size', {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
})
// Figma's Focused variant has the thumb in the on position.
// Focus itself remains a browser interaction, not an autoFocus side effect.
const initialChecked =
  state === 'On' || state === 'Focused' || state === 'Disabled On'
const disabled = state === 'Disabled Off' || state === 'Disabled On'
const labelLayer = instance.findText('Field Label', { traverseInstances: true })
const label = labelLayer.type === 'TEXT' ? labelLayer.textContent : undefined

export default {
  example: figma.code`
    function SwitchExample() {
      const [checked, setChecked] = useState(${renderPropValue(initialChecked)})

      return (
        <Switch
          checked={checked}
          onCheckedChange={setChecked}${renderProp('size', size)}${renderProp(
            'disabled',
            disabled,
          )}${
            label
              ? renderProp('label', label)
              : renderProp('aria-label', 'Switch label')
          }
        />
      )
    }
  `,
  imports: [
    'import { useState } from "react"',
    'import { Switch } from "@acko/switch"',
    'import "@acko/css/switch.css"',
  ],
  id: 'acko-switch',
  metadata: {
    nestable: false,
    props: {
      size,
      checked: initialChecked,
      disabled,
      label,
    },
  },
}
