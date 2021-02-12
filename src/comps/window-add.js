
import m from 'mithril'
import extract from 'img-extract'
import Thumb from './thumb'

export default function AddWindow (state, dispatch) {
  const image = state.cache.image
  const sprites = state.sprites.list
  const selects = state.sprites.selects
  return m('.window.-add', [
    m('.window-header', [
      m('.window-title', 'Add new frames'),
      m('span.action.icon.material-icons-round',
        { onclick: () => dispatch('closeWindow') },
        'close')
    ]),
    m('.window-content', [
      m('.window-bar', [
        selects.length === 1
          ? '1 sprite selected'
          : `${selects.length} sprites selected`,
        m('.view-toggle', [
          m('span.icon.material-icons-round.action.-select', 'view_module'),
          m('span.icon.material-icons-round.action', 'view_list')
        ])
      ]),
      m('.window-entries', [
        m('.window-entrygrid', sprites.map((sprite, i) =>
          m('.entry.action', {
            key: `${i}-${sprite.name}-${sprite.rect[2]},${sprite.rect[3]}`,
            class: selects.includes(i) ? '-select' : null,
            onclick: (evt) => dispatch('selectSprite', {
              index: i,
              opts: {
                ctrl: evt.ctrlKey || evt.metaKey,
                shift: evt.shiftKey
              }
            })
          }, [
            m('.thumb.-entry', [
              m(Thumb, { image: extract(image, ...sprite.rect) })
            ]),
            m('.entry-name', sprite.name)
          ])
        ))
      ]),
      m('.window-footer', [
        m('button.-create', {
          onclick: () => dispatch('confirmFrames')
        }, [
          m('span.icon.material-icons-round', 'add'),
          'Add'
        ]),
        m('button.-cancel.-alt', { onclick: () => dispatch('closeWindow') }, 'Cancel')
      ])
    ])
  ])
}
