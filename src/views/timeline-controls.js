
import m from 'mithril'
import deepClone from 'lodash.clonedeep'
import { getSelectedAnim, getAnimDuration } from '../app/helpers'

export const toggleOnionSkin = (state) => ({
  ...state,
  timeline: {
    ...state.timeline,
    onionskin: !state.timeline.onionskin
  }
})

export const togglePlay = (dispatch, getState) => {
  if (getState().timeline.playing) {
    return dispatch(pauseAnim)
  }

  dispatch(playAnim)
  requestAnimationFrame(function animate () {
    if (getState().timeline.playing) {
      dispatch(stepAnim)
      requestAnimationFrame(animate)
    }
  })
}

export const playAnim = (state) => ({
  ...state,
  timeline: { ...state.timeline, playing: true }
})

export const pauseAnim = (state) => ({
  ...state,
  timeline: { ...state.timeline, playing: false }
})

export const stepAnim = (state) => {
  const timeline = deepClone(state.timeline)
  const anim = getSelectedAnim(state)
  if (++timeline.subindex === anim.speed) {
    timeline.subindex = 0
    if (++timeline.index === getAnimDuration(anim)) {
      timeline.index = 0
    }
  }
  return { ...state, timeline }
}

export default function TimelineControls (state, dispatch) {
  const timeline = state.timeline
  return m('th.timeline-controls', [
    m('.control-group', [
      m('button', [
        m('span.icon.-prev.material-icons-round', 'eject')
      ]),
      m('button.-play.material-icons-round', {
        class: timeline.playing ? '-toggle' : '',
        onclick: () => dispatch(togglePlay)
      }, timeline.playing ? 'pause' : 'play_arrow'),
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
