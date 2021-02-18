
import m from 'mithril'
import Header from './header'
import Editor from './editor'
import Timeline from './timeline'
import SpritesPanel from './panel-sprites'
import PropsPanel from './panel-props'
import SpritesEditor from './editor-sprites'
import AnimsEditor from './editor-anims'

export default function App (state, dispatch) {
  return m('main.app', [
    Header({ title: state.project.name }),
    m('.content', [
      SpritesPanel(state, dispatch),
      state.focus === 'sprites' && SpritesEditor(state, dispatch),
      state.focus === 'anims' && AnimsEditor(state, dispatch),
      PropsPanel(state, dispatch)
    ]),
    Timeline(state, dispatch)
  ])
}
