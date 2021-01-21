import m from 'mithril'

const Canvas = {
  oncreate: vnode => {
    const image = vnode.attrs.image
    const canvas = vnode.dom
    const parent = canvas.parentNode
    const context = canvas.getContext('2d')
    canvas.width = parent.offsetWidth
    canvas.height = parent.offsetHeight
    context.fillStyle = 'gray'
    context.fillRect(0, 0, canvas.width, canvas.height)
    for (let y = 0; y < canvas.height; y += 16) {
      for (let x = 0; x < canvas.width; x += 16) {
        if ((x + y) % 32) {
          context.fillStyle = 'silver'
          context.fillRect(x, y, 16, 16)
        }
      }
    }
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
