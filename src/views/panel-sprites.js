
import m from 'mithril'

export default function SpritesPanel () {
  return m('aside.panel.-sprites', [
    m('.panel-header', [
      'Sprites',
      m('span.icon.-button.material-icons-round', 'remove')
    ])
  ])
}
