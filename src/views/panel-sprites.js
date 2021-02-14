
import m from 'mithril'
import deepClone from 'lodash.clonedeep'
import Panel from './panel'
import Thumb from './thumb'
import cache from '../app/cache'
import select from '../lib/select'

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
    selection.target === 'sprites' && m('.banner', [
      selection.items.length === 1
        ? `${selection.items.length} item selected`
        : `${selection.items.length} items selected`,
      selection.items.length === 1
        ? m('button', 'Split')
        : m('button', 'Merge')
    ])
  ])
}
