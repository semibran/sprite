
import m from 'mithril'
import Header from './header'
import Timeline from './timeline'
import SpritesPanel from './panel-sprites'
import PropsPanel from './panel-props'
import SpritesEditor from './editor-sprites'
import AnimsEditor from './editor-anims'

export default function App (state, dispatch) {
  const Editor = ((focus) => {
    switch (state.focus) {
      case 'sprites':
        return SpritesEditor
      case 'anims':
      case 'timeline':
        return AnimsEditor
    }
  })(state.focus)
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
