
import m from 'mithril'
import Panel from './panel'
import Thumb from './thumb'
import cache from '../app/cache'

export const showSprites = (state) => ({
  ...state,
  panels: { ...state.panels, sprites: true }
})

export const hideSprites = (state) => ({
  ...state,
  panels: { ...state.panels, sprites: false }
})

export default function SpritesPanel (state, dispatch) {
  return Panel({
    id: 'sprites',
    name: 'Sprites',
    hidden: !state.panels.sprites,
    onshow: () => dispatch(showSprites),
    onhide: () => dispatch(hideSprites)
  }, cache.sprites && m('.thumbs-wrap', [
    m('.thumbs', cache.sprites.map(image => {
      return m('.thumb', Thumb(image))
    }))
  ]))
}
