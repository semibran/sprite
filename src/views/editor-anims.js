
import m from 'mithril'
import Editor from './editor'
import rectContains from '../lib/rect-contains'
import cache from '../app/cache'
import {
  getSelectedAnim,
  getSelectedFrame,
  getSelectedFrames,
  getFrameAt,
  getFramesAt
} from '../app/helpers'
import { setFrameOrigin } from '../actions/frame'

const blue = '#36d'

let persist = false
let mounted = false
let hover = false
let rect = null
let drag = null

const fill = (canvas, x, y, scale) => {
  const tileSize = 16 * scale
  const patternSize = 32 * scale
  const context = canvas.getContext('2d')
  context.fillStyle = '#999'
  context.fillRect(0, 0, canvas.width, canvas.height)
  const cols = Math.ceil(canvas.width / tileSize)
  const rows = Math.ceil(canvas.height / tileSize)
  const xoffset = Math.round(x % patternSize + (canvas.width / 2) % patternSize)
  const yoffset = Math.round(y % patternSize + (canvas.height / 2) % patternSize)
  for (let y = 0; y < rows + 6; y++) {
    for (let x = 0; x < cols + 6; x++) {
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

  const drawFrame = (vnode, frame) => {
    if (!frame) return
    const { canvas, pos, scale } = vnode.state
    const context = canvas.getContext('2d')
    const image = cache.sprites[frame.sprite]
    const x = Math.round(canvas.width / 2 + pos.x - frame.origin.x * scale)
    const y = Math.round(canvas.height / 2 + pos.y - frame.origin.y * scale)
    const width = Math.round(image.width * scale)
    const height = Math.round(image.height * scale)
    context.drawImage(image, x, y, width, height)
    return { x, y, width, height }
  }

  const onrender = (vnode) => {
    const frame = getSelectedFrame(state)
    if (!frame || !cache.image) return

    const { canvas, editor, pos, scale } = vnode.state
    canvas.width = editor.offsetWidth
    canvas.height = editor.offsetHeight
    canvas.style = 'transform: translate(-50%, -50%)'
    fill(canvas, pos.x, pos.y, scale)

    const context = canvas.getContext('2d')
    context.imageSmoothingEnabled = false

    const { onionskin, playing, index } = state.timeline
    if (onionskin && !playing) {
      const anim = getSelectedAnim(state)
      if (state.select.list.length === 1) {
        const prev = getFrameAt(anim, index - 1)
        const next = getFrameAt(anim, index + 1)
        context.globalAlpha = 0.25
        drawFrame(vnode, next)
        context.globalAlpha = 0.5
        drawFrame(vnode, prev)
      } else {
        const frames = getFramesAt(anim, state.select.list)
        const framesBefore = frames.slice(0, index)
        const framesAfter = frames.slice(index + 1, frames.length)
        framesBefore.forEach((frame) => {
          context.globalAlpha = 0.25
          drawFrame(vnode, frame)
        })
        framesAfter.forEach((frame) => {
          context.globalAlpha = 0.5
          drawFrame(vnode, frame)
        })
      }
    }

    context.globalAlpha = 1
    rect = drawFrame(vnode, frame)

    if (hover || drag || state.select.focus === 'timeline') {
      context.strokeStyle = drag ? blue : 'rgba(0, 0, 0, 0.5)'
      context.strokeRect(rect.x, rect.y, rect.width, rect.height)
    }
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
    hover,
    class: '-anims',
    onrender,
    onmousedown: ({ x, y }) => {
      if (hover) {
        const frame = getSelectedFrame(state)
        drag = {
          x: -frame.origin.x - x,
          y: -frame.origin.y - y
        }
        m.redraw()
      }
    },
    onmousemove: ({ x, y, offsetX, offsetY, contained }) => {
      if (!contained) return

      if (drag) {
        dispatch(setFrameOrigin, {
          x: Math.round(-drag.x - x),
          y: Math.round(-drag.y - y)
        })
        return false
      }

      const newHover = rect && rectContains(rect, offsetX, offsetY)
      if (hover !== newHover) {
        hover = newHover
        m.redraw()
      }
    },
    onmouseup: () => {
      if (drag) {
        drag = null
        m.redraw()
      }
    },
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
