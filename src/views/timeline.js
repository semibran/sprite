
import m from 'mithril'
import deepClone from 'lodash.clonedeep'
import select from '../lib/select'

import Panel from './panel'
import TimelineControls from './timeline-controls'
import Thumb from './thumb'

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

export const createAnim = (state, { ids }) => ({
  ...state,
  focus: 'anims',
  anims: {
    ...state.anims,
    list: [...state.anims.list, {
      name: 'untitled',
      next: null,
      speed: 1,
      frames: ids
        ? ids.map((id) => {
            const sprite = state.sprites.list[id]
            const rect = sprite.rect
            return {
              sprite: id,
              duration: 1,
              origin: {
                x: Math.round(rect.width / 2),
                y: rect.height
              }
            }
          })
        : []
    }],
    selects: [state.anims.list.length]
  }
})

export const removeAnim = (state, { index }) => ({
  ...state,
  anims: state.anims.filter((_, i) => i !== index)
})

export const selectAnim = (state, { index, opts }) => {
  const newState = deepClone(state)
  if (state.focus !== 'anims') {
    newState.focus = 'anims'
    newState.sprites.selects = []
    newState.anims.selects = []
    newState.timeline.selects = []
  }

  // prevent deselection
  const selects = newState.anims.selects
  if (!selects.includes(index)) {
    select(selects, index, opts)
  }

  return newState
}

export const selectFrame = (state, { index, opts }) => {
  const newState = deepClone(state)
  if (state.focus !== 'timeline') {
    newState.focus = 'timeline'
    newState.sprites.selects = []
    newState.timeline.selects = []
  }

  // prevent deselection
  const selects = newState.timeline.selects
  if (!selects.includes(index)) {
    select(selects, index, opts)
    newState.timeline.pos = index
  }

  return newState
}

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
            const focus = state.timeline.pos === i && state.focus !== 'sprites'
            return m('th.frame-number', { class: focus ? '-focus' : '' }, [
              m('span', i + 1)
            ])
          }),
          m('th.track-end')
        ]),
        state.anims.list.map((anim, i) =>
          m('tr.timeline-track', {
            class: isAnimSelected(state, i) ? '-select' : '',
            onclick: (evt) => dispatch(selectAnim, {
              index: i,
              opts: {
                ctrl: evt.ctrlKey || evt.metaKey,
                shift: evt.shiftKey
              }
            })
          }, [
            m('td.track-name', [
              isAnimSelected(state, i)
                ? m('div', [
                    anim.name,
                    m('span.icon.material-icons-round', {
                      onclick: () => dispatch(removeAnim, { index: i })
                    }, 'close')
                  ])
                : anim.name
            ]),
            anim.frames.map((frame, i) => {
              const focus = state.timeline.pos === i && state.focus !== 'sprites'
              const image = cache.sprites && cache.sprites[frame.sprite]
              return m('td.frame', { class: focus ? '-focus' : '' }, [
                m('.thumb', {
                  class: focus ? '-select' : '',
                  onclick: (evt) => dispatch(selectFrame, {
                    index: i,
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
