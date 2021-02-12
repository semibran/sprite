
import m from 'mithril'
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import extract from 'img-extract'

import merge from './lib/merge'
import reduce from './lib/combine-reducers'

import Editor from './comps/editor'
import LeftSidebar from './comps/sidebar-left'
import AddWindow from './comps/window-add'

import cache from './app/cache'
import * as actions from './app/actions'

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

const reducers = reduce(actions, initialState)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const enhancer = composeEnhancers(applyMiddleware(thunk))
const store = createStore(reducers, enhancer)
store.subscribe(() => m.redraw())

actions.fetchImage('../tmp/test.gif').then(() => {
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
    state.window ? m('.overlay', { onclick: dispatch('closeWindow') }) : null,
    state.window === 'create' ? CreateWindow(state, dispatch) : null,
    state.window === 'add' ? AddWindow(state, dispatch) : null
  ])

m.mount(document.body, () => ({
  view: () => App({ ...store.getState(), ...cache },
    (type, payload) => () => store.dispatch({ type, payload }))
}))
