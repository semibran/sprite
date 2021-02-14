
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

export const selectSprite = (state, { index, opts }) => {
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
  return Panel({
    id: 'sprites',
    name: `Sprites (${state.sprites.length})`,
    hidden: !state.panels.sprites,
    onshow: () => dispatch(showSprites),
    onhide: () => dispatch(hideSprites)
  }, [
    cache.sprites && m('.panel-content', [
      m('.thumbs', [
        cache.sprites.map((image, i) => {
          const selected = selection.target === 'sprites' &&
            selection.items.includes(i)
          return m('.thumb', {
            key: `${i}-${state.sprites[i].name}`,
            class: selected ? '-select' : '',
            onclick: (evt) => dispatch(selectSprite, {
              index: i,
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
        void vnode.dom.offsetWidth
        vnode.dom.classList.add('-exit')
        return new Promise((resolve) => {
          vnode.dom.addEventListener('animationend', resolve)
        })
      }
    }, m('.banner.-enter', [
      selection.items.length > 1
        ? `${selection.items.length} sprites selected`
        : `1 sprite selected`,
      selection.items.length === 1
        ? m('button', 'Split')
        : m('button', {
          onclick: () => dispatch(mergeSprites)
        }, 'Merge')
    ]))
  ])
}
