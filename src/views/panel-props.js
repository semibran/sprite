
import m from 'mithril'
import Panel from './panel'
import {
  isNoneSelected,
  getSelectedSprites,
  getSelectedAnim,
  getSelectedFrame
} from '../app/helpers'

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
  const sprites = getSelectedSprites(state)
  const sprite = sprites[sprites.length - 1]
  const anim = getSelectedAnim(state)
  const frame = state.focus === 'timeline' && getSelectedFrame(state)
  const name = (() => {
    if (isNoneSelected(state)) {
      return 'Project'
    } else if (sprites.length === 1) {
      return 'Sprite'
    } else if (sprites.length > 1) {
      return 'Sprites'
    } else if (frame) {
      return 'Frame'
    } else if (anim) {
      return 'Animation'
    }
  })()
  return Panel({
    id: 'props',
    name,
    shown,
    onshow: () => dispatch(showProps),
    onhide: () => dispatch(hideProps)
  }, ((name) => {
    switch (name) {
      case 'Project':
        return ProjectPanel({ project: state.project, sprites: state.sprites.list, anims: state.anims.list })
      case 'Sprite':
        return SpritePanel({ sprite })
      case 'Sprites':
        return SpritesPanel({ sprites })
      case 'Animation':
        return AnimPanel({ anim })
      case 'Frame':
        return FramePanel({ frame, sprites: state.sprites.list })
    }
  })(name))
}

function ProjectPanel ({ project, sprites, anims }) {
  return m('.panel-content', [
    m('.panel-section.-name.-inline', [
      m('.section-key', 'Name'),
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
      m('.section-key', 'Name'),
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

function FramePanel ({ frame, sprites }) {
  return m('.panel-content', [
    m('.panel-section.-sprite.-inline', [
      m('.section-key', 'Sprite'),
      m('.section-value', sprites[frame.sprite].name)
    ]),
    m('.panel-section.-duration.-inline', [
      m('.section-key', 'Duration'),
      m('.section-value', frame.duration)
    ]),
    m('.panel-section.-origin', [
      m('.section-key', 'Origin'),
      m('.section-value', [
        m('.section-fields', [
          m('label.section-field', { for: 'x' }, [
            m('.field-key', 'X'),
            m('input.field-value#x', { type: 'number', value: frame.origin.x })
          ]),
          m('label.section-field', { for: 'y' }, [
            m('.field-key', 'Y'),
            m('input.field-value#y', { type: 'number', value: frame.origin.y })
          ])
        ])
      ])
    ])
  ])
}
