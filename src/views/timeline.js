
import m from 'mithril'

export default function Timeline () {
  return m('.panel.timeline', [
    m('.panel-header', [
      'Timeline',
      m('span.icon.material-icons-round', 'remove')
    ])
  ])
}
