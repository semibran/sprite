
import m from 'mithril'
import { getSelectedAnim, getFramesAt } from '../app/helpers'

export default function FramesTab (state, dispatch) {
  const anim = getSelectedAnim(state)
  const selects = state.timeline.selects
  const frames = getFramesAt(anim, selects)
  const equalDuration = !frames.find(frame => frame.duration !== frames[0].duration)
  const duration = equalDuration
    ? frames[0].duration
    : frames.reduce((d, frame) => frame.duration < d ? frame.duration : d, Infinity)

  return m('.sidebar-content', [
    m('section.-desc', `${selects.length} frames selected`),
    m('section.-duration', [
      m('h4.sidebar-key', 'Speed'),
      m('span.sidebar-value', [
        m('.sidebar-field.-text', [
          m('input.sidebar-input.-number', {
            type: 'number',
            value: duration,
            min: 1,
            max: 100,
            // onchange: changeFramesDuration
          }),
          m('span.sidebar-fieldname', duration === 1 ? ' frame/tick' : ' frames/tick')
        ])
      ])
    ]),
    m('section.-origin', [
      m('h4.sidebar-key', 'Origin'),
      m('select.sidebar-value', {
        // onchange: selectTimelineOrigin
      }, [
        m('option', { value: 'custom' }, 'Custom'),
        m('option', { value: 'left-top' }, 'Top left'),
        m('option', { value: 'center-top' }, 'Top'),
        m('option', { value: 'right-top' }, 'Top right'),
        m('option', { value: 'left-middle' }, 'Left'),
        m('option', { value: 'center-middle' }, 'Center'),
        m('option', { value: 'right-middle' }, 'Right'),
        m('option', { value: 'left-bottom' }, 'Bottom left'),
        m('option', { value: 'center-bottom' }, 'Bottom'),
        m('option', { value: 'right-bottom' }, 'Bottom right')
      ])
    ])
  ])
}
