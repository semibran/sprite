
import m from 'mithril'
import { exportData } from '../actions'

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
      m('button', {
        onclick: () => dispatch(exportData)
      }, 'Export')
    ])
  ])
}
