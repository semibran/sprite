
import m from 'mithril'
import Header from './header'
import Editor from './editor'
import Timeline from './timeline'
import SpritesPanel from './panel-sprites'
import PropsPanel from './panel-props'

export default function App (state, dispatch) {
  return m('main.app', [
    Header({ title: state.project.name }),
    m('.content', [
      SpritesPanel(state, dispatch),
      Editor(state, dispatch),
      PropsPanel(state, dispatch)
    ]),
    Timeline(state, dispatch)
  ])
}