
import m from 'mithril'
import deepClone from 'lodash.clonedeep'
import loadImage from 'img-load'
import clone from '../lib/img-clone'
import slice from '../lib/slice'
import select from '../lib/select'
import merge from '../lib/merge'
import cache from './cache'
import {
  getSelectedAnim,
  getAnimDuration,
  getFrameAt,
  getFramesAt
} from './helpers'

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
  const rect = merge(rects)
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

export const selectFrame = (state, { index, opts }) => {
  const newState = deepClone(state)
  const tl = newState.timeline
  select(tl.selects, index, opts)
  if (tl.selects.includes(index)) {
    tl.pos = index
  }
  return newState
}

export const selectAllFrames = (state) => {
  const anim = getSelectedAnim(state)
  const duration = getAnimDuration(anim)
  return {
    ...state,
    timeline: {
      ...state.timeline,
      selects: new Array(duration).fill(0).map((_, i) => i)
    }
  }
}

export const deselectAllFrames = (state) => {
  return {
    ...state,
    timeline: {
      ...state.timeline,
      selects: []
    }
  }
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

export const prevFrame = (state, select) => {
  const anim = getSelectedAnim(state)
  if (!anim) return state

  const newState = deepClone(state)
  const tl = newState.timeline
  const lastFrame = getAnimDuration(anim) - 1
  if (tl.pos >= 0) {
    if (tl.pos > 0) {
      tl.pos--
    } else {
      tl.pos = lastFrame
    }
    if (tl.selects.length >= 1) {
      tl.selects = [tl.pos]
    }
  }

  return pauseAnim(newState)
}

export const nextFrame = (state, select) => {
  const anim = getSelectedAnim(state)
  if (!anim) return state

  const newState = deepClone(state)
  const tl = newState.timeline
  const lastFrame = getAnimDuration(anim) - 1
  if (tl.pos <= lastFrame) {
    if (tl.pos < lastFrame) {
      tl.pos++
    } else {
      tl.pos = 0
    }
    if (tl.selects.length >= 1) {
      tl.selects = [tl.pos]
    }
  }

  return pauseAnim(newState)
}

const playAnim = (state) => {
  const anim = getSelectedAnim(state)
  if (!anim) return state

  const newState = deepClone(state)
  const duration = getAnimDuration(anim)
  const tl = newState.timeline
  tl.playing = true
  if (tl.pos === duration - 1) {
    tl.pos = 0
  }

  cache.timeout = requestAnimationFrame(function animate () {
    if (tl.pos < duration - 1) {
      tl.pos++
    } else if (tl.repeat) {
      tl.pos = 0
    } else {
      tl.playing = false
    }
    if (tl.playing) {
      cache.timeout = requestAnimationFrame(animate)
    }
    m.redraw()
  })

  return newState
}

export const pauseAnim = (state) => {
  if (cache.timeout) {
    cancelAnimationFrame(cache.timeout)
    cache.timeout = null
    m.redraw()
  }

  return {
    ...state,
    timeline: {
      ...state.timeline,
      playing: false
    }
  }
}

export const togglePlay = (state) => {
  if (state.timeline.playing) {
    return pauseAnim(state)
  } else {
    return playAnim(state)
  }
}

export const toggleRepeat = (state) => {
  return {
    ...state,
    timeline: {
      ...state.timeline,
      repeat: !state.timeline.repeat
    }
  }
}

export const toggleOnionSkin = (state) => {
  return {
    ...state,
    timeline: {
      ...state.timeline,
      onionskin: !state.timeline.onionskin
    }
  }
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

  const frames = newState.sprites.selects.map(idx => ({
    sprite: newState.sprites.list[idx],
    duration: 1,
    origin: { x: 0, y: 0 }
  }))
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
