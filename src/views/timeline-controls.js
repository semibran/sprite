
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
    dispatch(pauseAnim)
  } else {
    dispatch(startPlay)
  }
}

export const startPlay = (dispatch, getState) => {
  dispatch(playAnim)
  requestAnimationFrame(function animate () {
    if (getState().timeline.playing) {
      dispatch(stepFrame)
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
  timeline: { ...state.timeline, playing: false, subindex: 0 }
})

export const stepFrame = (state) => {
  const newState = deepClone(state)
  const anim = getSelectedAnim(newState)
  const duration = getAnimDuration(anim)
  const timeline = newState.timeline
  if (++timeline.subindex >= anim.speed) {
    timeline.subindex = 0
    if (timeline.index + 1 < duration) {
      timeline.index++
    } else if (anim.next === -1) {
      timeline.playing = false
    } else if (anim.next === state.anims.list.indexOf(anim)) {
      timeline.index = 0
    } else {
      timeline.index = 0
      newState.anims.index = anim.next
    }
  }
  return newState
}

export const prevFrame = (state) => {
  const timeline = deepClone(state.timeline)
  const anim = getSelectedAnim(state)
  timeline.playing = false
  timeline.subindex = 0
  if (--timeline.index < 0) {
    timeline.index = getAnimDuration(anim) - 1
  }
  return { ...state, timeline }
}

export const nextFrame = (state) => {
  const timeline = deepClone(state.timeline)
  const anim = getSelectedAnim(state)
  timeline.playing = false
  timeline.subindex = 0
  if (++timeline.index >= getAnimDuration(anim)) {
    timeline.index = 0
  }
  return { ...state, timeline }
}

export default function TimelineControls (state, dispatch) {
  const timeline = state.timeline
  return m('th.timeline-controls', [
    m('.control-group', [
      m('button', [
        m('span.icon.-prev.material-icons-round', {
          onclick: () => dispatch(prevFrame)
        }, 'eject')
      ]),
      m('button.-play.material-icons-round', {
        class: timeline.playing ? '-toggle' : '',
        onclick: () => dispatch(togglePlay)
      }, timeline.playing ? 'pause' : 'play_arrow'),
      m('button', [
        m('span.icon.-next.material-icons-round', {
          onclick: () => dispatch(nextFrame)
        }, 'eject')
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
