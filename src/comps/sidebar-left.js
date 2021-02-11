
import m from 'mithril'
import SpritesTab from './tab-sprites'
import AnimsTab from './tab-anims'

export default function LeftSidebar (state, dispatch) {
  return m('aside.sidebar.-left', [
    m('.sidebar-header', [
      m('.sidebar-tabs', [
        m('.tab.-sprites', {
          class: state.tab === 'sprites' ? '-active' : '',
          onclick: dispatch('selectTab', { tab: 'sprites' })
        }, `Sprites (${state.sprites.list.length})`),
        m('.tab.-anims', {
          class: state.tab === 'anims' ? '-active' : '',
          onclick: dispatch('selectTab', { tab: 'anims' })
        }, 'States')
      ]),
      m('.sidebar-subheader', [
        m('label.sidebar-search', { for: 'search' }, [
          m('span.icon.material-icons-round', 'search'),
          m('input', { id: 'search', placeholder: 'Search' })
        ]),
        m('.action.-add.material-icons-round',
          { onclick: state.tab === 'anims' && dispatch('createAnim') },
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
