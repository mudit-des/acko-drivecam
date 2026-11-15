// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=11754-617&m=dev
// component=Button
import figma from 'figma'

const instance = figma.selectedInstance
const { renderChildren, renderProp } = figma.helpers.react

const variant = instance.getEnum('Type', {
  Primary: 'primary',
  Secondary: 'secondary',
  'Secondary-onDark': 'secondary-on-dark',
  Ghost: 'ghost',
  'Primary-onDark': 'primary-on-dark',
  Link: 'link',
  'Destructive-Low': 'destructive-low',
  'Destructive-High': 'destructive-high',
  'Ghost-onDark': 'ghost-on-dark',
  'Link-onDark': 'link-on-dark',
  'Destructive-onDark': 'destructive-on-dark',
  White: 'white',
  Translucent: 'translucent',
})
const size = instance.getEnum('Size', {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
})
const disabled = instance.getEnum('State', {
  Default: false,
  Hover: false,
  Active: false,
  Disabled: true,
})
const iconOnly = instance.getEnum('Content', {
  Text: false,
  Icon: true,
})

const label = instance.getString('Label')
const showIconLeft = instance.getBoolean('Show Icon Left')
const showIconRight = instance.getBoolean('Show Icon Right')
const iconLeft = instance.getInstanceSwap('Icon Left')
const iconRight = instance.getInstanceSwap('Icon Right')

const iconLeftExample = showIconLeft ? iconLeft?.executeTemplate().example : undefined
const iconRightExample =
  showIconRight || iconOnly ? iconRight?.executeTemplate().example : undefined

const unsupportedVariant = figma.code`
  /* This Figma Button type has no verified equivalent in the installed @acko/button package. */
`

const buttonExample = figma.code`
  <Button${renderProp('variant', variant)}${renderProp('size', size)}${renderProp(
    'disabled',
    disabled,
  )}${renderProp('iconOnly', iconOnly)}${
    iconLeftExample ? renderProp('iconLeft', iconLeftExample) : ''
  }${iconRightExample ? renderProp('iconRight', iconRightExample) : ''}>
    ${renderChildren(label)}
  </Button>
`

export default {
  example: variant ? buttonExample : unsupportedVariant,
  imports: ['import { Button } from "@acko/button"'],
  id: 'acko-button',
  metadata: {
    nestable: true,
    props: {
      variant,
      size,
      disabled,
      iconOnly,
    },
  },
}
