
import m from 'mithril'
import deepClone from 'lodash.clonedeep'
import extractImage from 'img-extract'
import mergeRects from '../lib/merge'
import select from '../lib/select'
import cache from '../app/cache'
import Panel from './panel'
import Thumb from './thumb'

export const showSprites = (state) => ({
  ...state,
  panels: { ...state.panels, sprites: true }
})

export const hideSprites = (state) => ({
  ...state,
  panels: { ...state.panels, sprites: false }
})

export const selectSprite = (state, { index, focus, opts }) => {
  const newState = deepClone(state)
  const selection = newState.select
  if (selection.target !== 'sprites') {
    selection.target = 'sprites'
    selection.items = []
  }

  select(selection.items, index, opts)
  if (!selection.items.length) {
    selection.target = null
  }

  return newState
}

export const focusSprite = (state, { sprite, opts }) => (dispatch, getState) => {
  dispatch(selectSprite, {
    index: state.sprites.indexOf(sprite),
    focus: true,
    opts
  })

  const target = startFocus(state, sprite).editor.target
  const x = target.x
  const y = target.y
  dispatch(startFocus, sprite)
  requestAnimationFrame(function animate () {
    const editor = getState().editor
    if (!editor.target ||
        editor.target.x !== x ||
        editor.target.y !== y) {
      return
    }
    const xdist = Math.abs(editor.target.x - editor.pos.x)
    const ydist = Math.abs(editor.target.y - editor.pos.y)
    if (xdist + ydist < 1) {
      dispatch(endFocus)
    } else {
      dispatch(updateCamera)
      requestAnimationFrame(animate)
    }
  })
}

export const startFocus = (state, sprite) => {
  const editor = deepClone(state.editor)
  const [left, top, width, height] = sprite.rect
  editor.click = false
  editor.pan = null
  editor.target = {
    x: Math.floor(-left - width / 2),
    y: Math.floor(-top - height / 2)
  }
  return { ...state, editor }
}

export const endFocus = (state, sprite) => {
  return { ...state, editor: { ...state.editor, target: null } }
}

export const updateCamera = (state) => {
  const editor = deepClone(state.editor)
  editor.pos.x += (editor.target.x - editor.pos.x) / 8
  editor.pos.y += (editor.target.y - editor.pos.y) / 8
  return { ...state, editor }
}

export const mergeSprites = (state) => {
  if (state.select.target !== 'sprites' || !state.select.items.length) {
    return state
  }

  const newState = deepClone(state)
  const sprites = newState.sprites
  const selects = newState.select.items.sort()
  const rects = selects.map(idx => sprites[idx].rect)
  const rect = mergeRects(rects)
  for (let i = selects.length; --i;) {
    const idx = selects[i]
    sprites.splice(idx, 1)
    cache.sprites.splice(idx, 1)
  }

  const idx = selects[0]
  const sprite = sprites[idx]
  sprite.rect = rect
  cache.sprites[idx] = extractImage(cache.image, ...rect)
  selects.length = 0
  newState.select.target = null
  return newState
}

export default function SpritesPanel (state, dispatch) {
  const selection = state.select
  const shown = state.panels.sprites
  return Panel({
    id: 'sprites',
    name: `Sprites (${state.sprites.length})`,
    shown,
    onshow: () => dispatch(showSprites),
    onhide: () => dispatch(hideSprites)
  }, [
    cache.sprites && m('.panel-content', [
      m('.thumbs', [
        cache.sprites.map((image, i) => {
          const sprite = state.sprites[i]
          const selected = selection.target === 'sprites' &&
            selection.items.includes(i)
          return m('.thumb', {
            key: `${i}-${sprite.name}`,
            class: selected ? '-select' : '',
            onclick: (evt) => dispatch(focusSprite, {
              sprite,
              opts: {
                ctrl: evt.ctrlKey || evt.metaKey,
                shift: evt.shiftKey
              }
            })
          }, Thumb(image))
        })
      ])
    ]),
    selection.target === 'sprites' && selection.items.length && m.fragment({
      onbeforeremove: (vnode) => {
        vnode.dom.classList.remove('-enter')

        // HACK: reflush element to play same animation in reverse
        // eslint-disable-next-line
        void vnode.dom.offsetWidth

        vnode.dom.classList.add('-exit')
        return new Promise((resolve) => {
          vnode.dom.addEventListener('animationend', resolve)
        })
      }
    }, m('.banner.-enter', [
      selection.items.length > 1
        ? `${selection.items.length} sprites selected`
        : '1 sprite selected',
      selection.items.length === 1
        ? m('button', 'Split')
        : m('button', {
          onclick: () => dispatch(mergeSprites)
        }, 'Merge')
    ]))
  ])
}
