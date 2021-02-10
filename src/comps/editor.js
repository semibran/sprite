
import m from 'mithril'
import SpritesCanvas from './sprites-canvas'
import AnimsCanvas from './anims-canvas'

export default function Editor (state, dispatch) {
  return [
    state.tab === 'sprites' ? SpritesEditor(state, dispatch) : null,
    state.tab === 'anims' ? AnimsEditor(state, dispatch) : null,
    state.tab === 'anims' ? RightSidebar(state, dispatch) : null
  ]
}
function UploadButton (state, dispatch) {
  m('.upload-wrap', [
    m('label.button.upload-button', { for: 'upload' }, [
      m('span.icon.material-icons-round', 'publish'),
      'Select an image',
      m('input#upload', {
        type: 'file',
        accept: 'image/png, image/gif',
        multiple: false
      })
    ]),
    m('span.upload-text', 'Accepted formats: .png, .gif')
  ])
}

function SpritesEditor (state, dispatch) {
  return m('#editor.-sprites', [
    !state.image
      ? UploadButton()
      : m(SpritesCanvas, {
        image: state.image,
        rects: state.sprites.list.map(sprite => sprite.rect),
        selects: state.sprites.selects
      })
  ])
}

function AnimsEditor (state, dispatch) {
  const tl = state.timeline
  const anim = state.anims.select
  const selects = tl.selects
  const frame = anim && getFrameAt(anim, tl.pos)
  const frames = anim && (selects.length > 1
    ? getFramesAt(anim, selects)
    : getFramesAt(anim, [tl.pos - 1, tl.pos, tl.pos + 1])
  )
  return m('.editor-column', [
    m('#editor.-anims', [
      state.anims.list.length
        ? m(AnimsCanvas, {
            frame,
            frames: tl.onionSkin ? frames : [],
            playing: tl.playing,
            onchangeoffset: moveFrameOrigin
          })
        : null
    ]),
    anim ? Timeline() : null
  ])
}
