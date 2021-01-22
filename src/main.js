import m from 'mithril'
import extract from 'img-extract'
import Canvas from './comps/canvas'
import Thumb from './comps/thumb'
import clone from './lib/img-clone'
import slice from './lib/slice'

m.mount(document.body, () => {
  const state = {
    image: null,
    rects: [],
    sprites: []
  }

  const uploadImage = (evt) => {
    const image = new Image()
    image.src = URL.createObjectURL(evt.target.files[0])
    image.onload = () =>
      setImage(image)
  }

  const setImage = (image) => {
    state.image = clone(image)
    state.rects = slice(state.image)
    state.sprites = state.rects.map(rect => extract(image, ...rect))
    m.redraw()
  }

  return {
    view: () =>
      m('main.app', [
        m('aside.sidebar', [
          state.sprites.map((sprite, i) => {
            const [x, y] = state.rects[i]
            return m('.entry', [
              m('.entry-thumb', [
                m(Thumb, { image: sprite })
              ]),
              m('.entry-name', `${x},${y}`)
            ])
          })
        ]),
        m('#editor', [
          !state.image
            ? m('.upload-wrap', [
                m('label.button.upload-button', { for: 'upload' }, [
                  m('span.icon.material-icons-round', 'publish'),
                  'Select an image',
                  m('input#upload', {
                    type: 'file',
                    accept: 'image/png, image/gif',
                    multiple: false,
                    onchange: uploadImage
                  })
                ]),
                m('span.upload-text', 'Accepted formats: .png, .gif')
              ])
            : m(Canvas, { image: state.image })
        ])
      ])
  }
})
