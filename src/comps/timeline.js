
import m from 'mithril'
import extract from 'img-extract'
import {
  getFrameAt,
  getFramesAt,
  getSelectedAnim,
  getAnimDuration,
  getIndexOfFrame
} from '../app/helpers'
import Thumb from './thumb'

let onkeydown = null

export default function Timeline (state, dispatch) {
  const image = state.image
  const tl = state.timeline
  const anim = getSelectedAnim(state)
  const duration = getAnimDuration(anim)

  return m.fragment({
    oncreate: () => {
      window.addEventListener('keydown', (onkeydown = (evt) => {
        if (evt.key === ',') {
          dispatch('prevFrame')()
        } else if (evt.key === '.') {
          dispatch('nextFrame')()
        }
        evt.redraw = false
      }), true)
    },
    onremove: () => {
      window.removeEventListener('keydown', onkeydown, true)
    }
  }, m('#timeline', [
    m('.timeline-controls', [
      m('.controls-lhs', [
        m('.panel.-move', [
          m('button.panel-button', {
            disabled: duration === 1,
            onclick: duration > 1 && dispatch('prevFrame')
          }, [
            m('span.icon.material-icons-round.-step-prev', 'eject')
          ]),
          m('button.panel-button', {
            class: state.timeline.playing ? '-select' : '',
            disabled: duration === 1,
            onclick: duration > 1 && dispatch('togglePlay')
          }, [
            m('span.icon.material-icons-round.-play',
              state.timeline.playing ? 'pause' : 'play_arrow')
          ]),
          m('button.panel-button', {
            disabled: duration === 1,
            onclick: duration > 1 && dispatch('nextFrame')
          }, [
            m('span.icon.material-icons-round.-step-next', 'eject')
          ])
        ]),
        m('.panel.-repeat', [
          m('.panel-button', {
            class: state.timeline.repeat ? '-select' : '',
            onclick: dispatch('toggleRepeat')
          }, [
            m('span.icon.material-icons-round.-small', 'repeat')
          ])
        ]),
        m('.panel.-onion-skin', [
          m('.panel-button', {
            class: state.timeline.onionskin ? '-select' : '',
            onclick: dispatch('toggleOnionSkin')
          }, [
            m('span.icon.material-icons-round.-small', 'auto_awesome_motion')
          ])
        ])
      ]),
      m('.controls-rhs', [
        m('.action.-add.icon.material-icons-round',
          // { onclick: addFrame },
          'add'),
        m('.action.-clone.icon.-small.-disabled.material-icons-round',
          // { onclick: cloneFrame },
          'filter_none'),
        m('.action.-remove.icon.-disabled.material-icons-round', {
          // onclick: deleteFrame
        }, 'delete_outline')
      ])
    ]),
    m('.timeline', [
      m('table.timeline-frames', {
        tabindex: '0',
        onkeydown: (evt) => evt.preventDefault()
      }, [
        m('tr.frame-numbers', new Array(duration).fill(0).map((_, i) =>
          m.fragment({
            onupdate: (vnode) => {
              if (tl.pos === i) {
                vnode.dom.scrollIntoView()
              }
            }
          }, m('th.frame-number', {
            class: (tl.pos === i ? '-focus' : '') +
              (tl.selects.includes(i) ? ' -select' : ''),
            // onclick: selectFrame(i)
          }, i + 1))
        ).concat([
          m('th.frame-number.-add')
        ])),
        m('tr.frames', anim.frames.map((frame, i) => {
          const pos = getIndexOfFrame(anim, frame)
          return m('td.frame', {
            key: frame.sprite ? `${i}-${frame.sprite.name}` : i,
            class: (getFrameAt(anim, tl.pos) === frame ? '-focus' : '') +
              (getFramesAt(anim, tl.selects).includes(frame) ? ' -select' : ''),
            colspan: frame.duration > 1 ? frame.duration : null,
            onclick: (evt) => tl.pos !== pos && dispatch('selectFrame', {
              index: pos,
              opts: {
                ctrl: evt.ctrlKey || evt.metaKey,
                shift: evt.shiftKey
              }
            })()
          }, [
            m('.thumb.-frame', [
              frame.sprite
                ? m(Thumb, { image: extract(image, ...frame.sprite.rect) })
                : null
            ])
          ])
        }).concat([
          m('td.frame.-add', {
            key: 'add',
            onclick: dispatch('openWindow', { type: 'add' })
          }, [
            m('.icon.-small.material-icons-round', 'add'),
            m('.frame-text', 'Add')
          ])
        ]))
      ])
    ])
  ]))
}
