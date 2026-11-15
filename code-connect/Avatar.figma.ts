// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=7252-213&m=dev
// component=Avatar
import figma from 'figma'

const instance = figma.selectedInstance
const { identifier, renderProp } = figma.helpers.react

function readText(layerName: string) {
  const layer = instance.findText(layerName, { traverseInstances: true })
  return layer.type === 'TEXT' ? layer.textContent : undefined
}

const type = instance.getPropertyValue('Type')
const size = instance.getEnum('Size', {
  '24': 24,
  '32': 32,
  '40': 40,
  '48': 48,
  '64': 64,
})
const layout = instance.getEnum('Layout', {
  Stacked: 'stacked',
  Horizontal: 'horizontal',
})
const story = type === 'Story'
const hasImage = type === 'Image' || story
const online = instance.getBoolean('Show Status')
const showText = instance.getBoolean('Show Text')
// Story and progress rings are mutually exclusive. Progress supports 40–64px.
const showProgress =
  !story && (size === 40 || size === 48 || size === 64) &&
  instance.getBoolean('Show Progress')
const initials = type === 'Initials' ? readText('AB') : undefined
const title = readText('Title')
const name = showText ? title : undefined
const subtext = showText ? readText('Subtitle') : undefined

export default {
  example: figma.code`
    ${hasImage ? '{/* Supply photoUrl from your application image data. */}' : ''}
    ${showProgress ? '{/* Supply progressValue as a number from 0 to 100. */}' : ''}
    <Avatar${renderProp('size', size)}${renderProp('layout', layout)}${
      hasImage ? renderProp('src', identifier('photoUrl')) : ''
    }${renderProp('alt', title || initials || 'Avatar')}${
      initials !== undefined ? renderProp('initials', initials) : ''
    }${name !== undefined ? renderProp('name', name) : ''}${
      subtext !== undefined ? renderProp('subtext', subtext) : ''
    }${renderProp('online', online)}${renderProp('story', story)}${
      showProgress ? renderProp('progress', identifier('progressValue')) : ''
    } />
  `,
  imports: [
    'import { Avatar } from "@acko/avatar"',
    'import "@acko/css/avatar.css"',
  ],
  id: 'acko-avatar',
  metadata: {
    nestable: true,
    props: {
      size,
      layout,
      initials,
      name,
      subtext,
      online,
      story,
    },
  },
}
