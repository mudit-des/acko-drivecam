// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=7105-152&m=dev
// component=Breadcrumb
import figma from 'figma'

const instance = figma.selectedInstance
const { array, object, renderProp } = figma.helpers.react

const size = instance.getEnum('Size', {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
})

const parentLabels = instance
  .findLayers(
    (layer) => layer.type === 'TEXT' && layer.name === 'Parent Link',
    { traverseInstances: true },
  )
  .flatMap((layer) => (layer.type === 'TEXT' ? [layer.textContent] : []))

const currentPageLayer = instance.findText('Current Page', {
  traverseInstances: true,
})
const currentPage =
  currentPageLayer.type === 'TEXT' ? currentPageLayer.textContent : undefined

const items = array([
  ...parentLabels.map((label) => object({ label, href: '#' })),
  object({ label: currentPage }),
])

export default {
  example: figma.code`
    {/* Replace parent href placeholders with your application routes. */}
    <Breadcrumb${renderProp('items', items)}${renderProp('size', size)} />
  `,
  imports: [
    'import { Breadcrumb } from "@acko/breadcrumb"',
    'import "@acko/css/breadcrumb.css"',
  ],
  id: 'acko-breadcrumb',
  metadata: {
    nestable: true,
    props: {
      items,
      size,
    },
  },
}
