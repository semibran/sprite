function findClearRows (imagedata) {
  const rows = []
  for (let y = 0; y < imagedata.height; y++) {
    let clear = true
    for (let x = 0; x < imagedata.width; x++) {
      const idx = y * imagedata.width + x
      const alpha = imagedata.data[idx * 4 + 3]
      if (alpha) {
        clear = false
        break
      }
    }
    if (!y || clear) {
      rows.push(y)
    }
  }
  return rows
}

export default function slice (canvas) {
  const rects = []
  const context = canvas.getContext('2d')
  const imagedata = context.getImageData(0, 0, canvas.width, canvas.height)
  const rows = findClearRows(imagedata)
  // rows.push(canvas.height - 1)

  const subsheets = []
  let prev = null
  let y = null
  for (let i = 0; i < rows.length; i++) {
    if (prev === null && y !== null) {
      const subcvs = document.createElement('canvas')
      subcvs.width = canvas.width
      subcvs.height = rows[i] - y - 1
      subcvs.getContext('2d').drawImage(canvas, 0, -y)
      subsheets.push({ y, canvas: subcvs })
      y = null
    }
    if (prev === null || rows[i - 1] === rows[i] - 1) {
      prev = rows[i]
    } else {
      y = prev + 1
      prev = null
    }
  }

  for (const { y: suby, canvas: subcvs } of subsheets) {
    const cols = []
    for (let x = 0; x < canvas.width; x++) {
      let clear = true
      for (let y = 0; y < subcvs.height; y++) {
        const idx = (y + suby) * canvas.width + x
        const alpha = imagedata.data[idx * 4 + 3]
        if (alpha) {
          clear = false
          break
        }
      }
      if (!x || clear) {
        cols.push(x)
      }
    }

    const sprites = []
    let prev = null
    let x = null
    for (let i = 0; i < cols.length; i++) {
      if (prev === null && x !== null) {
        const sprite = document.createElement('canvas').getContext('2d')
        sprite.canvas.width = cols[i] - x - 1
        sprite.canvas.height = subcvs.height
        sprite.drawImage(canvas, -x, -(y + suby))
        sprites.push({ x, y: y + suby, canvas: sprite.canvas })
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
      const { x: subx, y: suby, canvas: subcvs } = sprites[i]
      const rows = []
      for (let y = 0; y < subcvs.height; y++) {
        let clear = true
        for (let x = 0; x < subcvs.width; x++) {
          const idx = (y + suby) * canvas.width + (x + subx)
          const alpha = imagedata.data[idx * 4 + 3]
          if (alpha) {
            clear = false
            rows.push(y)
            break
          }
        }
      }

      const top = rows[0]
      const bottom = rows[rows.length - 1]
      const height = bottom - top + 1
      if (height) {
        const subctx = subcvs.getContext('2d')
        const subimg = subctx.getImageData(0, top, subcvs.width, height)
        const clears = findClearRows(subimg)
        subcvs.height = height
        if (clears.length > 1) {
          subcvs.width += 2
          subcvs.height += 2
          subctx.putImageData(subimg, 1, 1)
          rects.push(...slice(subcvs).map(([x, y, width, height]) => [x + subx, y + suby, width, height]))
        } else {
          subctx.putImageData(subimg, 0, 0)
          rects.push([subx, suby + top, subcvs.width, height])
        }
      }
    }
  }

  return rects
}
