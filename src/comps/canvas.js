import m from 'mithril'

export default {
  oncreate: vnode => {
    const canvas = vnode.dom
    resize(canvas)
    canvas.height = vnode.attrs.image.height
    fill(canvas)

    const image = split(clone(vnode.attrs.image))
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
  },
  view: () =>
    m('canvas')
}

function resize (canvas) {
  canvas.width = canvas.parentNode.offsetWidth
  canvas.height = canvas.parentNode.offsetHeight
}

function clone (image) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = image.width
  canvas.height = image.height
  context.drawImage(image, 0, 0)
  return canvas
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

function split (canvas) {
  const context = canvas.getContext('2d')
  const imagedata = context.getImageData(0, 0, canvas.width, canvas.height)
  const rows = []
  for (let y = 0; y < canvas.height; y++) {
    let clear = true
    for (let x = 0; x < canvas.width; x++) {
      const idx = y * canvas.width + x
      const alpha = imagedata.data[idx * 4 + 3]
      if (alpha) {
        clear = false
        break
      }
    }
    if (clear) {
      rows.push(y)
    }
  }

  const subsheets = []
  let prev = null
  let y = null
  for (let i = 0; i < rows.length; i++) {
    if (prev === null && y !== null) {
      const subcanvas = document.createElement('canvas')
      subcanvas.width = canvas.width
      subcanvas.height = rows[i] - y - 1
      subcanvas.getContext('2d')
        .drawImage(canvas, 0, -y)
      subsheets.push({ y, canvas: subcanvas })
      y = null
    }
    if (prev === null || rows[i - 1] === rows[i] - 1) {
      prev = rows[i]
    } else {
      y = prev + 1
      prev = null
    }
  }

  for (const { y: suby, canvas: subcanvas } of subsheets) {
    const cols = []
    for (let x = 0; x < canvas.width; x++) {
      let clear = true
      for (let y = 0; y < subcanvas.height; y++) {
        const idx = (y + suby) * canvas.width + x
        const alpha = imagedata.data[idx * 4 + 3]
        if (alpha) {
          clear = false
          break
        }
      }
      if (clear) {
        cols.push(x)
      }
    }

    const sprites = []
    let prev = null
    let x = null
    for (let i = 0; i < cols.length; i++) {
      if (prev === null && x !== null) {
        const sprite = document.createElement('canvas')
        sprite.width = cols[i] - x - 1
        sprite.height = subcanvas.height
        sprite.getContext('2d')
          .drawImage(canvas, -x, -(y + suby))
        sprites.push({ x, y: y + suby, canvas: sprite })
        x = null
      }
      if (prev === null || cols[i - 1] === cols[i] - 1) {
        prev = cols[i]
      } else {
        x = prev + 1
        prev = null
      }
    }

    for (let i = 0; i < sprites.length; i++) {
      const { x: subx, y: suby, canvas: subcanvas } = sprites[i]
      const rows = []
      for (let y = 0; y < subcanvas.height; y++) {
        let clear = true
        for (let x = 0; x < subcanvas.width; x++) {
          const idx = (y + suby) * canvas.width + (x + subx)
          const alpha = imagedata.data[idx * 4 + 3]
          if (alpha) {
            clear = false
            break
          }
        }
        if (!clear) {
          rows.push(y)
        }
      }

      const top = rows[0]
      const bottom = rows[rows.length - 1]
      const sprite = document.createElement('canvas')
      sprite.width = subcanvas.width
      sprite.height = bottom - top + 1
      sprite.getContext('2d')
        .drawImage(canvas, 0, -top)
      context.strokeStyle = 'white'
      context.strokeRect(x + subx + 0.5, suby + top + 0.5, sprite.width - 0.5, sprite.height - 0.5)
    }
  }

  return canvas
}
