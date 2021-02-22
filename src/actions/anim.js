
import deepClone from 'lodash.clonedeep'
import select from '../lib/select'
import { getSelectedAnim } from '../app/helpers'

export const createAnim = (state, { ids }) => ({
  ...state,
  panel: 'anims',
  select: {
    ...state.select,
    focus: 'anims',
    list: [state.anims.list.length],
    renaming: true
  },
  anims: {
    ...state.anims,
    index: state.anims.list.length,
    list: [...state.anims.list, {
      name: 'untitled',
      next: -1,
      speed: 1,
      frames: ids
        ? ids.map((id) => {
            const sprite = state.sprites.list[id]
            const rect = sprite.rect
            const x = Math.round(rect.width / 2)
            const y = rect.height
            return {
              sprite: id,
              duration: 1,
              origin: { x, y }
            }
          })
        : []
    }]
  }
})

export const startCreateAnim = (state) => ({
  ...state,
  anims: { ...state.anims, creating: true }
})

export const stopCreateAnim = (state) => ({
  ...state,
  anims: { ...state.anims, creating: false }
})

export const deleteAnim = (state, { index }) => {
  const newState = deepClone(state)
  const anims = newState.anims.list
  anims.splice(index, 1)
  anims.forEach((anim) => {
    if (anim.next >= index) {
      anim.next--
    }
  })
  if (newState.anims.index >= anims.length) {
    if (--newState.anims.index < 0) {
      newState.select.focus = 'sprites'
      newState.panel = 'sprites'
    }
  }
  return newState
}

export const selectAnim = (state, { index, opts }) => {
  const newState = deepClone(state)
  if (newState.select.focus !== 'anims') {
    newState.panel = 'anims'
    newState.select.focus = 'anims'
    newState.select.list = []
  }

  // prevent deselection
  const selects = newState.select.list
  if (!selects.includes(index)) {
    select(selects, index, opts)
  }

  if (index !== newState.anims.index) {
    newState.anims.index = index
    if (newState.timeline.playing) {
      newState.timeline.index = 0
    }
  }

  return newState
}

export const startRenameAnim = (state) => ({
  ...state,
  select: {
    ...state.select,
    renaming: true
  }
})

export const renameAnim = (state, { name }) => {
  const newState = deepClone(state)
  const anim = getSelectedAnim(newState)
  anim.name = name
  newState.select.renaming = false
  return newState
}

export const setAnimSpeed = (state, { speed }) => {
  const newState = deepClone(state)
  const anim = getSelectedAnim(newState)
  anim.speed = speed
  return newState
}

export const setAnimBehavior = (state, { value }) => {
  const newState = deepClone(state)
  const anim = getSelectedAnim(newState)
  anim.next = value
  return newState
}
