
import m from 'mithril'

export default function SpritesPanel () {
  return m('aside.panel.-sprites', [
    m('.panel-header', [
      'Sprites',
      m('span.icon.material-icons-round', 'remove')
    ])
  ])
}
