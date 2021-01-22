import m from 'mithril'

export default () => {
  let selects = null
  return {
    oncreate: (vnode) => {
      const image = vnode.attrs.image
      const canvas = vnode.dom
      resize(canvas)
      fill(canvas)

      const context = canvas.getContext('2d')
      const xoffset = Math.round(canvas.width / 2 - image.width / 2)
      for (const [x, y, width, height] of vnode.attrs.rects) {
        context.strokeStyle = 'white'
        context.strokeRect(x + xoffset + 0.5, y + 0.5, width, height)
      }
      context.drawImage(image, xoffset, 0)
    },
    onupdate: (vnode) => {
      const image = vnode.attrs.image
      const canvas = vnode.dom
      const context = canvas.getContext('2d')
      const xoffset = Math.round(canvas.width / 2 - image.width / 2)
      if (selects) {
        for (const idx of selects) {
          const [x, y, width, height] = vnode.attrs.rects[idx]
          context.strokeStyle = 'white'
          context.strokeRect(x + xoffset + 0.5, y + 0.5, width, height)
        }
      }
      selects = vnode.attrs.selects.slice()
      for (const idx of selects) {
        const [x, y, width, height] = vnode.attrs.rects[idx]
        context.strokeStyle = 'red'
        context.strokeRect(x + xoffset + 0.5, y + 0.5, width, height)
      }
    },
    view: () =>
      m('canvas')
  }
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
