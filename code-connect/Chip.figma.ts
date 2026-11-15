// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=12276-2&m=dev
// component=Chip
import figma from 'figma'

const instance = figma.selectedInstance
const { renderProp, renderPropValue } = figma.helpers.react

const state = instance.getPropertyValue('State')
const size = instance.getEnum('Size', {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
})
const initialSelected = state === 'Selected'
const disabled = state === 'Disabled'
const labelLayer = instance.findText('Label', { traverseInstances: true })
const label = labelLayer.type === 'TEXT' ? labelLayer.textContent : 'Option label'
const showIcon = instance.getBoolean('Show Icon')
const icon = showIcon
  ? instance.findInstance('Icon').executeTemplate().example
  : undefined

// Hover and Pressed are pointer interactions, not persistent selection.
export default {
  example: figma.code`
    function ChipExample() {
      const [selected, setSelected] = useState(${renderPropValue(initialSelected)})

      return (
        <Chip
          selected={selected}
          onSelect={() => setSelected((previous) => !previous)}${renderProp(
            'label',
            label,
          )}${renderProp('size', size)}${renderProp('disabled', disabled)}${
            icon ? renderProp('icon', icon) : ''
          }
        />
      )
    }
  `,
  imports: [
    'import { useState } from "react"',
    'import { Chip } from "@acko/chip"',
    'import "@acko/css/chip.css"',
  ],
  id: 'acko-chip',
  metadata: {
    nestable: false,
    props: {
      label,
      size,
      selected: initialSelected,
      disabled,
    },
  },
}
