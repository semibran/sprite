
import m from 'mithril'
import Editor from './editor'
import cache from '../app/cache'
import { getSelectedFrame } from '../app/helpers'

const fill = (canvas, x, y) => {
  const context = canvas.getContext('2d')
  context.fillStyle = '#999'
  context.fillRect(0, 0, canvas.width, canvas.height)
  const xoffset = x % 32 + (canvas.width / 2) % 16
  const yoffset = y % 32 + (canvas.height / 2) % 16
  for (let y = -32; y < canvas.height + 32; y += 16) {
    for (let x = -32; x < canvas.width + 32; x += 16) {
      if ((x + y) % 32) {
        context.fillStyle = '#ccc'
        context.fillRect(x + xoffset, y + yoffset, 16, 16)
      }
    }
  }

  context.strokeStyle = 'white'

  context.beginPath()
  context.moveTo(canvas.width / 2 + x, 0)
  context.lineTo(canvas.width / 2 + x, canvas.height)
  context.stroke()

  context.beginPath()
  context.moveTo(0, canvas.height / 2 + y)
  context.lineTo(canvas.width, canvas.height / 2 + y)
  context.stroke()
}

export default function AnimsEditor (state, dispatch) {
  const onrender = (vnode) => {
    const frame = getSelectedFrame(state)
    if (!frame) return

    const sprite = cache.sprites[frame.sprite]
    if (!sprite) return

    const { canvas, editor, pos, scale } = vnode.state
    const bg = canvas.nextSibling
    const x = Math.round(pos.x) - canvas.width / 2
    const y = Math.round(pos.y) - canvas.height / 2
    const transform = 'transform: ' +
      `translate3d(${x}px, ${y}px, 0)` +
      `scale(${scale})`

    canvas.width = editor.offsetWidth
    canvas.height = editor.offsetHeight
    canvas.style = transform

    const context = canvas.getContext('2d')
    context.drawImage(sprite, Math.round(canvas.width / 2), Math.round(canvas.height / 2))

    bg.width = canvas.width
    bg.height = canvas.height
    bg.style = 'transform: translate(-50%, -50%)'
    fill(bg, pos.x, pos.y)
  }

  return m(Editor, {
    class: '-anims',
    onrender
  }, [m('canvas.-bg')])
}
