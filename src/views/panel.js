
import m from 'mithril'

export default function Panel ({ id, name, shown, onshow, onhide }, children) {
  return m('.panel.-' + id, {
    class: shown ? '' : '-min'
  }, [
    m('.panel-header', {
      ondblclick: shown ? onhide : onshow
    }, [
      name,
      m('span.icon.-button.material-icons-round', {
        tabindex: 0,
        onclick: shown ? onhide : onshow
      }, shown ? 'remove' : 'add')
    ]),
    shown && children
  ])
}
