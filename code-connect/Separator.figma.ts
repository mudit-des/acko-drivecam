// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=10578-736&m=dev
// component=Separator
import figma from 'figma'

const instance = figma.selectedInstance
const { renderProp } = figma.helpers.react

const orientation = instance.getEnum('Orientation', {
  Horizontal: 'horizontal',
  Vertical: 'vertical',
})
const variant = instance.getEnum('State', {
  Default: 'default',
  Strong: 'strong',
})

// Weight=Default is the component's fixed 1px line; there is no weight prop.
// Vertical separators need a flex row with height, or an explicit CSS height.
export default {
  example: figma.code`
    <Separator${renderProp('orientation', orientation)}${renderProp('variant', variant)} />
  `,
  imports: [
    'import { Separator } from "@acko/separator"',
    'import "@acko/css/separator.css"',
  ],
  id: 'acko-separator',
  metadata: {
    nestable: true,
    props: {
      orientation,
      variant,
    },
  },
}
