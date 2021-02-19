
import m from 'mithril'

import Panel from './panel'
import TimelineControls from './timeline-controls'
import Thumb from './thumb'

import { selectAnim, createAnim, removeAnim } from '../actions/anim'
import { selectFrame } from '../actions/frame'

import cache from '../app/cache'
import { isAnimSelected, getSelectedSprites } from '../app/helpers'

let dragging = false

export const showTimeline = (state) => ({
  ...state,
  panels: { ...state.panels, timeline: true }
})

export const hideTimeline = (state) => ({
  ...state,
  panels: { ...state.panels, timeline: false }
})

export default function Timeline (state, dispatch) {
  const shown = state.panels.timeline
  const maxframes = state.anims.list.reduce(
    (max, anim) =>
      anim.frames.length > max
        ? anim.frames.length
        : max, 5)
  return Panel({
    id: 'timeline',
    name: 'Timeline',
    shown,
    onshow: () => dispatch(showTimeline),
    onhide: () => dispatch(hideTimeline)
  }, [
    m('.panel-content', [
      m('table.timeline', [
        m('tr.timeline-header', [
          TimelineControls(state, dispatch),
          new Array(maxframes).fill(0).map((_, i) => {
            const focus = state.timeline.index === i && state.panel === 'anims'
            return m('th.frame-number', { class: focus ? '-focus' : '' }, [
              m('span', i + 1)
            ])
          }),
          m('th.track-end')
        ]),
        state.anims.list.map((anim, i) =>
          m('tr.timeline-track', {
            class: isAnimSelected(state, i) ? '-select' : ''
          }, [
            m('td.track-name', {
              onclick: (evt) => dispatch(selectAnim, {
                index: i,
                opts: {
                  ctrl: evt.ctrlKey || evt.metaKey,
                  shift: evt.shiftKey
                }
              })
            }, [
              isAnimSelected(state, i)
                ? m('div', [
                    anim.name,
                    m('span.icon.material-icons-round', {
                      onclick: () => dispatch(removeAnim, { index: i })
                    }, 'close')
                  ])
                : anim.name
            ]),
            anim.frames.map((frame, j) => {
              const focus = state.panel === 'anims' &&
                state.anims.index === i &&
                state.timeline.index === j
              const image = cache.sprites && cache.sprites[frame.sprite]
              return m('td.frame', { class: focus ? '-focus' : '' }, [
                m('.thumb', {
                  class: focus ? '-select' : '',
                  onclick: (evt) => dispatch(selectFrame, {
                    animid: i,
                    frameid: j,
                    opts: {
                      ctrl: evt.ctrlKey || evt.metaKey,
                      shift: evt.shiftKey
                    }
                  })
                }, [
                  image && Thumb(image)
                ])
              ])
            }),
            m('div.track-bg')
          ])
        ),
        m('tr.timeline-track', [
          m('td.track-name.-add', [
            m('span.icon.material-icons-round', 'add'),
            'Create new'
          ]),
          getSelectedSprites(state).length
            ? m('td', { colspan: maxframes }, [
                m('.track-prompt', {
                  class: dragging ? '-focus' : '',
                  ondragover: (evt) => evt.preventDefault(),
                  ondragenter: (evt) => { dragging = true },
                  ondragleave: (evt) => { dragging = false },
                  ondrop: (evt) => {
                    evt.preventDefault()
                    dragging = false

                    const data = evt.dataTransfer.getData('text')
                    evt.dataTransfer.clearData()

                    const ids = data.split(',').map(Number)
                    dispatch(createAnim, { ids })
                  }
                }, 'Drag sprites here to create an animation.')
              ])
            : m('td'),
          m('div.track-bg')
        ])
      ])
    ])
  ])
}
