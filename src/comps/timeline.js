
import m from 'mithril'

export default function Timeline (state, dispatch) {
  const anim = state.anims.select
  const tl = state.timeline
  const duration = getAnimDuration(anim)
  return m.fragment({
    oncreate: (vnode) => {
      window.addEventListener('keydown', (evt) => {
        if (evt.key === ' ' && !evt.repeat) {
          toggleAnim()
        } else if (evt.key === ',') {
          stepPrev()
        } else if (evt.key === '.') {
          stepNext()
        } else if (evt.code === 'KeyA' && (evt.ctrlKey || evt.metaKey)) {
          evt.preventDefault()
          selectAllFrames()
        } else if (evt.code === 'Escape') {
          evt.preventDefault()
          deselectAllFrames()
        } else if (evt.key === 'Shift') {
          evt.redraw = false
        }
      }, true)
    }
  }, m('#timeline', [
    m('.timeline-controls', [
      m('.controls-lhs', [
        m('.panel.-move', [
          m('.panel-button', { onclick: stepPrev }, [
            m('span.icon.material-icons-round.-step-prev', 'eject')
          ]),
          m('.panel-button', {
            class: state.timeline.playing ? '-select' : '',
            onclick: toggleAnim
          }, [
            m('span.icon.material-icons-round.-play',
              state.timeline.playing ? 'pause' : 'play_arrow')
          ]),
          m('.panel-button', { onclick: stepNext }, [
            m('span.icon.material-icons-round.-step-next', 'eject')
          ])
        ]),
        m('.panel.-repeat', [
          m('.panel-button', {
            class: state.timeline.repeat ? '-select' : '',
            onclick: toggleRepeat
          }, [
            m('span.icon.material-icons-round.-small', 'repeat')
          ])
        ]),
        m('.panel.-onion-skin', [
          m('.panel-button', {
            class: state.timeline.onionSkin ? '-select' : '',
            onclick: toggleOnionSkin
          }, [
            m('span.icon.material-icons-round.-small', 'auto_awesome_motion')
          ])
        ])
      ]),
      m('.controls-rhs', [
        m('.action.-add.icon.material-icons-round',
          // { onclick: addFrame },
          'add'),
        m('.action.-clone.icon.-small.material-icons-round',
          // { onclick: cloneFrame },
          'filter_none'),
        m('.action.-remove.icon.material-icons-round', {
          onclick: deleteFrame
        }, 'delete_outline')
      ])
    ]),
    m('.timeline', [
      m('table.timeline-frames', {
        tabindex: '0',
        onkeydown: (evt) => evt.preventDefault()
      }, [
        m('tr.frame-numbers', new Array(duration).fill(0).map((_, i) =>
          m.fragment({
            onupdate: (vnode) => {
              if (tl.pos === i) {
                vnode.dom.scrollIntoView()
              }
            }
          }, m('th.frame-number', {
            class: (tl.pos === i ? '-focus' : '') +
              (tl.selects.includes(i) ? ' -select' : ''),
            onclick: selectFrame(i)
          }, i + 1))
        ).concat([
          m('th.frame-number.-add')
        ])),
        m('tr.frames', anim.frames.map((frame, i) =>
          m('td.frame', {
            key: `${i}-${frame.sprite.name}`,
            class: (getFrameAt(anim, tl.pos) === frame ? '-focus' : '') +
              (getFramesAt(anim, tl.selects).includes(frame) ? ' -select' : ''),
            colspan: frame.duration > 1 ? frame.duration : null,
            onclick: selectFrame(getIndexOfFrame(anim, frame))
          }, [
            m('.thumb.-frame', [
              m(Thumb, { image: frame.sprite.image })
            ])
          ])
        ).concat([
          m('td.frame.-add', { key: 'add' }, [
            m('.icon.-small.material-icons-round', 'add'),
            m('.frame-text', 'Add')
          ])
        ]))
      ])
    ])
  ]))
}
