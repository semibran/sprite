
import extract from 'img-extract'

export default function slice (canvas) {
  const rects = []
  const xrects = xslice(canvas)
  const xsheets = xrects.map((xrect) => extract(canvas, ...xrect))
  xsheets.forEach((xcanvas, i) => {
    const xrect = xrects[i]
    const yrects = yslice(xcanvas).map((yrect) => [
      yrect[0] + xrect[0],
      yrect[1] + xrect[1],
      yrect[2],
      yrect[3]
    ])
    const ysheets = yrects.map((yrect) => extract(canvas, ...yrect))
    ysheets.forEach((ycanvas, j) => {
      const yrect = yrects[j]
      const rows = xscan(ycanvas)
      const chunks = tokenize(rows)
      if (chunks.length === 1) {
        rects.push([
          yrects[j][0],
          chunks[0].start + yrects[j][1],
          yrects[j][2],
          chunks[0].length
        ])
      } else {
        rects.push(...slice(ycanvas).map((rect) => [
          rect[0] + yrect[0],
          rect[1] + yrect[1],
          rect[2],
          rect[3]
        ]))
      }
    })
  })

  return rects
}

function xslice (canvas) {
  const rows = xscan(canvas)
  const chunks = tokenize(rows)
  return chunks.map((chunk) => [0, chunk.start, canvas.width, chunk.length])
}

function yslice (canvas) {
  const cols = yscan(canvas)
  const chunks = tokenize(cols)
  return chunks.map((chunk) => [chunk.start, 0, chunk.length, canvas.height])
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
