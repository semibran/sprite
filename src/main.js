
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

actions.fetchImage('../tmp/test.png').then(() => {
  store.dispatch({ type: 'setImage' })
  m.redraw()
})

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
