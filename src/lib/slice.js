
import extract from 'img-extract'

export default function slice (canvas) {
  const rects = []
  const xrects = xslice(canvas)
  const xsheets = xrects.map((xrect) =>
    extract(canvas, xrect.x, xrect.y, xrect.width, xrect.height))

  xsheets.forEach((xcanvas, i) => {
    const xrect = xrects[i]
    const yrects = yslice(xcanvas).map((yrect) => ({
      x: yrect.x + xrect.x,
      y: yrect.y + xrect.y,
      width: yrect.width,
      height: yrect.height
    }))
    const ysheets = yrects.map((yrect) =>
      extract(canvas, yrect.x, yrect.y, yrect.width, yrect.height))

    ysheets.forEach((ycanvas, j) => {
      const yrect = yrects[j]
      const rows = xscan(ycanvas)
      const chunks = tokenize(rows)
      if (chunks.length === 1) {
        rects.push({
          x: yrect.x,
          y: chunks[0].start + yrect.y,
          width: yrect.width,
          height: chunks[0].length
        })
      } else {
        rects.push(...slice(ycanvas).map((rect) => ({
          x: rect.x + yrect.x,
          y: rect.y + yrect.y,
          width: rect.width,
          height: rect.height
        })))
      }
    })
  })

  return rects
}

function xslice (canvas) {
  const rows = xscan(canvas)
  const chunks = tokenize(rows)
  return chunks.map((chunk) => ({
    x: 0,
    y: chunk.start,
    width: canvas.width,
    height: chunk.length
  }))
}

function yslice (canvas) {
  const cols = yscan(canvas)
  const chunks = tokenize(cols)
  return chunks.map((chunk) => ({
    x: chunk.start,
    y: 0,
    width: chunk.length,
    height: canvas.height
  }))
}

function xscan (canvas) {
  const rows = []
  const context = canvas.getContext('2d')
  const imagedata = context.getImageData(0, 0, canvas.width, canvas.height)
  for (let y = 0; y < imagedata.height; y++) {
    for (let x = 0; x < imagedata.width; x++) {
      const idx = y * imagedata.width + x
      const filled = imagedata.data[idx * 4 + 3]
      if (filled) {
        rows.push(y)
        break
      }
    }
  }
  return rows
}

function yscan (canvas) {
  const cols = []
  const context = canvas.getContext('2d')
  const imagedata = context.getImageData(0, 0, canvas.width, canvas.height)
  for (let x = 0; x < imagedata.width; x++) {
    for (let y = 0; y < imagedata.height; y++) {
      const idx = y * imagedata.width + x
      const filled = imagedata.data[idx * 4 + 3]
      if (filled) {
        cols.push(x)
        break
      }
    }
  }
  return cols
}

function tokenize (ints) {
  const tokens = []
  let token = null
  for (let i = 0; i < ints.length; i++) {
    if (!token) {
      token = {
        start: ints[i],
        length: 1
      }
      tokens.push(token)
    }

    if (ints[i + 1] - ints[i] === 1) {
      token.length++
    } else {
      token = null
    }
  }

  return tokens
}
