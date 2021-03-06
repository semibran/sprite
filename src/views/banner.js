
import m from 'mithril'
import { getSelectedSprites } from '../app/helpers'
import { splitSprite, mergeSprites, repackSprites } from '../actions/sprite'
import { stopCreateAnim, createAnim } from '../actions/anim'

export default function Banner (state, dispatch) {
  const sprites = getSelectedSprites(state)
  const type = (() => {
    if (state.anims.creating) {
      return 'create'
    } else if (sprites.length === 1) {
      return 'single'
    } else if (sprites.length === state.sprites.list.length) {
      return 'all'
    } else if (sprites.length > 1) {
      return 'multi'
    }
  })()
  return m.fragment({
    onbeforeremove: (vnode) => {
      const banner = vnode.dom
      banner.classList.remove('-enter')

      // HACK: reflush element to play same animation in reverse
      // eslint-disable-next-line
      void banner.offsetWidth

      banner.classList.add('-exit')
      return new Promise((resolve) => {
        banner.addEventListener('animationend', resolve)
      })
    }
  }, m('.banner.-enter', { class: '-' + type }, [
    type === 'single' && [
      '1 sprite selected',
      m('button', { onclick: () => dispatch(splitSprite) }, 'Split')
    ],
    type === 'all' && [
      `${sprites.length} sprites selected`,
      m('button', { onclick: () => dispatch(repackSprites) }, 'Repack')
    ],
    type === 'multi' && [
      `${sprites.length} sprites selected`,
      m('button', { onclick: () => dispatch(mergeSprites) }, 'Merge')
    ],
    type === 'create' && sprites.length > 0 && [
      sprites.length === 1
        ? '1 sprite selected'
        : `${sprites.length} sprites selected`,
      m('button', {
        onclick: () => {
          dispatch(createAnim, { ids: state.select.list })
          dispatch(stopCreateAnim)
        }
      }, 'Animate')
    ],
    type === 'create' && !sprites.length && [
      'Select sprites to animate',
      m('button.-alt', { onclick: () => dispatch(stopCreateAnim) }, 'Cancel')
    ]
  ]))
}
