
import deepClone from 'lodash.clonedeep'
import loadImage from 'img-load'
import clone from '../lib/img-clone'
import slice from '../lib/slice'
import select from '../lib/select'
import cache from './cache'
import { getSelectedAnim, getAnimDuration } from './helpers'

export const fetchImage = async (url) => {
  cache.image = await loadImage(url)
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

export const selectFrame = (state, { index, opts }) => {
  const newState = deepClone(state)
  const tl = newState.timeline
  select(tl.selects, index, opts)
  if (tl.selects.includes(index)) {
    tl.pos = index
  }
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

export const prevFrame = (state) => {
  const anim = getSelectedAnim(state)
  if (!anim) return state

  const newState = deepClone(state)
  const tl = newState.timeline
  const lastFrame = getAnimDuration(anim) - 1
  // pauseAnim()
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

  return newState
}

export const nextFrame = (state) => {
  const anim = getSelectedAnim(state)
  if (!anim) return state

  const newState = deepClone(state)
  const tl = newState.timeline
  const lastFrame = getAnimDuration(anim) - 1
  // pauseAnim()
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

  return newState
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
