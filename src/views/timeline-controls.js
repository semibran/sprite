
import m from 'mithril'

export const toggleOnionSkin = (state) => ({
  ...state,
  timeline: {
    ...state.timeline,
    onionskin: !state.timeline.onionskin
  }
})

export default function TimelineControls (state, dispatch) {
  const timeline = state.timeline
  return m('th.timeline-controls', [
    m('.control-group', [
      m('button', [
        m('span.icon.-prev.material-icons-round', 'eject')
      ]),
      m('button.-play.material-icons-round', 'play_arrow'),
      m('button', [
        m('span.icon.-next.material-icons-round', 'eject')
      ])
    ]),
    m('.control-group', [
      m('button.icon.-small.-onion-skin.material-icons-round', {
        class: timeline.onionskin ? '-toggle' : '',
        onclick: () => dispatch(toggleOnionSkin)
      }, 'auto_awesome_motion')
    ])
  ])
}
