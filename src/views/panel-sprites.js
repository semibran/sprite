
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
  if (state.select.target !== 'sprites') {
    newState.select.target = 'sprites'
    newState.select.items = []
  }
  select(newState.select.items, index, opts)
  return newState
}

export default function SpritesPanel (state, dispatch) {
  return Panel({
    id: 'sprites',
    name: `Sprites (${state.sprites.length})`,
    hidden: !state.panels.sprites,
    onshow: () => dispatch(showSprites),
    onhide: () => dispatch(hideSprites)
  }, cache.sprites && m('.thumbs', [
    cache.sprites.map((image, i) => {
      const selected = state.select.target === 'sprites' &&
        state.select.items.includes(i)
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
  ]))
}
