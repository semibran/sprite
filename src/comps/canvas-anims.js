
import m from 'mithril'
import extract from 'img-extract'

export default () => {
  let canvas = null
  let sheet = null
  let frame = null
  let frames = null
  let playing = null
  let presspos = null
  let changeOffset = null

  const cache = (vnode) => {
    canvas = vnode.dom
    sheet = vnode.attrs.image
    frame = vnode.attrs.frame
    frames = vnode.attrs.frames
    playing = vnode.attrs.playing
    changeOffset = vnode.attrs.onchangeoffset
  }

  const update = () => {
    resize(canvas)

    const xcenter = Math.round(canvas.width / 2)
    const ycenter = Math.round(canvas.height / 2)
    fill(canvas, xcenter, ycenter)

    let framesBefore = []
    let framesAfter = []
    if (frames.length && !playing) {
      const idx = frames.indexOf(frame)
      framesBefore = frames.slice(0, idx)
      framesAfter = frames.slice(idx + 1, frames.length)
    }

    const context = canvas.getContext('2d')

    for (const frame of framesAfter) {
      const image = extract(sheet, ...frame.sprite.rect)
      const x = xcenter - frame.origin.x
      const y = ycenter - frame.origin.y
      context.globalAlpha = 0.25
      context.drawImage(image, x, y)
      context.globalAlpha = 1
    }

    if (frame && frame.sprite) {
      const image = extract(sheet, ...frame.sprite.rect)
      const x = xcenter - frame.origin.x
      const y = ycenter - frame.origin.y

      if (!playing) {
        context.strokeStyle = presspos ? '#cdf' : '#68e'
        context.strokeRect(x + 0.5, y + 0.5, image.width - 1, image.height - 1)
      }

      context.drawImage(image, x, y)
    }

    for (const frame of framesBefore) {
      const image = extract(sheet, ...frame.sprite.rect)
      const x = xcenter - frame.origin.x
      const y = ycenter - frame.origin.y
      context.globalAlpha = 0.25
      context.drawImage(image, x, y)
      context.globalAlpha = 1
    }
  }

  const onupdate = (vnode) => {
    cache(vnode)
    update()
  }

  const onmousedown = (evt) => {
    if (!frame || !frame.sprite) return
    const xcenter = Math.round(canvas.width / 2)
    const ycenter = Math.round(canvas.height / 2)
    const x = evt.offsetX - xcenter + frame.origin.x
    const y = evt.offsetY - ycenter + frame.origin.y
    const width = frame.sprite.rect[2]
    const height = frame.sprite.rect[3]
    if (x >= 0 && x < width && y >= 0 && y < height) {
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
    changeOffset(presspos.x - x - frame.origin.x, presspos.y - y - frame.origin.y)
    m.redraw()
  }

  const onmouseup = (evt) => {
    if (!presspos) return
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
      changeOffset(-xdelta, -ydelta)
      m.redraw()
    }
  }

  return {
    oncreate: (vnode) => {
      const canvas = vnode.dom
      onupdate(vnode)
      window.addEventListener('resize', update)
      canvas.addEventListener('mousedown', onmousedown)
      window.addEventListener('mousemove', onmousemove)
      window.addEventListener('mouseup', onmouseup)
      window.addEventListener('keydown', onkeydown)
    },
    onupdate,
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
  context.lineTo(x + 0.5, canvas.height + 1)
  context.stroke()

  context.beginPath()
  context.moveTo(0, y + 0.5)
  context.lineTo(canvas.width + 1, y + 0.5)
  context.stroke()
}