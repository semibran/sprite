import m from 'mithril'
import extract from 'img-extract'
import Canvas from './comps/canvas'
import Thumb from './comps/thumb'
import clone from './lib/img-clone'
import slice from './lib/slice'
import merge from './lib/merge'

m.mount(document.body, () => {
  const state = {
    image: null,
    rects: [],
    sprites: [],
    selects: []
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

  const toggleEntry = (i) => (evt) => {
    const idx = state.selects.indexOf(i)
    if (idx === -1) {
      state.selects.push(i)
    } else {
      state.selects.splice(idx, 1)
    }
  }

  const mergeSelects = () => {
    state.selects.sort()
    const rects = state.selects.map(idx => state.rects[idx])
    for (let i = state.selects.length; --i;) {
      const idx = state.selects[i]
      state.rects.splice(idx, 1)
      state.sprites.splice(idx, 1)
    }
    const idx = state.selects[0]
    const rect = merge(rects)
    state.rects[idx] = rect
    state.sprites[idx] = extract(state.image, ...rect)
    state.selects.length = 0
  }

  return {
    view: () =>
      m('main.app', [
        m('aside.sidebar', [
          m('.sidebar-entries', [
            state.sprites.map((sprite, i) => {
              const rect = state.rects[i]
              const [x, y] = rect
              return m('.entry', {
                key: i + '-' + rect.join(','),
                onclick: toggleEntry(i),
                class: state.selects.includes(i) ? '-select' : -1
              }, [
                m('.entry-thumb', [
                  m(Thumb, { image: sprite })
                ]),
                m('.entry-name', x + ',' + y)
              ])
            })
          ]),
          m('.sidebar-footer', [
            m('button.button.-split', { disabled: true }, [
              m('span.icon.material-icons-round', 'vertical_split'),
              'Split'
            ]),
            m('button.button.-merge', {
              disabled: state.selects.length < 2,
              onclick: state.selects.length >= 2 && mergeSelects
            }, [
              m('span.icon.material-icons-round', 'aspect_ratio'),
              'Merge'
            ])
          ])
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
            : m(Canvas, {
              image: state.image,
              rects: state.rects,
              selects: state.selects
            })
        ])
      ])
  }
})
