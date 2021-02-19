
import m from 'mithril'

const SpritePanel = ({ sprite }) => {
  const { x, y, width, height } = sprite.rect
  return m('.panel-content', [
    m('.panel-section.-name.-inline', [
      m('.section-key', 'Name'),
      m('.section-value', sprite.name)
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
      ])
    ]),
    m('.panel-section.-animations.-inline', [
      m('.section-key', 'Used in'),
      m('.section-value', 'n/a')
    ])
  ])
}

export default SpritePanel
