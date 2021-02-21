
import m from 'mithril'
import cache from '../app/cache'
import Panel from './panel'
import Thumb from './thumb'
import Banner from './banner'
import { selectSprite } from '../actions/sprite'
import {
  isSpriteSelected,
  getSelectedSprites
} from '../app/helpers'

let selection = null
let dragging = false

export const showSprites = (state) => ({
  ...state,
  panels: { ...state.panels, sprites: true }
})

export const hideSprites = (state) => ({
  ...state,
  panels: { ...state.panels, sprites: false }
})

export const focusSprite = ({ sprite, opts }) => (dispatch, getState) => {
  const state = getState()
  const index = state.sprites.list.indexOf(sprite)
  dispatch(selectSprite, { index, opts })

  if (!state.select.list.includes(index)) {
    cache.messages.focus = { sprite }
  }
}

export default function SpritesPanel (state, dispatch) {
  const shown = state.panels.sprites
  const sprites = getSelectedSprites(state)
  return Panel({
    id: 'sprites',
    name: `Sprites (${state.sprites.list.length})`,
    shown,
    onshow: () => dispatch(showSprites),
    onhide: () => dispatch(hideSprites)
  }, [
    cache.sprites && m('.panel-content', [
      m('.thumbs', [
        cache.sprites.map((image, i) => {
          const sprite = state.sprites.list[i]
          const selected = isSpriteSelected(state, i)

          const handleSelect = (evt) => dispatch(focusSprite({
            sprite,
            opts: {
              ctrl: evt.ctrlKey || evt.metaKey,
              shift: evt.shiftKey
            }
          }))

          const handleDragStart = (evt) => {
            dragging = true
            evt.dataTransfer.setData('text/plain', state.select.list.join())
            if (!isSpriteSelected(state, i)) {
              handleSelect(evt)
            }
          }

          const handleDragEnd = (evt) => {
            dragging = false
          }

          return m.fragment({
            onupdate: (vnode) => {
              const selects = state.select.list
              const last = selects[selects.length - 1]
              if (!isSpriteSelected(state) || i !== last) {
                return
              }

              const thumb = vnode.dom
              const wrap = thumb.parentNode.parentNode
              const id = selects.join()
              if (!selection ||
                 (id !== selection &&
                    selects.length >= selection.split(',').length)) {
                const thumbTop = thumb.offsetTop
                const thumbHeight = thumb.offsetHeight
                const thumbBottom = thumbTop + thumbHeight
                const wrapTop = wrap.scrollTop
                const wrapHeight = wrap.offsetHeight
                const wrapBottom = wrapTop + wrapHeight
                if (thumbTop < wrapTop || thumbBottom > wrapBottom) {
                  thumb.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'end'
                  })
                }
              }

              selection = selects.join()
            }
          }, m('.thumb', {
            key: `${sprite.name}(${sprite.rect.x},${sprite.rect.y},${sprite.width},${sprite.height})`,
            class: (selected ? '-select' : '') +
              (dragging && isSpriteSelected(state, i) ? ' -drag' : ''),
            onclick: handleSelect,
            ondragstart: handleDragStart,
            ondragend: handleDragEnd,
            draggable: true
          }, Thumb({ image })))
        })
      ])
    ]),
    sprites.length > 0 && Banner(state, dispatch)
  ])
}
