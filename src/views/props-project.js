
import m from 'mithril'

const ProjectPanel = ({ project, sprites, anims }) =>
  m('.panel-content', [
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

export default ProjectPanel
