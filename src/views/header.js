
import m from 'mithril'

export default function Header (props) {
  return m('header', [
    m('span.icon.material-icons-round', 'menu'),
    m('.header-text', [
      m('span', 'Current project'),
      m('h3', props.title)
    ])
  ])
}
