
import m from 'mithril'
import AnimTab from './tab-anim'
import FrameTab from './tab-frame'
import FramesTab from './tab-frames'

export default function SidebarRight (state, dispatch) {
  const tab = state.anims.tab
  const selects = state.timeline.selects
  return m('aside.sidebar.-right', [
    !selects.length ? AnimTab(state, dispatch) : null,
    selects.length === 1 ? FrameTab(state, dispatch) : null,
    selects.length > 1 ? FramesTab(state, dispatch) : null
  ])
}
