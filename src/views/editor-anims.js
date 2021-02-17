
import m from 'mithril'
import Editor from './editor'
import cache from '../app/cache'
import { getSelectedFrame } from '../app/helpers'

const fill = (canvas) => {
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

export default function AnimsEditor (state, dispatch) {
  const onrender = (vnode) => {
    const frame = getSelectedFrame(state)
    if (!frame) return

    const sprite = cache.sprites[frame.sprite]
    if (!sprite) return

    const canvas = vnode.state.canvas
    canvas.width = sprite.width
    canvas.height = sprite.height
    fill(canvas)

    const context = canvas.getContext('2d')
    context.drawImage(sprite, 0, 0)
  }

  return m(Editor, {
    class: '-anims',
    oncreate: onrender,
    onupdate: onrender
  })
}
