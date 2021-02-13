
import m from 'mithril'
import deepClone from 'lodash.clonedeep'
import extract from 'img-extract'
import cache from '../app/cache'
import select from '../lib/select'
import {
  getSelectedAnim,
  getAnimDuration,
  getFrameAt,
  getFramesAt,
  getFrameIndex
} from '../app/helpers'
import Thumb from './thumb'

let onkeydown = null

export const selectFrame = (state, { index, opts }) => {
  const newState = deepClone(state)
  const tl = newState.timeline
  select(tl.selects, index, opts)
  if (tl.selects.includes(index)) {
    tl.pos = index
  }
  return newState
}

export const selectAllFrames = (state) => {
  const anim = getSelectedAnim(state)
  const duration = getAnimDuration(anim)
  return {
    ...state,
    timeline: {
      ...state.timeline,
      selects: new Array(duration).fill(0).map((_, i) => i)
    }
  }
}

export const deselectAllFrames = (state) => {
  return {
    ...state,
    timeline: {
      ...state.timeline,
      selects: []
    }
  }
}

export const addFrame = (state) => {
  const newState = deepClone(state)
  const anim = getSelectedAnim(newState)
  const duration = getAnimDuration(anim)
  anim.frames.push({
    sprite: null,
    duration: 1,
    origin: { x: 0, y: 0 }
  })
  newState.timeline.pos = duration
  newState.timeline.selects = [duration]
  return newState
}

export const cloneFrame = (state) => {
  const newState = deepClone(state)
  const anim = getSelectedAnim(newState)
  const tl = newState.timeline
  if (tl.selects.length) {
    tl.selects.sort()
    const frames = getFramesAt(anim, tl.selects)
    const index = tl.selects[tl.selects.length - 1]
    anim.frames.splice(index + 1, 0, ...frames.map(deepClone))
  } else {
    const frame = getFrameAt(anim, tl.pos)
    anim.frames.splice(tl.pos, 0, deepClone(frame))
  }
  return newState
}

export const deleteFrame = (state) => {
  const newState = deepClone(state)
  const anim = getSelectedAnim(newState)
  if (getAnimDuration(anim) === 1) return newState

  const tl = newState.timeline
  if (tl.selects.length) {
    tl.selects.sort()
    const frames = getFramesAt(anim, tl.selects)
    for (let i = anim.frames.length; i--;) {
      if (frames.includes(anim.frames[i])) {
        anim.frames.splice(i, 1)
      }
    }
    tl.pos = tl.selects[0]
    tl.selects = [tl.pos]
  } else {
    const frame = getFrameAt(anim, tl.pos)
    const idx = getFrameIndex(anim, frame)
    anim.frames.splice(idx, 1)
    tl.pos = idx
    tl.selects = [tl.pos]
  }
  return newState
}

export const prevFrame = (state, select) => {
  const anim = getSelectedAnim(state)
  if (!anim) return state

  const newState = deepClone(state)
  const tl = newState.timeline
  const lastFrame = getAnimDuration(anim) - 1
  if (tl.pos >= 0) {
    if (tl.pos > 0) {
      tl.pos--
    } else {
      tl.pos = lastFrame
    }
    if (tl.selects.length >= 1) {
      tl.selects = [tl.pos]
    }
  }

  return pauseAnim(newState)
}

export const nextFrame = (state, select) => {
  const anim = getSelectedAnim(state)
  if (!anim) return state

  const newState = deepClone(state)
  const tl = newState.timeline
  const lastFrame = getAnimDuration(anim) - 1
  if (tl.pos <= lastFrame) {
    if (tl.pos < lastFrame) {
      tl.pos++
    } else {
      tl.pos = 0
    }
    if (tl.selects.length >= 1) {
      tl.selects = [tl.pos]
    }
  }

  return pauseAnim(newState)
}

export const playAnim = (state) => {
  const anim = getSelectedAnim(state)
  if (!anim) return state

  const newState = deepClone(state)
  const duration = getAnimDuration(anim)
  const tl = newState.timeline
  tl.playing = true
  if (tl.pos === duration - 1) {
    tl.pos = 0
  }

  cache.timeout = requestAnimationFrame(function animate () {
    if (anim.speed === 1 || ++tl.subpos >= anim.speed) {
      tl.subpos = 0
      if (tl.pos + 1 === duration) {
        if (tl.repeat) {
          tl.pos = 0
        } else {
          tl.playing = false
        }
      } else {
        tl.pos++
      }
    }

    if (tl.playing) {
      cache.timeout = requestAnimationFrame(animate)
    }

    m.redraw()
  })

  return newState
}

export const pauseAnim = (state) => {
  if (cache.timeout) {
    cancelAnimationFrame(cache.timeout)
    cache.timeout = null
    m.redraw()
  }

  return {
    ...state,
    timeline: {
      ...state.timeline,
      playing: false
    }
  }
}

export const togglePlay = (state) => {
  if (state.timeline.playing) {
    return pauseAnim(state)
  } else {
    return playAnim(state)
  }
}

export const toggleRepeat = (state) => {
  return {
    ...state,
    timeline: {
      ...state.timeline,
      repeat: !state.timeline.repeat
    }
  }
}

export const toggleOnionSkin = (state) => {
  return {
    ...state,
    timeline: {
      ...state.timeline,
      onionskin: !state.timeline.onionskin
    }
  }
}

export default function Timeline (state, dispatch) {
  return m.fragment({
    oncreate: () => {
      window.addEventListener('keydown', (onkeydown = (evt) => {
        console.log(evt)
        if (evt.key === ',') {
          dispatch('prevFrame')
        } else if (evt.key === '.') {
          dispatch('nextFrame')
        } else if (evt.key === ' ' && !evt.repeat) {
          dispatch('togglePlay')
        } else if (evt.key === 'a' && (evt.ctrlKey || evt.metaKey)) {
          evt.preventDefault()
          dispatch('selectAllFrames')
        } else if (evt.code === 'Escape') {
          evt.preventDefault()
          dispatch('deselectAllFrames')
        } else if (evt.code === 'Delete') {
          dispatch('deleteFrame')
        }
        evt.redraw = false
      }), true)
    },
    onremove: () => {
      window.removeEventListener('keydown', onkeydown, true)
    }
  }, m('#timeline', [
    TimelineControls(state, dispatch),
    TimelineTrack(state, dispatch)
  ]))
}

function TimelineControls (state, dispatch) {
  const anim = getSelectedAnim(state)
  const duration = getAnimDuration(anim)

  return m('.timeline-controls', [
    m('.controls-lhs', [
      m('.panel.-move', [
        m('button.panel-button', {
          disabled: duration === 1,
          onclick: duration > 1 && (() => dispatch('prevFrame'))
        }, [
          m('span.icon.material-icons-round.-step-prev', 'eject')
        ]),
        m('button.panel-button', {
          class: state.timeline.playing ? '-select' : '',
          disabled: duration === 1,
          onclick: duration > 1 && (() => dispatch('togglePlay'))
        }, [
          m('span.icon.material-icons-round.-play',
            state.timeline.playing ? 'pause' : 'play_arrow')
        ]),
        m('button.panel-button', {
          disabled: duration === 1,
          onclick: duration > 1 && (() => dispatch('nextFrame'))
        }, [
          m('span.icon.material-icons-round.-step-next', 'eject')
        ])
      ]),
      m('.panel.-repeat', [
        m('.panel-button', {
          class: state.timeline.repeat ? '-select' : '',
          onclick: () => dispatch('toggleRepeat')
        }, [
          m('span.icon.material-icons-round.-small', 'repeat')
        ])
      ]),
      m('.panel.-onion-skin', [
        m('.panel-button', {
          class: state.timeline.onionskin ? '-select' : '',
          onclick: () => dispatch('toggleOnionSkin')
        }, [
          m('span.icon.material-icons-round.-small', 'auto_awesome_motion')
        ])
      ])
    ]),
    m('.controls-rhs', [
      m('.action.-add.icon.material-icons-round', {
        onclick: (evt) => dispatch('addFrame')
      }, 'add'),
      m('.action.-clone.icon.-small.material-icons-round', {
        class: duration === 1 ? '-disabled' : null,
        onclick: duration > 1 && ((evt) => dispatch('cloneFrame'))
      }, 'filter_none'),
      m('.action.-remove.icon.material-icons-round', {
        class: duration === 1 ? '-disabled' : null,
        onclick: duration > 1 && ((evt) => dispatch('deleteFrame'))
      }, 'delete_outline')
    ])
  ])
}

function TimelineTrack (state, dispatch) {
  const image = state.cache.image
  const tl = state.timeline
  const anim = getSelectedAnim(state)
  const duration = getAnimDuration(anim)

  return m('.timeline', [
    m('table.timeline-frames', {
      tabindex: '0',
      onkeydown: (evt) => evt.preventDefault()
    }, [
      m('tr.frame-numbers', new Array(duration).fill(0).map((_, i) =>
        m('th.frame-number', {
          key: 'frame-number_' + i,
          class: (tl.pos === i ? '-focus' : '') +
            (tl.selects.includes(i) ? ' -select' : ''),
          onclick: tl.pos !== i && (evt => dispatch('selectFrame', {
            index: i,
            opts: {
              ctrl: evt.ctrlKey || evt.metaKey,
              shift: evt.shiftKey
            }
          }))
        }, i + 1)
      ).concat([
        m('th.frame-number.-add', { key: 'add' })
      ])),
      m('tr.frames', anim.frames.map((frame, i) => {
        const pos = getFrameIndex(anim, frame)
        return m.fragment({
          onupdate: (vnode) => {
            if (tl.pos === pos) {
              vnode.dom.scrollIntoView()
            }
          }
        }, m('td.frame', {
          key: frame.sprite ? `${i}-${frame.sprite.name}` : 'i-null',
          class: (getFrameAt(anim, tl.pos) === frame ? '-focus' : '') +
            (getFramesAt(anim, tl.selects).includes(frame) ? ' -select' : ''),
          colspan: frame.duration > 1 ? frame.duration : null,
          onclick: tl.pos !== pos && (evt => dispatch('selectFrame', {
            index: pos,
            opts: {
              ctrl: evt.ctrlKey || evt.metaKey,
              shift: evt.shiftKey
            }
          }))
        }, [
          m('.thumb.-frame', [
            image && frame.sprite
              ? m(Thumb, { image: extract(image, ...frame.sprite.rect) })
              : null
          ])
        ]))
      }).concat([
        m('td.frame.-add', {
          onclick: () => dispatch('openWindow', { type: 'add' })
        }, [
          m('.icon.-small.material-icons-round', 'add'),
          m('.frame-text', 'Add')
        ])
      ]))
    ])
  ])
}
