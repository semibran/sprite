
import m from 'mithril'
import cache from '../app/cache'
import Editor from './editor'
import contains from '../lib/rect-contains'
import { selectSprite } from './panel-sprites'
import { isSpriteSelected } from '../app/helpers'

let hover = -1

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

export const panSpriteEditor = (state, pos) => ({
  ...state,
  spriteEditor: { ...state.spriteEditor, pos }
})

export const zoomSpriteEditor = (state, scale) => ({
  ...state,
  spriteEditor: { ...state.spriteEditor, scale }
})

export default function SpritesEditor (state, dispatch) {
  const sprites = state.sprites
  const image = cache.image

  const render = (canvas) => {
    if (!image) return

    canvas.width = image.width
    canvas.height = image.height
    fill(canvas)

    const context = canvas.getContext('2d')

    sprites.forEach((sprite, i) => {
      const { x, y, width, height } = sprite.rect
      const selected = isSpriteSelected(state.select, i)
      const hovered = hover === i
      if (selected) {
        context.lineWidth = 2
        context.fillStyle = '#36d'
        context.strokeStyle = '#36d'
        context.beginPath()
        context.rect(x, y, width, height)
        context.globalAlpha = 0.25
        context.fill()
        context.globalAlpha = 1
        context.stroke()
      } else if (hovered) {
        context.lineWidth = 2
        context.strokeStyle = '#36d'
        context.strokeRect(x, y, width, height)
      } else {
        context.lineWidth = 1
        context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
        context.strokeRect(x - 0.5, y - 0.5, width + 1, height + 1)
      }

      context.drawImage(cache.sprites[i], x, y)
    })
  }

  return (!state._persist || state._persist.rehydrated) &&
    m(Editor, {
      pos: state.spriteEditor.pos,
      scale: state.spriteEditor.scale,
      hover: hover !== -1,
      onupdate: (vnode) => {
        render(vnode.dom.firstChild)
      },
      onmove: ({ x, y }) => {
        const id = sprites.findIndex((sprite) => {
          return contains(sprite.rect, x, y)
        })
        if (hover !== id) {
          hover = id
          m.redraw()
          console.log(x, y, id)
        }
      },
      onpan: ({ x, y }) => {
        dispatch(panSpriteEditor, { x, y })
      },
      onzoom: (scale) => {
        dispatch(zoomSpriteEditor, scale)
      }
    })
}
