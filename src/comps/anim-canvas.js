import m from 'mithril'

export default () => {
  let canvas = null
  let frame = null
  let frameBefore = null
  let frameAfter = null
  let playing = null
  let presspos = null
  let changeOffset = null

  const update = (vnode) => {
    canvas = vnode.dom
    frame = vnode.attrs.frame
    frameBefore = vnode.attrs.frameBefore
    frameAfter = vnode.attrs.frameAfter
    playing = vnode.attrs.playing
    changeOffset = vnode.attrs.onchangeoffset
    resize(canvas)

    const xcenter = Math.round(canvas.width / 2)
    const ycenter = Math.round(canvas.height / 2)
    fill(canvas, xcenter, ycenter)

    const context = canvas.getContext('2d')

    if (frameAfter && !playing) {
      const image = frameAfter.sprite.image
      const x = xcenter - frameAfter.origin.x
      const y = ycenter - frameAfter.origin.y
      context.globalAlpha = 0.25
      context.drawImage(image, x, y)
      context.globalAlpha = 1
    }

    const image = frame.sprite.image
    const x = xcenter - frame.origin.x
    const y = ycenter - frame.origin.y

    if (!playing) {
      context.strokeStyle = presspos ? '#cdf' : '#68e'
      context.strokeRect(x - 0.5, y - 0.5, image.width + 1, image.height + 1)
    }

    context.drawImage(image, x, y)

    if (frameBefore && !playing) {
      const image = frameBefore.sprite.image
      const x = xcenter - frameBefore.origin.x
      const y = ycenter - frameBefore.origin.y
      context.globalAlpha = 0.25
      context.drawImage(image, x, y)
      context.globalAlpha = 1
    }
  }

  const onresize = (vnode) => () => update(vnode)

  const onmousedown = (evt) => {
    const xcenter = Math.round(canvas.width / 2)
    const ycenter = Math.round(canvas.height / 2)
    const x = evt.offsetX - xcenter + frame.origin.x
    const y = evt.offsetY - ycenter + frame.origin.y
    const image = frame.sprite.image
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

  const onkeydown = (evt) => {
    const left = evt.code === 'ArrowLeft'
    const right = evt.code === 'ArrowRight'
    const up = evt.code === 'ArrowUp'
    const down = evt.code === 'ArrowDown'
    const shift = evt.shiftKey
    let xdelta = 0
    let ydelta = 0

    if (left && !right) {
      xdelta = -1
    } else if (right && !left) {
      xdelta = 1
    }

    if (up && !down) {
      ydelta = -1
    } else if (down && !up) {
      ydelta = 1
    }

    if (shift) {
      xdelta *= 10
      ydelta *= 10
    }

    if (xdelta || ydelta) {
      changeOffset(frame.origin.x - xdelta, frame.origin.y - ydelta)
      m.redraw()
    }
  }

  return {
    oncreate: (vnode) => {
      const canvas = vnode.dom
      update(vnode)
      window.addEventListener('resize', onresize(vnode))
      canvas.addEventListener('mousedown', onmousedown)
      window.addEventListener('mousemove', onmousemove)
      window.addEventListener('mouseup', onmouseup)
      window.addEventListener('keydown', onkeydown)
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
