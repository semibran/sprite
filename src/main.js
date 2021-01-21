import m from 'mithril'

const Canvas = {
  oncreate: vnode => {
    const image = vnode.attrs.image
    const canvas = vnode.dom
    const context = canvas.getContext('2d')
    canvas.width = image.width
    canvas.height = image.height
    context.drawImage(image, 0, 0)
  },
  view: () =>
    m('canvas')
}

m.mount(document.body, () => {
  const state = { image: null, sprites: [] }

  const uploadImage = (evt) => {
    const image = new Image()
    image.src = URL.createObjectURL(evt.target.files[0])
    image.onload = () =>
      setImage(image)
  }

  const setImage = (image) => {
    state.image = image
    m.redraw()
  }

  return {
    view: () =>
      m('main.app', [
        m('aside.sidebar'),
        m('.editor', [
          !state.image
            ? m('.upload-wrap', [
                m('label.button.upload-button', { for: 'upload' }, [
                  m('span.icon.material-icons-round', 'publish'),
                  'Select an image...',
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
          // h('button', {}, [
          //   h('span', { class: 'icon material-icons-round' },
          //     text('publish')),
          //   text('Select an image...')
          // ])
        ])
      ])
  }
})
