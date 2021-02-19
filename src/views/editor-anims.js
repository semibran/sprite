
import m from 'mithril'
import Editor from './editor'
import cache from '../app/cache'
import { getSelectedFrame } from '../app/helpers'

let persist = false
let mounted = false

const fill = (canvas, x, y, scale) => {
  const tileSize = 16 * scale
  const patternSize = 32 * scale
  const context = canvas.getContext('2d')
  context.fillStyle = '#999'
  context.fillRect(0, 0, canvas.width, canvas.height)
  const cols = Math.ceil(canvas.width / tileSize)
  const rows = Math.ceil(canvas.height / tileSize)
  const xoffset = x % patternSize + (canvas.width / 2) % patternSize
  const yoffset = y % patternSize + (canvas.height / 2) % patternSize
  for (let y = 0; y < rows + 5; y++) {
    for (let x = 0; x < cols + 5; x++) {
      if ((x + y) % 2) {
        context.fillStyle = '#ccc'
        context.fillRect(
          (x - 4) * tileSize + xoffset,
          (y - 4) * tileSize + yoffset,
          tileSize,
          tileSize
        )
      }
    }
  }

  context.lineWidth = 2
  context.strokeStyle = 'rgba(0, 0, 0, 0.5)'

  context.beginPath()
  context.moveTo(Math.round(canvas.width / 2 + x), 0)
  context.lineTo(Math.round(canvas.width / 2 + x), canvas.height)
  context.stroke()

  context.beginPath()
  context.moveTo(0, Math.round(canvas.height / 2 + y))
  context.lineTo(canvas.width, Math.round(canvas.height / 2 + y))
  context.stroke()
}

export const panAnimEditor = (state, pos) => ({
  ...state,
  anims: {
    ...state.anims,
    editor: { ...state.anims.editor, pos }
  }
})

export const zoomAnimEditor = (state, scale) => ({
  ...state,
  anims: {
    ...state.anims,
    editor: { ...state.anims.editor, scale }
  }
})

export default function AnimsEditor (state, dispatch) {
  const editor = state.anims.editor

  const onrender = (vnode) => {
    const frame = getSelectedFrame(state)
    if (!frame) return

    const image = cache.sprites[frame.sprite]
    if (!image) return

    const { canvas, editor, pos, scale } = vnode.state
    canvas.width = editor.offsetWidth
    canvas.height = editor.offsetHeight
    canvas.style = 'transform: translate(-50%, -50%)'
    fill(canvas, pos.x, pos.y, scale)

    const context = canvas.getContext('2d')
    context.imageSmoothingEnabled = false
    context.drawImage(
      image,
      Math.round(canvas.width / 2 + pos.x - frame.origin.x * scale),
      Math.round(canvas.height / 2 + pos.y - frame.origin.y * scale),
      Math.round(image.width * scale),
      Math.round(image.height * scale)
    )
  }

  let transform = {}

  if (state._persist && !state._persist.rehydrated) {
    return null
  } else if (!persist || !mounted) {
    persist = true
    mounted = true
    transform = {
      pos: editor.pos,
      scale: Math.round(editor.scale)
    }
  }

  return m(Editor, {
    ...transform,
    class: '-anims',
    onrender,
    onpan: ({ x, y }) => {
      dispatch(panAnimEditor, { x, y })
    },
    onzoom: (scale) => {
      dispatch(zoomAnimEditor, scale)
    },
    onremove: () => {
      mounted = false
    }
  })
}
