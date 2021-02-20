
import m from 'mithril'
import InlineInput from './input-inline'
import { setAnimSpeed } from '../actions/anim'

const SPEED_MIN = 1
const SPEED_MAX = 100

const AnimPanel = ({ anim }, dispatch) =>
  m('.panel-content', [
    m('.panel-section.-name.-inline', [
      m('.section-key', 'Name'),
      m('.section-value', anim.name)
    ]),
    m('.panel-section.-duration.-inline', [
      m('.section-key', 'Duration'),
      m('.section-value', [
        m('span.field-value', anim.frames.length),
        m('span.field-key', anim.frames.length === 1 ? ' frame' : ' frames')
      ])
    ]),
    m('.panel-section.-speed.-inline', [
      m('.section-key', 'Speed'),
      m('.section-value', [
        InlineInput({
          id: 'speed',
          min: SPEED_MIN,
          max: SPEED_MAX,
          value: anim.speed,
          oninput: (evt) => dispatch(setAnimSpeed, {
            speed: parseInt(evt.target.value)
          })
        }, [
          m('span.field-value', anim.speed),
          m('span.field-key', anim.speed === 1 ? ' tick/frame' : ' ticks/frame')
        ])
      ])
    ]),
    m('.panel-section.-repeat.-inline', [
      m('.section-key', 'Repeat'),
      m('.section-value', anim.next ? 'Yes' : 'No')
    ])
  ])

export default AnimPanel
