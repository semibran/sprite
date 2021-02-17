
import m from 'mithril'
import cache from '../app/cache'
import Editor from './editor'
import { selectSprite } from './panel-sprites'
import { isSpriteSelected } from '../app/helpers'

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
  let hover = -1

  const render = (canvas) => {
    if (!image) return

    canvas.width = image.width
    canvas.height = image.height
    fill(canvas)

    const context = canvas.getContext('2d')

    sprites.forEach((sprite, i) => {
      const [left, top, width, height] = sprite.rect
      const selected = isSpriteSelected(state.select, i)
      const hovered = hover === i
      if (selected) {
        context.lineWidth = 2
        context.fillStyle = '#36d'
        context.strokeStyle = '#36d'
        context.beginPath()
        context.rect(...sprite.rect)
        context.globalAlpha = 0.25
        context.fill()
        context.globalAlpha = 1
        context.stroke()
      } else if (hovered) {
        context.lineWidth = 2
        context.strokeStyle = '#36d'
        context.strokeRect(...sprite.rect)
      } else {
        context.lineWidth = 1
        context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
        context.strokeRect(left - 0.5, top - 0.5, width + 1, height + 1)
      }
    })

    context.drawImage(image, 0, 0)
  }

  return (!state._persist || state._persist.rehydrated) &&
    m(Editor, {
      pos: state.spriteEditor.pos,
      scale: state.spriteEditor.scale,
      onupdate: (vnode) => {
        render(vnode.dom.firstChild)
      },
      onpan: ({ x, y }) => {
        dispatch(panSpriteEditor, { x, y })
      },
      onzoom: (scale) => {
        dispatch(zoomSpriteEditor, scale)
      }
    })
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
