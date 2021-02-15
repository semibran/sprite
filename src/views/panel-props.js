
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
    shown,
    onshow: () => dispatch(showProps),
    onhide: () => dispatch(hideProps)
  }, [
    !state.select.items.length &&
      ProjectPanel({ project: state.project, sprites: state.sprites, anims: state.anims }),
    state.select.target === 'sprites' && state.select.items.length === 1 &&
      SpritePanel({ sprite: state.sprites[state.select.items[0]] }),
    state.select.target === 'sprites' && state.select.items.length > 1 &&
      SpritesPanel({ sprites: state.select.items.map(index => state.sprites[index]) }),
    state.select.target === 'anims' && state.select.items.length === 1 &&
      AnimPanel({ anim: state.anims[state.select.items[0]] })
  ])
}

function ProjectPanel ({ project, sprites, anims }) {
  return m('.panel-content', [
    m('.panel-section.-name.-inline', [
      m('.section-key', 'Project'),
      m('.section-value', project.name)
    ]),
    m('.panel-section.-sprites.-inline', [
      m('.section-key', 'Sprites'),
      m('.section-value', sprites.length)
    ]),
    m('.panel-section.-anims.-inline', [
      m('.section-key', 'Animations'),
      m('.section-value', anims.length)
    ])
  ])
}

function SpritePanel ({ sprite }) {
  const [x, y, width, height] = sprite.rect
  return m('.panel-content', [
    m('.panel-section.-name.-inline', [
      m('.section-key', 'Sprite'),
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

function SpritesPanel ({ sprites }) {
  return m('.panel-content', [
    m('.panel-section.-name.-inline', [
      m('span', sprites.length > 1
        ? `${sprites.length} sprites selected`
        : '1 sprite selected')
    ])
  ])
}

function AnimPanel ({ anim }) {
  return m('.panel-content', [
    m('.panel-section.-name.-inline', [
      m('.section-key', 'Animation'),
      m('.section-value', anim.name)
    ]),
    m('.panel-section.-duration.-inline', [
      m('.section-key', 'Duration'),
      m('.section-value', anim.frames.length)
    ]),
    m('.panel-section.-speed.-inline', [
      m('.section-key', 'Speed'),
      m('.section-value', anim.speed)
    ]),
    m('.panel-section.-repeat.-inline', [
      m('.section-key', 'Repeat'),
      m('.section-value', anim.next ? 'Yes' : 'No')
    ])
  ])
}
