
import m from 'mithril'
import { getSelectedAnim, getFrameAt } from '../app/helpers'

export default function FrameTab (state, dispatch) {
  const anim = getSelectedAnim(state)
  const frame = anim && getFrameAt(anim, state.timeline.selects[0])
  if (!frame) return null

  return m('.sidebar-content', [
    m('section.-desc', '1 frame selected'),
    m('section.-sprite', [
      m('h4.sidebar-key', 'Sprite'),
      m('span.sidebar-value', [
        m('.sidebar-field', frame.sprite.name)
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
            // onchange: changeFrameDuration(frame)
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
