
import m from 'mithril'
import cache from '../app/cache'
import Editor from './editor'
import contains from '../lib/rect-contains'
import { selectSprite } from '../actions/sprite'
import { isSpriteSelected } from '../app/helpers'

let hover = -1
let sprite = null
let persist = false

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
  sprites: {
    ...state.sprites,
    editor: { ...state.sprites.editor, pos }
  }
})

export const zoomSpriteEditor = (state, scale) => ({
  ...state,
  sprites: {
    ...state.sprites,
    editor: { ...state.sprites.editor, scale }
  }
})

export const deselectSprites = (state) => ({
  ...state,
  select: {
    ...state.select,
    focus: null,
    list: []
  }
})

export default function SpritesEditor (state, dispatch) {
  const sprites = state.sprites.list
  const editor = state.sprites.editor
  const image = cache.image

  const onrender = (vnode) => {
    if (!image) return

    const { canvas, pos, scale } = vnode.state
    canvas.width = image.width
    canvas.height = image.height
    canvas.style = 'transform: ' +
      `translate3d(${Math.round(pos.x)}px, ${Math.round(pos.y)}px, 0)` +
      `scale(${scale})`
    fill(canvas)

    const context = canvas.getContext('2d')

    sprites.forEach((sprite, i) => {
      const { x, y, width, height } = sprite.rect
      const selected = isSpriteSelected(state, i)
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

  let transform = {}

  if (state._persist && !state._persist.rehydrated) {
    return null
  } else if (!persist) {
    persist = true
    transform = {
      pos: editor.pos,
      scale: Math.round(editor.scale)
    }
  }

  if (cache.messages.focus) {
    const newSprite = cache.messages.focus.sprite
    cache.messages.focus = null
    if (newSprite && sprite !== newSprite) {
      sprite = newSprite
      const { x, y, width, height } = sprite.rect
      const scale = Math.round(editor.scale)
      transform = {
        pos: {
          x: Math.round((-x - width / 2) * scale),
          y: Math.round((-y - height / 2) * scale)
        },
        scale: scale
      }
    }
  }

  const findIndex = (sprites, x, y) =>
    sprites.findIndex((sprite) =>
      contains({
        x: sprite.rect.x,
        y: sprite.rect.y,
        width: sprite.rect.width + 2,
        height: sprite.rect.height + 2
      }, x, y))

  return m(Editor, {
    ...transform,
    class: '-sprites',
    hover: hover !== -1,
    onrender,
    onmove: ({ x, y, contained }) => {
      let id = -1
      if (contained) {
        id = findIndex(sprites, x, y)
      }
      if (hover !== id) {
        hover = id
        m.redraw()
      }
    },
    onclick: ({ x, y, ctrl, shift }) => {
      const id = findIndex(sprites, x, y)
      if (id !== -1) {
        dispatch(selectSprite, {
          index: id,
          opts: { ctrl: ctrl || shift }
        })
      } else if (state.select.list.length) {
        dispatch(deselectSprites)
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
