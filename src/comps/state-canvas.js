import m from 'mithril'

export default () => ({
  oncreate: (vnode) => {
    const image = vnode.attrs.image
    const canvas = vnode.dom
    const context = canvas.getContext('2d')

    const update = () => {
      resize(canvas)
      fill(canvas)
      const xoffset = Math.round(canvas.width / 2 - image.width / 2)
      const yoffset = Math.round(canvas.height / 2 - image.height / 2)
      context.drawImage(image, xoffset, yoffset)
    }

    update()
    window.addEventListener('resize', update)
  },
  view: () =>
    m('canvas.-state')
})

function resize (canvas) {
  canvas.width = Math.floor(canvas.parentNode.offsetWidth / 2)
  canvas.height = Math.floor(canvas.parentNode.offsetHeight / 2)
}

function fill (canvas) {
  const context = canvas.getContext('2d')
  context.fillStyle = '#999'
  context.fillRect(0, 0, canvas.width, canvas.height)
  for (let y = 0; y < canvas.height; y += 16) {
    for (let x = 0; x < canvas.width; x += 16) {
      if ((x + y) % 32) {
        context.fillStyle = '#ccc'
        context.fillRect(x, y, 16, 16)
      }
    }
  }
}
