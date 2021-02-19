
import m from 'mithril'

const AnimPanel = ({ anim }) =>
  m('.panel-content', [
    m('.panel-section.-name.-inline', [
      m('.section-key', 'Name'),
      m('.section-value', anim.name)
    ]),
    m('.panel-section.-duration.-inline', [
      m('.section-key', 'Duration'),
      m('.section-value', anim.frames.length)
    ]),
    m('.panel-section.-speed.-inline', [
      m('.section-key', 'Speed'),
      m('.section-value', anim.speed)
    ]),
    m('.panel-section.-repeat.-inline', [
      m('.section-key', 'Repeat'),
      m('.section-value', anim.next ? 'Yes' : 'No')
    ])
  ])

export default AnimPanel
