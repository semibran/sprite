
import m from 'mithril'
import { setFrameDuration, setFrameOrigin } from '../actions/frame'

const DURATION_MIN = 1
const DURATION_MAX = 100

const InlineInput = ({ id, value, min, max, oninput }, children) => {
  const onrender = (vnode) => {
    const input = vnode.dom
    if (document.activeElement !== input) {
      input.value = value
    }
  }

  return m('label.section-field.-inline', { for: id }, [
    m.fragment({ oncreate: onrender, onupdate: onrender }, [
      m('input.field-value', {
        type: 'number',
        id,
        min,
        max,
        oninput: (evt) => {
          const input = evt.target
          if (parseInt(input.value) < min) {
            input.value = min
          } else if (parseInt(input.value) > max) {
            input.value = max
          }

          const duration = parseInt(input.value)
          if (duration) {
            input.nextSibling.innerText = duration
            oninput && oninput(evt)
          }
        },
        onkeydown: (evt) => {
          const input = evt.target
          if (evt.code === 'Enter') {
            input.blur()
          }
        }
      })
    ]),
    ...children
  ])
}

const FramePanel = ({ frame, sprites }, dispatch) =>
  m('.panel-content', [
    m('.panel-section.-sprite.-inline', [
      m('.section-key', 'Sprite'),
      m('.section-value', sprites[frame.sprite].name)
    ]),
    m('.panel-section.-duration.-inline', [
      m('.section-key', 'Duration'),
      m('.section-value', [
        InlineInput({
          id: 'duration',
          min: DURATION_MIN,
          max: DURATION_MAX,
          value: frame.duration,
          oninput: (evt) => dispatch(setFrameDuration, {
            duration: parseInt(evt.target.value)
          })
        }, [
          m('span.field-value', frame.duration),
          m('span.field-key', frame.duration === 1 ? ' frame' : ' frames')
        ])
      ])
    ]),
    m('.panel-section.-origin', [
      m('.section-key', 'Origin'),
      m('.section-value', [
        m('.section-fields', [
          m('label.section-field', { for: 'x' }, [
            m('.field-key', 'X'),
            m('input.field-value#x', {
              type: 'number',
              value: frame.origin.x,
              onchange: (evt) => dispatch(setFrameOrigin, { x: evt.target.value })
            })
          ]),
          m('label.section-field', { for: 'y' }, [
            m('.field-key', 'Y'),
            m('input.field-value#y', {
              type: 'number',
              value: frame.origin.y,
              onchange: (evt) => dispatch(setFrameOrigin, { y: evt.target.value })
            })
          ])
        ])
      ])
    ])
  ])

export default FramePanel
