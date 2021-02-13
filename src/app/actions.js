
import m from 'mithril'
import deepClone from 'lodash.clonedeep'
import cloneImage from '../lib/img-clone'
import sliceCanvas from '../lib/slice'
import mergeRects from '../lib/merge'
import select from '../lib/select'
import cache from './cache'
import {
  getSelectedAnim,
  getSelectedFrame,
  getAnimDuration,
  getFrameAt,
  getFramesAt,
  getFrameIndex
} from './helpers'

export * from '../comps/timeline'

export const setImage = (state) => {
  if (state.sprites.list.length) return state
  const canvas = cloneImage(cache.image)
  return {
    ...state,
    sprites: {
      ...state.sprites,
      list: sliceCanvas(canvas).map((rect, i) => (
        { name: `${state.sprname}_${i}`, rect }
      ))
    }
  }
}

export const selectTab = (state, { tab }) => {
  return {
    ...state,
    tab,
    sprites: {
      ...state.sprites,
      selects: []
    }
  }
}

export const selectSprite = (state, { index, opts }) => {
  state = deepClone(state)
  select(state.sprites.selects, index, opts)
  return state
}

export const selectAnim = (state, { index, opts }) => {
  const newState = deepClone(state)
  select(newState.anims.selects, index, opts)
  newState.timeline.pos = 0
  newState.timeline.selects = []
  return newState
}

export const mergeSelects = (state) => {
  if (!state.sprites.selects.length) return state

  const newState = deepClone(state)
  const sprites = newState.sprites.list
  const selects = newState.sprites.selects.sort()
  const rects = selects.map(idx => sprites[idx].rect)
  const rect = mergeRects(rects)
  for (let i = selects.length; --i;) {
    const idx = selects[i]
    sprites.splice(idx, 1)
    // cache.sprites.splice(idx, 1)
  }

  const idx = selects[0]
  const sprite = sprites[idx]
  sprite.rect = rect
  // cache.sprites[idx] = extract(cache.image, ...rect)
  selects.length = 0
  return newState
}

export const createAnim = (state) => {
  const anims = state.anims
  const anim = {
    name: 'untitled',
    loop: false,
    next: null,
    speed: 1,
    frames: [{
      sprite: null,
      duration: 1,
      origin: { x: 0, y: 0 }
    }]
  }
  return {
    ...state,
    anims: {
      ...anims,
      list: [...anims.list, anim],
      selects: [anims.list.length],
      editname: true
    }
  }
}

export const startRenameAnim = (state) => {
  const anims = state.anims
  const selects = anims.selects
  return {
    ...state,
    anims: {
      ...anims,
      editname: true,
      selects: [selects[selects.length - 1]]
    }
  }
}

export const renameAnim = (state, { name }) => {
  const anims = state.anims
  const selects = anims.selects
  return {
    ...state,
    anims: {
      ...anims,
      editname: false,
      list: anims.list.map((anim, i) =>
        i === selects[selects.length - 1]
          ? { ...anim, name }
          : anim
      )
    }
  }
}

export const setAnimSpeed = (state, speed) => {
  const newState = deepClone(state)
  const anim = getSelectedAnim(newState)
  anim.speed = speed
  return newState
}

export const setFrameOrigin = (state, { x, y }) => {
  const newState = deepClone(state)
  const anim = getSelectedAnim(newState)
  const frame = getFrameAt(anim, newState.timeline.pos)
  if (x != null) frame.origin.x = x
  if (y != null) frame.origin.y = y
  return newState
}

export const moveFrameOrigin = (state, { x, y }) => {
  const newState = deepClone(state)
  const anim = getSelectedAnim(newState)
  const frames = getFramesAt(anim, newState.timeline.selects)
  frames.forEach(frame => {
    frame.origin.x += x
    frame.origin.y += y
  })
  return newState
}

export const setFrameDuration = (state, duration) => {
  const newState = deepClone(state)
  const frame = getSelectedFrame(newState)
  frame.duration = duration
  return newState
}

export const confirmFrames = (state) => {
  const newState = deepClone(state)
  const anim = getSelectedAnim(newState)

  for (let i = anim.frames.length; i--;) {
    if (!anim.frames[i].sprite) {
      anim.frames.splice(i, 1)
    } else {
      break
    }
  }

  const frames = newState.sprites.selects.map((idx) => {
    const sprite = newState.sprites.list[idx]
    const [,, width, height] = sprite.rect
    return {
      sprite,
      duration: 1,
      origin: { x: Math.floor(width / 2), y: height }
    }
  })
  anim.frames.push(...frames)
  newState.sprites.selects = []
  newState.timeline.selects = []
  newState.timeline.pos = 0

  newState.window = null
  return newState
}

export const openWindow = (state, { type }) => {
  return { ...state, window: type }
}

export const closeWindow = (state) => {
  return { ...state, window: null }
}

// non-`export`-prefixed functions are WIP

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

const changeFramesDuration = (evt) => {
  const tl = state.timeline
  const anim = state.anims.select
  const frames = getFramesAt(anim, tl.selects)
  for (const frame of frames) {
    frame.duration = parseInt(evt.target.value)
  }
}
