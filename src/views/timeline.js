
import m from 'mithril'
import Panel from './panel'
import TimelineControls from './timeline-controls'

export const showTimeline = (state) => ({
  ...state,
  panels: { ...state.panels, timeline: true }
})

export const hideTimeline = (state) => ({
  ...state,
  panels: { ...state.panels, timeline: false }
})

export default function Timeline (state, dispatch) {
  const shown = state.panels.timeline
  return Panel({
    id: 'timeline',
    name: 'Timeline',
    hidden: !shown,
    onshow: () => dispatch(showTimeline),
    onhide: () => dispatch(hideTimeline)
  }, shown && [
    m('table.panel-content', [
      m('tr.timeline-header', [
        TimelineControls(state, dispatch),
        m('th.frame-number', m('span', '1')),
        m('th.frame-number', m('span', '2')),
        m('th.frame-number', m('span', '3')),
        m('th.frame-number', m('span', '4')),
        m('th.frame-number', m('span', '5'))
      ]),
      m('tr.timeline-track', [
        m('td.track-name', 'Example_01'),
        m('td', { colspan: 5 }, [
          m('.track-prompt', 'Drag sprites here to create an animation.')
        ])
      ]),
      m('tr.timeline-track', [
        m('td.track-name', 'Example_02')
      ]),
      m('tr.timeline-track', [
        m('td.track-name', 'Example_03')
      ])
    ])
  ])
}
