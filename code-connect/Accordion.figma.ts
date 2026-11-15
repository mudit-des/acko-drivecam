// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=7104-182&m=dev
// component=Accordion
import figma from 'figma'

const instance = figma.selectedInstance
const { renderChildren, renderProp } = figma.helpers.react

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
const title = readText('Title Text')
// Closed variants omit the body layer; supply content for when the item opens.
const content = readText('Body Text') ?? 'Accordion content'
const disabled = state === 'Disabled'
const defaultValue = state === 'Open' ? 'item-1' : undefined

export default {
  example: figma.code`
    <Accordion${renderProp('type', 'single')}${renderProp('size', size)}${
      defaultValue ? renderProp('defaultValue', defaultValue) : ''
    }>
      <AccordionItem${renderProp('value', 'item-1')}${renderProp(
        'title',
        title,
      )}${renderProp('disabled', disabled)}>
        ${renderChildren(content)}
      </AccordionItem>
    </Accordion>
  `,
  imports: [
    'import { Accordion, AccordionItem } from "@acko/accordion"',
    'import "@acko/css/accordion.css"',
  ],
  id: 'acko-accordion',
  metadata: {
    nestable: false,
    props: {
      type: 'single',
      size,
      defaultValue,
    },
  },
}
