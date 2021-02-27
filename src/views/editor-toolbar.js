
import m from 'mithril'
import cache from '../app/cache'

const EditorToolbar = (state, dispatch) => {
  let zoom = Math.round(cache.zoom * 1000) / 10
  if (zoom === Math.trunc(zoom)) {
    zoom += '.0'
  }
  return m('.editor-toolbar', [
    m('.editor-tools', [
      m('span.tool.icon.material-icons-round', 'crop_5_4'),
      m('span.tool.icon.-small.material-icons-outlined', 'pan_tool'),
      m('span.tool.icon.material-icons-round', 'zoom_in')
    ]),
    m('.editor-zoom', [
      m('label.input-wrap', { for: 'zoom' }, [
        m('input#zoom', { type: 'number', value: '1' }),
        m('span.input-text', zoom + '%')
      ]),
      m('span.icon.material-icons-round', 'crop_free')
    ])
  ])
}

export default EditorToolbar
