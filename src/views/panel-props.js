
import Panel from './panel'
import ProjectPanel from './props-project'
import SpritePanel from './props-sprite'
import SpritesPanel from './props-sprites'
import AnimPanel from './props-anim'
import FramePanel from './props-frame'
import {
  isNoneSelected,
  getSelectedSprites,
  getSelectedAnim,
  getSelectedFrame
} from '../app/helpers'

export const showProps = (state) => ({
  ...state,
  panels: { ...state.panels, props: true }
})

export const hideProps = (state) => ({
  ...state,
  panels: { ...state.panels, props: false }
})

export default function PropsPanel (state, dispatch) {
  const shown = state.panels.props
  const sprites = getSelectedSprites(state)
  const sprite = sprites[sprites.length - 1]
  const anim = getSelectedAnim(state)
  const frame = state.select.focus === 'timeline' && getSelectedFrame(state)
  let name = null
  let panel = null
  if (isNoneSelected(state)) {
    name = 'Project'
    panel = ProjectPanel({ project: state.project, sprites: state.sprites.list, anims: state.anims.list })
  } else if (sprites.length === 1) {
    name = 'Sprite'
    panel = SpritePanel({ sprite })
  } else if (sprites.length > 1) {
    name = 'Sprites'
    panel = SpritesPanel({ sprites })
  } else if (frame) {
    name = 'Frame'
    panel = FramePanel({ frame, sprites: state.sprites.list }, dispatch)
  } else if (anim) {
    name = 'Animation'
    panel = AnimPanel({ anim, id: state.anims.index }, dispatch)
  }
  return Panel({
    id: 'props',
    name,
    shown,
    onshow: () => dispatch(showProps),
    onhide: () => dispatch(hideProps)
  }, panel)
}
