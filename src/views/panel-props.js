
import m from 'mithril'

export default function PropsPanel () {
  return m('aside.panel.-props', [
    m('.panel-header', [
      'Properties',
      m('span.icon.-button.material-icons-round', 'remove')
    ])
  ])
}
