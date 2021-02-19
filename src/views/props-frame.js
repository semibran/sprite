
import m from 'mithril'
import { setFrameOrigin } from '../actions/frame'

const FramePanel = ({ frame, sprites }, dispatch) => {
  return m('.panel-content', [
    m('.panel-section.-sprite.-inline', [
      m('.section-key', 'Sprite'),
      m('.section-value', sprites[frame.sprite].name)
    ]),
    m('.panel-section.-duration.-inline', [
      m('.section-key', 'Duration'),
      m('.section-value', frame.duration)
    ]),
    m('.panel-section.-origin', [
      m('.section-key', 'Origin'),
      m('.section-value', [
        m('.section-fields', [
          m('label.section-field', {
            for: 'x',
            onchange: (evt) => dispatch(setFrameOrigin, { x: evt.target.value })
          }, [
            m('.field-key', 'X'),
            m('input.field-value#x', { type: 'number', value: frame.origin.x })
          ]),
          m('label.section-field', {
            for: 'y',
            onchange: (evt) => dispatch(setFrameOrigin, { y: evt.target.value })
          }, [
            m('.field-key', 'Y'),
            m('input.field-value#y', { type: 'number', value: frame.origin.y })
          ])
        ])
      ])
    ])
  ])
}

export default FramePanel
