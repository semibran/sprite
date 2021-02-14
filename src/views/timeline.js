
import Panel from './panel'

export const showTimeline = (state) => ({
  ...state,
  panels: { ...state.panels, timeline: true }
})

export const hideTimeline = (state) => ({
  ...state,
  panels: { ...state.panels, timeline: false }
})

export default function Timeline (state, dispatch) {
  return Panel({
    id: 'timeline',
    name: 'Timeline',
    hidden: !state.panels.timeline,
    onshow: () => dispatch(showTimeline),
    onhide: () => dispatch(hideTimeline)
  })
}
