
import m from 'mithril'
import Panel from './panel'

export const showProps = (state) => ({
  ...state,
  panels: { ...state.panels, props: true }
})

export const hideProps = (state) => ({
  ...state,
  panels: { ...state.panels, props: false }
})

export default function PropsPanel (state, dispatch) {
  const shown = state.panels.props
  return Panel({
    id: 'props',
    name: 'Properties',
    hidden: !shown,
    onshow: () => dispatch(showProps),
    onhide: () => dispatch(hideProps)
  }, shown && [
    state.select.target === 'sprites' && state.select.items.length === 1 &&
      SpritePanel({ sprite: state.sprites[state.select.items[0]] })
  ])
}

function SpritePanel ({ sprite }) {
  const [x, y, width, height] = sprite.rect
  return m('.panel-content', [
    m('.panel-section.-name.-inline', [
      m('.section-key', 'Sprite'),
      m('.section-value', sprite.name),
    ]),
    m('.panel-section.-location', [
      m('.section-key', 'Location'),
      m('.section-value', [
        m('.section-fields', [
          m('label.section-field', { for: 'x' }, [
            m('.field-key', 'X'),
            m('input.field-value#x', { type: 'number', value: x })
          ]),
          m('label.section-field', { for: 'y' }, [
            m('.field-key', 'Y'),
            m('input.field-value#y', { type: 'number', value: y })
          ]),
          m('label.section-field', { for: 'width' }, [
            m('.field-key', 'W'),
            m('input.field-value#width', { type: 'number', value: width })
          ]),
          m('label.section-field', { for: 'height' }, [
            m('.field-key', 'H'),
            m('input.field-value#height', { type: 'number', value: height })
          ])
        ])
      ]),
    ])
  ])
}
