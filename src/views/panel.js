
import m from 'mithril'

export default function Panel ({ id, name, hidden, onshow, onhide }, children) {
  return m('.panel.-' + id, {
    class: hidden ? '-min' : '',
    onclick: hidden && onshow
  }, [
    m('.panel-header', [
      name,
      m('span.icon.-button.material-icons-round', {
        tabindex: 0,
        onclick: !hidden && onhide
      }, hidden ? 'add' : 'remove')
    ]),
    m('.panel-content', children)
  ])
}
