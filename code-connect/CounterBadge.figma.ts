// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=7815-246&m=dev
// component=CounterBadge
import figma from 'figma'

const instance = figma.selectedInstance
const { renderProp } = figma.helpers.react

const color = instance.getEnum('Colour', {
  Purple: 'purple',
  Green: 'green',
  Blue: 'blue',
  Orange: 'orange',
  Pink: 'pink',
  Red: 'red',
  Gray: 'grey',
  Black: 'black',
})
const size = instance.getEnum('Size', {
  SM: 'sm',
  MD: 'md',
})
const countLayer = instance.findText('Count', { traverseInstances: true })
const countText = countLayer.type === 'TEXT' ? countLayer.textContent : '0'
const count = Number.parseInt(countText, 10)

export default {
  example: figma.code`
    <CounterBadge${renderProp('count', count)}${renderProp('color', color)}${renderProp(
      'size',
      size,
    )} />
  `,
  imports: ['import { CounterBadge } from "@acko/badge"'],
  id: 'acko-counter-badge',
  metadata: {
    nestable: true,
    props: {
      count,
      color,
      size,
    },
  },
}
