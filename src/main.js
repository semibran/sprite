
import m from 'mithril'
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import extract from 'img-extract'
import loadImage from 'img-load'

import clone from './lib/img-clone'
import slice from './lib/slice'
import merge from './lib/merge'
import reduce from './lib/combine-reducers'

import * as actions from './app/actions'
import Editor from './comps/editor'
import LeftSidebar from './comps/sidebar-left'

const cache = { image: null }

const initialState = {
  sprname: 'untitled',
  tab: 'sprites',
  window: null,
  sprites: {
    list: [],
    selects: [],
    editname: false,
  },
  anims: {
    list: [],
    selects: [],
    editname: false,
    tab: 'anim'
  },
  timeline: {
    pos: 0,
    selects: [],
    playing: false,
    repeat: false,
    onionskin: false
  }
}

export const setImage = (state) => {
  const canvas = clone(cache.image)
  return {
    ...state,
    sprites: {
      ...state.sprites,
      list: slice(canvas).map((rect, i) => (
        { name: `${state.sprname}_${i}`, rect }
      ))
    }
  }
}

const reducers = reduce(Object.assign(actions, { setImage }), initialState)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const enhancer = composeEnhancers(applyMiddleware(thunk))
const store = createStore(reducers, enhancer)

loadImage('../tmp/copen.png').then((image) => {
  cache.image = image
  store.dispatch({ type: 'setImage' })
  m.redraw()
})

const selectFrame = (i) => (evt) => {
  select(state.timeline.selects, i)(evt)
  state.timeline.pos = i
}

const selectAllFrames = () => {
  const tl = state.timeline
  const anim = state.anims.select
  tl.selects = new Array(getAnimDuration(anim)).fill(0).map((_, i) => i)
  tl.pos = 0
}

const deselectAllFrames = () => {
  const tl = state.timeline
  tl.selects = [tl.pos]
}

const deleteFrame = () => {
  const tl = state.timeline
  const anim = state.anims.select
  if (tl.selects.length) {
    tl.selects.sort()
    const frames = getFramesAt(anim, tl.selects)
    for (let i = anim.frames.length; i--;) {
      if (frames.includes(anim.frames[i])) {
        anim.frames.splice(i, 1)
      }
    }
    const idx = Math.max(0, tl.selects[0] - 1)
    tl.selects = [idx]
    tl.pos = idx
  } else {
    const frame = getFrameAt(anim, tl.pos)
    const idx = getIndexOfFrame(anim, frame)
    anim.frames.splice(idx, 1)
    tl.selects = [idx - 1]
    tl.pos = Math.max(0, idx - 1)
  }
}

const mergeSelects = () => {
  const sprites = state.sprites
  const selects = state.selects
  if (!selects.length) {
    return false
  }
  selects.sort()
  const rects = selects.map(idx => sprites[idx].rect)
  const rect = merge(rects)
  for (let i = selects.length; --i;) {
    const idx = selects[i]
    sprites.splice(idx, 1)
  }
  const idx = selects[0]
  const sprite = sprites[idx]
  sprite.rect = rect
  sprite.image = extract(state.image, ...rect)
  selects.length = 0
  return true
}

const toggleAnim = () => {
  if (state.timeline.playing) {
    return pauseAnim()
  } else {
    return playAnim()
  }
}

const stepPrev = () => {
  const anim = state.anims.select
  if (!anim) {
    return false
  }

  const tl = state.timeline
  const lastFrame = getAnimDuration(anim) - 1
  pauseAnim()
  if (tl.pos >= 0) {
    if (tl.pos > 0) {
      tl.pos--
    } else {
      tl.pos = lastFrame
    }
    if (tl.selects.length >= 1) {
      tl.selects = [tl.pos]
    }
    return true
  }

  return false
}

const stepNext = () => {
  const anim = state.anims.select
  if (!anim) {
    return false
  }

  const tl = state.timeline
  const lastFrame = getAnimDuration(anim) - 1
  pauseAnim()
  if (tl.pos <= lastFrame) {
    if (tl.pos < lastFrame) {
      tl.pos++
    } else {
      tl.pos = 0
    }
    if (tl.selects.length >= 1) {
      tl.selects = [tl.pos]
    }
    return true
  }

  return false
}

const pauseAnim = () => {
  const tl = state.timeline
  tl.playing = false
  if (tl.timeout) {
    cancelAnimationFrame(tl.timeout)
    tl.timeout = null
    m.redraw()
  }
  return true
}

const playAnim = () => {
  const anim = state.anims.select
  if (!anim) {
    return false
  }

  const duration = getAnimDuration(anim)
  const tl = state.timeline
  tl.playing = true
  if (tl.pos === duration - 1) {
    tl.pos = 0
  }

  tl.timeout = requestAnimationFrame(function animate () {
    if (tl.pos < duration - 1) {
      tl.pos++
    } else if (tl.repeat) {
      tl.pos = 0
    } else {
      tl.playing = false
    }
    if (tl.playing) {
      tl.timeout = requestAnimationFrame(animate)
    }
    m.redraw()
  })
  return true
}

const handleFrameOrigin = (axis) => (evt) => {
  const val = parseInt(evt.target.value)
  if (axis === 'x') {
    setFrameOrigin(val, null)
  } else if (axis === 'y') {
    setFrameOrigin(null, val)
  }
}

const selectTimelineOrigin = (evt) => {
  const tl = state.timeline
  const anim = state.anims.select
  const frames = anim && getFramesAt(anim, tl.selects)
  const [xpos, ypos] = evt.target.value.split('-')
  for (const frame of frames) {
    if (xpos === 'left') {
      frame.origin.x = 0
    } else if (xpos === 'center') {
      frame.origin.x = Math.floor(frame.sprite.image.width / 2)
    } else if (xpos === 'right') {
      frame.origin.x = frame.sprite.image.width
    }
    if (ypos === 'top') {
      frame.origin.y = 0
    } else if (ypos === 'middle') {
      frame.origin.y = Math.floor(frame.sprite.image.height / 2)
    } else if (ypos === 'bottom') {
      frame.origin.y = frame.sprite.image.height
    }
  }
}

const setFrameOrigin = (x, y) => {
  const anim = state.anims.select
  const frame = anim && anim.frames[state.timeline.pos]
  if (x != null) frame.origin.x = x
  if (y != null) frame.origin.y = y
}

const moveFrameOrigin = (dx, dy) => {
  const tl = state.timeline
  const anim = state.anims.select
  const frames = getFramesAt(anim, tl.selects)
  for (const frame of frames) {
    frame.origin.x += dx
    frame.origin.y += dy
  }
}

const changeFrameDuration = (frame) => (evt) => {
  frame.duration = parseInt(evt.target.value)
}

const changeFramesDuration = (evt) => {
  const tl = state.timeline
  const anim = state.anims.select
  const frames = getFramesAt(anim, tl.selects)
  for (const frame of frames) {
    frame.duration = parseInt(evt.target.value)
  }
}

const openWindow = (type) => () => {
  state.window = type
}

const closeWindow = () => {
  state.window = null
}

const CreateWindow = () =>
  m('.window.-create', [
    m('.window-header', [
      m('.window-title', 'Create new state'),
      m('span.action.icon.material-icons-round',
        { onclick: closeWindow },
        'close')
    ]),
    m('.window-content', [
      m('.window-bar', [
        state.selects.length === 1
          ? '1 sprite selected'
          : `${state.selects.length} sprites selected`,
        m('.view-toggle', [
          m('span.icon.material-icons-round.action.-select', 'view_module'),
          m('span.icon.material-icons-round.action', 'view_list')
        ])
      ]),
      m('.window-entries', [
        m('.window-entrygrid', state.sprites.map((sprite, i) =>
          m('.entry.action', {
            key: `${i}-${sprite.name}-${sprite.rect[2]},${sprite.rect[3]}`,
            onclick: select(state.selects, i),
            class: state.selects.includes(i) ? '-select' : null
          }, [
            m('.thumb.-entry', [
              m(Thumb, { image: sprite.image })
            ]),
            m('.entry-name', sprite.name)
          ])
        ))
      ]),
      m('.window-footer', [
        m('button.-create', {
          onclick: () => { createAnim(); closeWindow() }
        }, [
          m('span.icon.material-icons-round', 'add'),
          'Create'
        ]),
        m('button.-cancel.-alt', { onclick: closeWindow }, 'Cancel')
      ])
    ])
  ])

const App = (state, dispatch) =>
  m('main.app', [
    m('header', [
      m('.header-block', [
        m('span.icon.material-icons-round', 'menu'),
        m('.header-text', [
          m('.header-title', 'Untitled'),
          m('.header-subtitle', 'Current project')
        ])
      ])
    ]),
    m('.content', [
      LeftSidebar(state, dispatch),
      Editor(state, dispatch)
    ]),
    state.window ? m('.overlay', { onclick: closeWindow }) : null,
    state.window === 'create' ? CreateWindow() : null
  ])

m.mount(document.body, () => ({
  view: () => App({ ...store.getState(), ...cache },
    (type, payload) => () => store.dispatch({ type, payload }))
}))
