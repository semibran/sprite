
import m from 'mithril'
import clone from 'lodash.clonedeep'
import extract from 'img-extract'
import Thumb from './thumb'
import select from '../lib/select'

export function selectSprite (state, { index, opts }) {
  state = clone(state)
  select(state.sprites.selects, index, opts)
  return state
}

export default function SpritesTab (state, dispatch) {
  const image = state.image
  const sprites = state.sprites.list
  const selects = state.sprites.selects
  return sprites.length
    ? m('.sidebar-content', sprites.map((sprite, i) =>
        m('.entry', {
          key: `${i}-${sprite.name}-${sprite.rect[2]},${sprite.rect[3]}`,
          class: selects.includes(i) ? '-select' : null,
          onclick: (evt) => dispatch(selectSprite, {
            index: i,
            opts: {
              ctrl: evt.ctrlKey || evt.metaKey,
              shift: evt.shiftKey
            }
          })()
        }, [
          m('.thumb.-entry', [
            m(Thumb, { image: extract(image, ...sprite.rect) })
          ]),
          m('.entry-name', sprite.name)
        ])
      ))
    : m('.sidebar-content.-empty', [
      m('.sidebar-notice', 'No sprites registered.')
    ])
}
