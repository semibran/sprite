
import m from 'mithril'
import cache from '../app/cache'

export default function Editor (state, dispatch) {
  const image = cache.image
  return m('.editor', [
    m.fragment({
      onupdate: (vnode) => {
        const canvas = vnode.dom
        canvas.width = canvas.parentNode.offsetWidth
        canvas.height = canvas.parentNode.offsetHeight

        if (image) {
          const context = canvas.getContext('2d')
          const xoffset = canvas.width / 2 - image.width / 2

          fill(canvas)
          context.drawImage(image, Math.round(xoffset), 0)
        }
      }
    }, m('canvas'))
  ])
}

function fill (canvas) {
  const context = canvas.getContext('2d')
  context.fillStyle = '#999'
  context.fillRect(0, 0, canvas.width, canvas.height)
  for (let y = 0; y < canvas.height + 32; y += 16) {
    for (let x = 0; x < canvas.width + 32; x += 16) {
      if ((x + y) % 32) {
        context.fillStyle = '#ccc'
        context.fillRect(x, y, 16, 16)
      }
    }
  }
}
