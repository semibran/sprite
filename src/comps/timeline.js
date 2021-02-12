
import m from 'mithril'
import extract from 'img-extract'
import {
  getSelectedAnim,
  getAnimDuration,
  getFrameAt,
  getFramesAt,
  getFrameIndex
} from '../app/helpers'
import Thumb from './thumb'

let onkeydown = null

export default function Timeline (state, dispatch) {
  return m.fragment({
    oncreate: () => {
      window.addEventListener('keydown', (onkeydown = (evt) => {
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
