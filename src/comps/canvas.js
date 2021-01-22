import m from 'mithril'

export default {
  oncreate: vnode => {
    const image = vnode.attrs.image
    const canvas = vnode.dom
    resize(canvas)
    // canvas.height = image.height
    fill(canvas)

    const context = canvas.getContext('2d')
    context.drawImage(image, Math.round(canvas.width / 2 - image.width / 2), 0)
  },
  view: () =>
    m('canvas')
}

function resize (canvas) {
  canvas.width = canvas.parentNode.offsetWidth
  canvas.height = canvas.parentNode.offsetHeight
}

function fill (canvas) {
  const context = canvas.getContext('2d')
  context.fillStyle = '#444'
  context.fillRect(0, 0, canvas.width, canvas.height)
  for (let y = 0; y < canvas.height; y += 16) {
    for (let x = 0; x < canvas.width; x += 16) {
      if ((x + y) % 32) {
        context.fillStyle = '#666'
        context.fillRect(x, y, 16, 16)
      }
    }
  }
}
