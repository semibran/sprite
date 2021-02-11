
import m from 'mithril'
import SpritesCanvas from './canvas-sprites'
import AnimsEditor from './editor-anims'
import RightSidebar from './sidebar-right'

export default function Editor (state, dispatch) {
  return [
    state.tab === 'sprites' ? SpritesEditor(state, dispatch) : null,
    state.tab === 'anims' ? AnimsEditor(state, dispatch) : null,
    state.tab === 'anims' && state.anims.list.length ? RightSidebar(state, dispatch) : null
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
