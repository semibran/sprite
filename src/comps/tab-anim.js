
import m from 'mithril'
import { getSelectedAnim } from '../app/helpers'

export default function AnimTab (state, dispatch) {
  const anim = getSelectedAnim(state)
  if (!anim) return null

  return m('.sidebar-content', [
    m('section.-name', [
      m('h4.sidebar-key', 'Name'),
      m('span.sidebar-value', [
        m('.sidebar-field', anim.name)
      ])
    ]),
    m('section.-duration', [
      m('h4.sidebar-key', 'Duration'),
      m('span.sidebar-value', [
        m('.sidebar-field.-text', [
          anim.frames.length,
          m('span.sidebar-fieldname',
            anim.frames.length === 1 ? ' frame' : ' frames')
        ])
      ])
    ]),
    m('section.-speed', [
      m('h4.sidebar-key', 'Speed'),
      m('span.sidebar-value', [
        m('.sidebar-field.-text', [
          anim.speed,
          m('span.sidebar-fieldname',
            anim.speed === 1 ? ' tick/frame' : ' ticks/frame')
        ])
      ])
    ]),
    m('section.-repeat', [
      m('h4.sidebar-key', 'Repeat'),
      m('span.sidebar-value', [
        m('.sidebar-field.-text', anim.loop ? 'Yes' : 'No')
      ])
    ])
  ])
}
