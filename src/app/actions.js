
import clone from 'lodash.clonedeep'
import select from '../lib/select'
import { getSelectedAnim } from './helpers'

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
  state = clone(state)
  select(state.sprites.selects, index, opts)
  return state
}

export const selectAnim = (state, { index, opts }) => {
  state = clone(state)
  select(state.anims.selects, index, opts)
  return state
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
  const newState = clone(state)
  const anim = getSelectedAnim(newState)

  for (let i = anim.frames.length; i--;) {
    if (!anim.frames[i].sprite) {
      anim.frames.splice(i, 1)
    } else {
      break
    }
  }

  const frames = state.sprites.selects.map(idx => ({
    sprite: state.sprites.list[idx],
    duration: 1,
    origin: { x: 0, y: 0 }
  }))
  anim.frames.push(...frames)

  newState.window = null
  return newState
}

export const openWindow = (state, { type }) => {
  return { ...state, window: type }
}

export const closeWindow = (state) => {
  return { ...state, window: null }
}
