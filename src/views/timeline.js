
import m from 'mithril'

export const showTimeline = (state) => ({
  ...state,
  timeline: { ...state.timeline, hidden: false }
})

export const hideTimeline = (state) => ({
  ...state,
  timeline: { ...state.timeline, hidden: true }
})

export default function Timeline (state, dispatch) {
  const hidden = state.timeline.hidden
  return m('.panel.timeline', {
    class: hidden ? '-min' : '',
    onclick: hidden && (() => dispatch(showTimeline))
  }, [
    m('.panel-header', [
      'Timeline',
      m('span.icon.-button.material-icons-round', {
        tabindex: 0,
        onclick: () => dispatch(hideTimeline)
      }, hidden ? 'add' : 'remove')
    ])
  ])
}
