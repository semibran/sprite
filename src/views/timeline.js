
import m from 'mithril'

import Panel from './panel'
import TimelineControls from './timeline-controls'
import Thumb from './thumb'

import { selectAnim, createAnim, deleteAnim } from '../actions/anim'
import { selectFrame, deleteFrame } from '../actions/frame'

import cache from '../app/cache'
import {
  getSelectedSprites,
  isAnimSelected,
  getSelectedAnim,
  getAnimDuration,
  getSelectedFrame,
  getFrameAt,
  getFrameIndex
} from '../app/helpers'

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
  const anim = getSelectedAnim(state)
  const frame = getSelectedFrame(state)
  const maxframes = state.anims.list.reduce((max, anim) => {
    const duration = getAnimDuration(anim)
    return duration > max ? duration : max
  }, 5)
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
            const focus = state.panel === 'anims' && getFrameIndex(anim, frame) === i
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
                      onclick: (evt) => {
                        dispatch(deleteAnim, { index: i })
                        evt.stopPropagation()
                      }
                    }, 'close')
                  ])
                : anim.name
            ]),
            anim.frames.map((frame, j) => {
              const focus = state.panel === 'anims' &&
                state.anims.index === i &&
                getFrameAt(anim, state.timeline.index) === frame
              const image = cache.sprites && cache.sprites[frame.sprite]
              return m('td.frame', {
                class: focus ? '-focus' : '',
                colspan: frame.duration > 1 && frame.duration
              }, [
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
                  image && Thumb({ image }),
                  focus && !state.timeline.playing && m('.thumb-popup', [
                    m('span.icon.material-icons-round', 'filter_none'),
                    m('span.icon.material-icons-round', {
                      onclick: () => dispatch(deleteFrame)
                    }, 'delete_outline')
                  ])
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
