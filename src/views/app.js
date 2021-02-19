
import m from 'mithril'
import Header from './header'
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
      state.panel === 'sprites' && SpritesEditor(state, dispatch),
      state.panel === 'anims' && AnimsEditor(state, dispatch),
      PropsPanel(state, dispatch)
    ]),
    Timeline(state, dispatch)
  ])
}
