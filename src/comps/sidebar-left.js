
import m from 'mithril'
import SpritesTab, { selectSprite } from './sprites-tab'

export { selectSprite }

export default function LeftSidebar (state, dispatch) {
  return m('aside.sidebar.-left', [
    m('.sidebar-header', [
      m('.sidebar-tabs', [
        m('.tab.-sprites', {
          class: state.tab === 'sprites' ? '-active' : '',
          onclick: dispatch('selectTab', 'sprites')
        }, `Sprites (${state.sprites.list.length})`),
        m('.tab.-anims', {
          class: state.tab === 'anims' ? '-active' : '',
          onclick: dispatch('selectTab', 'anims')
        }, 'States')
      ]),
      m('.sidebar-subheader', [
        m('label.sidebar-search', { for: 'search' }, [
          m('span.icon.material-icons-round', 'search'),
          m('input', { id: 'search', placeholder: 'Search' })
        ]),
        m('.action.-add.material-icons-round',
          { onclick: dispatch('openWindow', 'create') },
          'add')
      ])
    ]),
    state.tab === 'sprites' ? SpritesTab(state, dispatch) : null,
    state.tab === 'sprites' ? SpritesFooter(state, dispatch) : null,
    state.tab === 'anims' ? AnimsTab(state, dispatch) : null
  ])
}

function SpritesFooter (state, dispatch) {
  const selects = state.sprites.selects
  const canSplit = selects.length === 1
  const canMerge = selects.length >= 2
  return m('.sidebar-footer', [
    m('button.-split', {
      disabled: !canSplit,
      onclick: canSplit && dispatch('splitSelects')
    }, [
      m('span.icon.material-icons-round', 'vertical_split'),
      'Split'
    ]),
    m('button.-merge', {
      disabled: !canMerge,
      onclick: canMerge && dispatch('mergeSelects')
    }, [
      m('span.icon.material-icons-round', 'aspect_ratio'),
      'Merge'
    ])
  ])
}

function AnimsTab (state, dispatch) {
  return state.anims.list.length
    ? m('.sidebar-content', state.anims.list.map((anim, i) =>
        m('.entry', {
          key: i + '-' + anim.name,
          // onclick: selectAnim(i),
          class: state.anims.select === anim ? '-select' : null
        }, [
          m('.thumb.-entry', [
            m(Thumb, { image: anim.frames[0].sprite.image })
          ]),
          state.anims.select === anim && state.anims.editingName
            ? m.fragment({ oncreate: (vnode) => vnode.dom.select() }, [
                m('input.entry-name', {
                  value: anim.name,
                  // onblur: endNameEdit
                })
              ])
            : m('.entry-name',
              // { ondblclick: startNameEdit },
              anim.name)
        ])
      ))
    : m('.sidebar-content.-empty', [
      m('.sidebar-notice', [
        'No states registered.',
        m('button.-create', {
          // onclick: openWindow('create')
        }, [
          m('span.icon.material-icons-round', 'add'),
          'Create'
        ])
      ])
    ])
}
