
import m from 'mithril'

export function selectAnimTab (state, { tab }) {
  return {
    ...state,
    anims: {
      ...state.anims,
      tab
    }
  }
}

export default function SidebarRight (state, dispatch) {
  const tab = state.anims.tab
  const selects = state.timeline.selects
  return m('aside.sidebar.-right', [
    m('.sidebar-header', [
      m('.sidebar-tabs', [
        m('.tab.-anim', {
          class: tab === 'anim' ? '-active' : '',
          onclick: dispatch(selectAnimTab, { tab: 'anim' })
        }, 'State'),
        m('.tab.-frame', {
          class: tab === 'frame' ? '-active' : '',
          onclick: dispatch(selectAnimTab, { tab: 'frame' })
        }, 'Frame')
      ])
    ]),
    tab === 'anim' ? AnimTab(state, dispatch) : null,
    tab === 'frame' && selects.length <= 1 ? FrameTab(state, dispatch) : null,
    tab === 'frame' && selects.length > 1 ? FramesTab(state, dispatch) : null
  ])
}

function AnimTab (state, dispatch) {
  const anim = state.anims.list[state.anims.selects[state.anims.selects.length - 1]]
  return anim
    ? m('.sidebar-content', [
        m('section.-name', [
          m('h4.sidebar-key', 'Name'),
          m('span.sidebar-value', [
            m('.sidebar-field', anim.name)
          ])
        ]),
        m('section.-duration', [
          m('h4.sidebar-key', 'Duration'),
          m('span.sidebar-value', [
            m('.sidebar-field.-text', [
              anim.frames.length,
              m('span.sidebar-fieldname',
                anim.frames.length === 1 ? ' frame' : ' frames')
            ]),
          ])
        ]),
        m('section.-speed', [
          m('h4.sidebar-key', 'Speed'),
          m('span.sidebar-value', [
            m('.sidebar-field.-text', [
              anim.speed,
              m('span.sidebar-fieldname',
                anim.speed === 1 ? ' frame/tick' : ' frames/tick')
            ]),
          ])
        ]),
        m('section.-repeat', [
          m('h4.sidebar-key', 'Repeat'),
          m('span.sidebar-value', [
            m('.sidebar-field.-text', anim.loop ? 'Yes' : 'No')
          ])
        ])
      ])
    : null
}

function FrameTab (state, dispatch) {
  const anim = state.anims.select
  const frame = anim && getFrameAt(anim, state.timeline.pos)
  return frame
    ? m('.sidebar-content', [
        m('section.-sprite', [
          m('h4.sidebar-key', 'Sprite'),
          m('span.sidebar-value', [
            m('.sidebar-field', frame.sprite.name)
          ])
        ]),
        m('section.-duration', [
          m('h4.sidebar-key', 'Duration'),
          m('span.sidebar-value', [
            m('.sidebar-field.-text', [
              m('input.sidebar-input.-number', {
                type: 'number',
                value: frame.duration,
                min: 1,
                max: 100,
                onchange: changeFrameDuration(frame)
              }),
              m('span.sidebar-fieldname',
                frame.duration === 1 ? ' frame' : ' frames')
            ])
          ])
        ]),
        m('section.-origin', [
          m('h4.sidebar-key', 'Origin'),
          m('span.sidebar-value', [
            m('.sidebar-fields', [
              m('.sidebar-field.-x', [
                m('span.sidebar-fieldname', 'X'),
                m('input.-sidebar-field', {
                  onchange: handleFrameOrigin('x'),
                  value: frame.origin.x
                })
              ]),
              m('.sidebar-field.-y', [
                m('span.sidebar-fieldname', 'Y'),
                m('input.-sidebar-field', {
                  onchange: handleFrameOrigin('y'),
                  value: frame.origin.y
                })
              ])
            ])
          ])
        ])
      ])
    : null
}

function FramesTab (state, dispatch) {
  const anim = state.anims.select
  const selects = state.timeline.selects
  const frames = getFramesAt(anim, selects)
  const equalDuration = !frames.find(frame => frame.duration !== frames[0].duration)
  const duration = equalDuration
    ? frames[0].duration
    : frames.reduce((d, frame) => frame.duration < d ? frame.duration : d, Infinity)
  return m('.sidebar-content', [
    m('section.-desc', [
      `${selects.length} frames selected`
    ]),
    m('section.-duration', [
      m('h4.sidebar-key', 'Speed'),
      m('span.sidebar-value', [
        m('.sidebar-field.-text', [
          m('input.sidebar-input.-number', {
            type: 'number',
            value: duration,
            min: 1,
            max: 100,
            onchange: changeFramesDuration
          }),
          m('span.sidebar-fieldname', duration === 1 ? ' frame/tick' : ' frames/tick')
        ])
      ])
    ]),
    m('section.-origin', [
      m('h4.sidebar-key', 'Origin'),
      m('select.sidebar-value', { onchange: selectTimelineOrigin }, [
        m('option', { value: 'custom' }, 'Custom'),
        m('option', { value: 'left-top' }, 'Top left'),
        m('option', { value: 'center-top' }, 'Top'),
        m('option', { value: 'right-top' }, 'Top right'),
        m('option', { value: 'left-middle' }, 'Left'),
        m('option', { value: 'center-middle' }, 'Center'),
        m('option', { value: 'right-middle' }, 'Right'),
        m('option', { value: 'left-bottom' }, 'Bottom left'),
        m('option', { value: 'center-bottom' }, 'Bottom'),
        m('option', { value: 'right-bottom' }, 'Bottom right')
      ])
    ])
  ])
}
