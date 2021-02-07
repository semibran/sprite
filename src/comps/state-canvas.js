import m from 'mithril'

export default () => {
  const update = (vnode) => {
    const image = vnode.attrs.image
    const canvas = vnode.dom
    resize(canvas)

    const xoffset = Math.round(canvas.width / 2)
    const yoffset = Math.round(canvas.height / 2)
    const context = canvas.getContext('2d')
    fill(canvas, xoffset, yoffset)
    context.drawImage(image, xoffset, yoffset)
  }
  return {
    oncreate: (vnode) => {
      update(vnode)
      window.addEventListener('resize', () => update(vnode))
    },
    onupdate: update,
    view: () => m('canvas')
  }
}

function resize (canvas) {
  canvas.width = Math.floor(canvas.parentNode.offsetWidth / 2)
  canvas.height = Math.floor(canvas.parentNode.offsetHeight / 2)
}

function fill (canvas, x, y) {
  const context = canvas.getContext('2d')
  context.fillStyle = '#999'
  context.fillRect(0, 0, canvas.width, canvas.height)
  const xoffset = x % 16 - 16
  const yoffset = y % 16 - 16
  for (let y = 0; y < yoffset + canvas.height + 32; y += 16) {
    for (let x = 0; x < xoffset + canvas.width + 32; x += 16) {
      if ((x + y) % 32) {
        context.fillStyle = '#ccc'
        context.fillRect(x + xoffset, y + yoffset, 16, 16)
      }
    }
  }
  context.strokeStyle = 'white'

  context.beginPath()
  context.moveTo(x + 0.5, 0)
  context.lineTo(x + 0.5, canvas.height - 1)
  context.stroke()

  context.beginPath()
  context.moveTo(0, y + 0.5)
  context.lineTo(canvas.width - 1, y + 0.5)
  context.stroke()
}
