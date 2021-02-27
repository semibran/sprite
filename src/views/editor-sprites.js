
import m from 'mithril'
import cache from '../app/cache'
import Editor from './editor'
import EditorToolbar from './editor-toolbar'
import rectContains from '../lib/rect-contains'
import rectIntersects from '../lib/rect-intersects'
import rectFromPoints from '../lib/rect-from-points'
import { selectSprite } from '../actions/sprite'
import { isSpriteSelected } from '../app/helpers'

const blue = '#36d'

let hover = -1
let sprite = null
let persist = false
const range = {
  start: null,
  end: null,
  rect: null
}

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
      const inRange = range.rect && rectIntersects(sprite.rect, range.rect)
      if (selected) {
        context.fillStyle = blue
        context.strokeStyle = blue
        context.lineWidth = 2
        context.beginPath()
        context.rect(x, y, width, height)
        context.globalAlpha = 0.25
        context.fill()
        context.globalAlpha = 1
        context.stroke()
      } else if (hovered || inRange) {
        context.lineWidth = 2
        context.strokeStyle = blue
        context.strokeRect(x, y, width, height)
      }

      context.drawImage(cache.sprites[i], x, y)
    })

    if (range.rect) {
      const { x, y, width, height } = range.rect
      context.lineWidth = 1
      context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
      context.strokeRect(Math.round(x) - 0.5, Math.round(y) - 0.5, Math.round(width), Math.round(height))
    }
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
      rectContains({
        x: sprite.rect.x,
        y: sprite.rect.y,
        width: sprite.rect.width + 2,
        height: sprite.rect.height + 2
      }, x, y))

  const findIndexes = (sprites, rect) =>
    sprites.filter((sprite) => rectIntersects(sprite.rect, rect))
      .map((sprite) => sprites.indexOf(sprite))

  return m('.editor-wrap', [
    EditorToolbar(state, dispatch),
    m(Editor, {
      ...transform,
      class: '-sprites',
      hover: hover !== -1,
      onrender,
      onmousedown: ({ x, y, contained }) => {
        const id = contained ? findIndex(sprites, x, y) : -1
        if (id !== -1) {
          range.start = { x, y }
        }
      },
      onmousemove: ({ x, y, contained }) => {
        if (range.start) {
          range.end = { x, y }
          range.rect = rectFromPoints(range.start, range.end)
          m.redraw()
          return false
        }

        const id = contained ? findIndex(sprites, x, y) : -1
        if (hover !== id) {
          hover = id
          m.redraw()
        }
      },
      onmouseup: ({ x, y }) => {
        if (range.rect && range.rect.width > 2 && range.rect.height > 2) {
          const ids = findIndexes(sprites, range.rect)
          ids.forEach((id) => {
            dispatch(selectSprite, {
              index: id,
              opts: { ctrl: true }
            })
          })
        }
        range.start = null
        range.end = null
        range.rect = null
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
  ])
}
