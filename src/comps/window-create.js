
import m from 'mithril'

export default function CreateWindow (state, dispatch) {
  return m('.window.-create', [
    m('.window-header', [
      m('.window-title', 'Create new state'),
      m('span.action.icon.material-icons-round',
        { onclick: dispatch('closeWindow') },
        'close')
    ]),
    m('.window-content', [
      m('.window-bar', [
        state.selects.length === 1
          ? '1 sprite selected'
          : `${state.selects.length} sprites selected`,
        m('.view-toggle', [
          m('span.icon.material-icons-round.action.-select', 'view_module'),
          m('span.icon.material-icons-round.action', 'view_list')
        ])
      ]),
      m('.window-entries', [
        m('.window-entrygrid', state.sprites.map((sprite, i) =>
          m('.entry.action', {
            key: `${i}-${sprite.name}-${sprite.rect[2]},${sprite.rect[3]}`,
            onclick: select(state.selects, i),
            class: state.selects.includes(i) ? '-select' : null
          }, [
            m('.thumb.-entry', [
              m(Thumb, { image: sprite.image })
            ]),
            m('.entry-name', sprite.name)
          ])
        ))
      ]),
      m('.window-footer', [
        m('button.-create', {
          onclick: () => { createAnim(); closeWindow() }
        }, [
          m('span.icon.material-icons-round', 'add'),
          'Create'
        ]),
        m('button.-cancel.-alt', { onclick: dispatch('closeWindow')  }, 'Cancel')
      ])
    ])
  ])
