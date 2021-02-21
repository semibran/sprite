
import m from 'mithril'
import cache from '../app/cache'
import { prepareExport, exportData } from '../actions'

export default function Header ({ title }, dispatch) {
  return m('header', [
    m('.header-lhs', [
      m('span.icon.material-icons-round', 'menu'),
      m('.header-text', [
        m('span', 'Current project'),
        m('h3', title)
      ])
    ]),
    m('.header-rhs', [
      m('a.button', {
        href: cache.url,
        target: '_blank',
        onmouseover: () => dispatch(prepareExport),
        onclick: (evt) => {
          evt.preventDefault()
          dispatch(exportData)
        }
      }, 'Export')
    ])
  ])
}
