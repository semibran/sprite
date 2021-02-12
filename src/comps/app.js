
import m from 'mithril'
import Editor from './editor'
import LeftSidebar from './sidebar-left'
import AddWindow from './window-add'
import CreateWindow from './window-create'

export default function App (state, dispatch) {
  return m('main.app', [
    m('header', [
      m('.header-block', [
        m('span.icon.material-icons-round', 'menu'),
        m('.header-text', [
          m('.header-title', 'Untitled'),
          m('.header-subtitle', 'Current project')
        ])
      ])
    ]),
    m('.content', [
      LeftSidebar(state, dispatch),
      Editor(state, dispatch)
    ]),
    state.window ? Overlay(state, dispatch) : null,
    state.window === 'create' ? CreateWindow(state, dispatch) : null,
    state.window === 'add' ? AddWindow(state, dispatch) : null
  ])
}

function Overlay (state, dispatch) {
  return m('.overlay', { onclick: dispatch('closeWindow') })
}
