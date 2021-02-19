
import m from 'mithril'

const SpritesPanel = ({ sprites }) =>
  m('.panel-content', [
    m('.panel-section.-name.-inline', [
      m('span', sprites.length > 1
        ? `${sprites.length} sprites selected`
        : '1 sprite selected')
    ])
  ])

export default SpritesPanel
