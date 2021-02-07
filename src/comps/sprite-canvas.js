import m from 'mithril'

export default () => {
  let selects = null

  const update = (vnode) => {
    const image = vnode.attrs.image
    const canvas = vnode.dom
    fill(canvas)

    const context = canvas.getContext('2d')
    const xoffset = Math.round(canvas.width / 2 - image.width / 2)
    for (let i = 0; i < vnode.attrs.rects.length; i++) {
      const [x, y, width, height] = vnode.attrs.rects[i]
      context.strokeStyle = vnode.attrs.selects.includes(i)
        ? '#68e'
        : 'white'
      context.strokeRect(x + xoffset - 0.5, y - 0.5, width + 1, height + 1)
    }
    context.drawImage(image, xoffset, 0)
  }

  return {
    oncreate: (vnode) => {
      const image = vnode.attrs.image
      const canvas = vnode.dom
      canvas.width = image.width
      canvas.height = image.height
      update(vnode)
    },
    onupdate: update,
    view: () => m('canvas')
  }
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
