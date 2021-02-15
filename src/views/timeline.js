
import m from 'mithril'
import deepClone from 'lodash.clonedeep'
import select from '../lib/select'

import Panel from './panel'
import TimelineControls from './timeline-controls'
import Thumb from './thumb'

import cache from '../app/cache'
import { isAnimSelected } from '../app/helpers'

let dragging = false

export const showTimeline = (state) => ({
  ...state,
  panels: { ...state.panels, timeline: true }
})

export const hideTimeline = (state) => ({
  ...state,
  panels: { ...state.panels, timeline: false }
})

export const createAnim = (state, { ids }) => ({
  ...state,
  select: {
    ...state.select,
    target: 'anims',
    items: [state.anims.length]
  },
  anims: [...state.anims, {
    name: 'untitled',
    next: null,
    speed: 1,
    frames: ids
      ? ids.map((id) => ({
          sprite: id,
          duration: 1,
          origin: {
            x: Math.round(state.sprites[id].rect[2] / 2),
            y: state.sprites[id].rect[3]
          }
        }))
      : []
  }]
})

export const removeAnim = (state, { index }) => ({
  ...state,
  anims: state.anims.filter((_, i) => i !== index)
})

export const selectAnim = (state, { index, opts }) => {
  const selection = deepClone(state.select)
  if (selection.target !== 'anims') {
    selection.target = 'anims'
    selection.items = []
  }

  select(selection.items, index, opts)
  return { ...state, select: selection }
}

export default function Timeline (state, dispatch) {
  const shown = state.panels.timeline
  const maxframes = state.anims.reduce(
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
          new Array(maxframes).fill(0).map((_, i) =>
            m('th.frame-number', m('span', i + 1))
          ),
          m('th.track-end')
        ]),
        state.anims.map((anim, i) =>
          m('tr.timeline-track', {
            class: isAnimSelected(state.select, i) ? '-select' : '',
            onclick: (evt) => dispatch(selectAnim, {
              index: i,
              opts: {
                ctrl: evt.ctrlKey || evt.metaKey,
                shift: evt.shiftKey
              }
            })
          }, [
            m('td.track-name', [
              isAnimSelected(state.select, i)
                ? m('div', [
                    anim.name,
                    m('span.icon.material-icons-round', {
                      onclick: () => dispatch(removeAnim, { index: i })
                    }, 'close')
                  ])
                : anim.name
            ]),
            anim.frames.map((frame) => {
              const image = cache.sprites && cache.sprites[frame.sprite]
              return m('td.frame', [
                m('.thumb', image && Thumb(image))
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
          state.select.target === 'sprites' &&
          state.select.items.length
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
