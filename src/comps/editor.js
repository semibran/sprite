
import m from 'mithril'
import SpritesEditor from './editor-sprites'
import AnimsEditor from './editor-anims'
import RightSidebar from './sidebar-right'

export default function Editor (state, dispatch) {
  return [
    state.tab === 'sprites' ? SpritesEditor(state, dispatch) : null,
    state.tab === 'anims' ? AnimsEditor(state, dispatch) : null,
    state.tab === 'anims' && state.anims.list.length ? RightSidebar(state, dispatch) : null
  ]
}
