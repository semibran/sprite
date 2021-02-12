
import m from 'mithril'
import { getSelectedAnim, getFrameAt } from '../app/helpers'

const handleFrameDuration = (dispatch) => (evt) => {
  dispatch('setFrameDuration', parseInt(evt.target.value))
}

export default function FrameTab (state, dispatch) {
  const anim = getSelectedAnim(state)
  const index = state.timeline.selects[0]
  const frame = anim && getFrameAt(anim, index)
  if (!frame) return null

  return m('.sidebar-content', [
    m('section.-desc', '1 frame selected'),
    m('section.-sprite', [
      m('h4.sidebar-key', 'Sprite'),
      m('span.sidebar-value', [
        m('.sidebar-field', frame.sprite ? frame.sprite.name : '(none)')
      ])
    ]),
    m('section.-duration', [
      m('h4.sidebar-key', 'Duration'),
      m('span.sidebar-value', [
        m('.sidebar-field.-text', [
          m('input.sidebar-input.-number', {
            type: 'number',
            value: frame.duration,
            min: 1,
            max: 100,
            onchange: handleFrameDuration(dispatch)
          }),
          m('span.sidebar-fieldname',
            frame.duration === 1 ? ' frame' : ' frames')
        ])
      ])
    ]),
    m('section.-origin', [
      m('h4.sidebar-key', 'Origin'),
      m('span.sidebar-value', [
        m('.sidebar-fields', [
          m('.sidebar-field.-x', [
            m('span.sidebar-fieldname', 'X'),
            m('input.-sidebar-field', {
              // onchange: handleFrameOrigin('x'),
              value: frame.origin.x
            })
          ]),
          m('.sidebar-field.-y', [
            m('span.sidebar-fieldname', 'Y'),
            m('input.-sidebar-field', {
              // onchange: handleFrameOrigin('y'),
              value: frame.origin.y
            })
          ])
        ])
      ])
    ])
  ])
}
