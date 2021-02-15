
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

export const addFrame = (state, sprid) => ({
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
    frames: sprid != null
      ? ((sprite) => [{
          sprite: sprid,
          duration: 1,
          origin: {
            x: Math.round(sprite.rect[2] / 2),
            y: sprite.rect[3]
          }
        }])(state.sprites[sprid])
      : []
  }]
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
  const maxframes = 5
  return Panel({
    id: 'timeline',
    name: 'Timeline',
    shown,
    onshow: () => dispatch(showTimeline),
    onhide: () => dispatch(hideTimeline)
  }, [
    m('table.panel-content', [
      m('tr.timeline-header', [
        TimelineControls(state, dispatch),
        new Array(maxframes).fill(0).map((_, i) =>
          m('th.frame-number', m('span', i + 1))
        )
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
          m('td.track-name', anim.name),
          anim.frames.map((frame) => {
            const image = cache.sprites && cache.sprites[frame.sprite]
            return m('td.frame', [
              m('.thumb', image && Thumb(image))
            ])
          })
        ])
      ),
      m('tr.timeline-track', [
        m('td.track-name.-add', [
          m('span.icon.material-icons-round', 'add'),
          'Create new'
        ]),
        state.select.target === 'sprites' &&
        state.select.items.length &&
          m('td', { colspan: maxframes }, [
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

                const idx = parseInt(data)
                dispatch(addFrame, idx)
              }
            }, 'Drag sprites here to create an animation.')
          ])
      ])
    ])
  ])
}
