// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=7814-342&m=dev
// component=Badge
import figma from 'figma'

const instance = figma.selectedInstance
const { renderChildren, renderProp } = figma.helpers.react

const color = instance.getEnum('Colour', {
  Purple: 'purple',
  Green: 'green',
  Blue: 'blue',
  Orange: 'orange',
  Pink: 'pink',
  Red: 'red',
  Grey: 'grey',
  Black: 'black',
})
const size = instance.getEnum('Size', {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
})
const variant = instance.getEnum('Style', {
  Solid: 'solid',
  Outline: 'outline',
})
const label = instance.getString('Label')
const showIcon = instance.getBoolean('Icon')
const icon = showIcon
  ? instance.findInstance('Icon').executeTemplate().example
  : undefined

export default {
  example: figma.code`
    <Badge${renderProp('color', color)}${renderProp('size', size)}${renderProp(
      'variant',
      variant,
    )}${icon ? renderProp('icon', icon) : ''}>
      ${renderChildren(label)}
    </Badge>
  `,
  imports: ['import { Badge } from "@acko/badge"'],
  id: 'acko-badge',
  metadata: {
    nestable: true,
    props: {
      color,
      size,
      variant,
    },
  },
}
