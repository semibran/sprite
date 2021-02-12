
import m from 'mithril'
import SpritesCanvas from './canvas-sprites'

export default function SpritesEditor (state, dispatch) {
  return m('#editor.-sprites', [
    !state.cache.image
      ? UploadButton()
      : m(SpritesCanvas, {
        image: state.cache.image,
        rects: state.sprites.list.map(sprite => sprite.rect),
        selects: state.sprites.selects
      })
  ])
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
