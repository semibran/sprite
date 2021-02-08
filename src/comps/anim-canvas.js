import m from 'mithril'

export default () => {
  let image = null
  let canvas = null
  let presspos = null
  let xoffset = 0
  let yoffset = 0
  let changeOffset = null

  const update = (vnode) => {
    image = vnode.attrs.image
    canvas = vnode.dom
    xoffset = vnode.attrs.offset.x
    yoffset = vnode.attrs.offset.y
    changeOffset = vnode.attrs.onchangeoffset
    resize(canvas)

    const xcenter = Math.round(canvas.width / 2)
    const ycenter = Math.round(canvas.height / 2)
    fill(canvas, xcenter, ycenter)

    const context = canvas.getContext('2d')
    const x = xcenter - xoffset
    const y = ycenter - yoffset
    if (presspos) {
      context.strokeStyle = '#68e'
      context.strokeRect(x - 0.5, y - 0.5, image.width + 1, image.height + 1)
    }
    context.drawImage(image, x, y)
  }

  const onresize = (vnode) => () => update(vnode)

  const onmousedown = (evt) => {
    const xcenter = Math.round(canvas.width / 2)
    const ycenter = Math.round(canvas.height / 2)
    const x = evt.offsetX - xcenter + xoffset
    const y = evt.offsetY - ycenter + yoffset
    if (x >= 0 && x < image.width && y >= 0 && y < image.height) {
      presspos = { x, y }
      m.redraw()
    }
  }

  const onmousemove = (evt) => {
    if (!presspos) return
    const xcenter = Math.round(canvas.width / 2)
    const ycenter = Math.round(canvas.height / 2)
    const x = evt.offsetX - xcenter
    const y = evt.offsetY - ycenter
    changeOffset(presspos.x - x, presspos.y - y)
    m.redraw()
  }

  const onmouseup = (evt) => {
    presspos = null
    m.redraw()
  }

  return {
    oncreate: (vnode) => {
      const canvas = vnode.dom
      update(vnode)
      window.addEventListener('resize', onresize(vnode))
      canvas.addEventListener('mousedown', onmousedown)
      window.addEventListener('mousemove', onmousemove)
      window.addEventListener('mouseup', onmouseup)
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
